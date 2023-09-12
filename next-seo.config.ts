import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER,
} from "@/lib/constants";
import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  // configure the title settings
  title: SITE_NAME,
  // titleTemplate: `${SITE_NAME} - %s`,
  defaultTitle: SITE_NAME,
  description: SITE_DESCRIPTION,

  // social media card data
  openGraph: {
    site_name: SITE_NAME,
    locale: "en_US",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/_static/solana_devs.jpeg`,
        width: 256,
        height: 256,
        alt: "@solana_devs",
      },
    ],
  },
  twitter: {
    handle: TWITTER.handle,
    site: TWITTER.handle,
    cardType: "summary",
    // cardType: "summary_large_image",
  },
};

export default config;
