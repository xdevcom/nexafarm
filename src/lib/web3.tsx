import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { REOWN_PROJECT_ID, RPC_URL } from "@/config/contract";

const networks = [bsc] as const;

const wagmiAdapter = new WagmiAdapter({
  networks: [bsc],
  projectId: REOWN_PROJECT_ID,
  ssr: false,
  transports: { [bsc.id]: http(RPC_URL) },
});

// Fallback config used during SSR so wagmi hooks have a config in tree.
const ssrConfig = createConfig({
  chains: [bsc],
  transports: { [bsc.id]: http(RPC_URL) },
});

let appKitInitialized = false;
function ensureAppKit() {
  if (appKitInitialized || typeof window === "undefined") return;
  appKitInitialized = true;
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [bsc],
    projectId: REOWN_PROJECT_ID,
    defaultNetwork: bsc,
    metadata: {
      name: "NexaFarm",
      description: "NexaFarm — The Future of DeFi Staking",
      url: typeof window !== "undefined" ? window.location.origin : "https://nexafarm.app",
      icons: [],
    },
    features: { analytics: false, email: false, socials: false },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#22e07a",
      "--w3m-border-radius-master": "12px",
    },
  });
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: false } },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    ensureAppKit();
    setMounted(true);
  }, []);

  const config = mounted ? wagmiAdapter.wagmiConfig : ssrConfig;
  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
