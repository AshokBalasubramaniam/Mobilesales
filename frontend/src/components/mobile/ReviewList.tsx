import Avatar from "../common/Avatar";
import StarRating from "../common/StarRating";
import EmptyState from "../common/EmptyState";
import { formatDate } from "../../utils/format";
import { MessageSquare } from "lucide-react";
import type { Review } from "../../types/models";

export interface ReviewListProps {
  reviews?: Review[] | null;
  loading?: boolean;
}

const classes = {
  skeletonWrapper: "space-y-3",
  skeletonItem: "skeleton h-24",
  list: "space-y-4",
  card: "rounded-xl border border-gray-200 p-4",
  cardRow: "flex items-start gap-3",
  body: "flex-1",
  headerRow: "flex items-center justify-between",
  reviewerName: "text-sm font-semibold",
  reviewDate: "text-xs text-gray-400",
  ratingWrapper: "mt-0.5",
  comment: "mt-2 text-sm text-gray-600",
  imagesRow: "mt-2 flex gap-2",
  reviewImage: "size-16 rounded-lg object-cover",
  sellerReply: "mt-3 rounded-lg bg-gray-50 p-3 text-sm",
  sellerReplyLabel: "font-medium",
};

const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  if (loading) {
    return (
      <div className={classes.skeletonWrapper}>
        {[1, 2].map((i) => (
          <div key={i} className={classes.skeletonItem} />
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to review after your purchase."
      />
    );
  }

  return (
    <div className={classes.list}>
      {reviews.map((review) => {
        const buyer =
          typeof review.buyer === "string" ? undefined : review.buyer;
        return (
          <div key={review._id} className={classes.card}>
            <div className={classes.cardRow}>
              <Avatar src={buyer?.avatar} name={buyer?.name} size="sm" />
              <div className={classes.body}>
                <div className={classes.headerRow}>
                  <span className={classes.reviewerName}>{buyer?.name}</span>
                  <span className={classes.reviewDate}>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className={classes.ratingWrapper}>
                  <StarRating value={review.rating} />
                </div>
                {review.comment && (
                  <p className={classes.comment}>{review.comment}</p>
                )}
                {review.images?.length > 0 && (
                  <div className={classes.imagesRow}>
                    {review.images.map((img) => (
                      <img
                        key={img}
                        src={img}
                        alt="Review"
                        className={classes.reviewImage}
                      />
                    ))}
                  </div>
                )}
                {review.sellerReply?.text && (
                  <div className={classes.sellerReply}>
                    <span className={classes.sellerReplyLabel}>
                      Seller reply:{" "}
                    </span>
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
