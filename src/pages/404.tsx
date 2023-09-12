import DefaultLayout from "@/layouts/DefaultLayout";
import styles from "@/styles/Home.module.css";
import { LinkCardGrid } from "@/components/LinkCard";

export default function Page() {
  return (
    <DefaultLayout
      seo={{
        // comment for better diffs
        title: "Page Not Found",
        description: "",
      }}
      className={styles.main}
    >
      <div className={styles.center}>
        <h6 className={styles.heading}>404</h6>

        <p className={styles.tagline}>
          The page you were looking for was not found.
        </p>
      </div>

      <LinkCardGrid
        title={"Explore NFT experiments"}
        cards={[
          {
            label: "Feature #1",
            href: "#",
            description: "Checkout this super cool thing that we can do",
          },
          {
            label: "Feature #2",
            href: "#",
            description: "Checkout this super cool thing that we can do",
          },
          {
            label: "Feature #3",
            href: "#",
            description: "Checkout this super cool thing that we can do",
          },
        ]}
      />
    </DefaultLayout>
  );
}
