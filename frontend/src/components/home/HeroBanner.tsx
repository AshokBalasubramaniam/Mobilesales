import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Repeat,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import api from "../../api/api";
import { PATHS } from "../../routes/paths";
import type { ApiResponse } from "../../types/api";

const SIDE_BADGES = [
  {
    icon: ShieldCheck,
    title: "Verified Devices",
    description: "100+ Quality Checks",
  },
  {
    icon: BadgeCheck,
    title: "Best Resale Value",
    description: "Get Maximum Offers",
  },
  {
    icon: Zap,
    title: "Instant Offers",
    description: "Quick & Easy Process",
  },
  {
    icon: Wallet,
    title: "Secure Transactions",
    description: "100% Safe & Secure",
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    description: "Fast & Reliable",
  },
];

const HAPPY_CUSTOMERS = ["Aarav Shah", "Meera Iyer", "Rohan Nair", "Ayaan Khan"];

const classes = {
  wrap: "w-full bg-gray-100 px-4 py-4",
  section:
    "relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0a1a0b_0%,#0d2110_40%,#0f2a14_70%,#0a1a0b_100%)]",
  bannerImage:
    "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-float object-contain",
  glow:
    "pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_60%_50%,#16a34a_0%,transparent_60%),radial-gradient(ellipse_at_20%_80%,#065f46_0%,transparent_50%)]",
  layout: "relative flex flex-col items-stretch xl:flex-row",
  content: "flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10",
  badge:
    "mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-600/25 px-3 py-1.5 text-xs font-semibold text-brand-200",
  badgeIcon: "size-3 text-accent-400",
  title:
    "font-display text-[28px] leading-none font-black text-white sm:text-4xl xl:text-[52px]",
  titleAccent: "mt-1 block text-accent-500 sm:mt-2",
  subtitle:
    "mb-7 mt-4 max-w-sm text-sm leading-relaxed text-gray-300 sm:text-base",
  actions: "mb-8 flex flex-wrap gap-3",
  exploreIconCircle:
    "flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-700",
  exploreIcon: "size-3.5",
  sellButton:
    "border border-white/40 bg-transparent text-white hover:bg-white/10",
  sellIconCircle:
    "flex size-6 shrink-0 items-center justify-center rounded-full border border-white/70",
  sellIcon: "size-3.5",
  proof: "flex flex-wrap items-center gap-4",
  avatarStack: "flex -space-x-3",
  avatarRing: "ring-2 ring-brand-900",
  proofText: "text-sm font-semibold text-white",
  ratingRow: "flex items-center gap-1.5 text-sm",
  ratingCheck: "size-4 text-brand-500",
  ratingScore: "font-bold text-accent-500",
  ratingStars: "flex text-amber-400",
  ratingStarIcon: "size-3.5 fill-current",
  ratingCount: "text-gray-400",
  sideBadges:
    "hidden w-52 shrink-0 flex-col justify-center gap-2 p-5 xl:flex",
  sideBadgeCard:
    "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm",
  sideBadgeIconWrap:
    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600/25 text-brand-300",
  sideBadgeIcon: "size-4",
  sideBadgeTitle: "text-xs font-semibold leading-tight text-white",
  sideBadgeDescription: "text-xs leading-tight text-gray-400",
};

const HeroBanner = () => {
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerSize, setBannerSize] = useState(100);

  useEffect(() => {
    api
      .get<
        ApiResponse<{ heroBannerUrl: string | null; heroBannerSize: number }>
      >("/settings/public")
      .then(({ data }) => {
        setBannerUrl(data.data.heroBannerUrl);
        setBannerSize(data.data.heroBannerSize);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={classes.wrap}>
      <div className={classes.section} style={{ minHeight: 340 }}>
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            className={classes.bannerImage}
            style={{ width: bannerSize, height: bannerSize }}
          />
        )}
        <div className={classes.glow} />
        <div className={classes.layout}>
          <div className={classes.content}>
            <span className={classes.badge}>
              <ShieldCheck className={classes.badgeIcon} /> India's Trusted
              Electronics Marketplace
            </span>

            <h1 className={classes.title}>
              Upgrade Smarter.
              <span className={classes.titleAccent}>Trade Better.</span>
            </h1>

            <p className={classes.subtitle}>
              Buy, Sell &amp; Exchange Certified Smartphones, Laptops &amp;
              More at Best Prices.
            </p>

            <div className={classes.actions}>
              <Button size="lg" onClick={() => navigate(PATHS.search)}>
                Explore Devices
                <span className={classes.exploreIconCircle}>
                  <ArrowRight className={classes.exploreIcon} />
                </span>
              </Button>
              <Button
                size="lg"
                className={classes.sellButton}
                onClick={() => navigate(PATHS.sell)}
              >
                Sell Your Device
                <span className={classes.sellIconCircle}>
                  <Repeat className={classes.sellIcon} />
                </span>
              </Button>
            </div>

            <div className={classes.proof}>
              <div className={classes.avatarStack}>
                {HAPPY_CUSTOMERS.map((name) => (
                  <Avatar
                    key={name}
                    name={name}
                    size="sm"
                    className={classes.avatarRing}
                  />
                ))}
              </div>
              <span className={classes.proofText}>50K+ Happy Customers</span>

              <div className={classes.ratingRow}>
                <BadgeCheck className={classes.ratingCheck} />
                <span className={classes.ratingScore}>4.8</span>
                <span className={classes.ratingStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={classes.ratingStarIcon} />
                  ))}
                </span>
                <span className={classes.ratingCount}>(2.3K Reviews)</span>
              </div>
            </div>
          </div>

          <div className={classes.sideBadges}>
            {SIDE_BADGES.map((b) => (
              <div key={b.title} className={classes.sideBadgeCard}>
                <span className={classes.sideBadgeIconWrap}>
                  <b.icon className={classes.sideBadgeIcon} />
                </span>
                <div>
                  <p className={classes.sideBadgeTitle}>{b.title}</p>
                  <p className={classes.sideBadgeDescription}>
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
