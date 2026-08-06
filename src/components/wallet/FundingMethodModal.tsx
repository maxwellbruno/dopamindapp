import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Wallet, ArrowDownLeft } from 'lucide-react';

interface FundingMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferFromWallet: () => void;
  onReceiveFunds: () => void;
}

const FundingMethodModal: React.FC<FundingMethodModalProps> = ({
  isOpen,
  onClose,
  onTransferFromWallet,
  onReceiveFunds
}) => {
  const methods = [
    {
      id: 'card',
      label: 'Pay with Card',
      description: 'Buy crypto instantly with your card',
      icon: CreditCard,
      comingSoon: true
    },
    {
      id: 'exchange',
      label: 'Transfer from Exchange',
      description: 'Deposit from a crypto exchange',
      icon: Building2,
      comingSoon: true
    },
    {
      id: 'wallet',
      label: 'Transfer from Wallet',
      description: 'Send crypto from another wallet',
      icon: Wallet,
      comingSoon: false,
      onClick: onTransferFromWallet
    },
    {
      id: 'receive',
      label: 'Receive funds',
      description: 'Show your wallet address or QR code',
      icon: ArrowDownLeft,
      comingSoon: false,
      onClick: onReceiveFunds
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-dark">Add Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {methods.map((method) => (
            <Button
              key={method.id}
              variant="outline"
              onClick={() => {
                if (!method.comingSoon && method.onClick) {
                  method.onClick();
                  onClose();
                }
              }}
              disabled={method.comingSoon}
              className={`w-full h-auto py-4 px-4 justify-start gap-4 ${
                method.comingSoon
                  ? 'opacity-60 cursor-not-allowed border-dashed'
                  : 'hover:bg-mint-green/5 hover:border-mint-green/30'
              }`}
            >
              <div className={`p-2 rounded-lg ${method.comingSoon ? 'bg-soft-gray' : 'bg-mint-green/10'}`}>
                <method.icon className={`h-5 w-5 ${method.comingSoon ? 'text-text-secondary' : 'text-mint-green'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-dark">{method.label}</span>
                  {method.comingSoon && (
                    <Badge variant="secondary" className="text-xs bg-soft-gray text-text-secondary">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{method.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundingMethodModal;
