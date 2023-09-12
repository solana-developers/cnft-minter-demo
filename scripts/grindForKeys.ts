/**
 * Generate correctly formatted string keypairs for loading in the app
 */
import { Keypair } from "@solana/web3.js";

const MAX_KEYPAIR_COUNT = 10_000_000;
const DESIRED_KEYPAIR_COUNT = 3;

// set to a blank string if you will accept any key
const SEARCH_TERM = "dev";

// track the keys that match the search term
const matchingKeys: Keypair[] = [];

async function main() {
  console.log("===============");
  console.log(`Generating ${MAX_KEYPAIR_COUNT} keypairs for loading...`);
  console.log("===============", "\n");

  // grind for the keys
  for (let i = 0; i < MAX_KEYPAIR_COUNT; i++) {
    const keypair = Keypair.generate();
    console.log(`[${i}]`, keypair.publicKey.toBase58());

    // only care about the keypairs that start with the search term
    if (!!SEARCH_TERM && !keypair.publicKey.toBase58().startsWith(SEARCH_TERM))
      continue;

    matchingKeys.push(keypair);

    // stop searching when we have found the desired number of matching keys
    if (matchingKeys.length >= DESIRED_KEYPAIR_COUNT) break;
  }

  if (matchingKeys.length == 0) return console.log("No matching keys found");

  // print a separator
  console.log("\n--------------------------------------\n");
  console.log("The following matching keypairs were found:\n");

  // print all the found keys
  for (let i = 0; i < matchingKeys.length; i++) {
    console.log(`[${i}]`, matchingKeys[i].publicKey.toBase58());
    const stringified = `[${matchingKeys[i].secretKey.join(",")}]`;

    console.log(stringified);

    console.log(
      "does it parse correct?",
      Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(stringified)),
      ).publicKey.toBase58() === matchingKeys[i].publicKey.toBase58(),
      "\n",
    );
  }
}

// finally, run this script
main();
