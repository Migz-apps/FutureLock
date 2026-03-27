import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia, localhost } from 'wagmi/chains';
import { http } from 'wagmi';
// FIXED: Correct import for defineChain
import { defineChain } from 'viem';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '00000000000000000000000000000000';

// Define the FutureLock local network
const futureLockChain = defineChain({
  id: 31337, // Changed to 31337 to match standard Hardhat default
  name: 'FutureLock',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
});

export const config = getDefaultConfig({
  appName: 'FutureLock',
  projectId: projectId,
  chains: [futureLockChain, mainnet, polygon, sepolia],
  transports: {
    [futureLockChain.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});