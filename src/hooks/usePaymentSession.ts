import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { getApiErrorMessage } from '@/services/apiClient';
import { saveGatewaySession } from '@/services/paymentGatewayService';
import { MAX_MANUAL_CHECKS, SCAN_CUTOFF_SECONDS, STATUS_POLL_SECONDS } from '@/lib/gatewayQr';
import type { GatewaySession } from '@/types/paymentGateway';
import type { Payment } from '@/types/payment';

type Phase = 'waiting' | 'finalizing' | 'paid' | 'cash' | 'expired' | 'unverified' | 'failed';
type CheckSource = 'scheduled' | 'manual' | 'final';
const TEMPORARY_VERIFICATION_MESSAGE =
  'Payment received? We are still verifying your payment. Please keep this page open or check your booking history before paying again.';

export function usePaymentSession(session: GatewaySession) {
  const [payment, setPayment] = useState(session.payment);
  const initialPhase: Phase = payment.status === 'PAID' ? 'paid' : payment.paymentMethod === 'CASH' ? 'cash' : 'waiting';
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)));
  const [manualChecks, setManualChecks] = useState(session.manualChecks);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Waiting for your bank to confirm payment.');
  const alive = useRef(false);
  const phaseRef = useRef<Phase>(initialPhase);
  const manualCount = useRef(session.manualChecks);
  const currentPayment = useRef(session.payment);
  const pending = useRef<Promise<Payment | null> | null>(null);
  const manualRequestInFlight = useRef(false);
  const finalStarted = useRef(false);

  const transition = useCallback((next: Phase) => {
    phaseRef.current = next;
    if (alive.current) setPhase(next);
  }, []);
  const accept = useCallback((next: Payment) => {
    currentPayment.current = next;
    saveGatewaySession({ ...session, payment: next, manualChecks: manualCount.current });
    if (!alive.current) return;
    setPayment(next);
    if (typeof next.manualVerificationCount === 'number') {
      manualCount.current = Math.max(manualCount.current, next.manualVerificationCount);
      setManualChecks(manualCount.current);
    }
    if (next.status === 'PAID') transition('paid');
    else if (next.paymentMethod === 'CASH' && next.status === 'PENDING') transition('cash');
    else if (next.status === 'EXPIRED') transition('expired');
    else if (next.status === 'FAILED') transition('failed');
  }, [session, transition]);

  const verify = useCallback(async (source: CheckSource): Promise<Payment | null> => {
    if (!alive.current || !['waiting', 'finalizing'].includes(phaseRef.current)) return null;
    if (pending.current) {
      const previous = await pending.current;
      if (source === 'final' && alive.current && phaseRef.current === 'finalizing') {
        // The final check always follows any earlier in-flight request. It is never skipped.
      } else if (source === 'manual' && alive.current && phaseRef.current === 'waiting') {
        // A user click should always own one fresh backend verification after
        // any scheduled request has finished, unless that request already paid.
      } else {
        return previous;
      }
    }
    const active = currentPayment.current;
    setBusy(true);
    const request = (async () => {
      try {
        const next = await paymentService.checkStatus(active.id, source);
        accept(next);
        if (alive.current && next.status === 'PENDING') {
          setMessage(next.rateLimitedUntil
            ? 'Bakong verification is temporarily unavailable. Please try again later.'
            : next.lastVerificationError || 'Payment is still pending. Keep this page open.');
        }
        return next;
      } catch (error) {
        if (alive.current) {
          const detail = getApiErrorMessage(error, 'payment verification');
          setMessage(`${TEMPORARY_VERIFICATION_MESSAGE}${detail ? ` (${detail})` : ''}`);
        }
        return null;
      }
    })();
    pending.current = request;
    try { return await request; }
    finally {
      if (pending.current === request) pending.current = null;
      if (alive.current) setBusy(false);
    }
  }, [accept]);

  useEffect(() => {
    alive.current = true;
    if (phaseRef.current !== 'waiting') return () => { alive.current = false; };
    const timers: number[] = [];
    STATUS_POLL_SECONDS.forEach((seconds) => {
      const delay = session.startedAt + seconds * 1000 - Date.now();
      if (delay > 0 && session.startedAt + seconds * 1000 < session.expiresAt) {
        timers.push(window.setTimeout(() => void verify('scheduled'), delay));
      }
    });
    timers.push(window.setTimeout(async () => {
      if (finalStarted.current || phaseRef.current !== 'waiting') return;
      finalStarted.current = true;
      setRemaining(0);
      transition('finalizing');
      const result = await verify('final');
      if (!alive.current || (phaseRef.current as Phase) !== 'finalizing') return;
      const finalExpired = result?.status === 'EXPIRED' || result?.status === 'FAILED';
      transition(finalExpired ? 'expired' : 'unverified');
      setMessage(finalExpired ? 'Time is up. Payment has not been confirmed. Check your booking history before paying again.'
        : TEMPORARY_VERIFICATION_MESSAGE);
    }, Math.max(0, session.expiresAt - Date.now())));
    const tick = window.setInterval(() => {
      if (phaseRef.current === 'waiting') setRemaining(Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)));
    }, 250);
    return () => {
      alive.current = false;
      timers.forEach(window.clearTimeout);
      window.clearInterval(tick);
    };
  }, [session, transition, verify]);

  const manualCheck = useCallback(async () => {
    if (manualRequestInFlight.current || manualCount.current >= MAX_MANUAL_CHECKS
      || phaseRef.current !== 'waiting') return;
    manualRequestInFlight.current = true;
    manualCount.current += 1;
    setManualChecks(manualCount.current);
    saveGatewaySession({ ...session, payment: currentPayment.current, manualChecks: manualCount.current });
    try {
      // One click owns one request. A scheduled check that is already running
      // is rejected by the pending-request guard above.
      await verify('manual');
    } finally {
      manualRequestInFlight.current = false;
    }
  }, [session, verify]);

  const switchToCash = useCallback(async () => {
    if (pending.current || !['waiting', 'expired', 'unverified'].includes(phaseRef.current)) return;
    setBusy(true);
    const request = (async () => {
      try {
        const next = await paymentService.switchToCash(currentPayment.current.id);
        accept(next); // The bank may report PAID while the cash switch is being requested.
        return next;
      } catch (error) {
        if (alive.current) setMessage(getApiErrorMessage(error, 'cash payment'));
        return null;
      }
    })();
    pending.current = request;
    try { await request; }
    finally {
      if (pending.current === request) pending.current = null;
      if (alive.current) setBusy(false);
    }
  }, [accept]);

  return { payment, phase, remaining, busy, message, manualChecks, manualCheck, switchToCash,
    scanningClosed: remaining <= SCAN_CUTOFF_SECONDS || phase !== 'waiting' };
}
