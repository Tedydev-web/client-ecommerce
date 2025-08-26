"use client";

import { useState, useEffect, useCallback } from 'react';
import { manageOrderService } from '@/services/orderService';
import { discountService } from '@/services/discountService';
import { OrderStatus } from '@/types/order.interface';
import { DiscountStatus, VoucherType } from '@/types/discount.interface';
import { useUserData } from '@/hooks/useGetData-UserLogin';

// Interface cho thống kê seller
export interface SellerStats {
  totalOrders: number;
  pendingPayment: number;
  pendingPackaging: number;
  pendingDelivery: number;
  cancelled: number;
  delivered: number;
  isLoading: boolean;
  error: string | null;
}

// Interface cho thống kê discount
export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  shopDiscounts: number;
  platformDiscounts: number;
  productDiscounts: number;
  isLoading: boolean;
  error: string | null;
}

export const useDbSeller = () => {
  const user = useUserData();
  
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    totalOrders: 0,
    pendingPayment: 0,
    pendingPackaging: 0,
    pendingDelivery: 0,
    cancelled: 0,
    delivered: 0,
    isLoading: true,
    error: null,
  });

  const [discountStats, setDiscountStats] = useState<DiscountStats>({
    totalDiscounts: 0,
    activeDiscounts: 0,
    expiredDiscounts: 0,
    shopDiscounts: 0,
    platformDiscounts: 0,
    productDiscounts: 0,
    isLoading: true,
    error: null,
  });

  // Fetch thống kê discount cho seller
  const fetchDiscountStats = useCallback(async () => {
    try {
      setDiscountStats(prev => ({ ...prev, isLoading: true, error: null }));

      // Lấy tất cả discount của user hiện tại với limit 200
      const response = await discountService.getAll({
        page: 1,
        limit: 200,
        createdById: user?.id, // Thêm createdById để filter theo user
      });

      if (response.success && response.data) {
        const discounts = response.data;
        const totalDiscounts = discounts.length;

        // Đếm theo trạng thái
        const activeDiscounts = discounts.filter(discount => discount.discountStatus === DiscountStatus.ACTIVE).length;
        const expiredDiscounts = discounts.filter(discount => discount.discountStatus === DiscountStatus.EXPIRED).length;
        
        // Đếm theo loại voucher
        const shopDiscounts = discounts.filter(discount => discount.voucherType === VoucherType.SHOP).length;
        const platformDiscounts = discounts.filter(discount => discount.voucherType === VoucherType.PLATFORM).length;
        const productDiscounts = discounts.filter(discount => discount.voucherType === VoucherType.PRODUCT).length;

        setDiscountStats({
          totalDiscounts,
          activeDiscounts,
          expiredDiscounts,
          shopDiscounts,
          platformDiscounts,
          productDiscounts,
          isLoading: false,
          error: null,
        });

      } else {
        throw new Error(response.message || 'Không thể lấy dữ liệu discount');
      }
    } catch (error) {
      console.error('Error fetching discount stats:', error);
      setDiscountStats(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy thống kê discount',
      }));
    }
  }, [user?.id]);

  // Fetch thống kê đơn hàng cho seller
  const fetchSellerStats = useCallback(async () => {
    try {
      setSellerStats(prev => ({ ...prev, isLoading: true, error: null }));

      // Lấy tất cả đơn hàng của user hiện tại với limit 200
      const response = await manageOrderService.getAll({
        page: 1,
        limit: 200,
        // Thêm filter theo user nếu API hỗ trợ
        // userId: user?.id, // Uncomment nếu API hỗ trợ filter theo userId
      });

      if (response.statusCode === 200 && response.data) {
        const orders = response.data;
        const totalOrders = orders.length;

        // Đếm theo từng trạng thái
        const pendingPayment = orders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length;
        const pendingPackaging = orders.filter(order => order.status === OrderStatus.PENDING_PACKAGING).length;
        const pendingDelivery = orders.filter(order => order.status === OrderStatus.PENDING_DELIVERY).length;
        const cancelled = orders.filter(order => order.status === OrderStatus.CANCELLED).length;
        const delivered = orders.filter(order => order.status === OrderStatus.DELIVERED).length;

        setSellerStats({
          totalOrders,
          pendingPayment,
          pendingPackaging,
          pendingDelivery,
          cancelled,
          delivered,
          isLoading: false,
          error: null,
        });

      } else {
        throw new Error(response.message || 'Không thể lấy dữ liệu đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      setSellerStats(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy thống kê đơn hàng',
      }));
    }
  }, [user?.id]);

  // Fetch combined stats
  const fetchAllStats = useCallback(async () => {
    await Promise.all([
      fetchSellerStats(),
      fetchDiscountStats(),
    ]);
  }, [fetchSellerStats, fetchDiscountStats]);

  // Load data khi component mount
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  return {
    sellerStats,
    discountStats,
    refreshStats: fetchAllStats,
  };
};
