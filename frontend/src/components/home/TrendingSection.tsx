import { useState } from "react";
import clsx from "clsx";
import ProductCarousel from "./ProductCarousel";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

export interface TrendingSectionProps {
  verified?: Mobile[];
  bestDeals?: Mobile[];
  recentlyAdded?: Mobile[];
  loading?: boolean;
}

const classes = {
  tabs:
    "flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 [scrollbar-width:none]",
  tab: "rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors text-gray-500 hover:text-gray-700",
  tabActive: "bg-brand-600 text-white hover:text-white",
};

const TrendingSection = ({
  verified,
  bestDeals,
  recentlyAdded,
  loading,
}: TrendingSectionProps) => {
  const TABS = [
    { key: "trending", label: "Trending", listings: verified, href: PATHS.search },
    {
      key: "deals",
      label: "Best Deals",
      listings: bestDeals,
      href: `${PATHS.search}?sort=price_low`,
    },
    {
      key: "recent",
      label: "Recently Added",
      listings: recentlyAdded,
      href: `${PATHS.search}?sort=newest`,
    },
  ];
  const [active, setActive] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <ProductCarousel
      loading={loading}
      listings={current.listings}
      viewAllHref={current.href}
      header={
        <div className={classes.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={clsx(classes.tab, active === tab.key && classes.tabActive)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    />
  );
};

export default TrendingSection;
