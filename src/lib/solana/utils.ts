/**
 * Assorted utility functions for Solana
 */

import { debug } from "@/lib/utils/logs";
import { Cluster, Connection, VersionedTransaction } from "@solana/web3.js";

/**
 * Compute the Solana explorer address for the various data
 */
export function explorerURL({
  address,
  sig,
  cluster = (process?.env?.NEXT_PUBLIC_SOLANA_RPC_MONIKER as Cluster) ||
    "devnet",
}: {
  address?: string;
  sig?: string;
  cluster?: Cluster;
}) {
  let baseUrl: string;

  // set the base url, based on the input data
  if (address) baseUrl = `https://explorer.solana.com/address/${address}`;
  else if (sig) baseUrl = `https://explorer.solana.com/tx/${sig}`;
  else return "[unknown]";

  // auto append the desired search params
  const url = new URL(baseUrl);
  url.searchParams.append("cluster", cluster);
  return url.toString() + "\n";
}

/**
 * Helper function to extract a transaction signature from a failed transaction's error message
 */
export async function extractSignatureFromFailedTransaction(
  connection: Connection,
  err: any,
  fetchLogs?: boolean,
) {
  if (err?.signature) return err.signature;

  // extract the failed transaction's signature
  const failedSig = new RegExp(
    /^((.*)?Error: )?(Transaction|Signature) ([A-Z0-9]{32,}) /gim,
  ).exec(err?.message?.toString())?.[4];

  // ensure a signature was found
  if (failedSig) {
    // when desired, attempt to fetch the program logs from the cluster
    if (fetchLogs)
      await connection
        .getTransaction(failedSig, {
          maxSupportedTransactionVersion: 0,
        })
        .then((tx) => {
          debug(`\n==== Transaction logs for ${failedSig} ====`);
          // debug(explorerURL({ txSignature: failedSig }), "");
          debug(tx?.meta?.logMessages ?? "No log messages provided by RPC");
          debug(`==== END LOGS ====\n`);
        });
    else {
      debug("Failed:", explorerURL({ sig: failedSig }));
    }
  }

  // always return the failed signature value
  return failedSig;
}
