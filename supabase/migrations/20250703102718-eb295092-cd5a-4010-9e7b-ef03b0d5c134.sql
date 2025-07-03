-- Update subscription plans with correct USD to NGN conversion
-- $4.99 USD ≈ ₦7,500 NGN, $9.99 USD ≈ ₦15,000 NGN
UPDATE public.subscription_plans 
SET 
  price_cents = 750000, -- ₦7,500 in kobo (NGN smallest unit)
  currency = 'NGN'
WHERE id = 'pro';

UPDATE public.subscription_plans 
SET 
  price_cents = 1500000, -- ₦15,000 in kobo 
  currency = 'NGN'
WHERE id = 'elite';