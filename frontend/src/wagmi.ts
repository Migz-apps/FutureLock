import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { localhost } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '00000000000000000000000000000000';

export const config = getDefaultConfig({
  appName: 'FutureLock',
  projectId: projectId, // Get from cloud.walletconnect.com
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // Crucial for Next.js
});