import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConnectButton } from "@/components/ConnectButton";
import { useUserInfo, useTxWrite, type UserInfo } from "@/hooks/useNexaFarm";
import { fmtNumber, fmtUsdt, fmtDate } from "@/lib/format";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contract";
import { Crown, Trophy } from "lucide-react";

export const Route = createFileRoute("/leadership")({
  head: () => ({ meta: [{ title: "Leadership — NexaFarm" }, { name: "description", content: "Earn monthly USDT leadership bonuses on NexaFarm." }] }),
  component: LeadershipPage,
});

const RANKS = [
  { lvl: 1, reward: 25,  team: 250,  vol: 10_000 },
  { lvl: 2, reward: 50,  team: 500,  vol: 25_000 },
  { lvl: 3, reward: 100, team: 1000, vol: 50_000 },
  { lvl: 4, reward: 250, team: 2500, vol: 100_000 },
];

function LeadershipPage() {
  const { isConnected } = useAccount();
  const userInfo = useUserInfo();
  const { run, isPending, isConfirming, isSuccess } = useTxWrite();

  useEffect(() => { if (isSuccess) userInfo.refetch(); }, [isSuccess]);

  const info = userInfo.data as UserInfo | undefined;
  const teamCount = Number(info?.totalReferrals ?? 0n);
  const teamVolumeBig = info?.teamVolume ?? 0n;
  const teamVolume = Number(teamVolumeBig) / 1e18;
  const rank = Number(info?.leadershipRank ?? 0n);
  const lastClaim = Number(info?.lastLeadershipClaim ?? 0n);
  const nextClaim = lastClaim ? lastClaim + 30 * 86400 : 0;
  const now = Math.floor(Date.now() / 1000);
  const canClaim = rank > 0 && (lastClaim === 0 || now >= nextClaim);

  async function claim() {
    await run("Claim Leadership Bonus", {
      address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: "claimLeadershipBonus", args: [],
    });
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold">Leadership <span className="text-gradient">Program</span></h1>
        <p className="text-muted-foreground mt-2">Build an active team to unlock monthly USDT rewards.</p>

        {!isConnected && (
          <Card className="glass p-8 mt-8 text-center border-primary/15">
            <p className="text-muted-foreground">Connect your wallet to see your rank progress.</p>
            <div className="mt-4 inline-flex"><ConnectButton /></div>
          </Card>
        )}

        {isConnected && (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              <StatBox label="Team Count" value={fmtNumber(teamCount)} />
              <StatBox label="Team Volume" value={`${fmtUsdt(teamVolumeBig)} USDT`} />
              <StatBox label="Current Rank" value={rank > 0 ? `Level ${rank}` : "—"} />
            </div>

            <Card className="glass p-6 mt-6 border-primary/15 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Next Claim</p>
                <p className="text-lg font-semibold mt-1">{lastClaim ? fmtDate(nextClaim) : (rank > 0 ? "Available now" : "Reach Level 1 first")}</p>
                <p className="text-xs text-muted-foreground mt-1">Last claim: {lastClaim ? fmtDate(lastClaim) : "Never"}</p>
              </div>
              <Button onClick={claim} disabled={!canClaim || isPending || isConfirming}
                className="gradient-primary text-primary-foreground font-semibold">
                <Trophy className="h-4 w-4 mr-2" /> {isPending || isConfirming ? "Processing..." : "Claim Leadership Bonus"}
              </Button>
            </Card>
          </>
        )}

        <h2 className="text-2xl font-bold mt-12">Rank Levels</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {RANKS.map((r) => {
            const teamPct = isConnected ? Math.min(100, (teamCount / r.team) * 100) : 0;
            const volPct = isConnected ? Math.min(100, (teamVolume / r.vol) * 100) : 0;
            const achieved = rank >= r.lvl;
            return (
              <Card key={r.lvl} className={`glass p-6 border-primary/15 ${achieved ? "glow border-primary/60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level {r.lvl}</span>
                  <Crown className={`h-4 w-4 ${achieved ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="mt-2 text-3xl font-bold text-primary">{r.reward}<span className="text-sm text-muted-foreground font-normal"> USDT/mo</span></div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between"><span>Team {fmtNumber(Math.min(teamCount, r.team))} / {r.team}</span><span>{teamPct.toFixed(0)}%</span></div>
                    <Progress value={teamPct} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between"><span>Vol ${fmtNumber(Math.floor(Math.min(teamVolume, r.vol)))} / ${fmtNumber(r.vol)}</span><span>{volPct.toFixed(0)}%</span></div>
                    <Progress value={volPct} className="h-1.5 mt-1" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass p-5 border-primary/15">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  );
}
