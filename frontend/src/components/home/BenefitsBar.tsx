import {
  Headphones,
  Lock,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const BENEFITS = [
  {
    icon: RotateCcw,
    title: "7 Days Replacement",
    description: "Hassle-free return policy",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Across India",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "100% Protected",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Available",
    description: "On Selected Devices",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "We're here to help",
  },
];

const classes = {
  section: "border-y border-gray-100 bg-white shadow-sm",
  container: "mx-auto max-w-screen-2xl px-4 py-4 lg:px-6",
  row: "flex flex-wrap items-center justify-between gap-4 overflow-x-auto sm:flex-nowrap",
  item: "flex shrink-0 items-center gap-3",
  divider: "hidden h-8 w-px bg-gray-200 sm:block",
  icon: "size-6 text-brand-600",
  title: "text-sm font-semibold text-gray-800",
  description: "text-xs text-gray-400",
};

const BenefitsBar = () => (
  <section className={classes.section}>
    <div className={classes.container}>
      <div className={classes.row}>
        {BENEFITS.map((b, i) => (
          <div key={b.title} className={classes.item}>
            {i > 0 && <div className={classes.divider} />}
            <b.icon className={classes.icon} />
            <div>
              <p className={classes.title}>{b.title}</p>
              <p className={classes.description}>{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsBar;
