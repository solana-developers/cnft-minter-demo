/**
 * Define the static drop information to process each of the available NFTs to mint
 */

import { SITE_DESCRIPTION, SITE_URL, TWITTER } from "./general";

/**
 * Type for the statically defined NFT details
 */
type MintableNFTDetails = {
  // todo:
  // price: number;
  // priceToken: "sol";
  startDate?: Date;
  endDate?: Date;
  metadataUri: string;
  metadata: {
    name: string;
    image: string;
    description?: string;
    symbol?: string;
    seller_fee_basis_points?: number;
    isMutable?: boolean;
    external_url?: string;
    collection?: {
      name: string;
      family: string;
    };
    properties: {
      category?: "image";
      files: Array<{
        uri: string;
        type: "image/png" | "image/jpeg" | "image/gif";
      }>;
      creators?: Array<{
        address: string;
        share: number;
      }>;
    };
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
};

/**
 * Collection treasure address
 *
 * pro tip: use a multi sig protocol like Squads for your treasure address
 */
export const TREASURY_ADDRESS = "";

/**
 * Tree and collection address to mint the NFTs to
 */
export const COLLECTION_DETAILS = {
  /**
   * Collection address to use while minting
   *
   * NOTE: this should be owned by the `SOLANA_KEYPAIR` to ensure we can mint to the collection
   */
  collectionAddress: process.env.SOLANA_COLLECTION_ADDRESS,

  /**
   * Tree address to use while minting
   *
   * NOTE: this should be owned by the `SOLANA_KEYPAIR` to ensure we can write to the tree
   */
  treeAddress: process.env.SOLANA_TREE_ADDRESS,
};

/**
 * Define the default metadata to be used when minting these NFTs
 */
export const GENERIC_METADATA_DEFAULTS = {
  symbol: "DevRel",
  collection: {
    name: "Solana Developers Demos",
    family: "DevRel",
  },
  description: SITE_DESCRIPTION,
  external_url: TWITTER.website,
  isMutable: true,
  seller_fee_basis_points: 500,
  properties: {
    category: "image",
    creators: !TREASURY_ADDRESS
      ? [] // use a blank a array when no treasury address is set
      : [
          {
            address: TREASURY_ADDRESS,
            share: 100,
          },
        ],
  },
};

/**
 * Define a static listing of NFTs to allow minting
 */
export const STATIC_NFT_ITEMS: MintableNFTDetails[] = [
  {
    metadataUri:
      "https://bafybeiduoxcb7kymhmb5r5eemtfwa2pgich2dxlg5okaqvbaijcrk3kgji.ipfs.dweb.link/asset.json",
    metadata: {
      name: "Demo #1 - solana_devs",
      external_url: TWITTER.url,
      // description: "",
      image:
        "https://bafkreiesqzrm26vf5d4d6meuzqtdjmtg63u27so22rp57xdtcpq5nleulm.ipfs.nftstorage.link/",
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://bafkreiesqzrm26vf5d4d6meuzqtdjmtg63u27so22rp57xdtcpq5nleulm.ipfs.nftstorage.link/",
          },
        ],
      },
      attributes: [
        {
          trait_type: "item",
          value: "solana_devs",
        },
      ],
    },
  },
];
