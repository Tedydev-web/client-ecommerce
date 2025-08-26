"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Minus,
  Plus,
  TicketPercent,
  Star,
  StarHalf,
  Star as StarOutline,
  Flag,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from '@/providers/CartContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Sku,
  VariantGroup,
  SelectedVariants,
  findMatchingSku,
  isOptionAvailable,
  getCurrentStock,
  areAllVariantsSelected,
  findSelectedSkuPrice,
  handleAddToCart
} from "@/utils/productUtils";
import { useRouter } from "next/navigation";

interface Product {
  name: string;
  basePrice: number;
  virtualPrice: number;
  skus: Sku[];
  variants: VariantGroup[];
  media: { type: "image" | "video"; src: string }[];
  categories: { id: number; name: string }[];
  brand?: { id: number; name: string };
  origin?: string;
  material?: string;
  flashSale?: {
    price: number;
    endTime: string;
  };
  vouchers?: { code: string; desc: string }[];
  rating?: number;
  reviewCount?: number;
  sold?: number;
}

export default function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string | null>>({});
  const [currentSku, setCurrentSku] = useState<Sku | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const router = useRouter();
  // Sử dụng Context để quản lý giỏ hàng toàn cục
  const { addToCart } = useCart();
  const { checkAuth } = useAuthGuard();
  
  // Lấy ra tất cả variants từ API response
  const variantGroups = product.variants || [];
  
  // Tạo một object để theo dõi các lựa chọn variant của người dùng
  useEffect(() => {
    const initialVariants: SelectedVariants = {};
    variantGroups.forEach(group => {
      // Auto-select nếu variant là "Default"
      if (group.value === "Default" && group.options.includes("Default")) {
        initialVariants[group.value] = "Default";
      } else {
        initialVariants[group.value] = null;
      }
    });
    setSelectedVariants(initialVariants);
  }, [variantGroups]);
  
  // Xử lý khi người dùng chọn một variant
  const handleVariantSelect = (variantType: string, option: string) => {
    setSelectedVariants(prev => {
      // Nếu đang chọn cùng một giá trị, bỏ chọn nó
      if (prev[variantType] === option) {
        return { ...prev, [variantType]: null };
      }
      // Ngược lại, chọn giá trị mới
      return { ...prev, [variantType]: option };
    });
  };
  
  // Tìm SKU phù hợp với các lựa chọn variant hiện tại và cập nhật state
  useEffect(() => {
    // Sử dụng hàm tiện ích từ productUtils để tìm SKU phù hợp
    const matchingSku = findMatchingSku(selectedVariants, product.skus, variantGroups as VariantGroup[]);
    
    if (matchingSku) {
      console.log('Tìm thấy SKU:', matchingSku);
    } else if (areAllVariantsSelected(selectedVariants)) {
      console.log('Đã chọn đủ variants nhưng không tìm thấy SKU phù hợp');
    }
    
    setCurrentSku(matchingSku);
  }, [selectedVariants, product.skus, variantGroups]);
  
  // Tính toán tổng tồn kho dựa trên SKU hiện tại hoặc sử dụng hàm tiện ích
  const totalStock = getCurrentStock(selectedVariants, product.skus, variantGroups as VariantGroup[]);
    
  // Tính phần trăm giảm giá
  const discountPercent = Math.round(
    ((product.basePrice - product.virtualPrice) / product.basePrice) * 100
  );

  const category = product.categories[0]?.name ?? "";
  const brand = product.brand?.name ?? "";
  const origin = product.origin ?? "Không rõ";
  const material = product.material ?? "Không rõ";

  const isFlashSale = !!product.flashSale;
  const flashSalePrice = product.flashSale?.price ?? 0;
  const flashSaleEnd = product.flashSale?.endTime
    ? new Date(product.flashSale.endTime)
    : null;

  const vouchers = product.vouchers ?? [];

  // Kiểm tra xem đã chọn đủ variants chưa
  const isVariantSelected = areAllVariantsSelected(selectedVariants);

  // Debug log để hiểu các điều kiện
  useEffect(() => {
    console.log('=== PRODUCT DEBUG INFO ===');
    console.log('Product SKUs:', product.skus);
    console.log('Variant Groups:', variantGroups);
    console.log('Selected Variants:', selectedVariants);
    console.log('Current SKU:', currentSku);
    console.log('Is Variant Selected:', isVariantSelected);
    console.log('Current Stock:', currentSku?.stock || 0);
    console.log('Can Add to Cart:', isVariantSelected && currentSku && currentSku.stock > 0);
    console.log('=========================');
  }, [selectedVariants, currentSku, isVariantSelected, product.skus, variantGroups]);

  // Xử lý input số lượng
  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value.replace(/\D/g, ""), 10);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;
    
    const maxStock = currentSku ? currentSku.stock : totalStock;
    if (val > maxStock) val = maxStock;
    
    setQuantity(val);
  };

  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const sold = product.sold ?? 0;
  
  // Hàm xử lý khi click vào nút "Thêm vào giỏ hàng"
  const handleAddToCartClick = async () => {
    if (checkAuth()) {
      if (!isVariantSelected || !currentSku || currentSku.stock === 0) return;
      
      setIsAddingToCart(true);
      try {
        // Sử dụng hàm từ productUtils để xử lý việc thêm vào giỏ hàng
        await handleAddToCart(
          selectedVariants,
          product.skus,
          variantGroups as VariantGroup[],
          quantity,
          addToCart
        );
      } finally {
        setIsAddingToCart(false);
      }
    }
    else{
      router.push('/sign-in');
    }
  };

  // Hàm xử lý khi click vào nút "Mua ngay"
  const handleBuyNowClick = async () => {
    if (checkAuth()) {
      if (!isVariantSelected || !currentSku || currentSku.stock === 0) return;
      
      setIsBuyingNow(true);
      try {
        // 1. Thêm sản phẩm vào giỏ hàng và lấy cart item ID
        const cartItemId = await handleAddToCart(
          selectedVariants,
          product.skus,
          variantGroups as VariantGroup[],
          quantity,
          addToCart
        );

        if (cartItemId && typeof cartItemId === 'string') {
          console.log('Added to cart with ID:', cartItemId);
          // 2. Redirect với cart item ID từ API response  
          router.push(`/cart?selectItem=${cartItemId}`);
        } else {
          console.warn('Không lấy được cart item ID, redirect bình thường');
          // 3. Fallback: redirect bình thường
          router.push('/cart');
        }
      } catch (error) {
        console.error('Error in buy now process:', error);
        // Nếu có lỗi, vẫn redirect đến cart để user có thể thao tác manual
        router.push('/cart');
      } finally {
        setIsBuyingNow(false);
      }
    }
    else{
      router.push('/sign-in');
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="flex items-center gap-0.5 ml-1">
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <Star
              key={"full" + i}
              className="w-4 h-4 text-yellow-400 fill-yellow-400"
            />
          ))}
        {half === 1 && (
          <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        )}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <StarOutline key={"empty" + i} className="w-4 h-4 text-gray-300" />
          ))}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 text-[15px] leading-relaxed">
      {/* Tên sản phẩm */}
      <h1 className="text-2xl font-medium text-gray-900">{product.name}</h1>
      {/* Dịch vụ hỗ trợ */}
      <div className="flex items-center gap-4 text-sm mt-1">
        <span className="flex items-center gap-1">
          <Truck className="w-4 h-4 text-green-600" />
          <span className="text-black">Miễn phí vận chuyển</span>
        </span>
        <span className="flex items-center gap-1">
          <RefreshCcw className="w-4 h-4 text-blue-600" />
          <span className="text-black">Đổi trả 7 ngày</span>
        </span>
      </div>

      {/* Đánh giá, bán, tố cáo */}
     <div className="flex items-center w-full text-sm text-muted-foreground mb-1">
      <div className="flex items-center gap-1">
        <span className="font-medium text-black">{rating.toFixed(1)}</span>
        {renderStars(rating)}
      </div>
      <span className="mx-2">|</span>
      <span>
        <span className="text-black font-medium">{reviewCount}</span> Lượt đánh giá
      </span>
      <span className="mx-2">|</span>
      <span>
        Đã bán <span className="text-black font-medium">{sold.toLocaleString()}</span>
      </span>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        className="text-grey-500 px-2 py-1 h-auto"
      >
        <Flag className="w-4 h-4" />
        Tố cáo
      </Button>
    </div>


      {/* Giá */}
      {isFlashSale ? (
        <div className="flex items-center gap-3 text-xl font-bold text-red-600">
          <Badge className="bg-red-600 text-white">FLASH SALE</Badge>₫
          {flashSalePrice.toLocaleString("vi-VN")}
          <span className="text-sm line-through text-muted-foreground font-normal">
            ₫{product.virtualPrice.toLocaleString("vi-VN")}
          </span>
          {flashSaleEnd && (
            <span className="text-xs text-orange-500 ml-2">
              Kết thúc: {flashSaleEnd.toLocaleTimeString("vi-VN")}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-[#fafafa] px-3 py-4">
          <span className="text-3xl font-medium text-red-600">
            ₫{product.basePrice.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm line-through text-muted-foreground font-normal">
            ₫{product.virtualPrice.toLocaleString("vi-VN")}
          </span>
          <Badge className="bg-yellow-400 text-black">
            {discountPercent}% OFF
          </Badge>
        </div>

      )}

      {/* Vouchers */}
      {/* {vouchers.length > 0 && ( */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
            Voucher của Shop
          </div>
          <div className="flex gap-2 flex-wrap">
            {vouchers.map((v) => (
              <Badge
                key={v.code}
                className="bg-orange-100 text-orange-600 border border-orange-400 px-3 py-1 text-sm"
              >
                <span className="font-semibold">{v.code}</span>
                <span className="ml-2 text-xs">{v.desc}</span>
              </Badge>
            ))}
          </div>
        </div>
      {/* )} */}

      {/* Variants - Dynamic rendering based on API */}
      {variantGroups.map((variantGroup) => (
      <div key={variantGroup.value} className="flex flex-wrap items-center gap-3">
        <span className="w-24 text-muted-foreground">{variantGroup.value}:</span>
        <div className="flex gap-2 flex-wrap">
          {variantGroup.options.map((option) => {
            const isSelected = selectedVariants[variantGroup.value] === option;

            // Sử dụng hàm tiện ích để kiểm tra xem variant này có sẵn không
            const isAvailable = isOptionAvailable(
              variantGroup.value,
              option,
              selectedVariants,
              product.skus,
              variantGroups as VariantGroup[]
            );

            return (
              <button
                key={option}
                onClick={() => handleVariantSelect(variantGroup.value, option)}
                className={cn(
                  "relative px-4 py-2 border rounded-md text-sm transition-all",
                  "hover:border-primary hover:text-primary",
                  isSelected
                    ? "border-primary text-primary"
                    : "border-input text-foreground",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isAvailable}
              >
                {option}
                {isSelected && (
                  <span className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
))}

      
      
      {/* Số lượng */}
      <div className="flex items-center gap-4">
        <span className="min-w-[90px] text-muted-foreground">Số lượng:</span>
        <div className="flex items-center border rounded">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!isVariantSelected || quantity <= 1 || !currentSku?.stock}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <input
            type="number"
            min={1}
            max={currentSku ? currentSku.stock : totalStock}
            value={quantity}
            onChange={handleQuantityInput}
            disabled={!isVariantSelected || !currentSku?.stock}
            aria-label="Số lượng sản phẩm"
            title="Số lượng"
            className="w-12 h-8 text-center outline-none border-x [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setQuantity((q) => Math.min(currentSku ? currentSku.stock : totalStock, q + 1))}
            disabled={!isVariantSelected || quantity >= (currentSku ? currentSku.stock : totalStock) || !currentSku?.stock}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {isVariantSelected && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Tồn kho:{" "}
            <span className="font-semibold">
              {currentSku ? currentSku.stock.toLocaleString() : totalStock.toLocaleString()}
            </span>
          </span>
        )}
      </div>

      {/* Thông báo hết hàng */}
      {isVariantSelected && currentSku && currentSku.stock === 0 && (
        <div className="text-red-500 text-sm">
          Sản phẩm đã hết hàng với tùy chọn này
        </div>
      )}

      {/* Nút thao tác */}
      <div className="flex gap-3 pt-2 w-full">
        {/* Thêm vào giỏ hàng */}
        <Button
          className="flex-1 h-12 rounded-xs border border-red-500 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 shadow-sm text-base font-medium flex items-center justify-center gap-2 transition-all duration-200"
          disabled={!isVariantSelected || !currentSku || currentSku.stock === 0 || isAddingToCart}
          onClick={handleAddToCartClick}
        >
          {isAddingToCart ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Thêm Vào Giỏ Hàng
            </>
          )}
        </Button>

        {/* Mua ngay */}
        <Button
          className="flex-1 h-12 rounded-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md text-base font-medium flex items-center justify-center gap-2 transition-all duration-200"
          disabled={!isVariantSelected || !currentSku || currentSku.stock === 0 || isBuyingNow}
          onClick={handleBuyNowClick}
        >
          {isBuyingNow ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Đang xử lý...
            </>
          ) : (
            <>
              Mua Ngay
              <span>
                ₫
                {(currentSku 
                  ? currentSku.price
                  : isFlashSale
                    ? flashSalePrice
                    : product.basePrice
                ).toLocaleString("vi-VN")}
              </span>
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
