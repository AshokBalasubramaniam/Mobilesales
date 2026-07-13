import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchHomeSections } from '../features/mobiles/mobilesSlice';
import { fetchHomeReviews } from '../features/reviews/reviewsSlice';
import { selectHomeSections, selectHomeSectionsStatus } from '../selectors/mobiles.selectors';
import { selectHomeReviews } from '../selectors/reviews.selectors';
import HeroBanner from '../components/home/HeroBanner';
import QuickFilters from '../components/home/QuickFilters';
import HomeSection from '../components/home/HomeSection';
import PopularBrands from '../components/home/PopularBrands';
import FeaturedSellers from '../components/home/FeaturedSellers';
import CustomerReviews from '../components/home/CustomerReviews';
import FAQSection from '../components/home/FAQSection';
import { PATHS } from '../routes/paths';

const Home = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(selectHomeSections);
  const sectionsStatus = useAppSelector(selectHomeSectionsStatus);
  const reviews = useAppSelector(selectHomeReviews);
  const loading = sectionsStatus === 'idle' || sectionsStatus === 'loading';

  useEffect(() => {
    dispatch(fetchHomeSections());
  }, [dispatch]);

  useEffect(() => {
    if (!sections) return;
    const sampleIds = [...(sections.verified || []), ...(sections.premium || [])].slice(0, 2).map((m) => m._id);
    if (sampleIds.length) dispatch(fetchHomeReviews(sampleIds));
  }, [sections, dispatch]);

  return (
    <div>
      <HeroBanner />
      <QuickFilters />
      <HomeSection
        title="Verified Phones"
        subtitle="IMEI-checked and seller-verified"
        viewAllHref={`${PATHS.search}?verifiedImei=true`}
        listings={sections?.verified}
        loading={loading}
      />
      <HomeSection
        title="Premium Listings"
        subtitle="Top-tier condition, hand-picked"
        viewAllHref={`${PATHS.search}?sort=price_desc`}
        listings={sections?.premium}
        loading={loading}
      />
      <HomeSection
        title="Best Deals"
        subtitle="Biggest discounts vs. original price"
        viewAllHref={PATHS.search}
        listings={sections?.bestDeals}
        loading={loading}
      />
      <PopularBrands brands={sections?.popularBrands} />
      <HomeSection
        title="Recently Added"
        subtitle="Freshly listed phones"
        viewAllHref={`${PATHS.search}?sort=newest`}
        listings={sections?.recentlyAdded}
        loading={loading}
      />
      <FeaturedSellers mobiles={[...(sections?.verified || []), ...(sections?.premium || [])]} />
      <CustomerReviews reviews={reviews} />
      <FAQSection />
    </div>
  );
};

export default Home;
