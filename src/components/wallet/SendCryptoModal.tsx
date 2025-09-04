import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { useWallets } from '@privy-io/react-auth';
import { parseEther, isAddress } from 'viem';

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
  const { wallets } = useWallets();

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
    // For ETH, leave a small amount for gas fees
    if (selectedToken === 'ETH') {
      const balanceNum = parseFloat(maxBalance);
      const maxSendable = Math.max(0, balanceNum - 0.001); // Reserve 0.001 ETH for gas
      setAmount(maxSendable.toFixed(6));
    } else {
      setAmount(maxBalance);
    }
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount || !walletAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (parseFloat(amount) > parseFloat(getMaxBalance())) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    
    try {
      // Find the embedded wallet
      const embeddedWallet = wallets.find(wallet => 
        wallet.walletClientType === 'privy'
      );
      
      if (!embeddedWallet) {
        toast.error('Wallet not found');
        return;
      }

      // Get the wallet provider from Privy
      const walletProvider = await embeddedWallet.getEthereumProvider();
      
      if (selectedToken === 'ETH') {
        // Send ETH transaction
        const txHash = await walletProvider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: recipientAddress,
            value: parseEther(amount).toString(16)
          }]
        });
        toast.success(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`);
      } else {
        // For tokens, we need to interact with contracts
        toast.error('Token transfers not yet implemented');
        return;
      }
      
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
    return isAddress(address);
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

          <div className="bg-mint-green/10 rounded-lg p-4 border border-mint-green/20">
            <p className="text-sm text-text-secondary">
              <strong>Note:</strong> Transactions are processed on Base network. Make sure you have enough ETH for gas fees.
            </p>
          </div>

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