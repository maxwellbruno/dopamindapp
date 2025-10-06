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
  const [isLoading, setIsLoading] = useState(false);

  const handleFundWallet = async () => {
    if (!walletAddress) {
      toast.error('No wallet connected');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to add funds');
        return;
      }

      // Call the coinbase-onramp edge function
      const { data, error } = await supabase.functions.invoke('coinbase-onramp', {
        body: {
          walletAddress,
          amount: amt,
          cryptoCurrency: 'ETH',
          fiatCurrency: 'USD'
        }
      });

      if (error) {
        console.error('Coinbase onramp error:', error);
        toast.error('Failed to initialize Coinbase Onramp. Please try again.');
        return;
      }

      if (data?.success && data?.onrampUrl) {
        // Open Coinbase Onramp in a new window
        window.open(data.onrampUrl, '_blank', 'noopener,noreferrer');
        toast.success('Opening Coinbase Onramp...');
        onClose();
      } else {
        toast.error('Failed to get onramp URL');
      }
    } catch (error) {
      console.error('Funding error:', error);
      toast.error('Unable to open Coinbase Onramp. Please try again.');
    } finally {
      setIsLoading(false);
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
                Amount (ETH) — min 0.000333 ETH
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.000333"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.000333"
                step="0.000001"
                required
              />
            </div>

            {amount && (
              <div className="bg-light-gray rounded-lg p-3">
                <p className="text-sm text-cool-gray">You'll receive approximately:</p>
                <p className="font-semibold text-lg">
                  {calculateEstimate().toFixed(6)} ETH
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
              disabled={!walletAddress || isLoading}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isLoading ? 'Opening Coinbase...' : 'Add Funds'}
            </Button>
          </div>

          <div className="text-xs text-cool-gray bg-light-gray rounded p-3">
            <p><strong>Note:</strong> This opens Coinbase Onramp where you can add funds using card payment or transfer from an exchange.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;