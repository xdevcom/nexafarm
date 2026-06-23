import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/format";
import { CHAIN_ID } from "@/config/contract";
import { Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

// Reown AppKit references browser globals (HTMLElement) at module init,
// so we must NOT statically import from "@reown/appkit/react" anywhere
// that runs during SSR. Load it lazily on the client instead.
function useOpenAppKit(): () => void {
  const [open, setOpen] = useState<() => void>(() => () => {});
  useEffect(() => {
    if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
      return;
    }
    let cancelled = false;
    const mod = ["@/lib", "appkit.client"].join("/");
    (import(/* @vite-ignore */ mod) as Promise<{ openAppKitModal: () => Promise<void> }>)

      .then((m) => {
        if (cancelled) return;
        setOpen(() => () => {
          void m.openAppKitModal().catch((e) => console.error(e));
        });
      })
      .catch((e) => console.error("AppKit load failed", e));

    return () => {
      cancelled = true;
    };
  }, []);
  return open;
}

function ConnectButtonInner({ block }: { block: boolean }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const open = useOpenAppKit();

  const baseClass = `gradient-primary text-primary-foreground font-semibold animate-pulse-glow ${block ? "w-full" : ""}`;

  if (!isConnected) {
    return (
      <Button onClick={() => open()} className={baseClass}>
        <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
      </Button>
    );
  }

  if (chainId !== CHAIN_ID) {
    return (
      <Button onClick={() => switchChain({ chainId: CHAIN_ID })} variant="destructive" className={block ? "w-full" : ""}>
        Switch to BSC
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${block ? "w-full" : ""}`}>
      <button
        onClick={() => open()}
        className="glass rounded-lg px-3 py-1.5 text-sm font-mono text-foreground hover:bg-card flex-1 text-left"
      >
        {shortAddress(address)}
      </button>
      <Button size="icon" variant="ghost" onClick={() => disconnect()} title="Disconnect">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ConnectButton({ block = false }: { block?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const baseClass = `gradient-primary text-primary-foreground font-semibold animate-pulse-glow ${block ? "w-full" : ""}`;

  if (!mounted) {
    return (
      <Button disabled className={baseClass}>
        <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
      </Button>
    );
  }

  return <ConnectButtonInner block={block} />;
}

// Re-export the modal singleton helper for callers that want to open the
// modal imperatively without going through the hook.
export async function openAppKitModal() {
  if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
    return;
  }
  const mod = ["@/lib", "appkit.client"].join("/");
  const m = (await import(/* @vite-ignore */ mod)) as { openAppKitModal: () => Promise<void> };

  await m.openAppKitModal();
}

