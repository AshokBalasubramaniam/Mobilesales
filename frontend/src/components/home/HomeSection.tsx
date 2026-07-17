import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ListingGrid from "../mobile/ListingGrid";
import type { Mobile } from "../../types/models";

export interface HomeSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  listings?: Mobile[];
  loading?: boolean;
}

const classes = {
  section: "mx-auto max-w-7xl px-4 py-8",
  header: "mb-4 flex items-end justify-between",
  title: "text-xl font-bold",
  subtitle: "text-sm text-gray-500",
  viewAll:
    "flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline",
  viewAllIcon: "size-4",
};

const HomeSection = ({
  title,
  subtitle,
  viewAllHref,
  listings,
  loading,
}: HomeSectionProps) => {
  if (!loading && !listings?.length) return null;

  return (
    <section className={classes.section}>
      <div className={classes.header}>
        <div>
          <h2 className={classes.title}>{title}</h2>
          {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link to={viewAllHref} className={classes.viewAll}>
            View all <ChevronRight className={classes.viewAllIcon} />
          </Link>
        )}
      </div>
      <ListingGrid listings={listings} loading={loading} />
    </section>
  );
};

export default HomeSection;
