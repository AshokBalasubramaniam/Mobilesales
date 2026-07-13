import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';
import Card from '../common/Card';
import type { Mobile, User } from '../../types/models';

export interface FeaturedSellersProps {
  mobiles: Mobile[];
}

// The home-sections endpoint populates `seller` with ratingAvg/ratingCount
// (backend/src/controllers/mobile.controller.js#getHomeSections), which aren't
// part of the generic Mobile['seller'] Pick — extend locally instead of widening
// the shared model type.
type FeaturedSeller = Pick<User, '_id' | 'name' | 'avatar' | 'sellerProfile'> & {
  ratingAvg?: number;
  ratingCount?: number;
};

const FeaturedSellers = ({ mobiles }: FeaturedSellersProps) => {
  const sellers: FeaturedSeller[] = [];
  const seen = new Set<string>();
  for (const mobile of mobiles || []) {
    const seller = mobile.seller;
    if (typeof seller === 'object' && seller._id && !seen.has(seller._id) && seller.sellerProfile?.isVerified) {
      seen.add(seller._id);
      sellers.push(seller as FeaturedSeller);
    }
  }

  if (!sellers.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">Featured Sellers</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {sellers.slice(0, 4).map((seller) => (
          // `contents` keeps Link box-less so the whole Card (incl. its padding) stays
          // the click target, since Card itself can only render a <div>, not an <a>.
          <Link key={seller._id} to={`/users/${seller._id}`} className="contents">
            <Card padding="sm" hoverable className="flex flex-col items-center gap-2 text-center">
              <Avatar src={seller.avatar} name={seller.name} size="lg" />
              <span className="flex items-center gap-1 text-sm font-semibold">
                {seller.name} <BadgeCheck className="size-4 text-brand-600" />
              </span>
              <StarRating value={seller.ratingAvg} />
              <span className="text-xs text-gray-500">{seller.ratingCount} reviews</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSellers;
