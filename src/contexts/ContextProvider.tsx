import { FC, ReactNode, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Cluster, clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  AutoConnectProvider,
  useAutoConnect,
} from "@/contexts/AutoConnectProvider";
import { NetworkConfigurationProvider } from "@/contexts/NetworkConfigurationProvider";
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
// } from "@solana/wallet-adapter-wallets";

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false },
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  // compute the correct solana endpoint to connect to
  const endpoint = useMemo(
    () =>
      process?.env?.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl(
        (process?.env?.NEXT_PUBLIC_SOLANA_RPC_MONIKER as Cluster) || "devnet",
      ),
    [],
  );

  const wallets = useMemo(
    () => [
      /**
       * not explicitly defining wallet adapters here will
       * only support wallet adapter standard by default
       */
      // new UnsafeBurnerWalletAdapter()
      // new PhantomWalletAdapter(),
      // new SolflareWalletAdapter(),
    ],
    [
      /*endpoint*/
    ],
  );

  const onError = useCallback((error: WalletError) => {
    toast.error(error.message ? `${error.name}: ${error.message}` : error.name);
    console.error(error);
  }, []);

  return (
    // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        <ReactUIWalletModalProviderDynamic>
          {children}
        </ReactUIWalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
