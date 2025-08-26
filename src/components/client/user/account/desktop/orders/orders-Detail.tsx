"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, ChevronLeft, AlertTriangle } from "lucide-react";
import { useOrder } from "./useOrder";
import { Order, OrderItem } from "@/types/order.interface";
import Link from "next/link";
import { createProductSlug } from "@/components/client/products/shared/productSlug"; // Đường dẫn đến hàm tạo slug
import { OrderTimeline } from "./orders-Timeline";
import OrderInfo from "./orders-Info";

interface OrderDetailProps {
  readonly orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const { fetchOrderDetail, cancelOrder, loading } = useOrder();
  const [order, setOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        const res = await fetchOrderDetail(orderId);
        setOrder(res?.data ?? null);
      } catch (err) {}
    };

    loadOrder();
  }, [orderId, fetchOrderDetail]);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;

    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      const res = await fetchOrderDetail(orderId);
      setOrder(res?.data ?? null);
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    if (!isCancelling) {
      setShowCancelDialog(false);
    }
  };

  if (loading || !order) {
    return <div>Đang tải...</div>;
  }

  const statusMap: Record<
    string,
    { label: string; variant?: "default" | "destructive" }
  > = {
    PENDING_PAYMENT: { label: "Chờ thanh toán" },
    PENDING_PACKAGING: { label: "Đang đóng gói" },
    PENDING_PICKUP: { label: "Chờ lấy hàng" },
    PENDING_DELIVERY: { label: "Đang giao hàng" },
    DELIVERED: { label: "Đã giao hàng" },
    RETURNED: { label: "Đã trả hàng" },
    CANCELLED: { label: "Đã hủy", variant: "destructive" },
  };

  const currentStatus = statusMap[order.status] || { label: order.status };

  const selectedItem: OrderItem | undefined =
    order.items?.find((item) => item.productId === productId) ||
    order.items?.[0];

  const totalQuantity =
    selectedItem?.quantity ??
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ??
    0;

  const discount = order.totalVoucherDiscount;
  const shippingFee: number = order.totalShippingFee;

  const totalAmount = order.totalItemCost;

  const finalAmount = order.totalPayment;

  return (
    <div className="mx-auto bg-[#f5f5f5] space-y-3 text-sm rounded-md">
      <Link
        href="/user/orders"
        className="flex items-center gap-1 text-muted-foreground text-sm bg-white rounded-lg p-4 border cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-[#121214] text-sm">
          Lịch sử mua hàng
          <span className="font-medium text-[#CFCFD3]">
            {" "}
            / Chi tiết đơn hàng
          </span>
        </span>
      </Link>

      <section className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tiến trình đơn hàng</h2>
          <span className="text-sm font-medium">
            {order.status === "DELIVERED"
              ? `Đơn hàng đã hoàn thành: ${order.orderCode}`
              : `Mã vận đơn: ${order.orderCode}`}
          </span>
        </div>
        <OrderTimeline
          status={order.status}
          createdAt={order.createdAt}
          finalAmount={order.totalPayment}
          orderCode={order.orderCode}
        />
      </section>

      {order.status !== "CANCELLED" && (
        <section className="bg-white rounded-lg border p-4 space-y-3">
          <OrderInfo orderCode={order.orderCode} />
        </section>
      )}

      {/* Tổng quan */}
      <section className="bg-white rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Tổng quan</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Mã thanh toán: #{order.paymentId}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </span>
          <span className="text-muted-foreground">•</span>
          <Badge
            variant={currentStatus.variant || "default"}
            className="text-xs text-white"
          >
            {currentStatus.label}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div className="flex items-center gap-4">
            <img
              src={selectedItem?.image}
              alt={selectedItem?.productName}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-medium line-clamp-2">
                {selectedItem?.productName}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#d70018] font-semibold">
                  {(selectedItem?.skuPrice ?? 0).toLocaleString()}đ
                </span>
              </div>
              <span className="text-xs bg-gray-100 rounded px-2 py-0.5">
                {selectedItem?.skuValue}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[100px]">
            <span className="text-sm">Số lượng: {totalQuantity}</span>
            <div className="flex gap-2">
              {/* Nút Mua lại - chỉ hiển thị cho trạng thái DELIVERED, RETURNED, CANCELLED */}
              {(order.status === "DELIVERED" ||
                order.status === "RETURNED" ||
                order.status === "CANCELLED") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#d70018] text-[#d70018] hover:bg-[#d70018] hover:text-white min-w-[100px]"
                  onClick={() => {
                    if (selectedItem) {
                      const slug = createProductSlug(
                        selectedItem.productName,
                        selectedItem.productId
                      );
                      router.push(`/products/${slug}`);
                    }
                  }}
                >
                  Mua lại
                </Button>
              )}
              {/* Nút Thanh toán lại - chỉ hiển thị cho trạng thái PENDING_PAYMENT */}
              {order.status === "PENDING_PAYMENT" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0066cc] text-[#0066cc] hover:bg-[#0066cc] hover:text-white min-w-[120px]"
                  onClick={() => {
                    // Chuyển hướng đến trang retry payment
                    router.push(`/checkout/retry/${order.id}`);
                  }}
                >
                  Tiếp tục thanh toán
                </Button>
              )}

              {/* Nút Hủy đơn hàng - chỉ hiển thị cho trạng thái PENDING_PAYMENT */}
              {(order.status === "PENDING_PAYMENT" ||
                order.status === "PENDING_PACKAGING") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500 hover:bg-red-50 min-w-[110px]"
                  onClick={handleCancelClick}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-3">
        {/* Cột trái */}
        <div className="md:col-span-5 flex flex-col space-y-3">
          {/* Thông tin khách hàng */}
          <section className="bg-white rounded-lg border p-4 space-y-3">
            <h2 className="text-lg font-semibold">Thông tin khách hàng</h2>
            <div className="px-2 space-y-2 text-base">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Họ và tên:</span>
                <span className="font-sm">{order.receiver?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-sm">{order.receiver?.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Địa chỉ:</span>
                <span className="font-sm text-right max-w-[70%]">
                  {order.receiver?.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span className="text-muted-foreground">-</span>
              </div>
            </div>
          </section>

          {/* Thông tin hỗ trợ */}
          <section className="bg-white rounded-lg border p-4 py-6 space-y-3">
            <h2 className="text-lg font-semibold">Thông tin hỗ trợ</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Số điện thoại:</span>
                <span className="font-semibold">18002097</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#d70018] text-[#d70018] hover:bg-[#d70018] hover:text-white"
              >
                <Phone className="w-4 h-4 mr-1" /> Liên hệ
              </Button>
            </div>
          </section>

          {/* Trung tâm bảo hành */}
          <section className="bg-white rounded-lg border p-4 space-y-3 flex-1">
            <h2 className="text-lg font-semibold">Trung tâm bảo hành</h2>
            <div className="flex justify-between border-b">
              <span>Danh sách trung tâm bảo hành</span>
              <Button variant="link" className="text-primary px-0">
                Truy cập
              </Button>
            </div>
            <div className="flex justify-between">
              <span>Bảo hành tại Shopsifu</span>
              <Button variant="link" className="text-primary px-0">
                Truy cập
              </Button>
            </div>
          </section>
        </div>

        {/* Thông tin thanh toán */}
        <section className="bg-white rounded-lg border p-6 space-y-4 md:col-span-5 flex flex-col shadow-sm h-full">
          <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>

          {/* Sản phẩm */}
          <div className="p-2 space-y-3">
            <h3 className="text-base font-medium bg-neutral-100 rounded-xs px-2 py-1">
              Sản phẩm
            </h3>
            <div className="flex px-2 justify-between border-b pb-2">
              <span>Số lượng sản phẩm:</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="flex px-2 justify-between border-b pb-2">
              <span>Tổng tiền hàng:</span>
              <span>{totalAmount.toLocaleString()}đ</span>
            </div>
            <div className="flex px-2 justify-between border-b pb-2">
              <span>Phí vận chuyển:</span>
              <span>
                {shippingFee === 0
                  ? "Miễn phí"
                  : `${shippingFee.toLocaleString()}đ`}
              </span>
            </div>
            <div className="flex px-2 justify-between border-b pb-2 text-green-600">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="p-2 space-y-3 mt-3">
            <h3 className="text-base font-medium bg-neutral-100 rounded-xs px-2 py-1">
              Thanh toán
            </h3>
            <div className="flex px-2 justify-between border-b pb-2 font-semibold text-[#d70018] text-lg">
              <span>Tổng số tiền</span>
              <span>{finalAmount.toLocaleString()}đ</span>
            </div>
            <p className="text-xs px-2 text-muted-foreground border-b pb-2">
              (Đã bao gồm VAT và được làm tròn)
            </p>
            <div className="flex px-2 justify-between text-red-600">
              <span>Tổng số tiền đã thanh toán</span>
              <span>
                {order.status === "PICKUPED" ||
                order.status === "PENDING_DELIVERY" ||
                order.status === "DELIVERED"
                  ? order.totalPayment.toLocaleString()
                  : "0"}
                đ
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Modal xác nhận hủy đơn hàng */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <span className="font-semibold">#{order?.paymentId}</span> không?
              <br />
              <span className="text-red-600 text-sm mt-2 block">
                Lưu ý: Hành động này không thể hoàn tác.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDialogClose}
              disabled={isCancelling}
            >
              Không, giữ lại
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="text-white"
            >
              {isCancelling ? "Đang hủy..." : "Có, hủy đơn hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
