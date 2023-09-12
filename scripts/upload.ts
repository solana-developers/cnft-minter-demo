/**
 * Example script to process and upload files to IPFS
 */

import path from "path";
import { readFileSync } from "fs";
import { File } from "nft.storage";
import { JsonMetadata } from "@metaplex-foundation/js";
import { fileListToIpfsList, uploadFilesToIpfs } from "@/lib/utils/ipfs";

// simple check for the correct api token (via env vars)
if (!process.env.NFT_STORAGE_API_KEY) throw "Unable to locate access token";

// define the metadata file to load
const metadataFilePath = path.resolve("assets/asset.json");

(async () => {
  console.log("metadata path:", metadataFilePath);

  // read in the json metadata file to use
  const metadata: JsonMetadata = JSON.parse(
    readFileSync(metadataFilePath, "utf-8"),
  );

  // ensure the required metadata fields are set
  if (!metadata.name || !metadata.symbol) {
    throw Error("invalid metadata name or symbol");
  }

  console.log(metadata);
  console.log("-----------------");

  // return;

  /**
   * create the array of Files to upload
   *
   * note: defining a separate allows us to access the `name` value of each file
   */
  const filesToUpload = [
    new File([JSON.stringify(metadata)], "asset.json", {
      type: "text/plain",
    }),
  ];

  // send the user uploaded files to nft.storage (aka IPFS)
  const cid = await uploadFilesToIpfs(filesToUpload);

  const ipfsFiles = fileListToIpfsList(cid, filesToUpload);

  console.log(ipfsFiles);
})();
