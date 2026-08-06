import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, QrCode, ChevronRight } from 'lucide-react';

export type FundMethod = 'stripe' | 'moonpay' | 'exchange' | 'deposit';

interface FundOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: FundMethod) => void;
}

const options: { id: FundMethod; title: string; subtitle: string; icon: React.ElementType }[] = [
  {
    id: 'stripe',
    title: 'Card via Stripe',
    subtitle: 'Debit/credit card, Apple Pay & Link',
    icon: CreditCard,
  },
  {
    id: 'moonpay',
    title: 'Card via MoonPay',
    subtitle: 'Cards & local payment methods',
    icon: CreditCard,
  },
  {
    id: 'exchange',
    title: 'Transfer from an exchange',
    subtitle: 'Send from Binance, Coinbase and others',
    icon: Building2,
  },
  {
    id: 'deposit',
    title: 'Deposit address',
    subtitle: 'Receive crypto to your Base address',
    icon: QrCode,
  },
];

const FundOptionsModal: React.FC<FundOptionsModalProps> = ({ isOpen, onClose, onSelect }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add funds</DialogTitle>
          <DialogDescription>Choose how you'd like to buy or receive crypto.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {options.map(({ id, title, subtitle, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              onClick={() => onSelect(id)}
              className="w-full h-auto justify-between py-3 px-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-mint-green/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-mint-green" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground font-normal">{subtitle}</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundOptionsModal;
