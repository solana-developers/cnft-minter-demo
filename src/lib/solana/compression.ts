/**
 * Helper functions for working with compression related things
 * (e.g. spl merkle trees, etc)
 */

import { debug } from "@/lib/utils/logs";
import { SOLANA_KEYPAIR } from "./general";
import { buildTransaction } from "./transactions";
import { Keypair, PublicKey, Connection, Signer } from "@solana/web3.js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  createAllocTreeIx,
  ValidDepthSizePair,
  SPL_NOOP_PROGRAM_ID,
  deserializeChangeLogEventV1,
  getAllChangeLogEventV1FromTransaction,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  MetadataArgs,
  createCreateTreeInstruction,
  createMintToCollectionV1Instruction,
  getLeafAssetId,
} from "@metaplex-foundation/mpl-bubblegum";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "bn.js";

type CreateTreeProps = {
  connection: Connection;
  treeKeypair?: Keypair;
  depthSizePair: ValidDepthSizePair;
  treeOwner?: PublicKey;
  authority?: PublicKey;
  feePayer?: PublicKey;
  canopyDepth?: number;
};

/**
 * Create a Merkle tree that is owned by the Metaplex Bubblegum program
 *
 * ---
 * Helper function to create a merkle tree on chain, including allocating
 * all the space required to store all the nodes
 */
export async function buildCreateMerkleTreeTransaction({
  connection,
  treeKeypair,
  treeOwner,
  authority,
  feePayer,
  depthSizePair,
  canopyDepth = 0,
}: CreateTreeProps) {
  debug("[createMerkleTree]");

  // set the default `feePayer` to the site's key
  if (!feePayer) feePayer = SOLANA_KEYPAIR.publicKey;

  // set the default `authority` to the site's key
  if (!authority) authority = SOLANA_KEYPAIR.publicKey;

  // set the default `treeOwner` to the site's key
  if (!treeOwner) treeOwner = SOLANA_KEYPAIR.publicKey;

  // (when needed) generate a new keypair to use for the new tree
  if (!treeKeypair) treeKeypair = Keypair.generate();

  debug("treeAddress:", treeKeypair.publicKey.toBase58());

  // derive the tree's authority (PDA), owned by Bubblegum
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID,
  );

  // instruction to allocate the tree's account on chain (with the required space)
  const allocTreeIx = await createAllocTreeIx(
    connection,
    treeKeypair.publicKey,
    feePayer,
    depthSizePair,
    canopyDepth,
  );

  // instruction that actually initializes the merkle tree
  const createTreeIx = createCreateTreeInstruction(
    {
      payer: feePayer,
      treeCreator: treeOwner,
      treeAuthority,
      merkleTree: treeKeypair.publicKey,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      maxBufferSize: depthSizePair.maxBufferSize,
      maxDepth: depthSizePair.maxDepth,
      public: false,
    },
    BUBBLEGUM_PROGRAM_ID,
  );

  // always sign with the `treeKeypair`
  const signers: Array<Signer> = [treeKeypair];

  // (when needed) auto sign the transaction with the site's key
  if (feePayer.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);
  if (authority.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);

  // finally, build and return the transaction
  return buildTransaction({
    connection,
    signers,
    payerKey: feePayer,
    instructions: [
      // comment for better diffs
      allocTreeIx,
      createTreeIx,
    ],
  });
}

type MintCompressedNFTProps = {
  connection: Connection;
  treeAddress: PublicKey;
  treeDelegate?: PublicKey;
  feePayer?: PublicKey;

  nftOwner: PublicKey;
  nftDelegate?: PublicKey;
  compressedNFTMetadata: MetadataArgs;

  collectionMint: PublicKey;
  collectionAuthority: PublicKey;
  collectionMetadata?: PublicKey;
  collectionEditionAccount?: PublicKey;
};

/**
 * Mint a single compressed NFT to any a specific address
 */
