import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';
import Card from '../common/Card';
import { truncate } from '../../utils/format';
import type { Review } from '../../types/models';

export interface CustomerReviewsProps {
  reviews: Review[];
}

const CustomerReviews = ({ reviews }: CustomerReviewsProps) => {
  if (!reviews?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">What Buyers Are Saying</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reviews.slice(0, 3).map((review) => {
          const buyer = typeof review.buyer === 'object' ? review.buyer : undefined;
          return (
            <Card key={review._id} padding="md">
              <StarRating value={review.rating} />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{truncate(review.comment, 140)}</p>
              <div className="mt-4 flex items-center gap-2">
                <Avatar src={buyer?.avatar} name={buyer?.name} size="sm" />
                <span className="text-sm font-medium">{buyer?.name}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default CustomerReviews;
