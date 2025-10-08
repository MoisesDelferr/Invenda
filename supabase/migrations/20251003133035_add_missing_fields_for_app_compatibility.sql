/*
  # Add Missing Fields for App Compatibility

  ## Overview
  Adds missing fields to make database compatible with existing app structure.
  This ensures all features from the localStorage version work with Supabase.

  ## Changes

  ### Products Table
  - Add `model` field (text) - Product model/variant
  - Add `variation` field (text) - Product variation details
  
  ### Sales Table
  - Add `initial_payment` field (numeric) - For installment sales
  - Add `installment_count` field (integer) - Number of installments
  - Add `installment_value` field (numeric) - Value per installment
  - Add `is_installment` field (boolean) - Flag for installment sales
  
  ### Installment Payments Table (NEW)
  - Create table to track individual installment payments
  - Links to sales table
  - Tracks payment date and amount

  ## Notes
  - All changes are backward compatible
  - Existing data remains intact
  - Default values provided for new fields
*/

-- Add missing fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'model'
  ) THEN
    ALTER TABLE products ADD COLUMN model text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'variation'
  ) THEN
    ALTER TABLE products ADD COLUMN variation text;
  END IF;
END $$;

-- Add missing fields to sales table for installment support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'initial_payment'
  ) THEN
    ALTER TABLE sales ADD COLUMN initial_payment numeric(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'installment_count'
  ) THEN
    ALTER TABLE sales ADD COLUMN installment_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'installment_value'
  ) THEN
    ALTER TABLE sales ADD COLUMN installment_value numeric(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'is_installment'
  ) THEN
    ALTER TABLE sales ADD COLUMN is_installment boolean DEFAULT false;
  END IF;
END $$;

-- Create installment_payments table for tracking individual payments
CREATE TABLE IF NOT EXISTS installment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  payment_date timestamptz DEFAULT now(),
  amount numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for installment_payments
CREATE POLICY "Users can view payments of own sales"
  ON installment_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = installment_payments.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for own sales"
  ON installment_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = installment_payments.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments of own sales"
  ON installment_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = installment_payments.sale_id
      AND sales.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = installment_payments.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments of own sales"
  ON installment_payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = installment_payments.sale_id
      AND sales.user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_installment_payments_sale_id ON installment_payments(sale_id);

-- Update get_user_sales_count_current_month function to only count non-cancelled sales
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