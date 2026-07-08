import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';

const FeaturedSellers = ({ mobiles }) => {
  const sellers = [];
  const seen = new Set();
  for (const mobile of mobiles || []) {
    const seller = mobile.seller;
    if (seller?._id && !seen.has(seller._id) && seller.sellerProfile?.isVerified) {
      seen.add(seller._id);
      sellers.push(seller);
    }
  }

  if (!sellers.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">Featured Sellers</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {sellers.slice(0, 4).map((seller) => (
          <Link
            key={seller._id}
            to={`/users/${seller._id}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-5 text-center hover:shadow-sm dark:border-gray-800"
          >
            <Avatar src={seller.avatar} name={seller.name} size="lg" />
            <span className="flex items-center gap-1 text-sm font-semibold">
              {seller.name} <BadgeCheck className="size-4 text-brand-600" />
            </span>
            <StarRating value={seller.ratingAvg} />
            <span className="text-xs text-gray-500">{seller.ratingCount} reviews</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSellers;
