import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import StarRating from "../common/StarRating";
import { truncate, formatRelativeTime } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { Review } from "../../types/models";

export interface HappyCustomersCardProps {
  reviews?: Review[];
}

const classes = {
  card: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  header: "mb-3 flex items-center justify-between gap-2",
  title: "font-display text-sm font-bold text-gray-900",
  viewAll: "text-xs font-semibold text-brand-700 hover:underline",
  list: "flex flex-col gap-3",
  item: "flex gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0",
  avatar: "shrink-0",
  body: "min-w-0 flex-1",
  nameRow: "mb-0.5 flex items-center justify-between gap-1",
  name: "text-xs font-semibold text-gray-800",
  comment: "text-xs leading-snug text-gray-500",
  time: "mt-0.5 block text-xs text-gray-400",
};

const HappyCustomersCard = ({ reviews }: HappyCustomersCardProps) => {
  if (!reviews?.length) return null;

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>Happy Customers</h3>
        <Link to={PATHS.search} className={classes.viewAll}>
          View All
        </Link>
      </div>
      <div className={classes.list}>
        {reviews.slice(0, 3).map((review) => {
          const buyer =
            typeof review.buyer === "object" ? review.buyer : undefined;
          return (
            <div key={review._id} className={classes.item}>
              <Avatar
                src={buyer?.avatar}
                name={buyer?.name}
                size="sm"
                className={classes.avatar}
              />
              <div className={classes.body}>
                <div className={classes.nameRow}>
                  <span className={classes.name}>{buyer?.name}</span>
                  <StarRating value={review.rating} size="sm" />
                </div>
                <p className={classes.comment}>
                  {truncate(review.comment, 110)}
                </p>
                <span className={classes.time}>
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HappyCustomersCard;
