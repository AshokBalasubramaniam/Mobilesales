import { useEffect, useState } from "react";
import api from "../../api/api";
import type { SalesAnalytics } from "../../types/dashboard";
import type { ApiResponse } from "../../types/api";
import SalesBarChart from "../../components/dashboard/SalesBarChart";
import Spinner from "../../components/common/Spinner";

const classes = {
  container: "space-y-8",
  heading: "text-lg font-semibold",
  card: "rounded-xl border border-gray-200 p-6",
  cardTitle: "mb-4 font-semibold",
};

const Analytics = () => {
  const [data, setData] = useState<SalesAnalytics | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<SalesAnalytics>>("/admin/analytics/sales")
      .then(({ data }) => setData(data.data));
  }, []);

  if (!data) return <Spinner full />;

  return (
    <div className={classes.container}>
      <h2 className={classes.heading}>Sales Analytics</h2>

      <div className={classes.card}>
        <h3 className={classes.cardTitle}>Daily Sales (last 30 days)</h3>
        <SalesBarChart data={data.dailySales} />
      </div>

      <div className={classes.card}>
        <h3 className={classes.cardTitle}>Monthly Sales (last 12 months)</h3>
        <SalesBarChart data={data.monthlySales} />
      </div>
    </div>
  );
};

export default Analytics;
