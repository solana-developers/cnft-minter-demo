import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className={"border-t border-gray-800"}>
      <div className={"container flex items-center justify-between"}>
        <div className="">
          <h4 className={"text-xl font-semibold"}>
            <Link href={"/"}>cNFT Minter Demo</Link>
          </h4>
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
    </footer>
  );
}
