"use client";

import { Cluster } from "@solana/web3.js";

export const NoticeMessage: React.FC<React.HTMLAttributes<any>> = ({
  children,
}) => {
  return (
    <p className="max-w-lg p-3 mx-auto text-base text-center bg-yellow-900 border border-yellow-600 rounded-lg">
      {children}
    </p>
  );
};

export const DevnetNotice: React.FC<React.HTMLAttributes<any>> = ({
  children,
}) => {
  if (
    (process?.env?.NEXT_PUBLIC_SOLANA_RPC_MONIKER as Cluster) != "mainnet-beta"
  )
    return children;

  // fallback to no value
  return null;
};
