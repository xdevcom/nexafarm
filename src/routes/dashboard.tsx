import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConnectButton } from "@/components/ConnectButton";
import { useUserDeposits, useUserInfo, useTxWrite, type DepositTuple, type UserInfo } from "@/hooks/useNexaFarm";
import { fmtUsdt, fmtDate, shortAddress, countdown } from "@/lib/format";
import { PLANS, CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contract";
import { Coins, TrendingUp, Users, Crown } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NexaFarm" }, { name: "description", content: "Track your staking deposits, ROI, and rewards on NexaFarm." }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { address, isConnected } = useAccount();
  const userInfo = useUserInfo();
  const deposits = useUserDeposits();
  const { run, isPending, isConfirming, isSuccess } = useTxWrite();

  useEffect(() => { if (isSuccess) { userInfo.refetch(); deposits.refetch(); } }, [isSuccess]);

  // Tick every minute for countdown
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((n) => n + 1), 30_000); return () => clearInterval(id); }, []);

  if (!isConnected) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Connect your wallet to see your stakes and earnings.</p>
          <div className="mt-6 inline-flex"><ConnectButton /></div>
        </div>
      </PageShell>
    );
  }

  const info = userInfo.data as UserInfo | undefined;
  const list = (deposits.data as DepositTuple[] | undefined) ?? [];

  async function withdrawRoi(i: number) {
    await run("Withdraw ROI", {
      address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "withdrawROI", args: [BigInt(i)],
    });
  }
  async function withdrawCapital(i: number) {
    await run("Withdraw Capital", {
      address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "withdrawCapital", args: [BigInt(i)],
    });
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-3xl font-bold font-mono">{shortAddress(address)}</h1>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Active Deposit" value={`${fmtUsdt(info?.totalDeposit)} USDT`} icon={<Coins className="h-5 w-5" />} loading={userInfo.isLoading} />
          <Stat label="Total ROI Earned" value={`${fmtUsdt(info?.totalRoiEarned)} USDT`} icon={<TrendingUp className="h-5 w-5" />} loading={userInfo.isLoading} />
          <Stat label="Referral Earnings" value={`${fmtUsdt(info?.referralEarnings)} USDT`} icon={<Users className="h-5 w-5" />} loading={userInfo.isLoading} />
          <Stat label="Leadership Earnings" value={`${fmtUsdt(info?.leadershipEarnings)} USDT`} icon={<Crown className="h-5 w-5" />} loading={userInfo.isLoading} />
        </div>

        <Card className="glass mt-10 p-0 overflow-hidden border-primary/15">
          <div className="p-5 border-b border-primary/10">
            <h2 className="font-semibold text-lg">Active Deposits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-primary/5">
                <tr className="text-left">
                  {["Plan", "Amount", "Start", "End", "Progress", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {deposits.isLoading && (
                  <tr><td colSpan={7} className="p-6"><div className="h-6 w-full shimmer rounded" /></td></tr>
                )}
                {!deposits.isLoading && list.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No active deposits yet.</td></tr>
                )}
                {list.map((d, i) => {
                  const now = Math.floor(Date.now() / 1000);
                  const total = Number(d.endTime - d.startTime);
                  const elapsed = Math.max(0, Math.min(total, now - Number(d.startTime)));
                  const pct = total > 0 ? (elapsed / total) * 100 : 0;
                  const matured = now >= Number(d.endTime);
                  return (
                    <tr key={i} className="border-t border-primary/10">
                      <td className="px-4 py-4 font-semibold">{PLANS[d.planId]?.label ?? `#${d.planId}`}</td>
                      <td className="px-4 py-4">{fmtUsdt(d.amount)} USDT</td>
                      <td className="px-4 py-4">{fmtDate(d.startTime)}</td>
                      <td className="px-4 py-4">{fmtDate(d.endTime)}</td>
                      <td className="px-4 py-4 min-w-[160px]">
                        <Progress value={pct} className="h-2" />
                        <div className="mt-1 text-[11px] text-muted-foreground">{pct.toFixed(1)}%</div>
                      </td>
                      <td className="px-4 py-4">{d.withdrawn ? "Closed" : matured ? <span className="text-primary">Matured</span> : countdown(d.endTime)}</td>
                      <td className="px-4 py-4 space-x-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" className="border-primary/40"
                          disabled={d.withdrawn || isPending || isConfirming}
                          onClick={() => withdrawRoi(i)}>Withdraw ROI</Button>
                        <Button size="sm" className="gradient-primary text-primary-foreground"
                          disabled={d.withdrawn || !matured || isPending || isConfirming}
                          onClick={() => withdrawCapital(i)}>Withdraw Capital</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, icon, loading }: { label: string; value: string; icon: React.ReactNode; loading?: boolean }) {
  return (
    <Card className="glass p-5 border-primary/15">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-bold">
        {loading ? <span className="inline-block h-7 w-24 shimmer rounded" /> : value}
      </div>
    </Card>
  );
}
