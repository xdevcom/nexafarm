import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLANS } from "@/config/contract";
import { ShieldCheck, TrendingUp, Users, Crown, Wallet, Coins, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexaFarm — Stake USDT, Earn Daily ROI on BSC" },
      { name: "description", content: "The Future of DeFi Staking. Stake USDT on BNB Smart Chain and earn up to 0.5% daily ROI with referral and leadership rewards." },
      { property: "og:title", content: "NexaFarm — DeFi Staking" },
      { property: "og:description", content: "Stake USDT. Earn Daily ROI. Build Your Team." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-primary mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Live on BNB Smart Chain
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            NexaFarm — <span className="text-gradient">The Future</span><br />of DeFi Staking
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Stake USDT, Earn Daily ROI, Build Your Team, Maximize Your Earnings.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/stake">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold animate-pulse-glow">
                Start Staking
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-primary/40">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-primary/10 bg-card/40 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 text-sm font-semibold">
              {PLANS.map((p) => (
                <span key={p.id} className="flex items-center gap-2 text-foreground">
                  <Zap className="h-4 w-4 text-primary" />
                  {p.days} Days <span className="text-primary">• {p.dailyRate}%/day</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Why Choose <span className="text-gradient">NexaFarm</span></h2>
        <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">
          A modern, transparent, and rewarding staking experience powered by smart contracts.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { I: TrendingUp, t: "Daily ROI", d: "Earn between 0.3% and 0.5% every single day from your stake." },
            { I: Users, t: "Referral Rewards", d: "Up to 4 levels of referral bonuses, paid in USDT." },
            { I: Crown, t: "Leadership Bonus", d: "Monthly USDT bonus when you build an active team." },
            { I: ShieldCheck, t: "Secure & Audited", d: "Non-custodial, on-chain smart contract on BSC." },
          ].map(({ I, t, d }) => (
            <Card key={t} className="glass p-6 border-primary/15 hover:border-primary/40 transition-all hover:-translate-y-1 hover:glow">
              <div className="h-11 w-11 rounded-lg gradient-primary grid place-items-center text-primary-foreground">
                <I className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center">How It Works</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { I: Wallet, t: "1. Connect Wallet", d: "Connect an injected EVM wallet on BNB Smart Chain Testnet." },
            { I: Coins, t: "2. Choose Plan", d: "Pick from 30, 90, 180, or 360 day staking plans starting at 10 USDT." },
            { I: TrendingUp, t: "3. Earn Daily", d: "Withdraw your ROI any time. Get your capital back at maturity." },
          ].map(({ I, t, d }) => (
            <Card key={t} className="glass p-8 text-center border-primary/15">
              <div className="mx-auto h-14 w-14 rounded-full gradient-primary grid place-items-center text-primary-foreground">
                <I className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Staking <span className="text-gradient">Plans</span></h2>
        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[640px] glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/5 text-foreground">
                <tr>
                  <th className="px-6 py-4 text-left">Plan</th>
                  <th className="px-6 py-4 text-left">Duration</th>
                  <th className="px-6 py-4 text-left">Daily ROI</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((p) => (
                  <tr key={p.id} className="border-t border-primary/10">
                    <td className="px-6 py-4 font-semibold text-primary">{p.label}</td>
                    <td className="px-6 py-4">{p.days} Days</td>
                    <td className="px-6 py-4">{p.dailyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link to="/stake">
            <Button size="lg" className="gradient-primary text-primary-foreground font-semibold">
              Stake Now
            </Button>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
