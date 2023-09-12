/**
 * Define general constants for use around the entire site/app
 */

export const SITE_NAME = "cNFT Minter Demo";

export const SITE_DESCRIPTION =
  "Demo application to mint compressed NFTs using Solana Pay QR codes. By the Solana Foundation's developer relations team.";

export const SITE_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000"
    : process.env?.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://solana.com/developers";

/**
 * Twitter information for the site
 */
export const TWITTER = {
  handle: "@solana_devs",
  username: "solana_devs",
  url: "https://twitter.com/solana_devs",
  website: "https://solana.com/developers",
};
