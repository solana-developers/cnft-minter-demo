/**
 * Helper functions for Solana transactions
 */

import {
  Connection,
  PublicKey,
  Signer,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

type BuildTransactionProps = {
  connection: Connection;
  payerKey: PublicKey;
  instructions: Array<TransactionInstruction>;
  signers?: Array<Signer>;
  useVersioned?: boolean;
};

/**
 * Solana transaction builder, including auto fetching the latest blockhash
 */
export async function buildTransaction({
  connection,
  payerKey,
  instructions,
  signers,
  useVersioned = false,
}: BuildTransactionProps) {
  // get the latest blockhash
  const { blockhash: recentBlockhash } = await connection.getLatestBlockhash();

  // build and return the full transaction
  const tx = new VersionedTransaction(
    new TransactionMessage({
      instructions,
      payerKey,
      recentBlockhash,
    }).compileToV0Message(),
  );

  // auto sign the transaction with all provided `signers`
  signers?.forEach((s) => tx.sign([s]));

  // finally, return the complete transaction
  return tx;
}
