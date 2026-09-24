import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  BadgeCheck,
  CircleHelp,
  Globe,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Share2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { PATHS } from "../../routes/paths";

interface FooterLink {
  label: string;
  to: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All Devices", to: PATHS.search },
      { label: "Phones", to: `${PATHS.search}?category=phone` },
      { label: "Laptops", to: `${PATHS.search}?category=laptop` },
      { label: "Tablets", to: `${PATHS.search}?category=tablet` },
      { label: "Smartwatches", to: `${PATHS.search}?category=smartwatch` },
      { label: "Accessories", to: `${PATHS.search}?category=accessory` },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Track Order", to: PATHS.buyer.orders },
      { label: "Sell Your Device", to: PATHS.sell },
    ],
  },
  {
    title: "Consumer Policy",
    links: [
      { label: "Terms Of Use", to: "/terms" },
      { label: "Privacy", to: "/privacy" },
    ],
  },
];

const BOTTOM_LINKS: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Become a Seller", to: PATHS.becomeSeller, icon: BadgeCheck },
  { label: "Sell Your Device", to: PATHS.sell, icon: Smartphone },
  { label: "Help Center", to: "/faq", icon: CircleHelp },
];

const PAYMENTS: { label: string; className: string }[] = [
  { label: "VISA", className: "text-[#1a1f71]" },
  { label: "Mastercard", className: "text-[#eb001b]" },
  { label: "UPI", className: "text-brand-700" },
  { label: "RuPay", className: "text-[#097939]" },
  { label: "PayPal", className: "text-[#003087]" },
  { label: "Net Banking", className: "text-gray-700" },
];

const SUPPORT_EMAIL = "support@mobilesales.local";

const classes = {
  footer: "mt-auto",
  // Light strip with an expandable "about" blurb
  aboutStrip: "border-t border-gray-200 bg-white",
  aboutToggle:
    "mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-4 text-left text-[15px] text-gray-800 lg:px-6",
  aboutToggleIcon: "size-5 shrink-0 text-gray-700",
  aboutBody:
    "mx-auto max-w-screen-2xl animate-fade-in px-4 pb-5 text-sm leading-relaxed text-gray-600 lg:px-6",
  // Dark main footer
  main: "bg-[#212121] text-white",
  container: "mx-auto max-w-screen-2xl px-4 lg:px-6",
  grid: "grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_minmax(0,1.2fr)_minmax(0,1.4fr)]",
  columnTitle: "mb-3 text-xs font-medium tracking-wide text-gray-400 uppercase",
  linkList: "space-y-1.5",
  link: "text-[13px] font-semibold text-white hover:text-brand-400 hover:underline",
  divider: "hidden w-px bg-gray-600 lg:block",
  infoTitle: "mb-3 text-xs font-medium text-gray-400",
  infoText: "text-[13px] leading-relaxed text-white",
  infoLink: "text-brand-400 hover:underline",
  socialTitle: "mt-5 mb-2 text-xs font-medium text-gray-400",
  socialRow: "flex gap-3",
  socialButton:
    "flex size-8 items-center justify-center rounded-full border border-gray-500 text-white transition-colors hover:border-brand-400 hover:text-brand-400",
  socialIcon: "size-4",
  newsletterForm: "mt-3 flex gap-2",
  newsletterInput:
    "min-w-0 flex-1 rounded border border-gray-600 bg-white/5 px-3 py-2 text-[13px] text-white placeholder-gray-500 outline-none focus:border-brand-400",
  newsletterButton:
    "rounded bg-brand-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-brand-500",
  // Bottom bar
  bottomBar:
    "flex flex-col items-center gap-4 border-t border-gray-600 py-5 text-[13px] lg:flex-row lg:justify-between",
  bottomLinks: "flex flex-wrap items-center justify-center gap-x-8 gap-y-2",
  bottomLink: "flex items-center gap-2 text-white hover:text-brand-400",
  bottomLinkIcon: "size-4 text-amber-400",
  copyright: "text-white",
  payments: "flex flex-wrap items-center justify-center gap-1.5",
  paymentBadge:
    "rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed! You'll hear about our latest offers.");
    setEmail("");
  };

  return (
    <footer className={classes.footer}>
      <div className={classes.aboutStrip}>
        <button
          type="button"
          onClick={() => setAboutOpen((o) => !o)}
          className={classes.aboutToggle}
          aria-expanded={aboutOpen}
        >
          MAPZHA - Your go-to place for buying &amp; selling devices
          {aboutOpen ? (
            <Minus className={classes.aboutToggleIcon} />
          ) : (
            <Plus className={classes.aboutToggleIcon} />
          )}
        </button>
        {aboutOpen && (
          <p className={classes.aboutBody}>
            MAPZHA is India&apos;s trusted marketplace for new and second-hand
            electronics. Buy and sell smartphones, laptops, tablets,
            smartwatches and more. Every listing is reviewed by our team,
            sellers are ID-verified, payments are secure, and you can chat
            with buyers and sellers directly before you decide.
          </p>
        )}
      </div>

      <div className={classes.main}>
        <div className={classes.container}>
          <div className={classes.grid}>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className={classes.columnTitle}>{col.title}</h4>
                <ul className={classes.linkList}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className={classes.link}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className={classes.divider} />

            <div>
              <h4 className={classes.infoTitle}>Mail Us:</h4>
              <p className={classes.infoText}>
                MAPZHA Electronics Marketplace
                <br />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={classes.infoLink}
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <h4 className={classes.socialTitle}>Social:</h4>
              <div className={classes.socialRow}>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  aria-label="Email"
                  className={classes.socialButton}
                >
                  <Mail className={classes.socialIcon} />
                </a>
                <Link
                  to="/contact"
                  aria-label="Contact"
                  className={classes.socialButton}
                >
                  <MessageCircle className={classes.socialIcon} />
                </Link>
                <span className={classes.socialButton}>
                  <Globe className={classes.socialIcon} />
                </span>
                <span className={classes.socialButton}>
                  <Share2 className={classes.socialIcon} />
                </span>
              </div>
            </div>

            <div>
              <h4 className={classes.infoTitle}>Newsletter:</h4>
              <p className={classes.infoText}>
                Get updates on the latest offers &amp; deals.
              </p>
              <form
                onSubmit={handleSubscribe}
                className={classes.newsletterForm}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={classes.newsletterInput}
                />
                <button type="submit" className={classes.newsletterButton}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className={classes.bottomBar}>
            <div className={classes.bottomLinks}>
              {BOTTOM_LINKS.map(({ label, to, icon: Icon }) => (
                <Link key={label} to={to} className={classes.bottomLink}>
                  <Icon className={classes.bottomLinkIcon} />
                  {label}
                </Link>
              ))}
            </div>
            <p className={classes.copyright}>
              © {new Date().getFullYear()} MAPZHA.com
            </p>
            <div className={classes.payments}>
              {PAYMENTS.map((p) => (
                <span
                  key={p.label}
                  className={clsx(classes.paymentBadge, p.className)}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
