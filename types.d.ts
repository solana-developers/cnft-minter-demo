/**
 * Global types for use throughout the repo
 */

type Option<T> = T | null;

/**
 * Define simple type definitions of the env variables
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Solana specific variables
     */
    SOLANA_PRIVATE_KEY: string;
    SOLANA_RPC_URL: string;
    NEXT_PUBLIC_SOLANA_RPC_URL: string;
    NEXT_PUBLIC_SOLANA_RPC_MONIKER: string;

    SOLANA_TREE_ADDRESS: string;
    SOLANA_COLLECTION_ADDRESS: string;
  }
}
