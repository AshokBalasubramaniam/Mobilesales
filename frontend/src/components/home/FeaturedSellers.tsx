import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import Avatar from "../common/Avatar";
import StarRating from "../common/StarRating";
import Card from "../common/Card";
import type { Mobile, User } from "../../types/models";

export interface FeaturedSellersProps {
  mobiles: Mobile[];
}

type FeaturedSeller = Pick<
  User,
  "_id" | "name" | "avatar" | "sellerProfile"
> & {
  ratingAvg?: number;
  ratingCount?: number;
};

const classes = {
  section: "mx-auto max-w-7xl px-4 py-8",
  title: "mb-4 text-xl font-bold",
  grid: "grid grid-cols-2 gap-4 sm:grid-cols-4",
  link: "contents",
  card: "flex flex-col items-center gap-2 text-center",
  name: "flex items-center gap-1 text-sm font-semibold",
  badge: "size-4 text-brand-600",
  reviewCount: "text-xs text-gray-500",
};

const FeaturedSellers = ({ mobiles }: FeaturedSellersProps) => {
  const sellers: FeaturedSeller[] = [];
  const seen = new Set<string>();
  for (const mobile of mobiles || []) {
    const seller = mobile.seller;
    if (
      typeof seller === "object" &&
      seller._id &&
      !seen.has(seller._id) &&
      seller.sellerProfile?.isVerified
    ) {
      seen.add(seller._id);
      sellers.push(seller as FeaturedSeller);
    }
  }

  if (!sellers.length) return null;

  return (
    <section className={classes.section}>
      <h2 className={classes.title}>Featured Sellers</h2>
      <div className={classes.grid}>
        {sellers.slice(0, 4).map((seller) => (
          <Link
            key={seller._id}
            to={`/users/${seller._id}`}
            className={classes.link}
          >
            <Card padding="sm" hoverable className={classes.card}>
              <Avatar src={seller.avatar} name={seller.name} size="lg" />
              <span className={classes.name}>
                {seller.name} <BadgeCheck className={classes.badge} />
              </span>
              <StarRating value={seller.ratingAvg} />
              <span className={classes.reviewCount}>
                {seller.ratingCount} reviews
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSellers;
