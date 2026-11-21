-- ============================================================
-- Ayyappa Enterprises – Hapdaily
-- Comprehensive Supabase PostgreSQL Schema, RLS, Storage & Seeds
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── 1. Enable UUID & Crypto extensions ────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Products Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Hapdaily' CHECK (brand IN ('Hatsun', 'Arogya', 'Hapdaily', 'Other')),
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Milk',
  unit TEXT NOT NULL DEFAULT '500ml',
  available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Orders Table (Customer Website) ────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unverified' CHECK (payment_status IN ('unverified', 'paid_verified', 'cash_on_delivery')),
  payment_method TEXT NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cod')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Wholesale Shops Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 5. Wholesale Rates Per Shop ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(shop_id, product_id)
);

-- ── 6. Daily Deliveries Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 7. Delivery Items Table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_unit TEXT NOT NULL DEFAULT '500ml',
  quantity INT NOT NULL CHECK (quantity > 0),
  rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
  line_total DECIMAL(10,2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 8. Payments Received Table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ── 8b. Performance Indexes (Ultra-fast mobile queries & billing) ──
CREATE INDEX IF NOT EXISTS idx_shops_name ON public.shops(name);
CREATE INDEX IF NOT EXISTS idx_deliveries_shop_date ON public.deliveries(shop_id, delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery_id ON public.delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_product_id ON public.delivery_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_shop_date ON public.payments(shop_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_shop_rates_shop_prod ON public.shop_rates(shop_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand, available);

-- ── 9. Row Level Security (RLS) ──────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Products Policies:
DROP POLICY IF EXISTS "Public can view available products" ON public.products;
DROP POLICY IF EXISTS "Authenticated store owner full access on products" ON public.products;
CREATE POLICY "Public can view available products" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Authenticated store owner full access on products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders Policies:
DROP POLICY IF EXISTS "Customers can place orders" ON public.orders;
DROP POLICY IF EXISTS "Store owner full access on orders" ON public.orders;
CREATE POLICY "Customers can place orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owner full access on orders" ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Wholesale Shops & Billing Policies (ONLY Owner, customers have NO access):
DROP POLICY IF EXISTS "Owner access to shops" ON public.shops;
DROP POLICY IF EXISTS "Owner access to shop_rates" ON public.shop_rates;
DROP POLICY IF EXISTS "Owner access to deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Owner access to delivery_items" ON public.delivery_items;
DROP POLICY IF EXISTS "Owner access to payments" ON public.payments;

CREATE POLICY "Owner access to shops" ON public.shops
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Owner access to shop_rates" ON public.shop_rates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Owner access to deliveries" ON public.deliveries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Owner access to delivery_items" ON public.delivery_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Owner access to payments" ON public.payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 10. Supabase Storage: Product Photos Bucket ───────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view product photos" ON storage.objects;
DROP POLICY IF EXISTS "Owner can upload product photos" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update product photos" ON storage.objects;

CREATE POLICY "Public can view product photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Owner can upload product photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

CREATE POLICY "Owner can update product photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- ── 11. Seed Sample Products ───────────────────────────────────
INSERT INTO public.products (name, brand, description, price, image_url, category, unit, available) VALUES
('Arogya Standardized Milk (Green Magic)', 'Arogya', 'Fresh pasteurized, homogenized standardized cow milk (4.5% FAT, 8.5% SNF). Daily morning essential for your whole family.', 32.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', 'Milk', '500ml', true),
('Arogya Full Cream Milk (Orange Pack)', 'Arogya', 'Thick and rich full cream milk (6.0% FAT, 9.0% SNF). Ideal for delicious sweets, rich tea, filter coffee, and thick curd.', 37.00, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80', 'Milk', '500ml', true),
('Arogya Toned Milk (Blue Pack)', 'Arogya', 'Wholesome toned milk (3.0% FAT, 8.5% SNF) for health-conscious daily diets. Light and easily digestible.', 28.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', 'Milk', '500ml', true),
('Hatsun Fresh Curd (Pouch)', 'Hatsun', 'Naturally fermented, thick, homestyle curd made with pure milk. Healthy probiotics and traditional taste.', 35.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', 'Curd', '450g', true),
('Hatsun Pure Cow Ghee (Jar)', 'Hatsun', 'Aromatic, golden granulated 100% pure cow ghee with traditional aroma. Untouched by hand, pure goodness.', 360.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', 'Ghee', '500ml', true),
('Hatsun Rich Cooking Butter', 'Hatsun', 'Made from farm-fresh cream, churned to perfection. Ideal for parathas, dosas, baking, and rich gravies.', 130.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', 'Butter', '200g', true),
('Hatsun Fresh Paneer', 'Hatsun', 'Super soft, succulent fresh paneer cubes. High in protein, holds shape perfectly while cooking.', 115.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', 'Paneer', '200g', true)
ON CONFLICT DO NOTHING;

-- ── 12. Seed Sample Wholesale Town Shops ──────────────────────
INSERT INTO public.shops (name, owner_name, phone, address, notes) VALUES
('Sri Krishna Sweets & Bakery', 'Suresh Kumar', '9840123456', '14, Gandhi Road, Near Old Bus Stand', 'Morning 6:00 AM delivery. Pays every Saturday.'),
('Ganesh Tea Stall & Tiffin Center', 'G. Murugan', '9840234567', 'Bazaar Street Corner, Opp. Taluk Office', '40 pkts daily Arogya Green Magic. UPI payment.'),
('Saravana Mess & Meals', 'R. Saravanan', '9840345678', 'Temple North Gate, Main Road', 'Bulk curd & milk regular customer. Clears bill 1st & 15th.')
ON CONFLICT DO NOTHING;
