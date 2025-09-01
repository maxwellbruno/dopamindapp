import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, ExternalLink, CreditCard, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('coinbase');

  const providers = [
    {
      id: 'coinbase',
      name: 'Coinbase',
      icon: <Building className="h-5 w-5" />,
      description: 'Buy with bank transfer or card',
      fees: '~1.49% fee',
    },
    {
      id: 'moonpay',
      name: 'MoonPay',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Card payments worldwide',
      fees: '~4.5% fee',
    },
  ];

  const tokens = [
    { value: 'ETH', label: 'Ethereum (ETH)', price: '$3,200' },
    { value: 'USDT', label: 'Tether USD (USDT)', price: '$1.00' },
  ];

  const handleBuyWithProvider = (providerId: string) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (providerId === 'coinbase') {
      // Coinbase Commerce/Onramp URL
      const coinbaseUrl = `https://pay.coinbase.com/buy/select-asset?appId=your-app-id&destinationWallets=[{"address":"${walletAddress}","blockchains":["base"]}]&defaultNetwork=base`;
      window.open(coinbaseUrl, '_blank');
    } else if (providerId === 'moonpay') {
      // MoonPay URL
      const moonpayUrl = `https://buy.moonpay.com?apiKey=your-api-key&currencyCode=${selectedToken.toLowerCase()}&walletAddress=${walletAddress}&showWalletAddressForm=false`;
      window.open(moonpayUrl, '_blank');
    }
    
    toast.info(`Opening ${providers.find(p => p.id === providerId)?.name}...`);
  };

  const calculateEstimate = () => {
    if (!amount || !selectedToken) return 0;
    const tokenPrice = selectedToken === 'ETH' ? 3200 : 1;
    return parseFloat(amount) / tokenPrice;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mint-green" />
            Buy Crypto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token to Buy</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.value} value={token.value}>
                      {token.label} - {token.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount && (
              <div className="bg-soft-gray rounded-lg p-3">
                <p className="text-sm text-text-secondary">You'll receive approximately:</p>
                <p className="font-semibold text-lg">
                  {calculateEstimate().toFixed(6)} {selectedToken}
                </p>
              </div>
            )}
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Choose Payment Provider</Label>
            <div className="space-y-2">
              {providers.map((provider) => (
                <Card 
                  key={provider.id} 
                  className={`cursor-pointer transition-colors hover:bg-soft-gray ${
                    selectedProvider === provider.id ? 'ring-2 ring-mint-green' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {provider.icon}
                        <div>
                          <h4 className="font-semibold">{provider.name}</h4>
                          <p className="text-sm text-text-secondary">{provider.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">{provider.fees}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Wallet Address Info */}
          {walletAddress && (
            <div className="bg-mint-green/10 rounded-lg p-4 border border-mint-green/20">
              <h4 className="font-semibold text-sm text-mint-green mb-2">Destination Wallet</h4>
              <p className="font-mono text-xs text-text-secondary break-all">{walletAddress}</p>
              <p className="text-sm text-text-secondary mt-1">Base Network</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => handleBuyWithProvider(selectedProvider)}
              disabled={!walletAddress || !amount}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buy with {providers.find(p => p.id === selectedProvider)?.name}
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-text-secondary bg-soft-gray rounded p-3">
            <p><strong>Disclaimer:</strong> This opens external payment providers. DOPAMINE is not responsible for transactions made through third-party services. Always verify the destination address before purchasing.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;