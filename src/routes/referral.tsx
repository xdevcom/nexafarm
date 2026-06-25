import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ConnectButton";
import { useUserInfo, useTxWrite, type UserInfo } from "@/hooks/useNexaFarm";
import { fmtNumber, fmtUsdt, shortAddress } from "@/lib/format";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contract";
import { Copy, Check, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/referral")({
  head: () => ({ meta: [{ title: "Referral — NexaFarm" }, { name: "description", content: "Invite friends and earn up to 4 levels of referral rewards in USDT." }] }),
  component: ReferralPage,
});

const LEVELS = [
  { lvl: 1, pct: 5, req: "Active deposit" },
  { lvl: 2, pct: 3, req: "Active deposit + 10 direct active" },
  { lvl: 3, pct: 1, req: "Active deposit + 15 direct active" },
  { lvl: 4, pct: 1, req: "Active deposit + 20 direct active" },
];

function ReferralPage() {
  const { address, isConnected } = useAccount();
  const userInfo = useUserInfo();
  const { run, isPending, isConfirming, isSuccess } = useTxWrite();
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (isSuccess) userInfo.refetch(); }, [isSuccess]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = address ? `${origin}/stake?ref=${address}` : "";
  const shortLink = address ? `${origin}/stake?ref=${address.slice(0, 4)}...` : "";

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  async function withdrawBonus() {
    await run("Withdraw Referral Bonus", {
      address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "withdrawReferralBonus", args: [],
    });
  }

  const info = userInfo.data as any;
  // getUserInfo returns: [referrer, totalReferralBonus, totalLeadershipBonus, lastLeadershipClaim, directCount, teamCount, teamVolume]
  const stats = {
    referrer: info?.[0],
    totalReferralBonus: info?.[1] ?? 0n,
    totalLeadershipBonus: info?.[2] ?? 0n,
    lastLeadershipClaim: info?.[3] ?? 0n,
    directCount: info?.[4] ?? 0n,
    teamCount: info?.[5] ?? 0n,
    teamVolume: info?.[6] ?? 0n,
    // In new ABI, we don't have pendingReferralBonus directly in getUserInfo
    // But usually it's totalReferralBonus minus what's already withdrawn
    // For now, let's use totalReferralBonus as available if contract doesn't separate it
    pendingReferralBonus: info?.[1] ?? 0n, 
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold">Referral <span className="text-gradient">Program</span></h1>
        <p className="text-muted-foreground mt-2">Earn instant USDT rewards across 4 levels when your network stakes.</p>

        {!isConnected ? (
          <Card className="glass p-8 mt-8 text-center border-primary/15">
            <p className="text-muted-foreground">Connect your wallet to get your unique referral link.</p>
            <div className="mt-4 inline-flex"><ConnectButton /></div>
          </Card>
        ) : (
          <>
            {/* Link */}
            <Card className="glass p-6 mt-8 border-primary/15">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Your Referral Link</label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 glass rounded-lg px-4 py-3 text-sm font-mono">
                  <span className="sm:hidden">{shortLink}</span>
                  <span className="hidden sm:inline break-all">{link}</span>
                </div>
                <Button onClick={copy} className="gradient-primary text-primary-foreground font-semibold">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Referrer wallet: <span className="font-mono text-foreground">{shortAddress(address)}</span></p>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <StatBox label="Total Referrals" value={fmtNumber(stats.teamCount)} loading={userInfo.isLoading} />
              <StatBox label="Direct Referrals" value={fmtNumber(stats.directCount)} loading={userInfo.isLoading} />
              <StatBox label="Referral Earnings" value={`${fmtUsdt(stats.totalReferralBonus)} USDT`} loading={userInfo.isLoading} />
            </div>

            <Card className="glass p-6 mt-6 border-primary/15">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Referral Bonus Balance</p>
                  <p className="text-2xl font-bold text-primary mt-1">{fmtUsdt(stats.pendingReferralBonus)} USDT</p>
                </div>
                <Button onClick={withdrawBonus} disabled={isPending || isConfirming || !stats.pendingReferralBonus}
                  className="gradient-primary text-primary-foreground font-semibold animate-pulse-glow">
                  <Wallet className="h-4 w-4 mr-2" /> {isPending || isConfirming ? "Processing..." : "Withdraw Bonus"}
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Levels */}
        <h2 className="text-2xl font-bold mt-12">Referral Levels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          {LEVELS.map((l) => (
            <Card key={l.lvl} className="glass p-6 border-primary/15">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level {l.lvl}</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 text-3xl font-bold text-primary">{l.pct}%</div>
              <p className="mt-2 text-xs text-muted-foreground">{l.req}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function StatBox({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <Card className="glass p-5 border-primary/15">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{loading ? <span className="inline-block h-7 w-24 shimmer rounded" /> : value}</p>
    </Card>
  );
}
