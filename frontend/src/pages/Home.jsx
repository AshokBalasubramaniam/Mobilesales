import { useEffect, useState } from 'react';
import { mobilesApi } from '../api/mobiles.api';
import { reviewsApi } from '../api/reviews.api';
import HeroBanner from '../components/home/HeroBanner';
import QuickFilters from '../components/home/QuickFilters';
import HomeSection from '../components/home/HomeSection';
import PopularBrands from '../components/home/PopularBrands';
import FeaturedSellers from '../components/home/FeaturedSellers';
import CustomerReviews from '../components/home/CustomerReviews';
import FAQSection from '../components/home/FAQSection';
import { PATHS } from '../routes/paths';

const Home = () => {
  const [sections, setSections] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobilesApi
      .homeSections()
      .then(async ({ data }) => {
        setSections(data.data);
        const sampleMobiles = [...(data.data.verified || []), ...(data.data.premium || [])].slice(0, 2);
        const reviewLists = await Promise.all(
          sampleMobiles.map((m) => reviewsApi.byMobile(m._id, { limit: 3 }).then((r) => r.data.data).catch(() => []))
        );
        setReviews(reviewLists.flat());
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroBanner />
      <QuickFilters />
      <HomeSection title="Verified Phones" subtitle="IMEI-checked and seller-verified" viewAllHref={`${PATHS.search}?verifiedImei=true`} listings={sections?.verified} loading={loading} />
      <HomeSection title="Premium Listings" subtitle="Top-tier condition, hand-picked" viewAllHref={`${PATHS.search}?sort=price_desc`} listings={sections?.premium} loading={loading} />
      <HomeSection title="Best Deals" subtitle="Biggest discounts vs. original price" viewAllHref={PATHS.search} listings={sections?.bestDeals} loading={loading} />
      <PopularBrands brands={sections?.popularBrands} />
      <HomeSection title="Recently Added" subtitle="Freshly listed phones" viewAllHref={`${PATHS.search}?sort=newest`} listings={sections?.recentlyAdded} loading={loading} />
      <FeaturedSellers mobiles={[...(sections?.verified || []), ...(sections?.premium || [])]} />
      <CustomerReviews reviews={reviews} />
      <FAQSection />
    </div>
  );
};

export default Home;
