/**
 * Helper functions for working with IPFS
 */

import { File, FilesSource, NFTStorage, RequestOptions } from "nft.storage";

/**
 * Simple reusable type for working with IPFS CIDs as URIs
 */
export type UriDataForCID = {
  ipfs: string;
  http: string;
};

/**
 * Convert a CID into various uri formats
 */
export function cidToUri(cid: string, fileName: string = ""): UriDataForCID {
  // todo: randomly select the ipfs gateway between all public public providers
  return {
    ipfs: `ipfs://${cid}/${fileName}`,
    http: `https://${cid}.ipfs.dweb.link/${fileName}`,
  };
}

/**
 * Upload a list of files into IPFS, via nft.storage
 */
export async function uploadFilesToIpfs(
  files: FilesSource,
  options?: RequestOptions,
) {
  // simple check for the correct api token (via env vars)
  if (!process.env.NFT_STORAGE_API_KEY) throw "Unable to locate access token";

  // create the storage client
  const nftStorage = new NFTStorage({
    token: process.env.NFT_STORAGE_API_KEY || "",
  });

  // send the user uploaded files to nft.storage (aka IPFS)
  const cid = await nftStorage.storeDirectory(files, options);

  // const status = await nftStorage.status(cid);
  // console.log(status);

  return cid;
}

/**
 * Convert a listing of files into a listing of IPFS supported uris
 */
export function fileListToIpfsList(
  cid: string,
  files: File[],
): UriDataForCID[] {
  const stack: UriDataForCID[] = [];

  files.forEach((file) => {
    stack.push(cidToUri(cid, file.name));
  });

  return stack;
}
