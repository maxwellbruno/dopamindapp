-- Update subscription plans to use KES currency and correct pricing
UPDATE subscription_plans 
SET 
  currency = 'KES',
  price_cents = 69900  -- KES 699 in cents
WHERE id = 'pro';

UPDATE subscription_plans 
SET 
  currency = 'KES', 
  price_cents = 149900  -- KES 1,499 in cents
WHERE id = 'elite';

-- Verify the updates
SELECT id, name, price_cents, currency FROM subscription_plans;