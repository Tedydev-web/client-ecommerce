"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Order, OrderItem, OrderStatus } from "@/types/order.interface";

export default function DashboardOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    orderService
      .getAll({ page: 1, limit: 8 }, controller.signal)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  interface StatusInfo {
    label: string;
    className: string;
  }

  const statusLabel: Record<OrderStatus, StatusInfo> = {
    PENDING_PAYMENT: {
      label: "Chờ thanh toán",
      className:
        "bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border border-amber-200",
    },
    PENDING_PACKAGING: {
      label: "Đang đóng gói",
      className:
        "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200",
    },
    PICKUPED: {
      label: "Chờ lấy hàng",
      className:
        "bg-gradient-to-r from-sky-50 to-blue-100 text-sky-700 border border-sky-200",
    },
    PENDING_DELIVERY: {
      label: "Đang giao hàng",
      className:
        "bg-gradient-to-r from-violet-50 to-purple-100 text-violet-700 border border-violet-200",
    },
    DELIVERED: {
      label: "Đã giao hàng",
      className:
        "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200",
    },
    RETURNED: {
      label: "Đã trả hàng",
      className:
        "bg-gradient-to-r from-slate-50 to-gray-100 text-slate-700 border border-slate-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      className:
        "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 border border-red-200",
    },
    VERIFY_PAYMENT: {
      label: "Đã xác nhận thanh toán",
      className:
        "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200",
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D70018]"></div>
          <span className="ml-3 text-gray-600 font-medium">
            Đang tải đơn hàng...
          </span>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-8 shadow-sm text-center h-full">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D70018]/10 to-[#FF6B35]/10 rounded-full blur-xl"></div>
            <Image
              src="/images/client/profile/logo mini.png"
              alt="Đơn hàng"
              width={120}
              height={120}
              className="mx-auto relative z-10"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-gray-600 mb-6 text-sm max-w-sm">
            Bạn chưa có đơn hàng nào gần đây? Hãy bắt đầu khám phá và mua sắm
            ngay nào!
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#D70018] to-[#FF6B35] text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  const handleViewDetail = (orderId: string, productId: string) => {
    router.push(`/user/orders/${orderId}?productId=${productId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Đơn hàng gần đây
        </h2>
        <Link
          href="/user/orders"
          className="inline-flex items-center text-[#D70018] font-semibold hover:text-[#B8001A] transition-colors duration-200 group self-start sm:self-auto"
        >
          <span className="text-sm sm:text-base">Xem tất cả</span>
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) =>
          order.items.map((item: OrderItem) => {
            const totalAmount = item.skuPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="group border border-gray-200 rounded-lg p-3 sm:p-4 bg-white hover:border-[#D70018]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleViewDetail(order.id, item.productId)}
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Đơn hàng:</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded">
                          #{order.id}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(order.createdAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        statusLabel[order.status]?.className ||
                        "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {statusLabel[order.status]?.label || order.status}
                    </span>
                  </div>

                  {/* Product Row */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image || "/static/no-image.png"}
                        alt={item.productName || "Sản phẩm"}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover w-[60px] h-[60px] border border-gray-100"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-[#D70018] transition-colors duration-200">
                        {item.productName}
                      </h4>

                      {item.skuValue && (
                        <p className="text-xs text-gray-500 mb-2 bg-gray-50 px-2 py-1 rounded inline-block">
                          Phân loại: {item.skuValue}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-[#D70018]">
                          {totalAmount.toLocaleString()}đ
                        </div>
                        <div className="text-xs text-gray-500">
                          SL: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  {/* Header Row */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Đơn hàng:{" "}
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                          #{order.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap ${
                        statusLabel[order.status]?.className ||
                        "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {statusLabel[order.status]?.label || order.status}
                    </span>
                  </div>

                  {/* Product Info Row */}
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <div className="relative group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                        <Image
                          src={item.image || "/static/no-image.png"}
                          alt={item.productName || "Sản phẩm"}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover w-[60px] h-[60px] shadow-sm border border-gray-100"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>

                      <div className="text-left flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-[#D70018] transition-colors duration-200">
                          {item.productName}
                        </h4>
                        {item.skuValue && (
                          <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
                            <span className="font-medium">Phân loại:</span>{" "}
                            {item.skuValue}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Tổng thanh toán
                        </p>
                        <p className="text-base font-bold text-[#D70018]">
                          {totalAmount.toLocaleString()}đ
                        </p>
                      </div>
                      <div className="inline-flex items-center text-sm text-[#D70018] font-semibold hover:text-[#B8001A] transition-colors duration-200 group/link">
                        <span className="hidden sm:inline">Xem chi tiết</span>
                        <span className="sm:hidden">Chi tiết</span>
                        <svg
                          className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
