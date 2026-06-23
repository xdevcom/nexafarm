import "@tanstack/react-start/client-only";

import { createAppKit, modal } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http, type Config } from "wagmi";
import { bsc } from "wagmi/chains";

import { REOWN_PROJECT_ID, RPC_URL } from "@/config/contract";

let clientConfigPromise: Promise<Config> | undefined;

export async function initAppKitClient(): Promise<Config> {
  if (clientConfigPromise) return clientConfigPromise;

  clientConfigPromise = (async () => {
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

export async function openAppKitModal() {
  await initAppKitClient();
  await modal?.open?.();
}