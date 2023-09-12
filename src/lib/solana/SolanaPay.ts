/**
 * Helper function for SolanaPay
 */

import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { VersionedTransaction, Signer } from "@solana/web3.js";

type BuildSolanaPayPostResponseProps = {
  /**
   *
   */
  signers?: Array<Signer>;

  /**
   * solana transaction to be formatted to the SolanaPay spec
   */
  transaction: VersionedTransaction;

  /**
   * string message to be displayed in the wallet's interface
   */
  message?: string;
};

/**
 * Build a valid SolanaPay POST request response
 */
export function buildSolanaPayPostResponse({
  transaction,
  message = undefined,
  signers,
}: BuildSolanaPayPostResponseProps) {
  // partially sign the transaction, with all provided `signers`
  signers?.forEach((s) => transaction.sign([s]));

  /**
   * note: the wallet user's account is also a required signer,
   * but they'll sign it with their wallet after we return it
   */

  // return the SolanaPay consumable *signed* transaction via JSON
  return {
    // send a string message to the wallet for display
    message,
    // serialize the transaction, then base64 encode it
    transaction: Buffer.from(transaction.serialize()).toString("base64"),
  };
}

type BuildSolanaPayGetResponseProps = {
  /**
   *
   */
  label?: string;

  /**
   *
   */
  message?: string;

  /**
   *
   */
  icon?: string;
};

/**
 * Build a valid SolanaPay GET request response
 */
export function buildSolanaPayGetResponse({
  label = SITE_NAME,
  icon = `${SITE_URL}/_static/solana_devs.jpeg`,
  message = undefined,
}: BuildSolanaPayGetResponseProps) {
  return {
    // comment for better diffs
    label,
    icon,
    message,
  };
}
