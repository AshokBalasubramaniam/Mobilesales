import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchHomeSections } from "../features/mobiles/thunks";
import { fetchHomeReviews } from "../features/reviews/thunks";
import {
  selectHomeSections,
  selectHomeSectionsStatus,
} from "../features/mobiles/selectors";
import { selectHomeReviews } from "../features/reviews/selectors";
import HeroBanner from "../components/home/HeroBanner";
import CategoriesNav from "../components/home/CategoriesNav";
import { useAuth } from "../hooks/useAuth";
import type { DeviceCategory } from "../types/models";
import TrendingSection from "../components/home/TrendingSection";
import RecentlyAddedSection from "../components/home/RecentlyAddedSection";
import TopSellingSection from "../components/home/TopSellingSection";
import RecommendedSection from "../components/home/RecommendedSection";
import OfferBanners from "../components/home/OfferBanners";
import StatsCard from "../components/home/StatsCard";
import SellStepsCard from "../components/home/SellStepsCard";
import WhyChooseMapzha from "../components/home/WhyChooseMapzha";
import HappyCustomersCard from "../components/home/HappyCustomersCard";
import BenefitsBar from "../components/home/BenefitsBar";

const classes = {
  layout: "mx-auto flex w-full max-w-screen-2xl items-start gap-4 px-4 pb-4",
  main: "flex min-w-0 flex-1 flex-col gap-4",
  sidebar: "sticky top-4 hidden w-[280px] shrink-0 flex-col gap-4 lg:flex",
  mobileSidebar: "flex flex-col gap-4 px-4 pb-4 lg:hidden",
  fullWidth: "mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 pb-4",
};

const Sidebar = ({
  loading,
  reviews,
}: {
  loading: boolean;
  reviews: ReturnType<typeof selectHomeReviews>;
}) => (
  <>
    <StatsCard />
    <SellStepsCard />
    <WhyChooseMapzha />
    {!loading && <HappyCustomersCard reviews={reviews} />}
  </>
);

const Home = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(selectHomeSections);
  const sectionsStatus = useAppSelector(selectHomeSectionsStatus);
  const reviews = useAppSelector(selectHomeReviews);
  const loading = sectionsStatus === "idle" || sectionsStatus === "loading";
  const [selectedCategory, setSelectedCategory] =
    useState<DeviceCategory | null>(null);
  const { user } = useAuth();
  const userId = user?._id;

  // Refetch when the signed-in user changes (session restore finishes after
  // the first render) so the backend can leave out the user's own listings.
  useEffect(() => {
    dispatch(fetchHomeSections(selectedCategory ?? undefined));
  }, [selectedCategory, userId, dispatch]);

  useEffect(() => {
    if (!sections) return;
    const sampleIds = [
      ...(sections.verified || []),
      ...(sections.premium || []),
    ]
      .slice(0, 2)
      .map((m) => m._id);
    if (sampleIds.length) dispatch(fetchHomeReviews(sampleIds));
  }, [sections, dispatch]);

  return (
    <div>
      <HeroBanner />

      <div className={classes.layout}>
        <div className={classes.main}>
          <CategoriesNav
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <TrendingSection
            verified={sections?.verified}
            bestDeals={sections?.bestDeals}
            recentlyAdded={sections?.recentlyAdded}
            loading={loading}
          />
          <RecentlyAddedSection
            listings={sections?.recentlyAdded}
            loading={loading}
          />
          <TopSellingSection
            listings={
              sections?.premium?.length ? sections.premium : sections?.verified
            }
            loading={loading}
          />
          <RecommendedSection listings={sections?.bestDeals} loading={loading} />
        </div>

        <div className={classes.sidebar}>
          <Sidebar loading={loading} reviews={reviews} />
        </div>
      </div>

      <div className={classes.mobileSidebar}>
        <Sidebar loading={loading} reviews={reviews} />
      </div>

      <div className={classes.fullWidth}>
        <OfferBanners />
      </div>

      <BenefitsBar />
    </div>
  );
};

export default Home;
