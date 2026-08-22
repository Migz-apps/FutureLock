import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
// FIXED: Correct import for defineChain

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '00000000000000000000000000000000';

export const config = getDefaultConfig({
  appName: 'FutureLock',
  projectId: projectId,
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
