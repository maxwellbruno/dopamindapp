import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Leaf } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { formatKes } from '@/lib/store';

const CartSheet: React.FC = () => {
  const { lines, isOpen, setOpen, setQty, remove, totalKes } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your basket</SheetTitle>
          <SheetDescription>Choose only what truly supports you.</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <Leaf className="w-8 h-8 text-mint-green" />
            <p className="text-sm">Your basket is empty. There's no rush.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mt-4">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                  <span className="text-3xl">{l.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{formatKes(l.priceKes)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => setQty(l.productId, l.quantity - 1)} aria-label="Decrease">
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-5 text-center">{l.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => setQty(l.productId, l.quantity + 1)} aria-label="Increase">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(l.productId)} aria-label="Remove">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{formatKes(totalKes)}</span>
              </div>
              <Button
                className="w-full rounded-full bg-mint-green hover:bg-mint-green/90 text-primary-foreground"
                onClick={() => { setOpen(false); navigate('/store/checkout'); }}
              >
                Continue to checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
