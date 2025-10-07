import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';

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

  const { fundWallet } = useFundWallet();

  const handleFundWallet = async () => {
    console.log('🟦 fundWallet via Privy modal');
    console.log('Wallet address:', walletAddress);
    console.log('Amount:', amount);

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
      await fundWallet(walletAddress, {
        chain: base,
        amount: String(amt),
        card: { preferredProvider: 'coinbase' },
        uiConfig: {
          receiveFundsTitle: `Receive ${amt} ETH`,
          receiveFundsSubtitle: 'Scan this code or copy your wallet address to receive funds on Base.'
        }
      });
      // Keep modal open; Privy will render over the app. You can close it after the flow.
    } catch (error: any) {
      console.error('Privy fundWallet error:', error);
      toast.error(`Unable to start funding: ${error?.message || 'Unknown error'}`);
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
              {isLoading ? 'Opening funding...' : 'Add Funds'}
            </Button>
          </div>

          <div className="text-xs text-cool-gray bg-light-gray rounded p-3">
            <p><strong>Note:</strong> This opens the Privy funding modal (Pay with card via Coinbase, Transfer from an exchange, Transfer from wallet, or Receive funds).</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;