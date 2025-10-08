/*
  # Create Freemium Model Schema

  ## Overview
  Implements a complete freemium model with usage tracking and limits.
  Free users: max 50 products, max 30 sales/month.
  Premium users: unlimited access.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `created_at` (timestamptz)
  - Stores extended user profile information
  
  ### `subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `is_premium` (boolean) - Premium status flag
  - `started_at` (timestamptz) - When premium started
  - `expires_at` (timestamptz) - When premium expires (null = lifetime)
  - `stripe_customer_id` (text) - For future Stripe integration
  - `stripe_subscription_id` (text) - For future Stripe integration
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - Manages user subscription status
  
  ### `products`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, required)
  - `description` (text)
  - `price` (numeric)
  - `stock_quantity` (integer)
  - `sku` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - Stores product catalog per user
  
  ### `sales`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `customer_id` (uuid, references customers)
  - `sale_date` (timestamptz)
  - `total_amount` (numeric)
  - `payment_type` (text) - 'cash', 'installment', etc
  - `status` (text) - 'completed', 'pending', 'cancelled'
  - `created_at` (timestamptz)
  - Stores all sales transactions
  
  ### `sale_items`
  - `id` (uuid, primary key)
  - `sale_id` (uuid, references sales)
  - `product_id` (uuid, references products)
  - `quantity` (integer)
  - `unit_price` (numeric)
  - `subtotal` (numeric)
  - Line items for each sale
  
  ### `customers`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, required)
  - `email` (text)
  - `phone` (text)
  - `address` (text)
  - `created_at` (timestamptz)
  - Customer database per user

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce user_id = auth.uid() checks
  - Separate policies for SELECT, INSERT, UPDATE, DELETE

  ## Functions
  - `get_user_product_count()` - Returns product count for current user
  - `get_user_sales_count_current_month()` - Returns sales count for current month
  - `check_can_create_product()` - Validates product creation against limits
  - `check_can_create_sale()` - Validates sale creation against limits
  - `is_user_premium()` - Checks if user has active premium subscription

  ## Notes
  - Freemium limits: 50 products max, 30 sales/month max for free users
  - Premium users have unlimited access
  - All limit checks are server-side for security
  - Stripe integration fields prepared but not implemented yet
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_premium boolean DEFAULT false NOT NULL,
  started_at timestamptz,
  expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10, 2) DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  sku text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  sale_date timestamptz DEFAULT now(),
  total_amount numeric(10, 2) DEFAULT 0,
  payment_type text DEFAULT 'cash',
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1,
  unit_price numeric(10, 2) DEFAULT 0,
  subtotal numeric(10, 2) DEFAULT 0
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sale items of own sales"
  ON sale_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sale items for own sales"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sale items of own sales"
  ON sale_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sale items of own sales"
  ON sale_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- Function: Check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  premium_status boolean;
BEGIN
  -- Use provided user_id or default to current user
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  -- Check subscription status
  SELECT COALESCE(is_premium, false)
  INTO premium_status
  FROM subscriptions
  WHERE user_id = target_user_id
    AND (expires_at IS NULL OR expires_at > now());
  
  -- If no subscription record exists, user is not premium
  RETURN COALESCE(premium_status, false);
END;
$$;

-- Function: Get user product count
CREATE OR REPLACE FUNCTION get_user_product_count(check_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  product_count integer;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  SELECT COUNT(*)
  INTO product_count
  FROM products
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(product_count, 0);
END;
$$;

-- Function: Get user sales count for current month
CREATE OR REPLACE FUNCTION get_user_sales_count_current_month(check_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  sales_count integer;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  SELECT COUNT(*)
  INTO sales_count
  FROM sales
  WHERE user_id = target_user_id
    AND status != 'cancelled'
    AND date_trunc('month', sale_date) = date_trunc('month', now());
  
  RETURN COALESCE(sales_count, 0);
END;
$$;

-- Function: Check if user can create product
CREATE OR REPLACE FUNCTION check_can_create_product()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  product_count integer;
  is_premium boolean;
  result json;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user is premium
  is_premium := is_user_premium(current_user_id);
  
  -- If premium, always allow
  IF is_premium THEN
    RETURN json_build_object(
      'allowed', true,
      'is_premium', true,
      'current_count', get_user_product_count(current_user_id),
      'limit', null
    );
  END IF;
  
  -- Get current product count
  product_count := get_user_product_count(current_user_id);
  
  -- Check against free tier limit (50 products)
  IF product_count >= 50 THEN
    RETURN json_build_object(
      'allowed', false,
      'is_premium', false,
      'current_count', product_count,
      'limit', 50,
      'message', 'Limite de 50 produtos atingido. Faça upgrade para cadastrar mais produtos.'
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true,
    'is_premium', false,
    'current_count', product_count,
    'limit', 50
  );
END;
$$;

-- Function: Check if user can create sale
CREATE OR REPLACE FUNCTION check_can_create_sale()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  sales_count integer;
  is_premium boolean;
  result json;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user is premium
  is_premium := is_user_premium(current_user_id);
  
  -- If premium, always allow
  IF is_premium THEN
    RETURN json_build_object(
      'allowed', true,
      'is_premium', true,
      'current_count', get_user_sales_count_current_month(current_user_id),
      'limit', null
    );
  END IF;
  
  -- Get current month sales count
  sales_count := get_user_sales_count_current_month(current_user_id);
  
  -- Check against free tier limit (30 sales per month)
  IF sales_count >= 30 THEN
    RETURN json_build_object(
      'allowed', false,
      'is_premium', false,
      'current_count', sales_count,
      'limit', 30,
      'message', 'Você atingiu o limite de 30 vendas neste mês. Faça upgrade para continuar.'
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true,
    'is_premium', false,
    'current_count', sales_count,
    'limit', 30
  );
END;
$$;

-- Function: Get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(check_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  is_premium boolean;
  product_count integer;
  sales_count integer;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  is_premium := is_user_premium(target_user_id);
  product_count := get_user_product_count(target_user_id);
  sales_count := get_user_sales_count_current_month(target_user_id);
  
  RETURN json_build_object(
    'is_premium', is_premium,
    'products', json_build_object(
      'count', product_count,
      'limit', CASE WHEN is_premium THEN null ELSE 50 END,
      'percentage', CASE WHEN is_premium THEN null ELSE (product_count::float / 50 * 100)::integer END
    ),
    'sales', json_build_object(
      'count', sales_count,
      'limit', CASE WHEN is_premium THEN null ELSE 30 END,
      'percentage', CASE WHEN is_premium THEN null ELSE (sales_count::float / 30 * 100)::integer END
    )
  );
END;
$$;