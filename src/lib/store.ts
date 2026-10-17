import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type StoreProduct = Tables<'store_products'>;
export type StoreOrder = Tables<'store_orders'> & { store_order_items: Tables<'store_order_items'>[] };

export const formatKes = (kes: number) => `KES ${kes.toLocaleString('en-KE')}`;

export const ORDER_STATUSES = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
export const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'On its way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function useStoreProducts(includeInactive = false) {
  return useQuery({
    queryKey: ['store-products', includeInactive],
    queryFn: async () => {
      let q = supabase.from('store_products').select('*').order('sort_order').order('name');
      if (!includeInactive) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return data as StoreProduct[];
    },
  });
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (error) throw error;
      return data;
    },
  });
}
