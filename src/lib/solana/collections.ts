/**
 * Helper functions for interacting with Solana NFT collections
 */

import { debug } from "@/lib/utils/logs";
import { SOLANA_KEYPAIR } from "./general";
import { buildTransaction } from "./transactions";
import {
  Keypair,
  PublicKey,
  Signer,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  createInitializeMint2Instruction,
  MINT_SIZE as SPL_TOKE_MINT_SPACE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createFreezeAccountInstruction,
} from "@solana/spl-token";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  CreateMetadataAccountArgsV3,
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

type CreateCollectionProps = {
  connection: Connection;
  mintKeypair?: Keypair;
  owner: PublicKey;
  authority?: PublicKey;
  feePayer?: PublicKey;
  signers?: Array<Signer>;
  metadataV3: CreateMetadataAccountArgsV3;
};

/**
 * Create a collection NFT
 * ---
 * note: this will sign the transaction with the `mintKeypair`
 * and when needed, the site's key
 */
export async function buildCreateCollectionTransaction({
  connection,
  mintKeypair,
  owner,
  authority,
  feePayer,
  metadataV3,
  signers = [],
}: CreateCollectionProps) {
  // set the default `feePayer` to the site's key
  if (!feePayer) feePayer = SOLANA_KEYPAIR.publicKey;

  // set the default `authority` to the site's key
  if (!authority) authority = SOLANA_KEYPAIR.publicKey;

  // (when needed) generate a new keypair to use for the collection we are about to create
  if (!mintKeypair) mintKeypair = Keypair.generate();

  // debug log some values
  console.log("TokenMint's address:", mintKeypair.publicKey.toBase58());
  debug("feePayer:", feePayer.toBase58());

  // define default config settings
  const config = {
    // note: NFTs should always have a decimal of 0
    decimals: 0,
    tokenProgramId: TOKEN_PROGRAM_ID,
    ataProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
  };

  // request the lamport cost for the mint account
  const lamportsForMintAccount = await getMinimumBalanceForRentExemptMint(
    connection,
  );

  // instruction to create the mint account (and fund enough to be rent exempt)
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: feePayer,
    newAccountPubkey: mintKeypair.publicKey,
    space: SPL_TOKE_MINT_SPACE,
    lamports: lamportsForMintAccount,
    programId: config.tokenProgramId,
  });

  // instruction to initialize the mint
  const initializeMintIx = createInitializeMint2Instruction(
    // set the tokenMint account address
    mintKeypair.publicKey,
    // set the decimals used for this SPL Mint (note: NFTs should be decimals=0)
    config.decimals,
    // set the collection's mintAuthority to the provided `authority`
    authority,
    // set the collection's freezeAuthority to the provided `authority`
    authority,
    // set the desired token programId
    config.tokenProgramId,
  );

  // derive the PDA of the token account ("ata") address for this new collection
  const [tokenAccount] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      config.tokenProgramId.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    config.ataProgramId,
  );

  // instruction to create the ata for the collection's nft
  const createAtaIx = createAssociatedTokenAccountInstruction(
    // set the fee payer for this action
    feePayer,
    // set the associated token account address to create
    tokenAccount,
    // set the owner of this ata
    owner,
    // set the tokenMint used to derive this ata
    mintKeypair.publicKey,
    // set the token program id to use for this ata
    config.tokenProgramId,
    // set the associated token program id to use for this ata
    config.ataProgramId,
  );

  // instruction to mint exactly 1 token to our TokenMint
  const mintCollectionNFTIx = createMintToInstruction(
    mintKeypair.publicKey,
    tokenAccount,
    authority,
    1, // exactly 1 token is an NFT
    undefined, // multiSigners?,
    config.tokenProgramId,
  );

  // instruction to freeze the token account
  const freezeMintIx = createFreezeAccountInstruction(
    tokenAccount,
    mintKeypair.publicKey,
    authority,
  );

  // derive the PDA for the metadata account
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );

  // instruction to create the metadata account
  const createMetadataIx = createCreateMetadataAccountV3Instruction(
    {
      payer: feePayer,
      metadata: metadataAccount,
      mint: mintKeypair.publicKey,
      mintAuthority: authority,
      updateAuthority: authority,
    },
    {
      createMetadataAccountArgsV3: metadataV3,
    },
  );

  // derive the PDA for the metadata account
  const [masterEditionAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
      Buffer.from("edition", "utf8"),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );

  // create an instruction to create the metadata account
  const createMasterEditionIx = createCreateMasterEditionV3Instruction(
    {
      payer: feePayer,
      edition: masterEditionAccount,
      mint: mintKeypair.publicKey,
      mintAuthority: authority,
      updateAuthority: authority,
      metadata: metadataAccount,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    },
  );

  // create the collection size instruction
  // const collectionSizeIX = createSetCollectionSizeInstruction(
  //   {
  //     collectionMetadata: metadataAccount,
  //     collectionAuthority: authority,
  //     collectionMint: mint,
  //   },
  //   {
  //     setCollectionSizeArgs: { size: 50 },
  //   },
  // );

  // always sign with the `mintKeypair`
  signers.push(mintKeypair);

  // (when needed) auto sign the transaction with the site's key
  if (feePayer.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);
  if (authority.toBase58() === SOLANA_KEYPAIR.publicKey.toBase58())
    signers.push(SOLANA_KEYPAIR);

  // finally, build and return the transaction with the `owner` as the fee payer
  return buildTransaction({
    connection,
    signers,
    payerKey: feePayer,
    instructions: [
      // comment for better diffs
      createMintAccountIx,
      initializeMintIx,
      createAtaIx,
      createMetadataIx,
      mintCollectionNFTIx,
      createMasterEditionIx,
      // freezeMintIx,
    ],
  });

  // return all the accounts
  // return { mint, tokenAccount, metadataAccount, masterEditionAccount };
}
