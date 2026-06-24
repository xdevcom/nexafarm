import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — NexaFarm" }, { name: "description", content: "Frequently asked questions about NexaFarm staking, referrals, leadership, and withdrawals." }] }),
  component: FaqPage,
});

const CATEGORIES: { name: string; faqs: { q: string; a: string }[] }[] = [
  {
    name: "General Questions",
    faqs: [
      { q: "What is NexaFarm?", a: "NexaFarm is a decentralized staking protocol on BNB Smart Chain that lets you stake USDT and earn daily ROI plus referral and leadership rewards." },
      { q: "Which blockchain does NexaFarm run on?", a: "NexaFarm runs on BNB Smart Chain Testnet, Chain ID 97." },
      { q: "Is NexaFarm custodial?", a: "No. All funds are held by the smart contract. You always control your own wallet." },
      { q: "Which wallets are supported?", a: "Any injected EVM wallet such as MetaMask, Trust Wallet browser extension, OKX, or Rabby." },
      { q: "Do I need BNB to interact with NexaFarm?", a: "Yes, a small amount of BNB is required to pay BSC gas fees." },
    ],
  },
  {
    name: "Staking & Plans",
    faqs: [
      { q: "What plans are available?", a: "30 days @ 0.30%/day, 90 days @ 0.35%/day, 180 days @ 0.40%/day, and 360 days @ 0.50%/day." },
      { q: "What is the minimum deposit?", a: "10 USDT (BEP-20)." },
      { q: "Can I stake multiple times?", a: "Yes — every deposit creates a separate position you can track in your Dashboard." },
      { q: "How is ROI calculated?", a: "Daily ROI accrues per second based on your plan's daily rate and is claimable at any time." },
      { q: "Do I need to approve USDT first?", a: "Yes. You approve the staking contract to spend USDT once, then your future deposits don't need a new approval." },
    ],
  },
  {
    name: "Referral System",
    faqs: [
      { q: "How many referral levels are there?", a: "Four levels: 5% (L1), 3% (L2), 1% (L3), and 1% (L4) of each downline deposit." },
      { q: "What are the qualification rules?", a: "Level 1 requires an active deposit. Levels 2-4 also require 10/15/20 direct active referrals respectively." },
      { q: "How do I get my referral link?", a: "Connect your wallet and visit the Referral page — your link is generated automatically." },
      { q: "When are referral bonuses paid?", a: "Bonuses accrue instantly. Withdraw them any time from the Referral page." },
    ],
  },
  {
    name: "Leadership Program",
    faqs: [
      { q: "How do I qualify for leadership?", a: "By reaching team count and team volume thresholds: 250/500/1000/2500 team and 10k/25k/50k/100k USDT volume." },
      { q: "How often can I claim?", a: "Leadership bonuses can be claimed every 30 days." },
      { q: "Do I keep earning if I drop below the threshold?", a: "You only qualify for the highest active rank when claiming. Maintain your team to keep your rank." },
      { q: "Is the leadership bonus on top of referral bonuses?", a: "Yes — leadership is an additional monthly reward." },
    ],
  },
  {
    name: "Withdrawals & Fees",
    faqs: [
      { q: "When can I withdraw my capital?", a: "Capital is released at the end of your staking plan's lock period." },
      { q: "Can I withdraw ROI before plan end?", a: "Yes — claim accumulated ROI at any time." },
      { q: "Are there any fees?", a: "Only the network gas fee paid in BNB. NexaFarm does not charge additional protocol withdrawal fees." },
      { q: "What if a transaction fails?", a: "No funds are moved on a failed transaction — you only lose the gas of that attempt. Try again with a clean nonce and adequate gas." },
    ],
  },
];

function FaqPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return CATEGORIES;
    const term = q.toLowerCase();
    return CATEGORIES.map((c) => ({
      ...c,
      faqs: c.faqs.filter((f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)),
    })).filter((c) => c.faqs.length > 0);
  }, [q]);

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-center">Frequently Asked <span className="text-gradient">Questions</span></h1>
        <p className="text-muted-foreground text-center mt-2">Everything you need to know about NexaFarm.</p>

        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions..." className="pl-10 h-12 bg-input/40" />
        </div>

        <div className="mt-10 space-y-8">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No matching questions.</p>
          )}
          {filtered.map((cat) => (
            <div key={cat.name}>
              <h2 className="text-lg font-semibold text-primary mb-3">{cat.name}</h2>
              <Card className="glass border-primary/15 px-4">
                <Accordion type="single" collapsible className="w-full">
                  {cat.faqs.map((f, i) => (
                    <AccordionItem key={i} value={`${cat.name}-${i}`} className="border-primary/10">
                      <AccordionTrigger className="text-left font-medium hover:text-primary">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>

        <Card className="glass mt-12 p-8 text-center border-primary/15">
          <MessageCircle className="h-10 w-10 mx-auto text-primary" />
          <h3 className="mt-3 text-xl font-semibold">Still have questions?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Reach out to our team on Telegram or Discord for support.</p>
        </Card>
      </section>
    </PageShell>
  );
}
