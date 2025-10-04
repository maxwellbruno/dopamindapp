import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

const BuyCryptoModal: React.FC<BuyCryptoModalProps> = ({
  isOpen,
  onClose,
  walletAddress
}) => {
  const [amount, setAmount] = useState('');

  const handleFundWallet = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate amount and enforce minimums for ETH on Base
    if (!amount) {
      toast.error('Please enter an amount to add');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0.000333) {
      toast.error('Minimum is 0.000333 ETH');
      return;
    }

    // Open a window immediately to avoid popup blockers
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');

    try {
      onClose();

      // Create a Coinbase Onramp session via our Edge Function
      const { data, error } = await supabase.functions.invoke('coinbase-onramp', {
        body: {
          walletAddress,
          amount: amt.toString(),
          cryptoCurrency: 'ETH',
          fiatCurrency: 'USD',
        },
      });

      if (error || !data?.onrampUrl) {
        throw new Error(error?.message || 'Failed to create onramp session');
      }

      if (popup) {
        popup.location.href = data.onrampUrl;
      } else {
        window.location.href = data.onrampUrl;
      }
    } catch (error) {
      console.error('Funding error:', error);
      if (popup && !popup.closed) popup.close();
      toast.error('Unable to open Coinbase Onramp. Please try again.');
    }
  };

  const calculateEstimate = () => {
    if (!amount) return 0;
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : val;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mint-green" />
            Add Funds
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount ({selectedToken === 'ETH' ? 'ETH' : 'USDC'}) — {selectedToken === 'ETH' ? 'min 0.000333 ETH' : 'min 1 USDC'}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={selectedToken === 'ETH' ? '0.000333' : '10'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedToken === 'ETH' ? '0.000333' : '1'}
                step={selectedToken === 'ETH' ? '0.000001' : '0.01'}
                required
              />
            </div>

            {amount && (
              <div className="bg-light-gray rounded-lg p-3">
                <p className="text-sm text-cool-gray">You'll receive approximately:</p>
                <p className="font-semibold text-lg">
                  {calculateEstimate().toFixed(6)} {selectedToken}
                </p>
              </div>
            )}
          </div>

          {/* Wallet Address Info */}
          {walletAddress && (
            <div className="bg-mint-green/10 rounded-lg p-4 border border-mint-green/20">
              <h4 className="font-semibold text-sm text-mint-green mb-2">Destination Wallet</h4>
              <p className="font-mono text-xs text-cool-gray break-all">{walletAddress}</p>
              <p className="text-sm text-cool-gray mt-1">Base Network</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleFundWallet}
              disabled={!walletAddress}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-cool-gray bg-light-gray rounded p-3">
            <p><strong>Note:</strong> This opens Privy's funding modal with your enabled methods: Pay with card, Transfer from exchange, and Transfer from external wallet on Base network.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;