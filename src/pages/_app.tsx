import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import SEO from "@@/next-seo.config";
// import { SessionProvider } from "next-auth/react";
import { ContextProvider } from "@/contexts/ContextProvider";

import { Inter } from "next/font/google";
import DefaultToaster from "@/components/core/DefaultToaster";

require("@solana/wallet-adapter-react-ui/styles.css");

// load and set the desired site font
const font = Inter({
  subsets: ["latin"],
  variable: "--font-theme",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    // <SessionProvider session={session}>
    <ContextProvider>
      <style jsx global>
        {`
          :root {
            --font-theme: ${font.style.fontFamily};
          }
        `}
      </style>

      <DefaultToaster />
      <DefaultSeo {...SEO} />

      <Component {...pageProps} />
    </ContextProvider>
    // </SessionProvider>
  );
}
