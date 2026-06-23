import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RPC_URL } from "@/config/contract";

// SSR-safe fallback config. Reown AppKit packages reference `HTMLElement`
// at module init (Lit web components), so they MUST NOT be imported at
// top level — only inside a client-only dynamic import.
const ssrConfig = createConfig({
  chains: [bsc],
  transports: { [bsc.id]: http(RPC_URL) },
});

async function initAppKitClient(): Promise<Config> {
  if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
    return ssrConfig;
  }
  const appkit = await import("./appkit-browser");
  return appkit.initAppKitClient();
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: false } },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(ssrConfig);
  useEffect(() => {
    if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
      return;
    }
    let cancelled = false;
    initAppKitClient()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch((err) => console.error("AppKit init failed", err));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
