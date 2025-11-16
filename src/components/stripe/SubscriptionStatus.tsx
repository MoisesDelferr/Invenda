import React, { useState, useEffect } from 'react';
import { getUserSubscription } from '../../lib/stripe';
import { getProductByPriceId } from '../../stripe-config';
import { Alert } from '../ui/Alert';

export const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getUserSubscription();
        setSubscription(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch subscription');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">Plan:</span> Free
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status);

  return (
    <div className="text-sm">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-gray-700">Plan:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {product?.name || 'Premium'}
        </span>
      </div>
      
      {subscription.current_period_end && (
        <div className="text-gray-600 mt-1">
          {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
          {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};