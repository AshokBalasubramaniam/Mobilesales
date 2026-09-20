import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";
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
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Track Order", to: PATHS.buyer.orders },
      { label: "Sell Your Device", to: PATHS.sell },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
];

const PAYMENTS: { label: string; className: string }[] = [
  { label: "Visa", className: "bg-[#1a1f71] text-white" },
  { label: "Mastercard", className: "bg-[#eb001b] text-white" },
  { label: "UPI", className: "bg-brand-700 text-white" },
  { label: "RuPay", className: "bg-brand-700 text-white" },
  { label: "PayPal", className: "bg-[#003087] text-white" },
];

const classes = {
  footer: "mt-auto bg-brand-900 text-gray-400",
  container: "mx-auto max-w-screen-2xl px-4 pt-12 pb-6 lg:px-6",
  grid: "mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6",
  brandColumn: "lg:col-span-2",
  brandLink: "flex items-center gap-2.5",
  logoMark:
    "flex size-8 items-center justify-center rounded-lg bg-accent-500 text-sm font-extrabold text-brand-900",
  logoName: "block text-base font-extrabold leading-none tracking-tight text-white",
  logoTagline: "block text-xs font-semibold tracking-wide text-accent-500",
  description: "mt-3 max-w-xs text-sm text-gray-500",
  socialRow: "mt-4 flex gap-3 text-gray-400",
  socialButton:
    "flex size-8 items-center justify-center rounded-full border border-white/10 hover:border-brand-600 hover:text-white",
  socialIcon: "size-3.5",
  columnTitle: "mb-4 text-sm font-semibold text-white",
  linkList: "space-y-2.5",
  link: "text-sm text-gray-500 hover:text-white",
  newsletterColumn: "sm:col-span-2 lg:col-span-2",
  newsletterTitle: "mb-1 text-sm font-semibold text-white",
  newsletterHint: "mb-4 text-xs text-gray-500",
  newsletterForm: "flex gap-2",
  newsletterInput:
    "flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-brand-600",
  newsletterButton:
    "whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110",
  bottomBar:
    "flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row",
  copyright: "text-xs text-gray-600",
  payments: "flex flex-wrap items-center justify-center gap-2",
  paymentBadge: "rounded-md border border-white/10 px-2.5 py-1 text-xs font-bold",
};

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed! You'll hear about our latest offers.");
    setEmail("");
  };

  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.grid}>
          <div className={classes.brandColumn}>
            <Link to={PATHS.home} className={classes.brandLink}>
              <span className={classes.logoMark}>M</span>
              <span>
                <span className={classes.logoName}>MAPZHA</span>
                <span className={classes.logoTagline}>
                  ELECTRONICS MARKETPLACE
                </span>
              </span>
            </Link>
            <p className={classes.description}>
              India's most trusted electronics marketplace. Buy, sell &amp;
              exchange smartphones, laptops &amp; more at best prices.
            </p>
            <div className={classes.socialRow}>
              <a
                href="mailto:support@mobilesales.local"
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

          <div className={classes.newsletterColumn}>
            <h4 className={classes.newsletterTitle}>
              Subscribe to our Newsletter
            </h4>
            <p className={classes.newsletterHint}>
              Get updates on the latest offers &amp; deals
            </p>
            <form onSubmit={handleSubscribe} className={classes.newsletterForm}>
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
          <p className={classes.copyright}>
            © {new Date().getFullYear()} MAPZHA Electronics Marketplace. All
            rights reserved.
          </p>
          <div className={classes.payments}>
            {PAYMENTS.map((p) => (
              <span key={p.label} className={`${classes.paymentBadge} ${p.className}`}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
