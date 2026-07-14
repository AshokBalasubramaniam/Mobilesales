import { useEffect, useState } from 'react';
import api from '../../api/api';
import type { SalesAnalytics } from '../../types/dashboard';
import type { ApiResponse } from '../../types/api';
import SalesBarChart from '../../components/dashboard/SalesBarChart';
import Spinner from '../../components/common/Spinner';

const Analytics = () => {
  const [data, setData] = useState<SalesAnalytics | null>(null);

  useEffect(() => {
    api.get<ApiResponse<SalesAnalytics>>('/admin/analytics/sales').then(({ data }) => setData(data.data));
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
