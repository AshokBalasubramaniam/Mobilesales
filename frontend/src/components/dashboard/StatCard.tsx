import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}

const StatCard = ({ icon: Icon, label, value, accent }: StatCardProps) => (
  <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <Icon className={`size-5 ${accent || 'text-brand-600'}`} />
    </div>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

export default StatCard;
