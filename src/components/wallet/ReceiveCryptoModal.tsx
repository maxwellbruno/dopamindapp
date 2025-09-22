import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownLeft, Copy, QrCode, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiveCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

const ReceiveCryptoModal: React.FC<ReceiveCryptoModalProps> = ({
  isOpen,
  onClose,
  walletAddress
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const generateQRCodeUrl = (address: string) => {
    // Using QR Server API for generating QR codes
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-mint-green" />
            Receive Crypto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            {walletAddress ? (
              <div className="p-4 bg-white rounded-lg border">
                <img
                  src={generateQRCodeUrl(walletAddress)}
                  alt="Wallet QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-soft-gray rounded-lg flex items-center justify-center">
                <QrCode className="h-12 w-12 text-text-secondary" />
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>Your Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                value={walletAddress || ''}
                readOnly
                className="font-mono text-sm"
                placeholder="No wallet connected"
              />
              <Button
                variant="outline"
                onClick={handleCopyAddress}
                disabled={!walletAddress}
                className="px-3"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-soft-gray rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Network Information</h4>
            <div className="text-sm text-text-secondary space-y-1">
              <p><span className="font-medium">Network:</span> Base Mainnet</p>
              <p><span className="font-medium">Supported Tokens:</span> ETH, USDC, DOPAMINE</p>
              <p><span className="font-medium">Chain ID:</span> 8453</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-mint-green/10 rounded-lg p-4 border border-mint-green/20">
            <h4 className="font-semibold text-sm text-mint-green mb-2">How to Receive</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Share your wallet address or QR code</li>
              <li>• Make sure the sender uses Base network</li>
              <li>• Transactions may take a few minutes to confirm</li>
            </ul>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveCryptoModal;