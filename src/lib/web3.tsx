import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { REOWN_PROJECT_ID, RPC_URL } from "@/config/contract";

// SSR-safe fallback config. Reown AppKit packages reference `HTMLElement`
// at module init (Lit web components), so they MUST NOT be imported at
// top level — only inside a client-only dynamic import.
const ssrConfig = createConfig({
  chains: [bsc],
  transports: { [bsc.id]: http(RPC_URL) },
});

let clientConfigPromise: Promise<Config> | undefined;

function importBrowserOnly<T>(specifier: string): Promise<T> {
  return new Function("s", "return import(s)")(specifier) as Promise<T>;
}

async function initAppKitClient(): Promise<Config> {
  if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
    return ssrConfig;
  }
  if (clientConfigPromise) return clientConfigPromise;
  clientConfigPromise = (async () => {
    const [{ createAppKit }, { WagmiAdapter }] = await Promise.all([
      importBrowserOnly<typeof import("@reown/appkit/react")>("@reown/appkit/react"),
      importBrowserOnly<typeof import("@reown/appkit-adapter-wagmi")>("@reown/appkit-adapter-wagmi"),
    ]);
    const wagmiAdapter = new WagmiAdapter({
      networks: [bsc],
      projectId: REOWN_PROJECT_ID,
      ssr: false,
      transports: { [bsc.id]: http(RPC_URL) },
    });
    createAppKit({
      adapters: [wagmiAdapter],
      networks: [bsc],
      projectId: REOWN_PROJECT_ID,
      defaultNetwork: bsc,
      metadata: {
        name: "NexaFarm",
        description: "NexaFarm — The Future of DeFi Staking",
        url: window.location.origin,
        icons: [],
      },
      features: { analytics: false, email: false, socials: false },
      themeMode: "dark",
      themeVariables: {
        "--w3m-accent": "#22e07a",
        "--w3m-border-radius-master": "12px",
      },
    });
    return wagmiAdapter.wagmiConfig as unknown as Config;
  })();
  return clientConfigPromise;
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
