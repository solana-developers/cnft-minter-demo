import styles from "@/styles/LinkCard.module.css";
import Link from "next/link";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type LinkCardGridProps = {
  title?: string;
  cards: LinkCardProps[];
};

export const LinkCardGrid: React.FC<
  React.HTMLAttributes<HTMLDivElement> & LinkCardGridProps
> = ({ title, cards, className }) => {
  return (
    <div className={className}>
      {!!title && <h2 className={styles.gridTitle}>{title}</h2>}

      <section className={styles.cardGrid}>
        {cards.map((card, id) => (
          <LinkCard key={id} {...card} />
        ))}
      </section>
    </div>
  );
};

type LinkCardProps = {
  label: string;
  href: string;
  description: string;
  isExternal?: boolean;
};

export const LinkCard: React.FC<LinkCardProps> = ({
  label,
  href,
  description,
  isExternal = false,
}) => {
  return (
    <Link
      href={href}
      className={styles.card}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      <h2>
        {label} <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
      </h2>
      <p>{description}</p>
    </Link>
  );
};
