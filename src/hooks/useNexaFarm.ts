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
  lastWithdrawTime: bigint;
  totalWithdrawn: bigint;
  withdrawn: boolean;
};

export type UserInfo = {
  referrer: `0x${string}`;
  totalReferralBonus: bigint;
  totalLeadershipBonus: bigint;
  lastLeadershipClaim: bigint;
  directCount: bigint;
  teamCount: bigint;
  teamVolume: bigint;
  // Computed fields for UI compatibility if needed
  totalDeposit?: bigint; 
  totalRoiEarned?: bigint;
};

export function useGlobalStats() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getContractStats",
    chainId: CHAIN_ID,
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

export function useUserActiveDepositAmount() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalActiveDepositAmount",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
}

export function useUserDeposits() {
  const { address } = useAccount();
  
  // First get the count of deposits
  const { data: count } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getDepositCount",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  });

  // Then fetch each deposit info
  // Note: Wagmi useReadContracts is better for this
  const contracts = [];
  if (address && count) {
    for (let i = 0; i < Number(count); i++) {
      contracts.push({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getDepositInfo",
        args: [address, BigInt(i)],
        chainId: CHAIN_ID,
      });
    }
  }

  return useReadContracts({
    contracts,
    query: { 
      enabled: !!address && !!count,
      refetchInterval: 20_000,
      select: (data) => {
        return data.map(res => {
          if (res.status === 'success' && Array.isArray(res.result)) {
            const [amount, planId, startTime, endTime, lastWithdrawTime, totalWithdrawn, withdrawn] = res.result;
            return {
              amount,
              planId: Number(planId),
              startTime,
              endTime,
              lastWithdrawTime,
              totalWithdrawn,
              withdrawn
            } as DepositTuple;
          }
          return null;
        }).filter(Boolean) as DepositTuple[];
      }
    },
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
