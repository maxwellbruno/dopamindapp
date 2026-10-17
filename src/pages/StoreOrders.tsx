import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatKes, STATUS_LABEL, type StoreOrder } from '@/lib/store';

const StoreOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const placed = params.get('placed');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-store-orders', user?.id],
    enabled: !!user,
    refetchInterval: placed ? 5000 : false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_orders')
        .select('*, store_order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StoreOrder[];
    },
  });

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background px-4 pt-8 md:pt-0 pb-28">
      <div className="max-w-md md:max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/store')} className="rounded-full" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">My orders</h1>
        </div>

        {placed && (
          <div className="dopamind-card p-6 mb-6 text-center animate-fade-in-up">
            <div className="mx-auto w-16 h-16 rounded-full bg-mint-green/15 flex items-center justify-center mb-3 animate-pulse">
              <Heart className="w-7 h-7 text-mint-green" />
            </div>
            <p className="font-semibold text-foreground">Thank you for caring for yourself</p>
            <p className="text-sm text-muted-foreground mt-1">
              Take one slow breath. Name one thing you're grateful for today. We'll prepare your order with care.
            </p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="dopamind-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    <p className="font-semibold text-foreground">{formatKes(o.total_kes)}</p>
                  </div>
                  <span className="text-xs font-medium rounded-full bg-mint-green/15 text-mint-green px-3 py-1">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {o.store_order_items.map((i) => `${i.emoji ?? ''} ${i.name} × ${i.quantity}`).join(' · ')}
                </p>
                {o.tracking_note && <p className="text-xs text-foreground mt-2">Note: {o.tracking_note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrders;
