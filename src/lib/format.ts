import { formatUnits } from "viem";
import { USDT_DECIMALS } from "@/config/contract";

export function shortAddress(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function fmtUsdt(value?: bigint | string | number | null, digits = 2): string {
  if (value === undefined || value === null) return "0.00";
  try {
    const n =
      typeof value === "bigint"
        ? Number(formatUnits(value, USDT_DECIMALS))
        : typeof value === "string"
          ? Number(formatUnits(BigInt(value), USDT_DECIMALS))
          : Number(value);
    return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  } catch {
    return "0.00";
  }
}

export function fmtNumber(value?: bigint | number | null): string {
  if (value === undefined || value === null) return "0";
  const n = typeof value === "bigint" ? Number(value) : value;
  return n.toLocaleString("en-US");
}

export function fmtDate(timestamp?: bigint | number | null): string {
  if (!timestamp) return "-";
  const ms = (typeof timestamp === "bigint" ? Number(timestamp) : timestamp) * 1000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function countdown(endTs: bigint | number): string {
  const end = typeof endTs === "bigint" ? Number(endTs) : endTs;
  const now = Math.floor(Date.now() / 1000);
  let diff = end - now;
  if (diff <= 0) return "Matured";
  const days = Math.floor(diff / 86400); diff %= 86400;
  const hrs = Math.floor(diff / 3600);   diff %= 3600;
  const mins = Math.floor(diff / 60);
  return `${days}d ${hrs}h ${mins}m`;
}
