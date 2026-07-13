import { useEffect, useState } from 'react';
import { adminApi } from '../../api/dashboard.api';
import type { SalesAnalytics } from '../../api/dashboard.api';
import SalesBarChart from '../../components/dashboard/SalesBarChart';
import Spinner from '../../components/common/Spinner';

const Analytics = () => {
  const [data, setData] = useState<SalesAnalytics | null>(null);

  useEffect(() => {
    adminApi.salesAnalytics().then(({ data }) => setData(data.data));
  }, []);

  if (!data) return <Spinner full />;

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Sales Analytics</h2>

      <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 font-semibold">Daily Sales (last 30 days)</h3>
        <SalesBarChart data={data.dailySales} />
      </div>

      <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 font-semibold">Monthly Sales (last 12 months)</h3>
        <SalesBarChart data={data.monthlySales} />
      </div>
    </div>
  );
};

export default Analytics;
