/**
 * Create an NFT collection, with all authorities/owners
 * set to the site's keypair
 */

// import dotenv from "dotenv";
// dotenv.config();

import { SOLANA_KEYPAIR } from "@/lib/solana/general";
import { SolanaConnection } from "@/lib/solana/SolanaConnection";
import { Cluster, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import type { CreateMetadataAccountArgsV3 } from "@metaplex-foundation/mpl-token-metadata";
import type { Creator, JsonMetadata } from "@metaplex-foundation/js";
import { buildCreateCollectionTransaction } from "@/lib/solana/collections";
import {
  explorerURL,
  extractSignatureFromFailedTransaction,
} from "@/lib/solana/utils";
import { loadOrGenerateKeypair } from "@/lib/solana/local-helpers";
import { cidToUri, uploadFilesToIpfs } from "@/lib/utils/ipfs";
import { readFileSync } from "fs";
import path from "path";
import { File } from "nft.storage";

// load or generate a new random keypair
// const defaultKeypair = loadOrGenerateKeypair("testing_tester");

// use the server keypair
const defaultKeypair = SOLANA_KEYPAIR;

console.log("Using keypair:", defaultKeypair.publicKey.toBase58());

/**
 * define the configuration information for this script
 */
const config = {
  isMutable: true,
  owner: defaultKeypair.publicKey,
  authority: defaultKeypair.publicKey,
  creators: [
    {
      address: defaultKeypair.publicKey,
      // when this address signs the transaction, it can be auto verified?
      verified: true,
      share: 100,
    },
  ] as Creator[],

  // define the metadata file to load
  metadataFilePath: path.resolve("assets/collection.json"),
  // define the collection image file to load
  // imageFilePath: path.resolve("public/_static/solana_devs.jpeg"),
  // todo: add direct image upload support
};

console.log("metadata path:", config.metadataFilePath);
// console.log("image path:", config.imageFilePath);

// todo: verify the specified file paths actually exist and fail if they do not

/***************************************************************************************/
/***************************************************************************************/

(async () => {
  // load or set the cluster
  const cluster =
    (process?.env?.NEXT_PUBLIC_SOLANA_RPC_MONIKER as Cluster) || "devnet";

  // create the connection to the desired solana cluster
  const connection = new SolanaConnection(clusterApiUrl(cluster));

  // get the payer's starting balance
  const initBalance = await connection.getBalance(defaultKeypair.publicKey);
  console.log(
    "Starting account balance:",
    initBalance / LAMPORTS_PER_SOL,
    "SOL\n",
  );

  // ensure the keypair has a high enough balance to create the collection
  if (initBalance / LAMPORTS_PER_SOL < 0.03) {
    throw Error("Balance too low!!!");
  }

  /***************************************************************************************/
  /***************************************************************************************/

  // read in the json metadata file to use
  const metadata: JsonMetadata = JSON.parse(
    readFileSync(config.metadataFilePath, "utf-8"),
  );

  // ensure the required metadata fields are set
  if (!metadata.name || !metadata.symbol) {
    throw Error("invalid metadata name or symbol");
  }

  // define the collection MetadataArgs
  const collectionMetadataV3: CreateMetadataAccountArgsV3 = {
    isMutable: config.isMutable,
    data: {
      name: metadata.name,
      symbol: metadata.symbol,
      // specific json metadata for the collection
      uri: "<BLANK_FOR_NOW_BUT_WILL_OVERRIDE>",
      // (note: this will override after the metadata file is uploaded)
      sellerFeeBasisPoints: metadata.seller_fee_basis_points || 0, // 100=1%
      creators: config?.creators || null,
      collection: null,
      uses: null,
    },
    collectionDetails: {
      __kind: "V1",
      size: 0,
    },
  };

  /*******************************************************************************************/
  /*******************************************************************************************/

  // load or generate a new random keypair for the collection address
  const keypair = loadOrGenerateKeypair(collectionMetadataV3.data.symbol);

  console.log("----------------------------------------");
  console.log("Create an NFT collection...");
  console.log("Cluster:", cluster);
  console.log("Address:", keypair.publicKey.toBase58());
  console.log("----------------------------------------");

  // upload and image (when desired)
  // if (config.imageFilePath) {
  //   // load in the image from the filesystem

  //   const imageFile = new File(
  //     readFileSync(config.imageFilePath, { encoding: "" }),
  //     "collection.png",
  //     {
  //       type: "image/png",
  //     },
  //   );
  //   console.log(imageFile);

  //   // upload image to ipfs
  //   cid = await uploadFilesToIpfs([imageFile]);
  //   const imageUriData = cidToUri(cid, imageFile.name);
  //   console.log("image file uploaded:", imageUriData);

  //   // replace the metadata json
  //   metadata.image = imageUriData.http;
  // }

  /*******************************************************************************************/
  /*******************************************************************************************/

  // create a File to represent the metadata json
  const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", {
    type: "text/plain",
  });

  // upload the metadata file ot IPFS
  const cid = await uploadFilesToIpfs([metadataFile]);
  const metadataUriData = cidToUri(cid, metadataFile.name);

  console.log("Metadata file uploaded:", metadataUriData);

  // set the collection metadata uri pointer to be the freshly uploaded info
  collectionMetadataV3.data.uri = metadataUriData.http;

  /*******************************************************************************************/
  /*******************************************************************************************/

  // process the actual collection creation

  // build the transaction
  const transaction = await buildCreateCollectionTransaction({
    connection,
    feePayer: defaultKeypair.publicKey,
    owner: config.owner,
    authority: config.authority,
    metadataV3: collectionMetadataV3,
    mintKeypair: keypair,

    // sign this transaction with the site's keypair
    signers: [defaultKeypair, keypair],
  });

  // console log it
  // console.log("transaction:", transaction);

  try {
    // send the transaction
    const sig = await connection.sendTransaction(transaction);

    // log the transaction explorer url
    console.log("\n=======================");
    console.log("Transfer successful!");
    console.log(explorerURL({ sig, cluster }));

    console.log("TokenMint for the collection:", keypair.publicKey.toBase58());
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
