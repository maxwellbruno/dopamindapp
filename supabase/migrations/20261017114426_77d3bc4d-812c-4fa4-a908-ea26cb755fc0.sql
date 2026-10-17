CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  benefit text,
  emoji text NOT NULL DEFAULT '🌿',
  image_url text,
  price_kes integer NOT NULL CHECK (price_kes >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_products TO authenticated;
GRANT ALL ON public.store_products TO service_role;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.store_products FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage products" ON public.store_products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_store_products_updated BEFORE UPDATE ON public.store_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  total_kes integer NOT NULL,
  total_usd_cents integer,
  paystack_reference text,
  tx_hash text,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  delivery_notes text,
  tracking_note text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.store_orders TO authenticated;
GRANT ALL ON public.store_orders TO service_role;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers view own orders" ON public.store_orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update orders" ON public.store_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_store_orders_updated BEFORE UPDATE ON public.store_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.store_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.store_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.store_products(id) ON DELETE SET NULL,
  name text NOT NULL,
  emoji text,
  unit_price_kes integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_order_items TO authenticated;
GRANT ALL ON public.store_order_items TO service_role;
ALTER TABLE public.store_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View items of own orders" ON public.store_order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.store_orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  kes_per_usd numeric NOT NULL DEFAULT 129,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins update store settings" ON public.store_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.store_settings (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.mark_store_order_paid(_order_id uuid, _tx_hash text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o record;
BEGIN
  SELECT * INTO o FROM store_orders WHERE id = _order_id FOR UPDATE;
  IF o IS NULL OR o.status <> 'pending' THEN RETURN false; END IF;
  UPDATE store_orders SET status='paid', paid_at=now(), tx_hash=COALESCE(_tx_hash, tx_hash) WHERE id=_order_id;
  UPDATE store_products p SET stock = GREATEST(0, p.stock - i.quantity)
    FROM store_order_items i WHERE i.order_id=_order_id AND i.product_id=p.id;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.mark_store_order_paid(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_store_order_paid(uuid,text) TO service_role;

INSERT INTO public.store_products (name, category, description, benefit, emoji, price_kes, stock, sort_order) VALUES
('Chamomile Calm Tea','Wellness Teas','Organic chamomile blend for deep relaxation and restful sleep.','Rest','🍵',1500,50,1),
('Green Tea Focus','Wellness Teas','Antioxidant-rich green tea to sharpen concentration.','Focus','🌿',1800,50,2),
('Rooibos Unwind','Wellness Teas','Caffeine-free rooibos for evening calm.','Calm','🍂',1700,50,3),
('Omega-3 Brain Complex','Supplements','High-purity fish oil for cognitive support.','Clarity','💊',3700,40,4),
('Turmeric Curcumin','Supplements','Anti-inflammatory turmeric extract for daily wellness.','Balance','🟡',3100,40,5),
('Magnesium Glycinate','Supplements','Supports relaxation, sleep, and nerve function.','Rest','💧',2400,40,6),
('L-Theanine','Supplements','Promotes calm focus without drowsiness.','Calm focus','🧘',2200,40,7),
('Lion''s Mane','Supplements','Functional mushroom traditionally used to support memory and mental clarity.','Clarity','🍄',2500,40,8),
('Ginkgo Biloba','Supplements','Leaf extract traditionally used to support circulation and focus.','Focus','🍃',2500,40,9),
('Ashwagandha','Supplements','Adaptogenic root that helps the body respond to everyday stress.','Stress relief','🌱',2500,40,10),
('Herbal Sleep Gummies','Supplements','Melatonin-free botanical blend for better sleep.','Rest','🌙',2700,40,11),
('Meditation Cushion','Mindful Essentials','Ergonomic cushion for comfortable seated meditation.','Presence','🪑',4900,20,12),
('Aromatherapy Candle','Mindful Essentials','Lavender & sage scent for a calming atmosphere.','Calm','🕯️',2800,30,13),
('Journal & Pen Set','Mindful Essentials','Guided gratitude journal for daily reflection.','Reflection','📓',2300,30,14),
('Breathing Necklace','Mindful Essentials','Mindful breathing tool to reduce stress on the go.','Breath','📿',4400,20,15);