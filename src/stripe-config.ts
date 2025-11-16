export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_TMWF4JsWu9WKt1',
    priceId: 'price_1SPnD80obDJx6Ljpubn1bZPT',
    name: 'teste02',
    description: 'Premium upgrade for unlimited access',
    price: 9.99,
    currency: 'BRL',
    mode: 'payment'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};