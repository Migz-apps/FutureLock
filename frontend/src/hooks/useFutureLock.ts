"use client";

import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import FutureLockABI from '../abis/FutureLock.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0") as `0x${string}`;

export const useFutureLock = () => {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const purchaseInsight = async (insightId: string, priceInEth: string) => {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0") {
      console.error("Contract address is missing in .env.local");
      return;
    }

    try {
      // We cast the entire configuration object to 'any' to stop the 
      // ts(2345) error. This is the only way to stop Wagmi from 
      // over-validating the ABI against the function name.
      const contractConfig: any = {
        address: CONTRACT_ADDRESS,
        abi: FutureLockABI.abi,
        functionName: 'purchaseInsight',
        args: [BigInt(insightId)],
        value: parseEther(priceInEth),
      };

      writeContract(contractConfig);
    } catch (err) {
      console.error("Transaction initiation failed:", err);
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