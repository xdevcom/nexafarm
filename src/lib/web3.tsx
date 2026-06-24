import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { bscTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RPC_URL } from "@/config/contract";
import type { ReactNode } from "react";

const config = createConfig({
  chains: [bscTestnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: { [bscTestnet.id]: http(RPC_URL) },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: false } },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
