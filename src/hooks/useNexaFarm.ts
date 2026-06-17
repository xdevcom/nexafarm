import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  USDT_ADDRESS,
  USDT_DECIMALS,
  CHAIN_ID,
} from "@/config/contract";

export type DepositTuple = {
  amount: bigint;
  planId: number;
  startTime: bigint;
  endTime: bigint;
  lastClaim: bigint;
  totalClaimed: bigint;
  withdrawn: boolean;
};

export type UserInfo = {
  totalDeposit: bigint;
  totalRoiEarned: bigint;
  referralEarnings: bigint;
  leadershipEarnings: bigint;
  directReferrals: bigint;
  totalReferrals: bigint;
  teamVolume: bigint;
  leadershipRank: bigint;
  lastLeadershipClaim: bigint;
  pendingReferralBonus: bigint;
};

export function useGlobalStats() {
  return useReadContracts({
    allowFailure: true,
    contracts: [
      { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "totalUsers", chainId: CHAIN_ID },
      { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "totalValueLocked", chainId: CHAIN_ID },
    ],
    query: { refetchInterval: 30_000 },
  });
}

export function useUserInfo() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
}

export function useUserDeposits() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUserDeposits",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
}

export function useUsdtBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
}

export function useUsdtAllowance() {
  const { address } = useAccount();
  return useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
}

export function useTxWrite() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function run(
    label: string,
    args: Parameters<typeof writeContractAsync>[0],
  ) {
    const t = toast.loading(`${label}: confirm in wallet...`);
    try {
      const tx = await writeContractAsync(args);
      toast.loading(`${label} submitted, waiting for confirmation...`, { id: t });
      return tx;
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      toast.error(err?.shortMessage || err?.message || `${label} failed`, { id: t });
      throw e;
    }
  }

  return { run, isPending, isConfirming, isSuccess, hash };
}

export function toUsdt(amount: string | number): bigint {
  return parseUnits(String(amount || 0), USDT_DECIMALS);
}
