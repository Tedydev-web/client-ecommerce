"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CartFooterMobileProps {
  total: number;
  totalSaved: number;
  isEditing?: boolean;
  selectedCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onCheckout: () => void;
  onDeleteSelected: () => void;
}

export default function CartFooterMobile({
  total,
  totalSaved,
  isEditing = false,
  selectedCount,
  allSelected,
  onToggleAll,
  onCheckout,
  onDeleteSelected,
}: CartFooterMobileProps) {
  const t = useTranslations();

  return (
    <div className="w-full sticky bottom-0 bg-white border-t text-sm text-muted-foreground safe-area-inset-bottom">
      {/* Voucher + Coin có thể reuse sau nếu cần, hiện tại bỏ qua giống desktop */}

      {/* Bottom Row - Mobile optimized */}
      <div className="flex flex-col gap-2 px-3 py-2 bg-white min-h-[60px]">
        {/* Top row - Checkbox + Delete button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Checkbox
              id="select-all-mobile"
              className="w-4 h-4"
              checked={allSelected}
              onCheckedChange={onToggleAll}
            />
            <label htmlFor="select-all-mobile" className="text-sm">
              Chọn tất cả ({selectedCount})
            </label>

            {selectedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                className="ml-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 text-xs px-2 py-1 h-7"
              >
                Xóa ({selectedCount})
              </Button>
            )}
          </div>
        </div>

        {/* Bottom row - Total + Checkout */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <div className="text-xs text-black mb-1">
              Tổng thanh toán ({selectedCount} sản phẩm):
            </div>
            <div>
              <span className="text-red-500 font-medium text-lg">
                ₫{total.toLocaleString("vi-VN")}
              </span>
              {totalSaved > 0 && (
                <div className="text-xs text-muted-foreground">
                  Tiết kiệm ₫{totalSaved.toLocaleString("vi-VN")}
                </div>
              )}
            </div>
          </div>

          <Button
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-6 py-2 h-9 ml-3 whitespace-nowrap"
            onClick={onCheckout}
            disabled={selectedCount === 0}
          >
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