export async function buildMintCompressedNftTransaction({
  connection,
  treeAddress,
  treeDelegate,
  nftOwner,
  nftDelegate,
  feePayer,
  compressedNFTMetadata,

  collectionMint,
  collectionMetadata,
  collectionAuthority,
  collectionEditionAccount,
}: MintCompressedNFTProps) {
  debug("[mintCompressedNFT]");

  // set the default `feePayer` to the site's key
  if (!feePayer) feePayer = SOLANA_KEYPAIR.publicKey;

  // set the default `nftDelegate` to the site's key
  if (!nftDelegate) nftDelegate = SOLANA_KEYPAIR.publicKey;

  // set the default `treeDelegate` to the site's key
  if (!treeDelegate) treeDelegate = SOLANA_KEYPAIR.publicKey;

  // verify all total creator shares equal 100
  if (!!compressedNFTMetadata.creators.length) {
    let total = 0;
    compressedNFTMetadata.creators.map((item) => (total += item.share));
    if (total != 100) throw Error("Creator shares must equal 100");
  }

  // derive the `collectionMetadata`, when not provided
  if (!collectionMetadata) {
    [collectionMetadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );
  }

  // derive the `collectionEditionAccount`, when not provided
  if (!collectionEditionAccount) {
    [collectionEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );
  }

  // debug("treeAddress:", treeKeypair.publicKey.toBase58());

  // derive the tree's authority (PDA), owned by Bubblegum
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [treeAddress.toBuffer()],
    BUBBLEGUM_PROGRAM_ID,
  );

  // derive a PDA (owned by Bubblegum) to act as the signer of the compressed minting
  const [bubblegumSigner] = PublicKey.findProgramAddressSync(
    // `collection_cpi` is a custom prefix required by the Bubblegum program
    [Buffer.from("collection_cpi", "utf8")],
    BUBBLEGUM_PROGRAM_ID,
  );

  /*
    Add a single mint instruction 
    ---
    But you could all multiple in the same transaction, as long as your 
    transaction is still within the byte size limits 
  */

  // instruction to mint the compressed nft into the tree
  const mintCompressedNftIx = createMintToCollectionV1Instruction(
    {
      payer: feePayer,

      merkleTree: treeAddress,
      treeAuthority,
      treeDelegate,

      // set the receiver of the compressed NFT
      leafOwner: nftOwner,
      // set a delegated authority over this NFT
      leafDelegate: nftDelegate,

      // collection details
      collectionAuthority,
      collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
      collectionMint,
      collectionMetadata,
      editionAccount: collectionEditionAccount,

      // other accounts
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      bubblegumSigner: bubblegumSigner,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    },
    {
      metadataArgs: Object.assign(compressedNFTMetadata, {
        collection: { key: collectionMint, verified: false },
      }),
    },
  );

  // todo: signers?
  const signers: Array<Signer> = [];

  // (when needed) auto sign the transaction with the site's key
  if (feePayer.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);
  if (treeDelegate.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);

  // finally, build and return the transaction
  return buildTransaction({
    connection,
    signers,
    payerKey: feePayer,
    instructions: [
      // comment for better diffs
      mintCompressedNftIx,
    ],
  });
}

type CompressedAssetUsingTxSignatureProps = {
  connection: Connection;
  treeAddress: PublicKey;
  signature: string;
};

/**
 * Fetch and parse a finalized transaction (that minted a compressed nft),
 * and derive the assetId
 *
 * ---
 * notes:
 * - until the transaction is `finalized`, this function is expected to error out
 * - this function expects a single compressed nft to be minted in the transaction
 */
export async function getCompressedAssetUsingTxSignature({
  connection,
  signature,
  treeAddress,
}: CompressedAssetUsingTxSignatureProps) {
  // get the transaction info
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) throw Error("Unable to getTransaction");

  const changelogEvents = getAllChangeLogEventV1FromTransaction(tx);

  if (!changelogEvents.length) throw Error("Unable to locate changelog events");

  const assetId = await getLeafAssetId(
    changelogEvents[0].treeId,
    new BN(changelogEvents[0].index),
  );

  return assetId;
}
