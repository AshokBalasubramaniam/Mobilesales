import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "How is the phone condition verified?",
    a: "Sellers self-report battery health, condition, and repair history. Verified sellers upload purchase bills and IMEI, which our team cross-checks before listings go live.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Payments are processed through Razorpay with UPI, cards, net banking, wallets, and EMI support. Funds are only released to the seller after you confirm delivery.",
  },
  {
    q: "Can I negotiate the price?",
    a: "Absolutely — use the in-app chat to send an offer directly to the seller. They can accept, reject, or counter your offer.",
  },
  {
    q: "What if the phone doesn't match the listing?",
    a: "Raise a dispute from your order page within the return window. Our support team mediates between you and the seller to resolve it fairly.",
  },
  {
    q: "How do I sell my phone?",
    a: 'Click "Sell Your Phone", fill in your device details, condition, and photos, set your price (or use our AI price suggestion), and publish — your listing goes live after a quick approval check.',
  },
];

const classes = {
  section: "mx-auto max-w-3xl px-4 py-12",
  title: "mb-6 text-center text-xl font-bold",
  list: "divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800",
  question:
    "flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium",
  icon: "size-4 shrink-0 transition-transform",
  iconOpen: "rotate-180",
  answer: "px-5 pb-4 text-sm text-gray-500",
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={classes.section}>
      <h2 className={classes.title}>Frequently Asked Questions</h2>
      <div className={classes.list}>
        {FAQS.map((faq, idx) => (
          <div key={faq.q}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              className={classes.question}
            >
              {faq.q}
              <ChevronDown
                className={clsx(
                  classes.icon,
                  openIndex === idx && classes.iconOpen,
                )}
              />
            </button>
            {openIndex === idx && <p className={classes.answer}>{faq.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
