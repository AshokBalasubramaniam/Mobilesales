import type { ReactNode } from "react";

export interface StaticPageProps {
  title: string;
  children?: ReactNode;
}

const classes = {
  container: "mx-auto max-w-3xl px-4 py-12",
  title: "mb-6 text-2xl font-bold",
  content: "space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400",
};

const StaticPage = ({ title, children }: StaticPageProps) => (
  <div className={classes.container}>
    <h1 className={classes.title}>{title}</h1>
    <div className={classes.content}>{children}</div>
  </div>
);

export default StaticPage;
