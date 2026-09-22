import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/services/apiClient';
import { promotionApi } from '@/services/promotionApi';
import type {
  CartItemForPromotion,
  PromotionValidationRequest,
  PromotionValidationResponse,
} from '@/types/promotion';

interface UsePromotionValidationArgs {
  cartItems: CartItemForPromotion[];
  subtotal: number;
}

export function usePromotionValidation({ cartItems, subtotal }: UsePromotionValidationArgs) {
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [result, setResult] = useState<PromotionValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const payload = useMemo<PromotionValidationRequest | null>(() => {
    const normalizedCode = (appliedCode || code).trim().toUpperCase();
    if (!normalizedCode) return null;
    return { code: normalizedCode, cartItems, subtotal };
  }, [appliedCode, cartItems, code, subtotal]);

  const validate = useCallback(async (nextCode?: string) => {
    const normalizedCode = (nextCode ?? code).trim().toUpperCase();
    if (!normalizedCode) {
      setError('Enter a promotion code.');
      setResult(null);
      return null;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');

    try {
      const response = await promotionApi.validate({ code: normalizedCode, cartItems, subtotal });
      if (requestId !== requestIdRef.current) return response;

      setResult(response);
      if (response.valid) {
        setAppliedCode(normalizedCode);
        setCode(normalizedCode);
      } else {
        setAppliedCode('');
        setError(response.message || 'Promotion code is not valid.');
      }
      return response;
    } catch (reason) {
      if (requestId === requestIdRef.current) {
        setResult(null);
        setAppliedCode('');
        setError(getApiErrorMessage(reason, 'promotion validation'));
      }
      return null;
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [cartItems, code, subtotal]);

  const remove = useCallback(() => {
    requestIdRef.current += 1;
    setAppliedCode('');
    setResult(null);
    setError('');
  }, []);

  useEffect(() => {
    if (!appliedCode || !payload) return;
    void validate(appliedCode);
    // Re-validate when cart/subtotal change after a code is applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, subtotal]);

  return {
    code,
    setCode,
    appliedCode,
    result,
    loading,
    error,
    apply: validate,
    remove,
    discountAmount: result?.valid ? result.discountAmount : 0,
  };
}

