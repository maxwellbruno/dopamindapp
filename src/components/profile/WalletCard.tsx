import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Send, ArrowDownLeft, ShoppingCart, Coins } from 'lucide-react';

interface WalletCardProps {
  walletAddress?: string;
  ethBalance?: string;
  usdtBalance?: string;
  dopamineBalance?: string;
  onConnect: () => void;
  onSend: () => void;
  onReceive: () => void;
  onBuy: () => void;
  isConnected: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({
  walletAddress,
  ethBalance = "0.00",
  usdtBalance = "0.00",
  dopamineBalance = "0.00",
  onConnect,
  onSend,
  onReceive,
  onBuy,
  isConnected
}) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="dopamind-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-text-dark flex items-center gap-2">
            <Wallet className="h-5 w-5 text-mint-green" />
            DOPAMINE Wallet
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Your Base network wallet for rewards
          </CardDescription>
        </div>
        <Badge variant="secondary" className="bg-mint-green/10 text-mint-green">
          Base Network
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-6">
            <Wallet className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary mb-4">Connect your wallet to start earning DOPAMINE tokens</p>
            <Button 
              onClick={onConnect}
              className="w-full bg-mint-green text-white hover:bg-mint-green/90"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            {/* Wallet Address */}
            <div className="bg-soft-gray rounded-lg p-3">
              <p className="text-sm text-text-secondary">Wallet Address</p>
              <p className="font-mono text-sm text-text-dark">{formatAddress(walletAddress || '')}</p>
            </div>

            {/* Token Balances */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-soft-gray rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ETH</span>
                  </div>
                  <span className="font-medium">Ethereum</span>
                </div>
                <span className="font-semibold">{ethBalance} ETH</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-soft-gray rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">USDT</span>
                  </div>
                  <span className="font-medium">Tether USD</span>
                </div>
                <span className="font-semibold">{usdtBalance} USDT</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-mint-green/10 to-calming-blue/10 rounded-lg border border-mint-green/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center">
                    <Coins className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">DOPAMINE</span>
                </div>
                <span className="font-semibold text-mint-green">{dopamineBalance} DOP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSend}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Send className="h-4 w-4" />
                <span className="text-xs">Send</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReceive}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-xs">Receive</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBuy}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Buy</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;