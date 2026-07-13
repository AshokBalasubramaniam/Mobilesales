import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Tag } from 'lucide-react';
import { mobilesApi } from '../../api/mobiles.api';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { couponsApi, type AppliedCoupon } from '../../api/coupons.api';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmailVerificationNotice from '../../components/auth/EmailVerificationNotice';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/format';
import { DELIVERY_TYPES } from '../../utils/constants';
import { PATHS } from '../../routes/paths';
import type { DeliveryType, Mobile } from '../../types/models';

const DELIVERY_CHARGES: Record<DeliveryType, number> = { home_delivery: 199, local_delivery: 49, store_pickup: 0 };

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_ADDRESS: AddressForm = { line1: '', line2: '', city: '', state: '', pincode: '' };

// Small ambient type covering just the bits of the Razorpay Checkout.js
// global we actually use — loaded dynamically below, not part of any
// published type package.
interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { mobileId } = useParams<{ mobileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mobile, setMobile] = useState<Mobile | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home_delivery');
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<AppliedCoupon | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!mobileId) return;
    mobilesApi.getById(mobileId).then(({ data }) => setMobile(data.data));
    if (user?.addresses?.length) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({ line1: def.line1, line2: def.line2 || '', city: def.city, state: def.state, pincode: def.pincode });
    }
  }, [mobileId, user]);

  if (!mobile) return <Spinner full />;
  if (!user) return null;

  const deliveryCharge = DELIVERY_CHARGES[deliveryType];
  const subtotal = mobile.price + deliveryCharge;
  const discount = couponResult?.discount || 0;
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const { data } = await couponsApi.apply(couponCode, subtotal);
      setCouponResult(data.data);
      toast.success(`Coupon applied! You saved ${formatCurrency(data.data.discount)}`);
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Invalid coupon');
      setCouponResult(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!mobileId) return;
    if (!user.isEmailVerified) return toast.error('Please verify your email before placing an order');

    if (deliveryType !== 'store_pickup' && (!address.line1 || !address.city || !address.state || address.pincode.length !== 6)) {
      return toast.error('Please fill in a complete delivery address');
    }

    setPlacing(true);
    try {
      const { data: orderRes } = await ordersApi.create({
        mobileId,
        deliveryType,
        deliveryAddress: deliveryType !== 'store_pickup' ? address : undefined,
        couponCode: couponResult ? couponCode : undefined,
      });
      const order = orderRes.data;

      const { data: payRes } = await paymentsApi.createOrder(order._id);
      const { razorpayOrderId, amount, currency, keyId, isMock } = payRes.data;

      if (isMock || !keyId) {
        await paymentsApi.verify({
          orderId: order._id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock',
        });
        toast.success('Payment successful!');
        navigate(PATHS.orderDetail(order._id));
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) return toast.error('Could not load payment gateway');

      if (!window.Razorpay) return toast.error('Could not load payment gateway');

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Mobile Sales',
        description: `${mobile.brand} ${mobile.model}`,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        handler: async (response) => {
          await paymentsApi.verify({
            orderId: order._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment successful!');
          navigate(PATHS.orderDetail(order._id));
        },
        theme: { color: '#4f46e5' },
      });
      rzp.open();
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      {!user.isEmailVerified && <EmailVerificationNotice />}

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <img src={mobile.images?.[0]?.url} alt="" className="size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
        <div>
          <p className="font-semibold">
            {mobile.brand} {mobile.model}
          </p>
          <p className="text-sm text-gray-500">
            {mobile.storage}GB · {mobile.condition}
          </p>
        </div>
        <span className="ml-auto font-bold">{formatCurrency(mobile.price)}</span>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <Select label="Delivery method" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}>
          {DELIVERY_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>

        {deliveryType !== 'store_pickup' && (
          <div className="space-y-3">
            <Input
              label="Address line 1"
              required
              value={address.line1}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress({ ...address, line1: e.target.value })}
            />
            <Input
              label="Address line 2 (optional)"
              value={address.line2}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress({ ...address, line2: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                required
                value={address.city}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress({ ...address, city: e.target.value })}
              />
              <Input
                label="State"
                required
                value={address.state}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress({ ...address, state: e.target.value })}
              />
              <Input
                label="Pincode"
                required
                maxLength={6}
                value={address.pincode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
          <Button type="button" variant="secondary" icon={Tag} loading={applyingCoupon} onClick={handleApplyCoupon}>
            Apply
          </Button>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
          <div className="flex justify-between">
            <span className="text-gray-500">Item price</span>
            <span>{formatCurrency(mobile.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery charge</span>
            <span>{formatCurrency(deliveryCharge)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold dark:border-gray-800">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" loading={placing} disabled={!user.isEmailVerified} onClick={handlePlaceOrder}>
          Pay {formatCurrency(total)}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
