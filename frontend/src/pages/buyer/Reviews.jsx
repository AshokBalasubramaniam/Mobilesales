import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewsApi } from '../../api/reviews.api';
import ReviewList from '../../components/mobile/ReviewList';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reviewsApi
      .my({ page })
      .then(({ data }) => {
        setReviews(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">My Reviews</h2>
      {!loading && reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews written yet" description="Reviews you leave after completed orders will appear here." />
      ) : (
        <ReviewList reviews={reviews} loading={loading} />
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Reviews;
