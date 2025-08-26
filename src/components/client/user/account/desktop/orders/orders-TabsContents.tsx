"use client";

import { TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { OrderEmpty } from "./orders-Empty";
import { useOrder } from "./useOrder";
import { OrderStatus } from "@/types/order.interface";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { createProductSlug } from "@/components/client/products/shared/productSlug";
import { ReviewsModal } from "@/components/client/products/products-ReviewsModal";

const statusConfig = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    bg: "bg-amber-100 text-amber-700",
  },
  PENDING_PACKAGING: {
    label: "Đang đóng gói",
    bg: "bg-orange-100 text-orange-700",
  },
  PICKUPED: { label: "Chờ lấy hàng", bg: "bg-blue-100 text-blue-700" },
  PENDING_DELIVERY: {
    label: "Đang giao hàng",
    bg: "bg-purple-100 text-purple-700",
  },
  DELIVERED: { label: "Đã giao hàng", bg: "bg-green-100 text-green-700" },
  RETURNED: { label: "Đã trả hàng", bg: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-red-100 text-red-700" },
  VERIFY_PAYMENT: { label: "Đã xác nhận", bg: "bg-green-100 text-green-700" },
};

interface Props {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const OrderTabContent = ({ currentTab, onTabChange }: Props) => {
  const router = useRouter();
  const {
    orders,
    loading,
    error,
    metadata,
    fetchAllOrders,
    fetchOrdersByStatus,
  } = useOrder();
  const [visibleCount, setVisibleCount] = useState(6);
  const [reviewProduct, setReviewProduct] = useState<any>(null);

  useEffect(() => {
    if (!currentTab) onTabChange("all");
  }, [currentTab, onTabChange]);

  useEffect(() => {
    if (currentTab === "all") {
      fetchAllOrders();
    } else {
      fetchOrdersByStatus(currentTab as OrderStatus);
    }
    setVisibleCount(6);
  }, [currentTab, fetchAllOrders, fetchOrdersByStatus]);

  const handleViewDetail = (orderId: string) => {
    router.push(
      `/user/orders/${orderId}?code=${
        orders.find((o) => o.id === orderId)?.orderCode
      }`
    );
  };

  const tabs = ["all", ...Object.values(OrderStatus)];

  return (
    <>
      {tabs.map((value) => (
        <TabsContent
          key={value}
          value={value}
          className="bg-white min-h-[70vh] p-4"
        >
          {value !== currentTab ? null : loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#D70018] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải đơn hàng...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-500">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  ❌
                </div>
                <p>{error}</p>
              </div>
            </div>
          ) : orders.length ? (
            <div className="space-y-3">
              {orders.slice(0, visibleCount).map((order) => {
                const firstItem = order.items[0];
                const status = statusConfig[order.status] || {
                  label: order.status,
                  bg: "bg-gray-100",
                };

                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md hover:border-[#D70018]/30 transition-all cursor-pointer"
                    onClick={() => handleViewDetail(order.id)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                      <span className="text-sm text-gray-600">
                        Mã: <strong>{order.id}</strong>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={firstItem?.image || "/static/no-image.png"}
                          alt={firstItem?.productName}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        {order.items.length > 1 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D70018] text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {order.items.length}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                          {firstItem?.productName}
                        </h4>
                        {order.items.length > 1 && (
                          <p className="text-xs text-gray-500 mb-2">
                            và {order.items.length - 1} sản phẩm khác
                          </p>
                        )}
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            Ngày đặt:{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p>
                            SL:{" "}
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            sản phẩm
                          </p>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="text-right">
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">Tổng tiền</p>
                          <p className="font-bold text-[#D70018] text-lg">
                            {order.totalPayment.toLocaleString()}₫
                          </p>
                        </div>

                        {order.status === "DELIVERED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs mb-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewProduct({
                                productId: firstItem.productId,
                                productName: firstItem.productName,
                                productSlug: createProductSlug(
                                  firstItem.productName,
                                  firstItem.productId
                                ),
                                orderId: order.id,
                              });
                            }}
                          >
                            Đánh giá
                          </Button>
                        )}

                        <div className="flex items-center gap-1 text-xs text-[#D70018] font-medium">
                          Chi tiết <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load more */}
              {metadata?.totalItems && visibleCount < metadata.totalItems && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (orders.length < (metadata?.totalItems ?? 0)) {
                        if (currentTab === "all") {
                          await fetchAllOrders(1, metadata.totalItems);
                        } else {
                          await fetchOrdersByStatus(
                            currentTab as OrderStatus,
                            1,
                            metadata.totalItems
                          );
                        }
                      }
                      setVisibleCount((prev) => prev + 10);
                    }}
                    className="text-[#D70018] border-[#D70018]/30 hover:bg-[#D70018] hover:text-white"
                  >
                    Xem thêm <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <OrderEmpty />
          )}
        </TabsContent>
      ))}

      {reviewProduct && (
        <ReviewsModal
          open={!!reviewProduct}
          onOpenChange={(open) => !open && setReviewProduct(null)}
          product={reviewProduct}
        />
      )}
    </>
  );
};
