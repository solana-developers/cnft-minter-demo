/**
 * Create an NFT collection, with all authorities/owners
 * set to the site's keypair
 */
import dotenv from "dotenv";
dotenv.config();

import { Cluster, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SOLANA_KEYPAIR } from "@/lib/solana/general";
import { SolanaConnection } from "@/lib/solana/SolanaConnection";
import { buildCreateMerkleTreeTransaction } from "@/lib/solana/compression";
import { clusterApiUrl } from "@solana/web3.js";
import {
  explorerURL,
  extractSignatureFromFailedTransaction,
} from "@/lib/solana/utils";

import {
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { loadOrGenerateKeypair } from "@/lib/solana/local-helpers";

// set the absolute max depth allowed by the compression program (due to math)
const ABSOLUTE_MAX_DEPTH = 17; // note: this is not expected to ever change

/**
 * define the configuration information for this script
 */
const config = {
  owner: SOLANA_KEYPAIR.publicKey,
  authority: SOLANA_KEYPAIR.publicKey,
};

/*
  Define our tree size parameters
*/
const depthSizePair: ValidDepthSizePair = {
  // max=8 nodes
  // maxDepth: 3,
  // maxBufferSize: 8,

  // max=16,384 nodes
  maxDepth: 14,
  maxBufferSize: 64,

  // max=131,072 nodes
  // maxDepth: 17,
  // maxBufferSize: 64,

  // max=1,048,576 nodes
  //   maxDepth: 20,
  //   maxBufferSize: 64,

  // max=67,108,864 nodes
  // maxDepth: 26,
  // maxBufferSize: 1024,

  // max=1,073,741,824 nodes
  // maxDepth: 30,
  // maxBufferSize: 2048,
};

// define the canopy depth value
// let canopyDepth = depthSizePair.maxDepth - 5;
let canopyDepth = 0;

// note: not sure if this is the ideal action, but there is a limit at depth of ABSOLUTE_MAX_DEPTH
// set the absolute maxDepth allowed
if (canopyDepth > ABSOLUTE_MAX_DEPTH) canopyDepth = ABSOLUTE_MAX_DEPTH;

// load or set the cluster
const cluster =
  (process?.env?.NEXT_PUBLIC_SOLANA_RPC_MONIKER as Cluster) || "devnet";

// ge// load or generate a new random keypair
const keypair = loadOrGenerateKeypair("tree");

(async () => {
  console.log("----------------------------------------");
  console.log("Creating a concurrent merkle tree for minting cNFTs to...");
  console.log("Cluster:", cluster);
  console.log("Address:", keypair.publicKey.toBase58());
  console.log("----------------------------------------");

  // create the connection to the desired solana cluster
  const connection = new SolanaConnection(clusterApiUrl(cluster));

  // get the payer's starting balance
  const initBalance = await connection.getBalance(SOLANA_KEYPAIR.publicKey);
  console.log(
    "Starting account balance:",
    initBalance / LAMPORTS_PER_SOL,
    "SOL\n",
  );

  // calculate the space required for the tree
  const requiredSpace = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize,
    canopyDepth,
  );

  // calculate the rent cost for the tree
  const storageCost = await connection.getMinimumBalanceForRentExemption(
    requiredSpace,
  );

  // demonstrate the cost, volume, and capability of the tree we are about to create
  console.log("Space to allocate:", requiredSpace, "bytes");
  console.log(
    "Estimated cost to allocate space:",
    storageCost / LAMPORTS_PER_SOL,
    "SOL",
  );
  console.log(
    "Max compressed NFTs for tree:",
    Math.pow(2, depthSizePair.maxDepth),
    "\n",
  );

  // ensure the payer has enough balance to create the allocate the Merkle tree
  if (initBalance < storageCost)
    return console.error("Not enough SOL to allocate the merkle tree");

  console.log("Create the merkle tree for use with the Bubblegum program...");

  // build the transaction
  const transaction = await buildCreateMerkleTreeTransaction({
    connection,
    feePayer: SOLANA_KEYPAIR.publicKey,
    treeKeypair: keypair,

    treeOwner: config.owner,
    authority: config.authority,
    depthSizePair: depthSizePair,
    canopyDepth: canopyDepth,
  });

  // sign this transaction with the site's keypair
  transaction.sign([SOLANA_KEYPAIR]);

  // console log it
  console.log("transaction:", transaction);

  try {
    // send the transaction
    const sig = await connection.sendTransaction(transaction);

    // log the transaction explorer url
    console.log("\n=======================");
    console.log("Transfer successful!");
    console.log(explorerURL({ sig, cluster }));

    console.log("treeAddress:", keypair.publicKey.toBase58());
  } catch (err: any) {
    console.error("\nTransaction failed:", err);

    console.log("\n=======================");
    console.log("  Transfer failed!");
    console.log("=======================");

    // log a block explorer link for the failed transaction
    await extractSignatureFromFailedTransaction(connection, err);

    throw err;
  }
})();
