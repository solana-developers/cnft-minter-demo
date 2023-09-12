/**
 * Assorted static data for testing
 */

import { Creator } from "@metaplex-foundation/mpl-bubblegum";

export type StaticProjectType = {
  slug: string;
  name: string;
  description?: string;
};

export type StaticDropKey = {
  /**
   * key is required to be a master unique key on the site
   */
  key: string;
  /**
   * url accessible slug for prettier links
   */
  slug: string;
  type: "collection" | "poap" | "single" | "open";

  /**
   *
   */
  name: string;
  description?: string;
  price?: number;
  currency?: "sol";
  options?: {
    hideMint?: boolean;
    mintButtonLabel?: string;
    openDate?: any;
    closeDate?: any;
  };
  metadata: {
    name: string;
    /**
     * uri to the json metadata contents
     */
    uri: string;
    symbol: string;
    sellerFeeBasisPoints?: number;
    creators?: Option<Creator[]>;
    isMutable: boolean;
  };
};

export const STATIC_DROP_KEYS: Array<StaticDropKey> = [];
