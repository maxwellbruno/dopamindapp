import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '@/components/admin/AdminGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { formatKes, ORDER_STATUSES, STATUS_LABEL, useStoreProducts, useStoreSettings, type StoreOrder, type StoreProduct } from '@/lib/store';

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="dopamind-card p-4">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
  </div>
);

function useAllOrders() {
  return useQuery({
    queryKey: ['admin-store-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_orders').select('*, store_order_items(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data as StoreOrder[];
    },
  });
}

const OrderCard: React.FC<{ order: StoreOrder; onSaved: () => void }> = ({ order, onSaved }) => {
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState(order.tracking_note ?? '');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('store_orders').update({ status, tracking_note: note || null }).eq('id', order.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Order updated');
    onSaved();
  };
  return (
    <div className="dopamind-card p-4 space-y-3">
      <div className="flex justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-foreground">{order.full_name} · {formatKes(order.total_kes)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString()} · {order.payment_method === 'crypto' ? 'USDC' : 'Card / M-Pesa'} · #{order.id.slice(0, 8)}
          </p>
        </div>
        <span className="text-xs rounded-full bg-muted px-3 py-1 h-fit text-foreground">{STATUS_LABEL[order.status]}</span>
      </div>
      <ul className="text-sm text-foreground">
        {order.store_order_items.map((i) => <li key={i.id}>{i.emoji} {i.name} × {i.quantity} — {formatKes(i.unit_price_kes * i.quantity)}</li>)}
      </ul>
      <div className="text-xs text-muted-foreground">
        <p>{order.phone}</p>
        <p>{order.address}, {order.city}</p>
        {order.delivery_notes && <p>Notes: {order.delivery_notes}</p>}
        {order.tx_hash && <a className="underline" href={`https://basescan.org/tx/${order.tx_hash}`} target="_blank" rel="noreferrer">View transaction</a>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Tracking note (shown to buyer)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={save} disabled={saving}>Save</Button>
      </div>
    </div>
  );
};

const emptyProduct = { name: '', category: 'Supplements', description: '', benefit: '', emoji: '🌿', image_url: '', price_kes: 0, stock: 0, is_active: true, sort_order: 100 };

const ProductDialog: React.FC<{ product: Partial<StoreProduct> | null; onClose: () => void; onSaved: () => void }> = ({ product, onClose, onSaved }) => {
  const [p, setP] = useState<any>(product ?? emptyProduct);
  React.useEffect(() => setP(product ?? emptyProduct), [product]);
  const set = (k: string, v: any) => setP((x: any) => ({ ...x, [k]: v }));
  const save = async () => {
    if (!p.name?.trim() || p.price_kes < 0) return toast.error('Name and a valid price are required');
    const row = {
      name: p.name.trim(), category: p.category, description: p.description ?? '', benefit: p.benefit || null,
      emoji: p.emoji || '🌿', image_url: p.image_url || null, price_kes: Number(p.price_kes), stock: Number(p.stock),
      is_active: !!p.is_active, sort_order: Number(p.sort_order) || 0,
    };
    const { error } = p.id
      ? await supabase.from('store_products').update(row).eq('id', p.id)
      : await supabase.from('store_products').insert(row);
    if (error) return toast.error(error.message);
    toast.success('Product saved');
    onSaved();
    onClose();
  };
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{p.id ? 'Edit product' : 'New product'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={p.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label><Input value={p.category} onChange={(e) => set('category', e.target.value)} /></div>
            <div><Label>Benefit tag</Label><Input value={p.benefit ?? ''} onChange={(e) => set('benefit', e.target.value)} placeholder="Calm, Focus…" /></div>
          </div>
          <div><Label>Description</Label><Textarea value={p.description} onChange={(e) => set('description', e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Price (KES)</Label><Input type="number" min={0} value={p.price_kes} onChange={(e) => set('price_kes', e.target.value)} /></div>
            <div><Label>Stock</Label><Input type="number" min={0} value={p.stock} onChange={(e) => set('stock', e.target.value)} /></div>
            <div><Label>Emoji</Label><Input value={p.emoji} onChange={(e) => set('emoji', e.target.value)} /></div>
          </div>
          <div><Label>Photo link (optional)</Label><Input value={p.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" /></div>
          <div className="flex items-center justify-between">
            <Label>Available in store</Label>
            <Switch checked={!!p.is_active} onCheckedChange={(v) => set('is_active', v)} />
          </div>
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminStoreInner: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: orders = [] } = useAllOrders();
  const { data: products = [] } = useStoreProducts(true);
  const { data: settings } = useStoreSettings();
  const [filter, setFilter] = useState('paid');
  const [editing, setEditing] = useState<Partial<StoreProduct> | null>(null);
  const [rate, setRate] = useState<string>('');

  const refreshOrders = () => qc.invalidateQueries({ queryKey: ['admin-store-orders'] });
  const refreshProducts = () => qc.invalidateQueries({ queryKey: ['store-products'] });

  const stats = useMemo(() => {
    const paid = orders.filter((o) => !['pending', 'cancelled'].includes(o.status));
    return {
      revenue: paid.reduce((s, o) => s + o.total_kes, 0),
      toShip: orders.filter((o) => ['paid', 'packed'].includes(o.status)).length,
      lowStock: products.filter((p) => p.is_active && p.stock <= 5).length,
      orders: paid.length,
    };
  }, [orders, products]);

  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const toggleActive = async (p: StoreProduct) => {
    const { error } = await supabase.from('store_products').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) return toast.error(error.message);
    refreshProducts();
  };

  const saveRate = async () => {
    const v = Number(rate);
    if (!v || v <= 0) return toast.error('Enter a valid rate');
    const { error } = await supabase.from('store_settings').update({ kes_per_usd: v, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) return toast.error(error.message);
    toast.success('Rate updated');
    qc.invalidateQueries({ queryKey: ['store-settings'] });
  };

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background px-4 pt-6 pb-28 md:pt-0">
      <div className="max-w-md md:max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" className="mr-3 rounded-2xl" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Wellness Store admin</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Revenue" value={formatKes(stats.revenue)} />
          <Stat label="Paid orders" value={stats.orders} />
          <Stat label="To ship" value={stats.toShip} />
          <Stat label="Low stock" value={stats.lowStock} />
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['all', ...ORDER_STATUSES].map((s) => (
                <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter(s)}>
                  {s === 'all' ? 'All' : STATUS_LABEL[s]} ({s === 'all' ? orders.length : orders.filter((o) => o.status === s).length})
                </Button>
              ))}
            </div>
            {shown.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">No orders here.</p>
              : shown.map((o) => <OrderCard key={o.id + o.updated_at} order={o} onSaved={refreshOrders} />)}
          </TabsContent>

          <TabsContent value="products" className="space-y-3">
            <Button onClick={() => setEditing({ ...emptyProduct })}><Plus className="w-4 h-4 mr-1" /> Add product</Button>
            {products.map((p) => (
              <div key={p.id} className="dopamind-card p-3 flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className={`text-xs ${p.stock <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formatKes(p.price_kes)} · {p.stock} in stock · {p.category}
                  </p>
                </div>
                <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} aria-label="Available" />
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings">
            <div className="dopamind-card p-4 space-y-3 max-w-sm">
              <Label>KES per 1 USD (used for crypto checkout)</Label>
              <div className="flex gap-2">
                <Input type="number" min={1} placeholder={String(settings?.kes_per_usd ?? '')} value={rate} onChange={(e) => setRate(e.target.value)} />
                <Button onClick={saveRate}>Save</Button>
              </div>
              <p className="text-xs text-muted-foreground">Current: KES {String(settings?.kes_per_usd ?? '—')} = $1</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ProductDialog product={editing} onClose={() => setEditing(null)} onSaved={refreshProducts} />
    </div>
  );
};

const AdminStore: React.FC = () => <AdminGuard><AdminStoreInner /></AdminGuard>;
export default AdminStore;
