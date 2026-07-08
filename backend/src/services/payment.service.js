const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!env.isRazorpayConfigured) return null;
  if (razorpayInstance) return razorpayInstance;
  // eslint-disable-next-line global-require
  const Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  return razorpayInstance;
};

/**
 * Creates a Razorpay order when real credentials are configured, otherwise
 * returns a deterministic mock order so checkout can be exercised end-to-end
 * in development without a Razorpay account.
 */
const createOrder = async ({ amount, currency = 'INR', receipt }) => {
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

const verifySignature = ({ orderId, paymentId, signature, isMock }) => {
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

const refundPayment = async ({ paymentId, amount, isMock }) => {
  const client = getRazorpay();
  if (client && !isMock) {
    const refund = await client.payments.refund(paymentId, { amount: Math.round(amount * 100) });
    return { refundId: refund.id, status: refund.status };
  }
  logger.debug(`[payment:mock] refunding mock payment ${paymentId}`);
  return { refundId: `mock_refund_${crypto.randomBytes(8).toString('hex')}`, status: 'processed' };
};

module.exports = { createOrder, verifySignature, refundPayment, isConfigured: env.isRazorpayConfigured };
