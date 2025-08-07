-- Update the get_user_subscription function to include pending status for test subscriptions
CREATE OR REPLACE FUNCTION public.get_user_subscription()
 RETURNS TABLE(plan_id text, status text, current_period_end timestamp with time zone, cancel_at_period_end boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    s.plan_id,
    s.status,
    s.current_period_end,
    s.cancel_at_period_end
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
  AND s.status IN ('active', 'trialing', 'pending');
$function$;

-- Also update the user_has_active_subscription function to include pending status
CREATE OR REPLACE FUNCTION public.user_has_active_subscription()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = auth.uid() 
    AND status IN ('active', 'trialing', 'pending')
    AND (current_period_end IS NULL OR current_period_end > now())
  );
$function$;