import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Twitter, Send, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-primary/10 bg-background/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-sm">
            NexaFarm is a next-generation DeFi staking protocol on BNB Smart Chain.
            Stake USDT, earn daily ROI, and grow your team rewards.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/stake" className="hover:text-primary">Stake</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            <li><Link to="/referral" className="hover:text-primary">Referral</Link></li>
            <li><Link to="/leadership" className="hover:text-primary">Leadership</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Community</h4>
          <div className="flex gap-3">
            {[
              { I: Twitter, href: "#", label: "Twitter" },
              { I: Send, href: "#", label: "Telegram" },
              { I: MessageCircle, href: "#", label: "WhatsApp" },
            ].map(({ I, href, label }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer" aria-label={label}
                 className="glass h-10 w-10 grid place-items-center rounded-lg text-foreground hover:text-primary hover:glow transition">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-primary/10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexaFarm. All rights reserved.
      </div>
    </footer>
  );
}
