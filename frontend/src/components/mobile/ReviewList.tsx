import Avatar from '../common/Avatar';
import StarRating from '../common/StarRating';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/format';
import { MessageSquare } from 'lucide-react';
import type { Review } from '../../types/models';

export interface ReviewListProps {
  reviews?: Review[] | null;
  loading?: boolean;
}

const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return <EmptyState icon={MessageSquare} title="No reviews yet" description="Be the first to review after your purchase." />;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const buyer = typeof review.buyer === 'string' ? undefined : review.buyer;
        return (
          <div key={review._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Avatar src={buyer?.avatar} name={buyer?.name} size="sm" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{buyer?.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                <div className="mt-0.5">
                  <StarRating value={review.rating} />
                </div>
                {review.comment && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
                {review.images?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {review.images.map((img) => (
                      <img key={img} src={img} alt="Review" className="size-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                {review.sellerReply?.text && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                    <span className="font-medium">Seller reply: </span>
                    {review.sellerReply.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
