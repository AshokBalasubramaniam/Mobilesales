const Report = require('../models/Report');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');
const { getPagination, buildMeta } = require('../utils/pagination');
const { REPORT_STATUS, DISPUTE_STATUS, ORDER_STATUS, NOTIFICATION_TYPE } = require('../config/constants');

// --- Reports (listings / users / chats) ---

const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({ ...req.body, reportedBy: req.user._id });
  new ApiResponse(201, report, 'Report submitted').send(res);
});

const listReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.reportType) filter.reportType = req.query.reportType;

  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('reportedBy', 'name email'),
    Report.countDocuments(filter),
  ]);

  new ApiResponse(200, reports, 'Reports fetched', buildMeta({ page, limit, total })).send(res);
});

const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw ApiError.notFound('Report not found');

  report.status = req.body.status;
  report.adminNote = req.body.adminNote;
  if ([REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED].includes(req.body.status)) {
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
  }
  await report.save();

  new ApiResponse(200, report, 'Report updated').send(res);
});

// --- Disputes (order-level) ---

const createDispute = asyncHandler(async (req, res) => {
  const { orderId, reason, description } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  const isParty = [order.buyer.toString(), order.seller.toString()].includes(req.user._id.toString());
  if (!isParty) throw ApiError.forbidden('You are not part of this order');

  const dispute = await Dispute.create({ order: orderId, raisedBy: req.user._id, reason, description });

  order.orderStatus = ORDER_STATUS.DISPUTED;
  await order.save();

  new ApiResponse(201, dispute, 'Dispute raised').send(res);
});

const listDisputes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [disputes, total] = await Promise.all([
    Dispute.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('order').populate('raisedBy', 'name email'),
    Dispute.countDocuments(filter),
  ]);

  new ApiResponse(200, disputes, 'Disputes fetched', buildMeta({ page, limit, total })).send(res);
});

const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id).populate('order');
  if (!dispute) throw ApiError.notFound('Dispute not found');

  dispute.status = req.body.status;
  dispute.resolution = req.body.resolution;
  if (req.body.status !== DISPUTE_STATUS.IN_REVIEW) {
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
  }
  await dispute.save();

  if (req.body.status === DISPUTE_STATUS.RESOLVED) {
    await Order.updateOne({ _id: dispute.order._id }, { orderStatus: ORDER_STATUS.COMPLETED });
  } else if (req.body.status === DISPUTE_STATUS.REJECTED) {
    await Order.updateOne({ _id: dispute.order._id }, { orderStatus: ORDER_STATUS.CONFIRMED });
  }

  await notificationService.notify({
    user: dispute.raisedBy,
    type: NOTIFICATION_TYPE.SYSTEM,
    title: 'Dispute update',
    message: `Your dispute has been marked as ${req.body.status}`,
    data: { disputeId: dispute._id },
  });

  new ApiResponse(200, dispute, 'Dispute updated').send(res);
});

module.exports = { createReport, listReports, resolveReport, createDispute, listDisputes, resolveDispute };
