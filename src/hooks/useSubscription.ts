import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UsageStats {
  is_premium: boolean;
  products: {
    count: number;
    limit: number | null;
    percentage: number | null;
  };
  sales: {
    count: number;
    limit: number | null;
    percentage: number | null;
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  is_premium: boolean;
  current_count: number;
  limit: number | null;
  message?: string;
}

export function useSubscription() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_user_usage_stats');

      if (rpcError) {
        throw rpcError;
      }

      setUsageStats(data as UsageStats);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateProduct = async (): Promise<LimitCheckResult> => {
    const { data, error: rpcError } = await supabase.rpc('check_can_create_product');

    if (rpcError) {
      throw rpcError;
    }

    return data as LimitCheckResult;
  };

  const checkCanCreateSale = async (): Promise<LimitCheckResult> => {
    const { data, error: rpcError } = await supabase.rpc('check_can_create_sale');

    if (rpcError) {
      throw rpcError;
    }

    return data as LimitCheckResult;
  };

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Check if subscription exists
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existing) {
          // Create subscription if it doesn't exist
          await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              is_premium: false
            });
        }

        // Fetch usage stats
        await fetchUsageStats();
      } catch (err) {
        console.error('Error initializing subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    };

    initializeSubscription();
  }, []);

  return {
    usageStats,
    loading,
    error,
    refetch: fetchUsageStats,
    checkCanCreateProduct,
    checkCanCreateSale,
  };
}
