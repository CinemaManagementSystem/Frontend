import { useEffect, useState } from 'react';
import { CalendarPlus, Crown, LoaderCircle, XCircle } from 'lucide-react';
import { membershipService } from '@/services/membershipService';
import { getApiErrorMessage } from '@/services/apiClient';
import type { UserMembership } from '@/types/membership';
import { formatCurrency } from '@/utils/formatCurrency';

export function MembershipMembersPage() {
  const [members, setMembers] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setMembers(await membershipService.adminMembers());
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership members'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const action = async (id: string, type: 'cancel' | 'extend') => {
    setBusy(id);
    setError('');
    try {
      if (type === 'cancel') await membershipService.cancelMember(id);
      else await membershipService.extendMember(id, 1);
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership update'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#E50914]"><Crown className="h-4 w-4" /> Membership</p>
        <h1 className="mt-2 text-2xl font-black">Members</h1>
      </div>
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading members...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr><th className="px-5 py-3">Member</th><th>Plan</th><th>Status</th><th>Paid</th><th>Started</th><th>Expires</th><th className="text-right pr-5">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-5 py-4 font-mono text-xs">User #{member.customerId}</td>
                    <td className="font-semibold">{member.planName}</td>
                    <td>{member.status}</td>
                    <td>{formatCurrency(Number(member.priceSnapshot))}</td>
                    <td>{member.startedAt ? new Date(member.startedAt).toLocaleDateString() : '-'}</td>
                    <td>{member.expiresAt ? new Date(member.expiresAt).toLocaleDateString() : '-'}</td>
                    <td className="pr-5 text-right">
                      <div className="inline-flex gap-2">
                        <button type="button" onClick={() => void action(member.id, 'extend')} disabled={busy === member.id || member.status !== 'ACTIVE'} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold disabled:opacity-40">
                          <CalendarPlus className="h-3.5 w-3.5" /> +1 mo
                        </button>
                        <button type="button" onClick={() => void action(member.id, 'cancel')} disabled={busy === member.id || member.status === 'CANCELLED'} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold disabled:opacity-40">
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
