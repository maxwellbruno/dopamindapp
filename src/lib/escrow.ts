import { encodeFunctionData, parseAbi } from 'viem';

export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const BASE_CHAIN_ID_HEX = '0x2105';
export const PLATFORM_FEE_BPS = 1500;
export const MIN_RATE_CENTS = 1000; // $10 per 30 minutes

const erc20 = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

export const centsToUsdcUnits = (cents: number) => BigInt(cents) * 10_000n;

export const formatUsd = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Sends USDC on Base from the user's Privy embedded wallet to the Dopamind escrow wallet.
 * Returns the transaction hash.
 */
export async function payEscrowUsdc(params: {
  wallets: any[];
  fromAddress: string;
  escrowAddress: string;
  amountCents: number;
}): Promise<string> {
  const { wallets, fromAddress, escrowAddress, amountCents } = params;

  const embedded =
    wallets.find((w: any) => w?.walletClientType === 'privy' || w?.walletClientType === 'embedded') ||
    wallets.find((w: any) => w?.address?.toLowerCase() === fromAddress.toLowerCase());

  if (!embedded) throw new Error('No Dopamind wallet available. Open your Wallet first.');

  const provider = await embedded.getEthereumProvider();

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_ID_HEX }],
    });
  } catch (_) {
    // Already on Base, or the provider does not support switching.
  }

  const data = encodeFunctionData({
    abi: erc20,
    functionName: 'transfer',
    args: [escrowAddress as `0x${string}`, centsToUsdcUnits(amountCents)],
  });

  const txHash: string = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: fromAddress, to: USDC_BASE, data }],
  });

  return txHash;
}
