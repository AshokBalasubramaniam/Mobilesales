import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

const BANNERS = [
  {
    tag: "Mega Exchange Offer",
    headline: "Up to ₹10,000 Extra Off",
    subtitle: "On Exchange of Old Devices",
    cta: "Exchange Now",
    bg: "bg-[linear-gradient(135deg,#0a1a0b_0%,#0d2f12_100%)]",
    accentBg: "bg-accent-500/15",
    accentText: "text-accent-500",
    ctaClass: "bg-accent-500 text-brand-900",
    image:
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=120&h=120&fit=crop&auto=format",
    href: PATHS.sell,
  },
  {
    tag: "Laptop Fiesta",
    headline: "Up to 40% OFF",
    subtitle: "On Best Selling Laptops",
    cta: "Shop Now",
    bg: "bg-[linear-gradient(135deg,#0c1a2e_0%,#0f2a4a_100%)]",
    accentBg: "bg-sky-400/15",
    accentText: "text-sky-400",
    ctaClass: "bg-sky-400 text-white",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&h=120&fit=crop&auto=format",
    href: `${PATHS.search}?category=laptop`,
  },
  {
    tag: "Accessories Sale",
    headline: "Up to 60% OFF",
    subtitle: "On Premium Accessories",
    cta: "Shop Now",
    bg: "bg-[linear-gradient(135deg,#1a0a0a_0%,#2d0f0f_100%)]",
    accentBg: "bg-red-400/15",
    accentText: "text-red-400",
    ctaClass: "bg-red-400 text-white",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop&auto=format",
    href: `${PATHS.search}?category=accessory`,
  },
];

const classes = {
  grid: "grid grid-cols-1 gap-3 sm:grid-cols-3",
  card: "flex items-center justify-between gap-3 rounded-xl p-5 text-left",
  content: "min-w-0 flex-1",
  tag: "mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
  headline: "font-display mt-1 font-black leading-tight text-white text-lg",
  subtitle: "mb-3 mt-0.5 text-xs text-gray-400",
  cta: "rounded-lg px-4 py-1.5 text-xs font-bold transition-transform hover:scale-[1.03]",
  image: "size-20 shrink-0 rounded-lg object-contain opacity-90",
};

const OfferBanners = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.grid}>
      {BANNERS.map((b) => (
        <button
          key={b.tag}
          type="button"
          onClick={() => navigate(b.href)}
          className={`${classes.card} ${b.bg}`}
          style={{ minHeight: 120 }}
        >
          <div className={classes.content}>
            <span className={`${classes.tag} ${b.accentBg} ${b.accentText}`}>
              {b.tag}
            </span>
            <p className={classes.headline}>{b.headline}</p>
            <p className={classes.subtitle}>{b.subtitle}</p>
            <span className={`${classes.cta} ${b.ctaClass}`}>{b.cta}</span>
          </div>
          <img src={b.image} alt={b.tag} className={classes.image} />
        </button>
      ))}
    </div>
  );
};

export default OfferBanners;
