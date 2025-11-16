import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export function useStripe() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(async () => {
    if (!session) {
      setError('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'X-Client-Info': '@supabase/supabase-js',
            Apikey: anonKey,
          },
          body: JSON.stringify({
      price_id: "price_1SPnD80obDJx6Ljpubn1bZPT", // substitua pelo ID real do preço do Stripe
      success_url: "https://seuapp.com/success",
      cancel_url: "https://seuapp.com/cancel",
      mode: "payment" // ou "payment"
    }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }

      const data: CheckoutResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar checkout session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const redirectToCheckout = useCallback(async () => {
    const checkout = await createCheckoutSession();
    if (checkout?.url) {
      window.location.href = checkout.url;
    }
  }, [createCheckoutSession]);

  return {
    createCheckoutSession,
    redirectToCheckout,
    loading,
    error,
  };
}