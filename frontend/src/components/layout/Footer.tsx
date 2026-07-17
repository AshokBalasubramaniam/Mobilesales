import { Link } from "react-router-dom";
import { Smartphone, Mail, MessageCircle, Globe } from "lucide-react";
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
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Buy",
    links: [
      { label: "Search Phones", to: PATHS.search },
      { label: "Compare", to: PATHS.compare },
      { label: "Wishlist", to: PATHS.wishlist },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Sell Your Phone", to: PATHS.sell },
      { label: "Seller Dashboard", to: PATHS.seller.root },
      { label: "Verification", to: PATHS.seller.verification },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

const classes = {
  footer:
    "mt-auto border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
  container: "mx-auto max-w-7xl px-4 py-10",
  grid: "grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5",
  brandColumn: "col-span-2",
  brandLink: "flex items-center gap-1.5 text-lg font-bold text-brand-600",
  brandIcon: "size-6",
  description: "mt-3 max-w-xs text-sm text-gray-500",
  socialRow: "mt-4 flex gap-3 text-gray-400",
  socialIcon: "size-5 hover:text-brand-600",
  columnTitle: "mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100",
  linkList: "space-y-2",
  link: "text-sm text-gray-500 hover:text-brand-600",
  copyright:
    "mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400 dark:border-gray-800",
};

const Footer = () => (
  <footer className={classes.footer}>
    <div className={classes.container}>
      <div className={classes.grid}>
        <div className={classes.brandColumn}>
          <Link to={PATHS.home} className={classes.brandLink}>
            <Smartphone className={classes.brandIcon} /> Mobile Sales
          </Link>
          <p className={classes.description}>
            India's trusted marketplace for buying and selling verified
            second-hand mobile phones.
          </p>
          <div className={classes.socialRow}>
            <a href="mailto:support@mobilesales.local" aria-label="Email">
              <Mail className={classes.socialIcon} />
            </a>
            <Link to="/contact" aria-label="Contact">
              <MessageCircle className={classes.socialIcon} />
            </Link>
            <Globe className={classes.socialIcon} />
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
      </div>

      <div className={classes.copyright}>
        © {new Date().getFullYear()} Mobile Sales. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
