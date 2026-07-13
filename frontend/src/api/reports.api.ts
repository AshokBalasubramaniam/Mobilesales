import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Dispute, Report, ReportType } from '../types/models';

export interface CreateReportPayload {
  reportType: ReportType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface ResolveReportPayload {
  status: 'reviewed' | 'resolved' | 'dismissed';
  adminNote?: string;
}

export interface CreateDisputePayload {
  order: string;
  reason: string;
  description?: string;
  evidenceUrls?: string[];
}

export interface ResolveDisputePayload {
  status: 'resolved' | 'rejected';
  resolution?: string;
}

export const reportsApi = {
  create: (payload: CreateReportPayload) => axiosClient.post<ApiResponse<Report>>('/reports', payload),
  list: (params?: PaginationParams) => axiosClient.get<ApiResponse<Report[]>>('/reports', { params }),
  resolve: (id: string, payload: ResolveReportPayload) => axiosClient.patch<ApiResponse<Report>>(`/reports/${id}/resolve`, payload),

  createDispute: (payload: CreateDisputePayload) => axiosClient.post<ApiResponse<Dispute>>('/reports/disputes', payload),
  listDisputes: (params?: PaginationParams) => axiosClient.get<ApiResponse<Dispute[]>>('/reports/disputes', { params }),
  resolveDispute: (id: string, payload: ResolveDisputePayload) =>
    axiosClient.patch<ApiResponse<Dispute>>(`/reports/disputes/${id}/resolve`, payload),
};
