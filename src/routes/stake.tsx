import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { isAddress, formatUnits, zeroAddress } from "viem";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectButton } from "@/components/ConnectButton";
import {
  PLANS, CONTRACT_ABI, CONTRACT_ADDRESS, ERC20_ABI, USDT_ADDRESS, USDT_DECIMALS, MIN_DEPOSIT, CHAIN_ID,
} from "@/config/contract";
import {
  useUsdtAllowance, useUsdtBalance, useUserDeposits, useTxWrite, toUsdt, type DepositTuple,
} from "@/hooks/useNexaFarm";
import { fmtDate, fmtUsdt, countdown } from "@/lib/format";
import { Clock, CheckCircle2 } from "lucide-react";
import { useSearch, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/stake")({
  head: () => ({ meta: [{ title: "Stake USDT — NexaFarm" }, { name: "description", content: "Stake USDT on BSC with 30/90/180/360 day plans." }] }),
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
  component: StakePage,
});

function StakePage() {
  const { address, isConnected, chainId } = useAccount();
  const { ref } = useSearch({ from: "/stake" });
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [planId, setPlanId] = useState<number>(0);
  const [referrer, setReferrer] = useState<string>(ref ?? "");

  useEffect(() => { if (ref && !referrer) setReferrer(ref); }, [ref]);

  const balance = useUsdtBalance();
  const allowance = useUsdtAllowance();
  const deposits = useUserDeposits();
  const { run, isPending, isConfirming, isSuccess } = useTxWrite();
  const [autoStake, setAutoStake] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed");
      balance.refetch(); allowance.refetch(); deposits.refetch();
    }
  }, [isSuccess]);

  const balanceNum = balance.data ? Number(formatUnits(balance.data as bigint, USDT_DECIMALS)) : 0;
  const allowanceNum = allowance.data ? Number(formatUnits(allowance.data as bigint, USDT_DECIMALS)) : 0;
  const amountNum = Number(amount || 0);
  const needsApprove = amountNum > allowanceNum;
  const wrongNetwork = isConnected && chainId !== CHAIN_ID;

  async function onApprove() {
    if (amountNum < MIN_DEPOSIT) { toast.error(`Enter at least ${MIN_DEPOSIT} USDT before approving`); return; }
    setAutoStake(true);
    try {
      await run("Approve USDT", {
        address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "approve",
        args: [CONTRACT_ADDRESS, toUsdt(amount)],
      });
    } catch {
      setAutoStake(false);
    }
  }

  async function onStake() {
    if (!isConnected) { toast.error("Connect wallet first"); return; }
    if (wrongNetwork) { toast.error("Switch network to BNB Smart Chain"); return; }
    if (amountNum < MIN_DEPOSIT) { toast.error(`Minimum deposit is ${MIN_DEPOSIT} USDT`); return; }
    if (amountNum > balanceNum) { toast.error("Insufficient USDT balance"); return; }
    const refAddr = referrer && isAddress(referrer) ? (referrer as `0x${string}`) : zeroAddress;
    await run("Stake", {
      address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "deposit",
      args: [toUsdt(amount), planId, refAddr],
    });
  }

  // Auto-trigger stake once approval is confirmed and allowance refreshed
  useEffect(() => {
    if (autoStake && !needsApprove && !isPending && !isConfirming && amountNum >= MIN_DEPOSIT) {
      setAutoStake(false);
      onStake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStake, needsApprove, isPending, isConfirming]);

  const list = (deposits.data as DepositTuple[] | undefined) ?? [];

  const selected = PLANS[planId];
  const projected = useMemo(() => {
    if (!amountNum || !selected) return 0;
    return amountNum * (selected.totalRoi / 100);
  }, [amountNum, selected]);

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Stake <span className="text-gradient">USDT</span></h1>
          <p className="text-muted-foreground mt-2">Choose a plan, enter your amount, and start earning daily ROI on BSC.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="glass p-6 border-primary/15">
            <Label className="text-sm font-semibold">Select Plan</Label>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {PLANS.map((p) => {
                const active = planId === p.id;
                return (
                  <button key={p.id} onClick={() => setPlanId(p.id)}
                    className={`text-left rounded-xl p-4 border transition ${active ? "border-primary bg-primary/10 glow" : "border-primary/15 hover:border-primary/40 bg-card/50"}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{p.label}</span>
                      {active && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-primary">{p.dailyRate}%<span className="text-xs text-muted-foreground font-normal"> /day</span></div>
                    <div className="mt-1 text-xs text-muted-foreground">Total ROI: <span className="text-foreground font-semibold">{p.totalRoi}%</span> · Min {MIN_DEPOSIT} USDT</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount" className="text-sm font-semibold">Amount (USDT)</Label>
                  <span className="text-xs text-muted-foreground">Balance: {fmtUsdt(balance.data as bigint)}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input id="amount" type="number" min={MIN_DEPOSIT} step="0.01" placeholder="10.00"
                    value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-input/40 text-lg h-12" />
                  <Button type="button" variant="outline" className="h-12 border-primary/40"
                    onClick={() => setAmount(balanceNum > 0 ? String(balanceNum) : "")}>MAX</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="ref" className="text-sm font-semibold">Referrer (optional)</Label>
                <Input id="ref" placeholder="0x..." value={referrer}
                  onChange={(e) => setReferrer(e.target.value)} className="mt-2 bg-input/40 font-mono text-sm" />
              </div>
            </div>
          </Card>

          <Card className="glass p-6 border-primary/15 h-fit">
            <h3 className="font-semibold text-lg">Summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Plan" v={selected.label} />
              <Row k="Daily ROI" v={`${selected.dailyRate}%`} />
              <Row k="Total ROI" v={`${selected.totalRoi}%`} />
              <Row k="Stake Amount" v={`${fmtUsdt(amountNum * 10 ** USDT_DECIMALS)} USDT`} />
              <Row k="Projected Earnings" v={`${projected.toFixed(2)} USDT`} highlight />
            </dl>

            <div className="mt-6 space-y-2">
              {!isConnected ? (
                <ConnectButton block />
              ) : wrongNetwork ? (
                <Button disabled className="w-full" variant="destructive">Switch to BNB Testnet</Button>
              ) : needsApprove ? (
                <Button onClick={onApprove} disabled={isPending || isConfirming} className="w-full gradient-primary text-primary-foreground font-semibold">
                  {isPending || isConfirming ? "Approving..." : "Approve USDT"}
                </Button>
              ) : (
                <Button onClick={onStake} disabled={isPending || isConfirming || !amount}
                  className="w-full gradient-primary text-primary-foreground font-semibold animate-pulse-glow">
                  {isPending || isConfirming ? "Processing..." : "Stake Now"}
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground text-center">Network: BNB Smart Chain Testnet · Token: USDT (BEP-20)</p>
            </div>
          </Card>
        </div>

        {/* History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold">My Deposits</h2>
          <Card className="glass mt-4 overflow-hidden border-primary/15">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead className="bg-primary/5">
                  <tr className="text-left">
                    {["#", "Plan", "Amount", "Start", "End", "Status"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {deposits.isLoading && (
                    <tr><td colSpan={6} className="p-6"><div className="h-6 w-full shimmer rounded" /></td></tr>
                  )}
                  {!deposits.isLoading && list.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{isConnected ? "No deposits yet." : "Connect wallet to view deposits."}</td></tr>
                  )}
                  {list.map((d, i) => (
                    <tr key={i} className="border-t border-primary/10">
                      <td className="px-4 py-3 font-mono">{i + 1}</td>
                      <td className="px-4 py-3">{PLANS[d.planId]?.label ?? `Plan #${d.planId}`}</td>
                      <td className="px-4 py-3">{fmtUsdt(d.amount)} USDT</td>
                      <td className="px-4 py-3">{fmtDate(d.startTime)}</td>
                      <td className="px-4 py-3">{fmtDate(d.endTime)}</td>
                      <td className="px-4 py-3">
                        {d.withdrawn ? <span className="text-muted-foreground">Closed</span>
                          : <span className="inline-flex items-center gap-1.5 text-primary"><Clock className="h-3 w-3" />{countdown(d.endTime)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={highlight ? "text-primary font-bold text-lg" : "text-foreground font-medium"}>{v}</dd>
    </div>
  );
}
