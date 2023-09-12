import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header className={"border-b border-gray-800"}>
      <div className={"container flex items-center justify-between !py-2"}>
        <div className="">
          <h1 className={"text-2xl font-semibold"}>
            <Link href={"/"}>{SITE_NAME}</Link>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={"https://twitter.com/solana_devs"}
            className="bg-twitter btn btn-sm"
            target="_blank"
          >
            @solana_devs
          </Link>
        </div>
      </div>
    </header>
  );
}
