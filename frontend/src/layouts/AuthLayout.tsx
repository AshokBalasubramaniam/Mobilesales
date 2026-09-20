import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Tag,
  MessageCircle,
  Layers,
  BadgeCheck,
  Zap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PATHS } from "../routes/paths";
import heroDevices from "../assets/hero-devices.png";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StatItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const classes = {
  page: "flex min-h-screen flex-col bg-brand-50",
  header: "flex items-center justify-between gap-4 px-4 py-4 sm:px-8",
  logoLink: "flex items-center gap-3",
  logoMark:
    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white",
  logoName: "block text-lg leading-tight font-bold text-brand-900",
  logoTagline: "block text-xs font-medium tracking-wide text-brand-700",
  headerCta: "flex items-center gap-3 text-sm text-gray-500",
  headerCtaButton:
    "rounded-full border border-brand-600 px-5 py-2 font-medium text-brand-700 transition-colors hover:bg-brand-100",

  main: "flex flex-1 flex-col gap-8 px-4 pb-8 sm:px-8 lg:flex-row lg:items-stretch",
  marketing: "hidden flex-1 flex-col lg:flex",
  badge:
    "inline-flex w-fit items-center gap-2 rounded-full border border-brand-300 bg-white/60 px-4 py-1.5 text-sm text-brand-700",
  badgeIcon: "size-4 text-brand-600",
  heading: "mt-6 text-5xl leading-tight font-black text-brand-900 xl:text-6xl",
  headingAccent: "text-brand-600",
  subheading: "mt-4 max-w-xs text-base leading-relaxed text-gray-600",
  featuresList: "mt-8 space-y-5",
  featureItem: "flex items-center gap-4",
  featureIconWrap:
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600",
  featureIcon: "size-5",
  featureTitle: "font-semibold text-brand-900",
  featureDescription: "text-sm text-gray-500",

  heroImageStage: "flex flex-1 items-center justify-center",
  heroImage: "w-full max-w-md object-contain",

  statsRow: "grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3",
  statItem: "flex items-center gap-3",
  statIconWrap:
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600",
  statTitle: "text-sm font-semibold text-brand-900",
  statDescription: "text-xs text-gray-500",

  formColumn: "flex w-full items-center justify-center lg:w-[440px] lg:shrink-0",
  formInner: "w-full max-w-md",
  cardLogoWrap: "mb-6 flex justify-center",
  cardLogoMark:
    "flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-2xl font-bold text-white",
  card: "rounded-3xl border border-brand-100 bg-white p-8 shadow-xl sm:p-10",
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Secure & Trusted",
    description: "100% safe transactions",
  },
  { icon: Tag, title: "Best Deals", description: "Find the best prices" },
  {
    icon: MessageCircle,
    title: "Chat & Connect",
    description: "Talk to buyers & sellers",
  },
];

const STATS: StatItem[] = [
  {
    icon: Layers,
    title: "Wide Range",
    description: "Phones, Laptops, Tablets & more",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Sellers",
    description: "Verified & reliable",
  },
  {
    icon: Zap,
    title: "Fast & Secure",
    description: "Safe delivery & payments",
  },
];

const AuthLayout = () => {
  const location = useLocation();
  const isRegister = location.pathname === PATHS.register;

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <Link to={PATHS.home} className={classes.logoLink}>
          <span className={classes.logoMark}>M</span>
          <span>
            <span className={classes.logoName}>MAPZHA</span>
            <span className={classes.logoTagline}>
              BUY &amp; SELL PHONES WITH TRUST
            </span>
          </span>
        </Link>
        <div className={classes.headerCta}>
          {isRegister ? (
            <>
              <span>Already a member?</span>
              <Link to={PATHS.login} className={classes.headerCtaButton}>
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">New here?</span>
              <Link to={PATHS.register} className={classes.headerCtaButton}>
                Create an account
              </Link>
            </>
          )}
        </div>
      </header>

      <main className={classes.main}>
        <div className={classes.marketing}>
          <div>
            <span className={classes.badge}>
              <Sparkles className={classes.badgeIcon} />
              Trusted • Safe • Easy
            </span>

            <h1 className={classes.heading}>
              Buy. Sell.
              <br />
              <span className={classes.headingAccent}>Connect.</span>
            </h1>
            <p className={classes.subheading}>
              India&apos;s trusted marketplace for new &amp; second-hand
              mobiles.
            </p>

            <div className={classes.featuresList}>
              {FEATURES.map((f) => (
                <div key={f.title} className={classes.featureItem}>
                  <span className={classes.featureIconWrap}>
                    <f.icon className={classes.featureIcon} />
                  </span>
                  <div>
                    <p className={classes.featureTitle}>{f.title}</p>
                    <p className={classes.featureDescription}>
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={classes.heroImageStage}>
            <img src={heroDevices} alt="" className={classes.heroImage} />
          </div>

          <div className={classes.statsRow}>
            {STATS.map((s) => (
              <div key={s.title} className={classes.statItem}>
                <span className={classes.statIconWrap}>
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className={classes.statTitle}>{s.title}</p>
                  <p className={classes.statDescription}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.formColumn}>
          <div className={classes.formInner}>
            <div className={classes.card}>
              <div className={classes.cardLogoWrap}>
                <span className={classes.cardLogoMark}>M</span>
              </div>
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
