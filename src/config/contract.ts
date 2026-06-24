// NexaFarm smart contract configuration on BNB Smart Chain
export const CHAIN_ID = 97;
export const RPC_URL = "https://misty-few-vineyard.bsc-testnet.quiknode.pro/b9c24315a4796add28d68735adffba4427238f1d";
export const BSC_SCAN = "https://testnet.bscscan.com";

export const CONTRACT_ADDRESS = "0xa06c737d7ff387738CfC9427fDd9De61E85859A3" as const;

// BNB Smart Chain Testnet USDT (BEP-20, 18 decimals)
export const USDT_ADDRESS = "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814" as const;
export const USDT_DECIMALS = 18;

export const PLANS = [
  { id: 0, days: 30,  dailyRate: 0.30, totalRoi: 9.0,   label: "30 Days"  },
  { id: 1, days: 90,  dailyRate: 0.35, totalRoi: 31.5,  label: "90 Days"  },
  { id: 2, days: 180, dailyRate: 0.40, totalRoi: 72.0,  label: "180 Days" },
  { id: 3, days: 360, dailyRate: 0.50, totalRoi: 180.0, label: "360 Days" },
] as const;

export const MIN_DEPOSIT = 10;

// Minimal ABI for NexaFarm staking contract — covers all UI flows.
// Replace with the full deployed ABI if additional functions are needed.
export const CONTRACT_ABI = [
  // ---- Writes ----
  { type: "function", name: "deposit",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "planId", type: "uint8" },
      { name: "referrer", type: "address" },
    ], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "withdrawROI",
    inputs: [{ name: "depositIndex", type: "uint256" }],
    outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "withdrawCapital",
    inputs: [{ name: "depositIndex", type: "uint256" }],
    outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "withdrawReferralBonus",
    inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "claimLeadershipBonus",
    inputs: [], outputs: [], stateMutability: "nonpayable" },

  // ---- Reads ----
  { type: "function", name: "getUserInfo", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalDeposit",       type: "uint256" },
      { name: "totalRoiEarned",     type: "uint256" },
      { name: "referralEarnings",   type: "uint256" },
      { name: "leadershipEarnings", type: "uint256" },
      { name: "directReferrals",    type: "uint256" },
      { name: "totalReferrals",     type: "uint256" },
      { name: "teamVolume",         type: "uint256" },
      { name: "leadershipRank",     type: "uint256" },
      { name: "lastLeadershipClaim",type: "uint256" },
      { name: "pendingReferralBonus", type: "uint256" },
    ],
  },
  { type: "function", name: "getUserDeposits", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{
      name: "deposits", type: "tuple[]",
      components: [
        { name: "amount",      type: "uint256" },
        { name: "planId",      type: "uint8"   },
        { name: "startTime",   type: "uint256" },
        { name: "endTime",     type: "uint256" },
        { name: "lastClaim",   type: "uint256" },
        { name: "totalClaimed",type: "uint256" },
        { name: "withdrawn",   type: "bool"    },
      ],
    }],
  },
  { type: "function", name: "totalUsers", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "totalValueLocked", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "pendingROI", stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "depositIndex", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }] },
  { type: "function", name: "decimals", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;

export const REOWN_PROJECT_ID = "9994e4620ba3499ea0460291f0ab4223";
