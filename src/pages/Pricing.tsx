import React from 'react';
import { AuthGuard } from '../components/auth/AuthGuard';
import { ProductCard } from '../components/stripe/ProductCard';
import { stripeProducts } from '../stripe-config';

export const Pricing: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Upgrade to unlock premium features and unlimited access
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stripeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};