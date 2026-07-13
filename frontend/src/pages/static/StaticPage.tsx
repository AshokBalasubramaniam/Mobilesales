import type { ReactNode } from 'react';

export interface StaticPageProps {
  title: string;
  children?: ReactNode;
}

const StaticPage = ({ title, children }: StaticPageProps) => (
  <div className="mx-auto max-w-3xl px-4 py-12">
    <h1 className="mb-6 text-2xl font-bold">{title}</h1>
    <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{children}</div>
  </div>
);

export default StaticPage;
