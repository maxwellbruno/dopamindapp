UPDATE public.subscriptions
SET status = 'canceled', updated_at = now()
WHERE cancel_at_period_end = true
  AND status IN ('pending', 'active', 'trialing')
  AND (current_period_end IS NULL OR current_period_end <= now());