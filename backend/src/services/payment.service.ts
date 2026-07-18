import crypto from 'crypto';
import env from '../config/env';
import logger from '../utils/logger';

let razorpayInstance: import('razorpay') | null = null;

const getRazorpay = (): import('razorpay') | null => {
  if (!env.isRazorpayConfigured) return null;
  if (razorpayInstance) return razorpayInstance;
  // eslint-disable-next-line global-require
  const Razorpay: typeof import('razorpay') = require('razorpay');
  razorpayInstance = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  return razorpayInstance;
};

export interface CreateOrderArgs {
  amount: number;
  currency?: string;
  receipt: string;
}

export interface CreateOrderResult {
  id: string;
  amount: string | number;
  currency: string;
  isMock: boolean;
}

/**
 * Creates a Razorpay order when real credentials are configured, otherwise
 * returns a deterministic mock order so checkout can be exercised end-to-end
 * in development without a Razorpay account.
 */
export const createOrder = async ({ amount, currency = 'INR', receipt }: CreateOrderArgs): Promise<CreateOrderResult> => {
  const client = getRazorpay();
  const amountInPaise = Math.round(amount * 100);

  if (client) {
    const order = await client.orders.create({ amount: amountInPaise, currency, receipt });
    return { id: order.id, amount: order.amount, currency: order.currency, isMock: false };
  }

  logger.debug(`[payment:mock] creating mock order for receipt ${receipt}`);
  return {
    id: `mock_order_${crypto.randomBytes(10).toString('hex')}`,
    amount: amountInPaise,
    currency,
    isMock: true,
  };
};

export interface VerifySignatureArgs {
  orderId: string;
  paymentId: string;
  signature: string;
  isMock?: boolean;
}

export const verifySignature = ({ orderId, paymentId, signature, isMock }: VerifySignatureArgs): boolean => {
  if (isMock || orderId.startsWith('mock_order_')) {
    // Mock orders are always considered valid in non-production dev flows.
    return true;
  }
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
};

export interface RefundPaymentArgs {
  paymentId: string;
  amount: number;
  isMock?: boolean;
}

export interface RefundPaymentResult {
  refundId: string;
  status: string;
}

export const refundPayment = async ({ paymentId, amount, isMock }: RefundPaymentArgs): Promise<RefundPaymentResult> => {
  const client = getRazorpay();
  if (client && !isMock) {
    const refund = await client.payments.refund(paymentId, { amount: Math.round(amount * 100) });
    return { refundId: refund.id, status: refund.status };
  }
  logger.debug(`[payment:mock] refunding mock payment ${paymentId}`);
  return { refundId: `mock_refund_${crypto.randomBytes(8).toString('hex')}`, status: 'processed' };
};

export const isConfigured = env.isRazorpayConfigured;
