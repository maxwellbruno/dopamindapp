import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SendCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
  ethBalance: string;
  usdtBalance: string;
  dopamineBalance: string;
}

const SendCryptoModal: React.FC<SendCryptoModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  ethBalance,
  usdtBalance,
  dopamineBalance
}) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);

  const getMaxBalance = () => {
    switch (selectedToken) {
      case 'ETH': return ethBalance;
      case 'USDT': return usdtBalance;
      case 'DOPAMINE': return dopamineBalance;
      default: return '0.00';
    }
  };

  const handleMaxClick = () => {
    const maxBalance = getMaxBalance();
    setAmount(maxBalance);
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount || !walletAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) > parseFloat(getMaxBalance())) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual blockchain transaction
      // For now, simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${amount} ${selectedToken} sent successfully!`);
      onClose();
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      toast.error('Failed to send transaction');
      console.error('Send error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (address: string) => {
    return address.length === 42 && address.startsWith('0x');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-mint-green" />
            Send Crypto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH (Balance: {ethBalance})</SelectItem>
                <SelectItem value="USDT">USDT (Balance: {usdtBalance})</SelectItem>
                <SelectItem value="DOPAMINE">DOPAMINE (Balance: {dopamineBalance})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono text-sm"
            />
            {recipientAddress && !isValidAddress(recipientAddress) && (
              <p className="text-sm text-red-500">Invalid address format</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <Button
                variant="outline"
                onClick={handleMaxClick}
                className="px-3"
              >
                Max
              </Button>
            </div>
            <p className="text-sm text-text-secondary">
              Available: {getMaxBalance()} {selectedToken}
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a demo implementation. In production, this would interact with the Base network to send real transactions.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!recipientAddress || !amount || !isValidAddress(recipientAddress) || isLoading}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendCryptoModal;