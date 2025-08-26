"use client";

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/admin/userService';
import { User } from '@/types/admin/user.interface';
import { getAllBrands } from '@/services/admin/brandsService';
import { categoryService } from '@/services/admin/categoryService';
import { auditLogsService } from '@/services/admin/auditLogsService';

// Interface cho thống kê dashboard
export interface DashboardStats {
  totalUsers: number;
  recentUsersCount: number;
  activeUsersCount: number;
  verifiedUsersCount: number;
  adminUsersCount: number;
  clientUsersCount: number;
  sellerUsersCount: number;
  // Thêm thống kê từ modules khác
  totalBrands: number;
  totalCategories: number;
  totalAuditLogs: number;
}

export interface UserStats {
  totalUsers: number;
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUserStats: () => Promise<void>;
}

// Interface cho overview statistics
export interface OverviewStats {
  totalUsers: number;
  totalBrands: number;
  totalCategories: number;
  totalAuditLogs: number;
  isLoading: boolean;
  error: string | null;
}

// Interface cho chart data
export interface ChartData {
  usersByRole: { name: string; value: number; color: string }[];
  usersByStatus: { name: string; value: number; color: string }[];
  isLoading: boolean;
}

/** Helper: chuẩn hoá response không đồng nhất */
function normalizeResponse(resp: any) {
  console.log('[useDbAdmin] raw response:', resp);

  // Mảng data có thể nằm ở nhiều chỗ
  const dataArr: unknown =
    (Array.isArray(resp?.data) && resp.data) ||
    (Array.isArray(resp?.items) && resp.items) ||
    (Array.isArray(resp?.data?.items) && resp.data.items) ||
    (Array.isArray(resp?.data?.data) && resp.data.data) ||
    [];

  const data: any[] = Array.isArray(dataArr) ? dataArr : [];

  // Tổng items có thể là:
  const totalItems: number =
    Number(resp?.metadata?.totalItems) ||
    Number(resp?.data?.metadata?.totalItems) ||
    Number(resp?.total) ||
    Number(resp?.totalItems) ||
    Number(resp?.data?.total) ||
    data.length ||
    0;

  return { data, totalItems };
}

export const useDbAdmin = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    users: [],
    isLoading: true,
    error: null,
    refreshUserStats: async () => {},
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    recentUsersCount: 0,
    activeUsersCount: 0,
    verifiedUsersCount: 0,
    adminUsersCount: 1, // Mặc định có 1 admin
    clientUsersCount: 0,
    sellerUsersCount: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalAuditLogs: 0,
  });

  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalAuditLogs: 0,
    isLoading: true,
    error: null,
  });

  const [chartData, setChartData] = useState<ChartData>({
    usersByRole: [],
    usersByStatus: [],
    isLoading: true,
  });

  // Fetch overview statistics từ tất cả modules
  const fetchOverviewStats = useCallback(async () => {
    try {
      setOverviewStats(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch data từ tất cả modules song song
      const [usersResponse, brandsResponse, categoriesResponse, auditLogsResponse] = await Promise.allSettled([
        userService.getAll({ page: 1, limit: 1 }), // Chỉ cần metadata
        getAllBrands({ page: 1, limit: 1 }), // Chỉ cần metadata
        categoryService.getAll({ page: 1, limit: 1 }), // Chỉ cần metadata
        auditLogsService.getAll({ page: 1, limit: 1 }), // Chỉ cần metadata
      ]);

      let totalUsers = 0;
      let totalBrands = 0;
      let totalCategories = 0;
      let totalAuditLogs = 0;

      // Xử lý kết quả users - dùng normalize function
      if (usersResponse.status === 'fulfilled') {
        const normalized = normalizeResponse(usersResponse.value);
        totalUsers = normalized.totalItems;
      }

      // Xử lý kết quả brands - dùng normalize function
      if (brandsResponse.status === 'fulfilled') {
        const normalized = normalizeResponse(brandsResponse.value);
        totalBrands = normalized.totalItems;
      }

      // Xử lý kết quả categories - dùng normalize function
      if (categoriesResponse.status === 'fulfilled') {
        const normalized = normalizeResponse(categoriesResponse.value);
        totalCategories = normalized.totalItems;
      }

      // Xử lý kết quả audit logs - dùng normalize function
      if (auditLogsResponse.status === 'fulfilled') {
        const normalized = normalizeResponse(auditLogsResponse.value);
        totalAuditLogs = normalized.totalItems;
      }

      setOverviewStats({
        totalUsers,
        totalBrands,
        totalCategories,
        totalAuditLogs,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching overview stats:', error);
      setOverviewStats(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy thống kê tổng quan',
      }));
    }
  }, []);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      setUserStats(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await userService.getAll({
        page: 1,
        limit: 50,
      });

      // Nếu API có field success=false → coi là lỗi
      if (response?.success === false) {
        throw new Error(response?.message || 'Không thể lấy dữ liệu người dùng');
      }

      // Chuẩn hoá dữ liệu để không phụ thuộc exact shape
      const { data: users, totalItems: totalUsers } = normalizeResponse(response);

      const now = Date.now();
      const last7Days = now - 7 * 24 * 60 * 60 * 1000;

      const recentUsersInSample = users.filter((u: any) => {
        const t = new Date(u?.createdAt ?? '').getTime();
        return Number.isFinite(t) && t >= last7Days;
      }).length;

      const activeUsersInSample = users.filter((u: any) => u?.status === 'ACTIVE').length;
      const adminUsersInSample = users.filter((u: any) => u?.role?.name === 'ADMIN').length;
      const clientUsersInSample = users.filter((u: any) => u?.role?.name === 'CLIENT').length;
      const sellerUsersInSample = users.filter((u: any) => u?.role?.name === 'SELLER').length;

      const sampleSize = users.length || 1; // tránh chia 0
      const est = (n: number) => Math.round((n / sampleSize) * totalUsers);

      // Đảm bảo có ít nhất 1 admin
      const estimatedAdminUsers = Math.max(1, est(adminUsersInSample));

      setUserStats({
        totalUsers,
        users,
        isLoading: false,
        error: null,
        refreshUserStats: fetchUserStats,
      });

      setDashboardStats(prev => ({
        ...prev,
        totalUsers,
        recentUsersCount: est(recentUsersInSample),
        activeUsersCount: est(activeUsersInSample),
        verifiedUsersCount: est(activeUsersInSample),
        adminUsersCount: estimatedAdminUsers,
        clientUsersCount: est(clientUsersInSample),
        sellerUsersCount: est(sellerUsersInSample),
      }));

      // Cập nhật chart data
      setChartData({
        usersByRole: [
          { name: 'Admin', value: estimatedAdminUsers, color: '#8B5CF6' },
          { name: 'Seller', value: est(sellerUsersInSample), color: '#F59E0B' },
          { name: 'Client', value: est(clientUsersInSample), color: '#3B82F6' },
        ],
        usersByStatus: [
          { name: 'Active', value: est(activeUsersInSample), color: '#10B981' },
          { name: 'Inactive', value: totalUsers - est(activeUsersInSample), color: '#EF4444' },
        ],
        isLoading: false,
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setUserStats(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
      }));
    }
  }, []);

  // Fetch combined stats
  const fetchAllStats = useCallback(async () => {
    await Promise.all([
      fetchUserStats(),
      fetchOverviewStats(),
    ]);
  }, [fetchUserStats, fetchOverviewStats]);

  // Load data khi component mount
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  // Update dashboard stats khi có overview stats
  useEffect(() => {
    if (!overviewStats.isLoading && !overviewStats.error) {
      setDashboardStats(prev => ({
        ...prev,
        totalBrands: overviewStats.totalBrands,
        totalCategories: overviewStats.totalCategories,
        totalAuditLogs: overviewStats.totalAuditLogs,
      }));
    }
  }, [overviewStats]);

  return {
    userStats,
    dashboardStats,
    overviewStats,
    chartData,
    refreshStats: fetchAllStats,
  };
};
