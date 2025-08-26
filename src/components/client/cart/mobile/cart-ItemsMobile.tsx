"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/providers/CartContext";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { findMatchingSku, SelectedVariants, Sku } from "@/utils/productUtils";
import { useCartAction } from "../hooks/use-CartAction";

interface MobileCartItemProps {
  item: any;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onVariationChange: (itemId: string, newSkuId: string) => void;
}

export default function MobileCartItem({
  item,
  selected,
  onToggle,
  onRemove,
}: MobileCartItemProps) {
  const { updateCartItem, isUpdating } = useCart();
  const { productDetails, fetchProductDetails, isLoading } = useCartAction();

  const [quantity, setQuantity] = useState(item.quantity);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>(
    {}
  );
  const [currentSku, setCurrentSku] = useState<Sku | null>(null);

  // Init biến thể khi mở popover
  useEffect(() => {
    if (isPopoverOpen && productDetails) {
      const initialVariants: SelectedVariants = {};
      const parts = item.sku.value.split("-");
      productDetails.variants.forEach((group, i) => {
        if (parts[i]) initialVariants[group.value] = parts[i];
      });
      setSelectedVariants(initialVariants);

      const skus = productDetails.skus.map((s) => ({
        ...s,
        productId: String(s.productId),
      }));
      setCurrentSku(
        findMatchingSku(initialVariants, skus, productDetails.variants)
      );
    }
  }, [isPopoverOpen, productDetails, item.sku.value]);

  // Update số lượng
  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;
    setQuantity(newQty);
    await updateCartItem(item.id, { skuId: item.sku.id, quantity: newQty });
  };

  // Chọn biến thể
  const handleVariantSelect = (variantType: string, option: string) => {
    const newSelected = { ...selectedVariants, [variantType]: option };
    setSelectedVariants(newSelected);

    if (productDetails) {
      const skus = productDetails.skus.map((s) => ({
        ...s,
        productId: String(s.productId),
      }));
      setCurrentSku(
        findMatchingSku(newSelected, skus, productDetails.variants)
      );
    }
  };

  // Xác nhận cập nhật biến thể
  const handleConfirmUpdate = async () => {
    if (currentSku && currentSku.id !== item.sku.id) {
      await updateCartItem(item.id, { skuId: currentSku.id, quantity }, true);
    }
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="w-4 h-4"
        />
      </div>

      {/* Product Content */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border">
            <Image
              src={item.sku.image || "/images/placeholder.png"}
              alt={item.sku.product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Header: Name + Delete Button */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5 flex-1">
                {item.sku.product.name}
              </h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={onRemove}
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Variant Selector */}
            <div className="mb-3">
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors max-w-full"
                    onClick={() => fetchProductDetails(item.sku.product.id)}
                  >
                    <span className="truncate">
                      Phân loại: {item.sku.value}
                    </span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 rounded-xl shadow-lg border-0"
                  align="start"
                  sideOffset={4}
                >
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-500">
                          Đang tải...
                        </span>
                      </div>
                    ) : productDetails ? (
                      <div className="space-y-4">
                        <div className="text-sm font-semibold text-gray-900 pb-2 border-b">
                          Chọn phân loại
                        </div>

                        {productDetails.variants.map((v) => (
                          <div key={v.value} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              {v.value}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {v.options.map((opt) => {
                                const isSelected =
                                  selectedVariants[v.value] === opt;
                                return (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      handleVariantSelect(v.value, opt)
                                    }
                                    className={cn(
                                      "px-3 py-2 border rounded-lg text-sm transition-all duration-200",
                                      isSelected
                                        ? "border-primary text-primary bg-primary/10 font-medium shadow-sm"
                                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <Separator className="my-4" />

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPopoverOpen(false)}
                            className="rounded-lg border-gray-200"
                          >
                            Hủy
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleConfirmUpdate}
                            disabled={
                              !currentSku ||
                              currentSku.id === item.sku.id ||
                              isUpdating
                            }
                            className="rounded-lg"
                          >
                            {isUpdating ? "Đang cập nhật..." : "Xác nhận"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-4 text-center">
                        Không thể tải thông tin sản phẩm
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Price and Quantity Row */}
            <div className="flex items-center justify-between">
              {/* Price */}
              <div className="text-red-500 font-bold text-base">
                ₫{item.sku.price.toLocaleString("vi-VN")}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 rounded-none"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-x border-gray-200 min-w-[3rem] text-center">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 rounded-none"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isUpdating}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
