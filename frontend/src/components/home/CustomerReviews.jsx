import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';
import { truncate } from '../../utils/format';

const CustomerReviews = ({ reviews }) => {
  if (!reviews?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">What Buyers Are Saying</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <div key={review._id} className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <StarRating value={review.rating} />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{truncate(review.comment, 140)}</p>
            <div className="mt-4 flex items-center gap-2">
              <Avatar src={review.buyer?.avatar} name={review.buyer?.name} size="sm" />
              <span className="text-sm font-medium">{review.buyer?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
