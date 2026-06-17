import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/format";
import { CHAIN_ID } from "@/config/contract";
import { Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button disabled className="gradient-primary text-primary-foreground font-semibold"><Wallet className="h-4 w-4 mr-2" />Connect Wallet</Button>;
  }

  const open = () => {
    // @ts-expect-error appkit web component
    document.querySelector("w3m-button")?.click?.();
    // Fallback: use modal API
    import("@reown/appkit/react").then(({ useAppKit }) => {
      // no-op; handled below via direct open
    });
    // Direct: open modal via global
    const w = window as unknown as { appKit?: { open: () => void } };
    if (w.appKit?.open) w.appKit.open();
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => {
          const m = document.querySelector("w3m-button") as HTMLElement | null;
          if (m) {
            (m.shadowRoot?.querySelector("button") as HTMLButtonElement | null)?.click();
          }
          open();
        }}
        className="gradient-primary text-primary-foreground font-semibold animate-pulse-glow"
      >
        <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
        <span className="sr-only"><w3m-button /></span>
      </Button>
    );
  }

  const wrongNetwork = chainId !== CHAIN_ID;
  if (wrongNetwork) {
    return (
      <Button onClick={() => switchChain({ chainId: CHAIN_ID })} variant="destructive">
        Switch to BSC
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="glass rounded-lg px-3 py-1.5 text-sm font-mono text-foreground">
        {shortAddress(address)}
      </div>
      <Button size="icon" variant="ghost" onClick={() => disconnect()} title="Disconnect">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
