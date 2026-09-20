import { CircleCheckBig } from "lucide-react";

const WHY_CHOOSE = [
  "100+ Point Quality Check",
  "No Hidden Charges",
  "7 Days Replacement",
  "Secure & Fast Delivery",
  "Verified Sellers",
  "Secure Payments",
];

const classes = {
  card: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  title: "mb-3 font-display text-sm font-bold text-gray-900",
  grid: "grid grid-cols-2 gap-x-3 gap-y-2",
  item: "flex items-start gap-2",
  icon: "size-3.5 shrink-0 text-brand-600",
  label: "text-xs leading-tight text-gray-700",
};

const WhyChooseMapzha = () => (
  <div className={classes.card}>
    <h3 className={classes.title}>Why Choose MAPZHA?</h3>
    <div className={classes.grid}>
      {WHY_CHOOSE.map((item) => (
        <div key={item} className={classes.item}>
          <CircleCheckBig className={classes.icon} />
          <span className={classes.label}>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export default WhyChooseMapzha;
