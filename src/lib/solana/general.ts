/**
 * General helper functions and constants for Solana
 */

import { Keypair } from "@solana/web3.js";

/**
 * Solana keypair for use on all networks
 */
export const SOLANA_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY || "")),
);
