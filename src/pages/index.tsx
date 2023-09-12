import DefaultLayout from "@/layouts/DefaultLayout";
import { NextSeoProps } from "next-seo";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef } from "react";
import { createQR, encodeURL } from "@solana/pay";
import { LinkCardGrid } from "@/components/LinkCard";
import { NoticeMessage, DevnetNotice } from "@/components/NoticeMessage";

// define a static size for the qr code
const QR_CODE_SIZE = 350;

const seo: NextSeoProps = {
  // comment for better diffs
  // title: "Demo application",
  // title: "Mint cNFTs using Solana Pay",
};

export default function Page() {
  // define a ref to populate the qr code in the ui
  const solanaPayQrRef = useRef<HTMLDivElement>();

  // generate the SolanaPay qr code on the client only (e.g. within useEffect)
  useEffect(() => {
    // make the site root the mint url
    const { location } = window;
    const apiUrl = `${location.protocol}//${location.host}/api/mint`;

    // setApiUrl(apiUrl);
    console.log("API url:", apiUrl);

    // generate the SolanaPay QR code
    const solanaPayQr = createQR(
      // encode the url with the desired params
      encodeURL({
        link: new URL(apiUrl),
      }),
      // set the svg image size
      QR_CODE_SIZE,
      // background color
      "transparent",
      // "#141414",
      // foreground color
      "white",
    );

    // set the generated QR code on the QR ref element
    if (solanaPayQrRef.current) {
      solanaPayQrRef.current.innerHTML = "";
      solanaPayQr.append(solanaPayQrRef.current);
    }
  }, []);

  return (
    <DefaultLayout seo={seo}>
      <div className="">
        <div className="mb-10 space-y-10">
          <p className={styles.tagline}>
            Scan with a Solana wallet
            <br /> to mint a compressed NFT
          </p>
        </div>

        <div className="items-center justify-center space-y-10">
          <DevnetNotice>
            <NoticeMessage>
              This app is connected to Solana&apos;s{" "}
              <span className="underline">devnet</span>.
              <br />
              Please ensure <span className="underline">your wallet</span> is
              connected to devnet.
            </NoticeMessage>
          </DevnetNotice>

          <div
            ref={solanaPayQrRef as any}
            className={`qrBox w-[${QR_CODE_SIZE}px] h-[${QR_CODE_SIZE}px]`}
          ></div>
        </div>
      </div>

      <LinkCardGrid
        className="mt-22"
        title={"Explore Solana and Compressed NFTs"}
        cards={[
          {
            label: "Solana Docs",
            href: "https://docs.solana.com",
            description:
              "The official core documentation for the Solana blockchain",
          },
          {
            label: "Developer Resources",
            href: "https://solana.com/hyperdrive/resources",
            description:
              "Collection of top Solana developer quickstart resources",
          },
          {
            label: "Solana StackExchange",
            href: "https://solana.stackexchange.com/",
            description:
              "Ask questions and get answers from developers in the Solana community",
          },
          {
            label: "cNFT JavaScript Guide",
            href: "https://solana.com/developers/guides/javascript/compressed-nfts",
            description:
              "Developer guide for creating compressed NFTs with JavaScript",
          },
          {
            label: "cNFT Livestream",
            href: "https://youtu.be/LxhTxS9DexU",
            description:
              "Livestream tutorial on how to use State Compression and compressed NFTs on Solana",
          },
          {
            label: "Solana Pay Docs",
            href: "https://docs.solanapay.com",
            description:
              "Explore the SolanaPay protocol spec that enables interactions using QR codes",
          },
        ]}
      />
    </DefaultLayout>
  );
}
