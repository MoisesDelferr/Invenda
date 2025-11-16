import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { createCheckoutSession } from '../../lib/stripe';
import type { StripeProduct } from '../../stripe-config';

interface ProductCardProps {
  product: StripeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const { url } = await createCheckoutSession({
        price_id: product.priceId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: window.location.href,
        mode: product.mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4">
          {product.description}
        </p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            R$ {product.price.toFixed(2)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 ml-2">/month</span>
          )}
        </div>
      </div>
      
      <Button
        onClick={handlePurchase}
        loading={loading}
        className="w-full"
      >
        {product.mode === 'subscription' ? 'Subscribe' : 'Buy Now'}
      </Button>
    </div>
  );
};