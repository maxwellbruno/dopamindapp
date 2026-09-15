import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Chamomile Calm Tea', category: 'Wellness Teas', price: 12, emoji: '🍵', description: 'Organic chamomile blend for deep relaxation and restful sleep.' },
  { id: '2', name: 'Green Tea Focus', category: 'Wellness Teas', price: 14, emoji: '🌿', description: 'Antioxidant-rich green tea to sharpen concentration.' },
  { id: '3', name: 'Rooibos Unwind', category: 'Wellness Teas', price: 13, emoji: '🍂', description: 'Caffeine-free rooibos for evening calm.' },
  { id: '4', name: 'Omega-3 Brain Complex', category: 'Supplements', price: 29, emoji: '💊', description: 'High-purity fish oil for cognitive support.' },
  { id: '5', name: 'Turmeric Curcumin', category: 'Supplements', price: 24, emoji: '🟡', description: 'Anti-inflammatory turmeric extract for daily wellness.' },
  { id: '6', name: 'Magnesium Glycinate', category: 'Supplements', price: 19, emoji: '💧', description: 'Supports relaxation, sleep, and nerve function.' },
  { id: '7', name: 'L-Theanine', category: 'Supplements', price: 17, emoji: '🧘', description: 'Promotes calm focus without drowsiness.' },
  { id: '8', name: 'Meditation Cushion', category: 'Mindful Essentials', price: 38, emoji: '🪑', description: 'Ergonomic cushion for comfortable seated meditation.' },
  { id: '9', name: 'Aromatherapy Candle', category: 'Mindful Essentials', price: 22, emoji: '🕯️', description: 'Lavender & sage scent for a calming atmosphere.' },
  { id: '10', name: 'Journal & Pen Set', category: 'Mindful Essentials', price: 18, emoji: '📓', description: 'Guided gratitude journal for daily reflection.' },
  { id: '11', name: 'Herbal Sleep Gummies', category: 'Supplements', price: 21, emoji: '🌙', description: 'Melatonin-free botanical blend for better sleep.' },
  { id: '12', name: 'Breathing Necklace', category: 'Mindful Essentials', price: 34, emoji: '📿', description: 'Mindful breathing tool to reduce stress on the go.' },
];

const WellnessStore: React.FC = () => {
  const navigate = useNavigate();

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filtered = activeCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-light-gray dark:bg-background">
      <div className="px-4 pt-8 md:pt-0">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-deep-blue to-mint-green flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-dark dark:text-foreground">Wellness Store</h1>
            </div>
          </div>

          <p className="text-text-light dark:text-muted-foreground text-sm mb-6 max-w-2xl">
            Curated teas, brain-supporting supplements, and mindful essentials to support your wellness journey.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-mint-green text-white'
                    : 'bg-white dark:bg-card text-text-light dark:text-muted-foreground hover:bg-mint-green/10 dark:hover:bg-mint-green/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="dopamind-card p-4 flex flex-col animate-fade-in-up"
              >
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-mint-green/15 to-deep-blue/15 dark:from-mint-green/10 dark:to-deep-blue/10 flex items-center justify-center mb-3">
                  <span className="text-5xl">{product.emoji}</span>
                </div>
                <span className="text-xs text-mint-green font-semibold uppercase tracking-wide mb-1">
                  {product.category}
                </span>
                <h3 className="font-semibold text-text-dark dark:text-foreground text-sm leading-snug mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-text-light dark:text-muted-foreground leading-relaxed mb-3 flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-text-dark dark:text-foreground">
                    ${product.price}
                  </span>
                  <Button
                    size="sm"
                    className="bg-mint-green hover:bg-mint-green/90 text-white rounded-full px-3"
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessStore;
