import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, BadgeCheck, Truck } from "lucide-react";
import Button from "../common/Button";
import { PATHS } from "../../routes/paths";

const classes = {
  section:
    "relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 text-white",
  container: "mx-auto max-w-7xl px-4 py-16 sm:py-24",
  content: "max-w-2xl",
  title: "text-3xl font-extrabold tracking-tight sm:text-5xl",
  subtitle: "mt-4 text-base text-brand-100 sm:text-lg",
  form: "mt-8 flex max-w-lg gap-2",
  searchWrapper: "relative flex-1",
  searchIcon: "absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-400",
  searchInput:
    "w-full rounded-full py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none",
  searchButton: "rounded-full",
  badges: "mt-8 flex flex-wrap gap-6 text-sm text-brand-100",
  badge: "flex items-center gap-1.5",
  badgeIcon: "size-4",
};

const HeroBanner = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(
      query ? `${PATHS.search}?q=${encodeURIComponent(query)}` : PATHS.search,
    );
  };

  return (
    <section className={classes.section}>
      <div className={classes.container}>
        <div className={classes.content}>
          <h1 className={classes.title}>Buy & sell used phones, safely.</h1>
          <p className={classes.subtitle}>
            Verified sellers, checked IMEIs, and secure payments — India's
            trusted marketplace for second-hand mobiles.
          </p>

          <form onSubmit={handleSearch} className={classes.form}>
            <div className={classes.searchWrapper}>
              <Search className={classes.searchIcon} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search iPhone 13, Galaxy S22..."
                className={classes.searchInput}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              variant="accent"
              className={classes.searchButton}
            >
              Search
            </Button>
          </form>

          <div className={classes.badges}>
            <span className={classes.badge}>
              <ShieldCheck className={classes.badgeIcon} /> Verified Sellers
            </span>
            <span className={classes.badge}>
              <BadgeCheck className={classes.badgeIcon} /> IMEI Checked
            </span>
            <span className={classes.badge}>
              <Truck className={classes.badgeIcon} /> Fast Delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
