import { Star } from "lucide-react";
import clsx from "clsx";

export interface StarRatingProps {
  value?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const classes = {
  container: "flex items-center gap-0.5",
  button: "cursor-default",
  sizeSm: "size-4",
  sizeMd: "size-5",
  sizeLg: "size-6",
  starActive: "fill-amber-400 text-amber-400",
  starInactive: "fill-gray-200 text-gray-200",
};

const StarRating = ({
  value = 0,
  size = "sm",
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const sizeClass =
    size === "lg"
      ? classes.sizeLg
      : size === "md"
        ? classes.sizeMd
        : classes.sizeSm;

  return (
    <div className={classes.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={clsx(!interactive && classes.button)}
        >
          <Star
            className={clsx(
              sizeClass,
              star <= Math.round(value)
                ? classes.starActive
                : classes.starInactive,
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
