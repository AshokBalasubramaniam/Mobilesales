import StaticPage from './StaticPage';
import { Mail, MessageCircle } from 'lucide-react';

const Contact = () => (
  <StaticPage title="Contact Us">
    <p>Have a question about an order, a listing, or your account? We're here to help.</p>
    <div className="flex items-center gap-2">
      <Mail className="size-4" /> support@mobilesales.local
    </div>
    <div className="flex items-center gap-2">
      <MessageCircle className="size-4" /> Use the in-app chat to reach a specific buyer or seller directly.
    </div>
  </StaticPage>
);

export default Contact;
