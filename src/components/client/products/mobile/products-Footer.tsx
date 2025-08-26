"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import AddCartMobile from "./products-AddCartMobile";
import { DrawerTrigger } from "@/components/ui/drawer";

interface ProductsFooterProps {
  product?: any;
  onAddToCart?: (skuId: string, quantity: number) => void;
  onBuyNow?: () => void;
  onChat?: () => void;
}

export default function ProductsFooter({ 
  product, 
  onAddToCart, 
  onBuyNow, 
  onChat 
}: ProductsFooterProps) {
  const [isAddCartOpen, setIsAddCartOpen] = useState(false);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  
  const handleAddToCart = (skuId: string, quantity: number) => {
    if (onAddToCart) {
      onAddToCart(skuId, quantity);
    }
    // Đóng drawer sau khi thêm vào giỏ hàng
    setIsAddCartOpen(false);
  };

  const handleAddToCartClick = () => {
    setIsBuyNowMode(false); // Normal add to cart mode
    setIsAddCartOpen(true);
  };

  const handleBuyNowClick = () => {
    setIsBuyNowMode(true); // Buy now mode
    setIsAddCartOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex items-center shadow-[0_-1px_4px_rgba(0,0,0,0.1)]">
        {/* Chat ngay */}
        <button
          onClick={onChat}
          className="flex flex-col items-center justify-center w-16 h-10 text-xs font-medium text-gray-600 hover:text-red-500 transition-colors"
        >
          <MessageCircle className="w-6 h-6 mb-0.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Thêm vào giỏ hàng */}
        <button
          onClick={handleAddToCartClick}
          className="flex-1 h-10 w-24 rounded-none border-none text-red-600 hover:bg-red-50 text-base flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>

        {/* Mua ngay */}
        <button
          onClick={handleBuyNowClick}
          className="flex-1 h-10 rounded-none border-none bg-red-600 hover:bg-red-700 text-white font-medium text-base flex items-center justify-center transition-all"
        >
          Mua ngay
        </button>
      </div>

      {/* Add to Cart Drawer */}
      {product && (
        <AddCartMobile
          product={product}
          isOpen={isAddCartOpen}
          onOpenChange={setIsAddCartOpen}
          isBuyNowMode={isBuyNowMode}
          // onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}