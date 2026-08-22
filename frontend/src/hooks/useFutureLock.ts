"use client";

import { useChainId, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import FutureLockABI from '../abis/FutureLock.json';
import { getErrorMessage } from '../utils/errorHandler';

// Configuration from environment variables
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}`;
// Unified the variable name to match your .env.local
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 0);

export const useFutureLock = () => {
  const chainId = useChainId();
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  /**
   * Triggers the smart contract transaction to purchase an insight.
   * @param insightId - The ID of the insight from the smart contract/database.
   * @param priceInEth - The cost in ETH (e.g., "0.01").
   */
  const purchaseInsight = async (insightId: string, priceInEth: string) => {
    // 1. Network Validation
    if (!EXPECTED_CHAIN_ID || chainId !== EXPECTED_CHAIN_ID) {
      const errorMsg = getErrorMessage({ message: `Wrong Network! Please switch to Chain ID: ${EXPECTED_CHAIN_ID}` });
      alert(errorMsg);
      return;
    }

    // 2. Contract Address Validation
    if (!CONTRACT_ADDRESS) {
      const errorMsg = getErrorMessage({ message: "Contract address missing" });
      alert(errorMsg);
      return;
    }

    try {
      // 3. Execute Transaction
      // We cast to 'any' to prevent Wagmi from trying to deep-validate 
      // the ABI against the function name at compile time.
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: FutureLockABI.abi as any,
        functionName: 'purchaseInsight',
        args: [BigInt(insightId)],
        value: parseEther(priceInEth),
      } as any);

    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(errorMsg);
    }
  };

  return { 
    purchaseInsight, 
    isPending, 
    error, 
    hash 
  };
};

export default useFutureLock;
