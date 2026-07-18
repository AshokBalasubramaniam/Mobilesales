import StaticPage from "./StaticPage";
import { Mail, MessageCircle } from "lucide-react";

const classes = {
  contactRow: "flex items-center gap-2",
  contactIcon: "size-4",
};

const Contact = () => (
  <StaticPage title="Contact Us">
    <p>
      Have a question about an order, a listing, or your account? We're here to
      help.
    </p>
    <div className={classes.contactRow}>
      <Mail className={classes.contactIcon} /> support@mobilesales.local
    </div>
    <div className={classes.contactRow}>
      <MessageCircle className={classes.contactIcon} /> Use the in-app chat to
      reach a specific buyer or seller directly.
    </div>
  </StaticPage>
);

export default Contact;
