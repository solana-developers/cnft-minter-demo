import type { SimpleLayoutProps } from "@/types";
import { NextSeo } from "next-seo";

import AppHeader from "@/components/core/AppHeader";
import AppFooter from "@/components/core/AppFooter";

export default function DefaultLayout({
  seo,
  children,
  className,
}: SimpleLayoutProps) {
  return (
    <>
      <NextSeo {...seo} />

      <AppHeader />

      <main className={`container min-h-[80vh] my-14 ${className ?? ""}`}>
        {children}
      </main>

      <AppFooter />
    </>
  );
}
