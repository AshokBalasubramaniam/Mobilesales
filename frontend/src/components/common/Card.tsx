import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

const PADDING = { sm: "p-4", md: "p-5" } as const;

const classes = {
  base: "rounded-xl border border-gray-200",
  hoverable: "transition-colors hover:border-brand-400 hover:shadow-sm",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  hoverable?: boolean;
  padding?: keyof typeof PADDING;
}

const Card = ({
  children,
  hoverable,
  padding = "md",
  className,
  ...props
}: CardProps) => (
  <div
    className={clsx(
      classes.base,
      PADDING[padding],
      hoverable && classes.hoverable,
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
