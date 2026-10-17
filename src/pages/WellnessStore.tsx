import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Package, Check } from 'lucide-react';
import { useStoreProducts, formatKes } from '@/lib/store';
import { useCart } from '@/contexts/CartContext';
import CartSheet from '@/components/store/CartSheet';

const WellnessStore: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useStoreProducts();
  const { add, count, setOpen, lines } = useCart();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [justAdded, setJustAdded] = React.useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const handleAdd = (p: (typeof products)[number]) => {
    add(p);
    setJustAdded(p.id);
    setTimeout(() => setJustAdded((v) => (v === p.id ? null : v)), 1400);
  };

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background">
      <div className="px-4 pt-8 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full" aria-label="Go back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-text-dark dark:text-foreground">Wellness Store</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/store/orders')} aria-label="My orders">
                <Package className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="rounded-full relative" onClick={() => setOpen(true)} aria-label="Open basket">
                <ShoppingBag className="w-4 h-4 mr-1" /> Basket
                {count > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-mint-green text-primary-foreground rounded-full px-2 py-0.5">{count}</span>
                )}
              </Button>
            </div>
          </div>

          <div className="dopamind-card p-5 mb-6 bg-gradient-to-br from-mint-green/10 to-deep-blue/10">
            <p className="text-text-dark dark:text-foreground font-medium">Shop slowly, choose gently.</p>
            <p className="text-text-light dark:text-muted-foreground text-sm mt-1">
              Teas, brain-supporting supplements and mindful essentials. Take a breath before each choice. Ask yourself whether it truly serves you.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${
                  activeCategory === cat
                    ? 'bg-mint-green text-primary-foreground'
                    : 'bg-card text-text-light dark:text-muted-foreground hover:bg-mint-green/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Gathering the shelves…</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
              {filtered.map((product) => {
                const soldOut = product.stock <= 0;
                const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
                return (
                  <div key={product.id} className="dopamind-card p-4 flex flex-col animate-fade-in-up">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-mint-green/15 to-deep-blue/15 flex items-center justify-center mb-3 overflow-hidden">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                        : <span className="text-5xl">{product.emoji}</span>}
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-mint-green font-semibold uppercase tracking-wide">{product.category}</span>
                      {product.benefit && (
                        <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{product.benefit}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-text-dark dark:text-foreground text-sm leading-snug mb-1">{product.name}</h3>
                    <p className="text-xs text-text-light dark:text-muted-foreground leading-relaxed mb-3 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-text-dark dark:text-foreground">{formatKes(product.price_kes)}</span>
                      {soldOut ? (
                        <span className="text-xs text-muted-foreground italic">Resting for now</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAdd(product)}
                          disabled={inCart >= product.stock}
                          className="bg-mint-green hover:bg-mint-green/90 text-primary-foreground rounded-full px-3 transition-all duration-500"
                        >
                          {justAdded === product.id ? <><Check className="w-3 h-3 mr-1" />Added</> : 'Add'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center pb-12">
            Supplements are not medical advice. Please check with a healthcare provider before starting anything new.
          </p>
        </div>
      </div>
      <CartSheet />
    </div>
  );
};

export default WellnessStore;
