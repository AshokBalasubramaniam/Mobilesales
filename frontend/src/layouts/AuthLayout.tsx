import { Link, Outlet } from "react-router-dom";
import {
  Smartphone,
  ShieldCheck,
  Tag,
  MessageCircle,
  Lock,
  Headphones,
  Award,
  type LucideIcon,
} from "lucide-react";
import { PATHS } from "../routes/paths";

interface Feature {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
}

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
}

const classes = {
  container: "flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950",
  innerContainer: "flex flex-1 flex-col lg:flex-row",
  brandPanel:
    "relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-12 py-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-center",
  brandCircleTop:
    "pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-white/10",
  brandCircleBlur:
    "pointer-events-none absolute top-1/3 -right-10 size-40 rounded-full bg-white/5 blur-2xl",
  brandLink: "mb-10 flex items-center gap-3",
  brandLogoWrap:
    "flex size-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-lg",
  brandLogoIcon: "size-6",
  brandName: "block text-lg font-bold text-white",
  brandTagline: "block text-xs text-brand-100",
  heading: "text-4xl font-extrabold text-white",
  headingAccent: "text-brand-200",
  subheading: "mt-3 max-w-sm text-sm text-brand-100",
  featuresList: "mt-10 space-y-5",
  featureItem: "flex items-center gap-3",
  featureIconBase:
    "flex size-10 shrink-0 items-center justify-center rounded-full",
  featureIconColor: "text-white",
  featureIcon: "size-5",
  featureTitle: "text-sm font-semibold text-white",
  featureDescription: "text-xs text-brand-100",
  phoneMockupContainer: "relative mx-auto mt-10 h-48 w-64",
  phoneShadow:
    "absolute bottom-0 left-1/2 h-6 w-56 -translate-x-1/2 rounded-full bg-black/20 blur-md",
  phoneBack:
    "absolute bottom-4 left-6 h-40 w-24 -rotate-6 rounded-2xl border border-white/20 bg-gradient-to-b from-white/25 to-white/5 shadow-xl backdrop-blur-sm",
  phoneFront:
    "absolute right-6 bottom-4 h-44 w-24 rotate-3 rounded-2xl border border-white/20 bg-gradient-to-b from-white/30 to-white/10 shadow-2xl backdrop-blur-sm",
  phoneNotch: "absolute inset-x-3 top-3 h-1 rounded-full bg-white/20",
  phoneIcon: "absolute inset-0 m-auto size-8 text-white/70",
  formPanel: "flex flex-1 items-center justify-center px-4 py-12 lg:w-1/2",
  formWrapper: "w-full max-w-md",
  mobileLogoLink:
    "mb-6 flex items-center justify-center gap-1.5 text-xl font-bold text-brand-600 lg:hidden",
  mobileLogoIcon: "size-7",
  formCard:
    "rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900",
  trustBar:
    "border-t border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-900",
  trustBarInner:
    "mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:justify-around",
  trustBadgeItem: "flex items-center justify-center gap-3 sm:justify-start",
  trustBadgeIconWrap:
    "flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30",
  trustBadgeIcon: "size-4.5",
  trustBadgeTitle: "text-sm font-semibold",
  trustBadgeDescription: "text-xs text-gray-500",
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    iconBg: "bg-brand-500",
    title: "Secure & Trusted",
    description: "100% safe transactions",
  },
  {
    icon: Tag,
    iconBg: "bg-fuchsia-500",
    title: "Best Deals",
    description: "Find the best prices",
  },
  {
    icon: MessageCircle,
    iconBg: "bg-blue-500",
    title: "Chat & Connect",
    description: "Talk to buyers & sellers",
  },
];

const TRUST_BADGES: TrustBadge[] = [
  { icon: Lock, title: "Secure Payments", description: "Safe & encrypted" },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
  {
    icon: Award,
    title: "Trusted Platform",
    description: "Thousands of happy users",
  },
];

const PhoneMockup = () => (
  <div className={classes.phoneMockupContainer}>
    <div className={classes.phoneShadow} />
    <div className={classes.phoneBack} />
    <div className={classes.phoneFront}>
      <div className={classes.phoneNotch} />
      <Smartphone className={classes.phoneIcon} />
    </div>
  </div>
);

const AuthLayout = () => (
  <div className={classes.container}>
    <div className={classes.innerContainer}>
      {/* Marketing / brand panel */}
      <div className={classes.brandPanel}>
        <div className={classes.brandCircleTop} />
        <div className={classes.brandCircleBlur} />

        <Link to={PATHS.home} className={classes.brandLink}>
          <span className={classes.brandLogoWrap}>
            <Smartphone className={classes.brandLogoIcon} />
          </span>
          <span>
            <span className={classes.brandName}>Mobile Sales</span>
            <span className={classes.brandTagline}>
              Buy & Sell Phones with Trust
            </span>
          </span>
        </Link>

        <h1 className={classes.heading}>
          Buy. Sell.
          <br />
          <span className={classes.headingAccent}>Connect.</span>
        </h1>
        <p className={classes.subheading}>
          India's trusted marketplace for new &amp; second-hand mobiles.
        </p>

        <div className={classes.featuresList}>
          {FEATURES.map((f) => (
            <div key={f.title} className={classes.featureItem}>
              <span
                className={`${classes.featureIconBase} ${f.iconBg} ${classes.featureIconColor}`}
              >
                <f.icon className={classes.featureIcon} />
              </span>
              <div>
                <p className={classes.featureTitle}>{f.title}</p>
                <p className={classes.featureDescription}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <PhoneMockup />
      </div>

      {/* Form panel */}
      <div className={classes.formPanel}>
        <div className={classes.formWrapper}>
          <Link to={PATHS.home} className={classes.mobileLogoLink}>
            <Smartphone className={classes.mobileLogoIcon} /> Mobile Sales
          </Link>
          <div className={classes.formCard}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>

    {/* Trust bar */}
    <div className={classes.trustBar}>
      <div className={classes.trustBarInner}>
        {TRUST_BADGES.map((b) => (
          <div key={b.title} className={classes.trustBadgeItem}>
            <span className={classes.trustBadgeIconWrap}>
              <b.icon className={classes.trustBadgeIcon} />
            </span>
            <div>
              <p className={classes.trustBadgeTitle}>{b.title}</p>
              <p className={classes.trustBadgeDescription}>{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AuthLayout;
