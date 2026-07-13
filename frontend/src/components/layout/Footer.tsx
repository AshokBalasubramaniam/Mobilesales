import { Link } from 'react-router-dom';
import { Smartphone, Mail, MessageCircle, Globe } from 'lucide-react';
import { PATHS } from '../../routes/paths';

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
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Buy',
    links: [
      { label: 'Search Phones', to: PATHS.search },
      { label: 'Compare', to: PATHS.compare },
      { label: 'Wishlist', to: PATHS.wishlist },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Sell Your Phone', to: PATHS.sell },
      { label: 'Seller Dashboard', to: PATHS.seller.root },
      { label: 'Verification', to: PATHS.seller.verification },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

const Footer = () => (
  <footer className="mt-auto border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2">
          <Link to={PATHS.home} className="flex items-center gap-1.5 text-lg font-bold text-brand-600">
            <Smartphone className="size-6" /> Mobile Sales
          </Link>
          <p className="mt-3 max-w-xs text-sm text-gray-500">
            India's trusted marketplace for buying and selling verified second-hand mobile phones.
          </p>
          <div className="mt-4 flex gap-3 text-gray-400">
            <a href="mailto:support@mobilesales.local" aria-label="Email">
              <Mail className="size-5 hover:text-brand-600" />
            </a>
            <Link to="/contact" aria-label="Contact">
              <MessageCircle className="size-5 hover:text-brand-600" />
            </Link>
            <Globe className="size-5 hover:text-brand-600" />
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-500 hover:text-brand-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400 dark:border-gray-800">
        © {new Date().getFullYear()} Mobile Sales. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
