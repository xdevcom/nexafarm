import { useAccount, useDisconnect, useChainId, useSwitchChain, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/format";
import { CHAIN_ID } from "@/config/contract";
import { Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

function ConnectButtonInner({ block }: { block: boolean }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors, isPending } = useConnect();

  const connectWallet = () => {
    const connector = connectors[0];
    if (!connector) return;
    connect({ connector, chainId: CHAIN_ID });
  };

  const baseClass = `gradient-primary text-primary-foreground font-semibold animate-pulse-glow ${block ? "w-full" : ""}`;

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={isPending} className={baseClass}>
        <Wallet className="h-4 w-4 mr-2" /> {isPending ? "Connecting..." : "Connect Wallet"}
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
        onClick={connectWallet}
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

