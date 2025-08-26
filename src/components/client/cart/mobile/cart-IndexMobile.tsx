"use client";

import { useCart } from "@/providers/CartContext";
import { Checkbox } from "@/components/ui/checkbox";
import MobileCartItem from "./cart-ItemsMobile";
import MobileCartHeader from "./cart-HeaderMobile";
import MobileCartFooter from "./cart-FooterMobile";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { CartItem, ShopCart } from "@/types/cart.interface";
import { PiStorefrontLight } from "react-icons/pi";
import { ProductInfo } from "@/types/order.interface";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  setShopOrders,
  setCommonInfo,
  setShopProducts,
} from "@/store/features/checkout/ordersSilde";

export default function MobileCartIndex() {
  const { shopCarts, isLoading, updateCartItemAndRefresh, removeItems } =
    useCart();

  const [selectedShops, setSelectedShops] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectAll, setSelectAll] = useState(false);

  // ✅ Toggle tất cả
  const handleToggleAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);

    const updatedShops: Record<string, boolean> = {};
    const updatedItems: Record<string, boolean> = {};

    shopCarts.forEach((shopCart: ShopCart) => {
      updatedShops[shopCart.shop.id] = newValue;
      shopCart.cartItems.forEach((item: CartItem) => {
        updatedItems[item.id] = newValue;
      });
    });

    setSelectedShops(updatedShops);
    setSelectedItems(updatedItems);
  };

  // ✅ Toggle shop
  const handleToggleShop = (shopId: string, items: CartItem[]) => {
    const isChecked = !selectedShops[shopId];
    const updatedItems = { ...selectedItems };
    const updatedShops = { ...selectedShops, [shopId]: isChecked };

    items.forEach((item) => {
      updatedItems[item.id] = isChecked;
    });

    setSelectedShops(updatedShops);
    setSelectedItems(updatedItems);
  };

  // ✅ Toggle item
  const handleToggleItem = (
    shopId: string,
    itemId: string,
    shopItems: CartItem[]
  ) => {
    const newIsSelected = !selectedItems[itemId];
    const updatedItems = { ...selectedItems, [itemId]: newIsSelected };
    setSelectedItems(updatedItems);

    const allSelected = shopItems.every((item) => updatedItems[item.id]);
    setSelectedShops((prev) => ({ ...prev, [shopId]: allSelected }));
  };

  // ✅ Update số lượng
  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity > 0) {
      const itemToUpdate = shopCarts
        .flatMap((shop: ShopCart) => shop.cartItems)
        .find((item: CartItem) => item.id === itemId);

      if (itemToUpdate) {
        await updateCartItemAndRefresh(itemId, {
          quantity,
          skuId: itemToUpdate.sku.id,
        });
      }
    } else {
      await handleRemoveItem(itemId);
    }
  };

  // ✅ Thay đổi SKU
  const handleVariationChange = async (itemId: string, newSkuId: string) => {
    const item = shopCarts
      .flatMap((sc: ShopCart) => sc.cartItems)
      .find((item: CartItem) => item.id === itemId);
    if (item) {
      await updateCartItemAndRefresh(itemId, {
        skuId: newSkuId,
        quantity: item.quantity,
      });
    }
  };

  // ✅ Xóa 1 sản phẩm
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItems([itemId]);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // ✅ Xóa tất cả sản phẩm đã chọn
  const handleDeleteSelected = async () => {
    try {
      const selectedItemIds = Object.keys(selectedItems).filter(
        (itemId) => selectedItems[itemId]
      );

      if (selectedItemIds.length === 0) {
        toast.error("Vui lòng chọn sản phẩm để xóa");
        return;
      }

      await removeItems(selectedItemIds);
      setSelectedItems({});
      setSelectedShops({});
      setSelectAll(false);

      toast.success(`Đã xóa ${selectedItemIds.length} sản phẩm khỏi giỏ hàng`);
    } catch (error) {
      console.error("Error removing selected items:", error);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  // ✅ Tính toán footer
  const { total, totalSaved, selectedCount } = useMemo(() => {
    let currentTotal = 0;
    let currentTotalSaved = 0;
    let count = 0;

    shopCarts.forEach((shopCart: ShopCart) => {
      shopCart.cartItems.forEach((item: CartItem) => {
        if (selectedItems[item.id]) {
          const quantity = item.quantity;
          const price = item.sku.price || 0;
          const regularPrice = item.sku.product.virtualPrice || price;

          currentTotal += price * quantity;
          if (regularPrice > price) {
            currentTotalSaved += (regularPrice - price) * quantity;
          }
          count++;
        }
      });
    });

    return {
      total: currentTotal,
      totalSaved: currentTotalSaved,
      selectedCount: count,
    };
  }, [selectedItems, shopCarts]);

  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ Checkout
  const handleCheckout = () => {
    const selectedShopCarts = shopCarts
      .map((shopCart: ShopCart) => ({
        ...shopCart,
        cartItems: shopCart.cartItems.filter(
          (item: CartItem) => selectedItems[item.id]
        ),
      }))
      .filter((shopCart: ShopCart) => shopCart.cartItems.length > 0);

    if (selectedShopCarts.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }

    const shopOrdersPayload = selectedShopCarts.map((shopCart: ShopCart) => ({
      shopId: shopCart.shop.id,
      cartItemIds: shopCart.cartItems.map((item: CartItem) => item.id),
      discountCodes: [],
    }));

    const shopProductsPayload = selectedShopCarts.reduce(
      (acc: Record<string, ProductInfo[]>, shopCart: ShopCart) => {
        acc[shopCart.shop.id] = shopCart.cartItems.map((item: CartItem) => ({
          id: item.id,
          name: item.sku.product.name,
          image: item.sku.image,
          variation: item.sku.value,
          quantity: item.quantity,
          subtotal: item.sku.price * item.quantity,
          price: item.sku.price,
          shopName: shopCart.shop.name,
        }));
        return acc;
      },
      {}
    );

    const allCartItemIds = selectedShopCarts
      .flatMap((shopCart: ShopCart) =>
        shopCart.cartItems.map((item: CartItem) => item.id)
      )
      .join(",");

    dispatch(setShopOrders(shopOrdersPayload));
    dispatch(setShopProducts(shopProductsPayload));
    dispatch(
      setCommonInfo({ amount: total, receiver: null, paymentGateway: null })
    );

    router.push(`/checkout/${allCartItemIds}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <MobileCartHeader title="Giỏ hàng" />
      </div>

      <main className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : shopCarts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src="/images/empty-cart.png"
                alt="Empty Cart"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-500">Giỏ hàng của bạn còn trống</p>
          </div>
        ) : (
          <div className="pb-4">
            {shopCarts.map((shop: ShopCart) => (
              <div key={shop.shop.id} className="bg-white mb-2 shadow-sm">
                <div className="p-4 border-b flex items-center gap-3">
                  <Checkbox
                    checked={!!selectedShops[shop.shop.id]}
                    onCheckedChange={() =>
                      handleToggleShop(shop.shop.id, shop.cartItems)
                    }
                  />
                  <PiStorefrontLight className="h-5 w-5" />
                  <span className="text-base">Shop {shop.shop.name}</span>
                </div>
                <div>
                  {shop.cartItems.map((item: CartItem) => (
                    <MobileCartItem
                      key={item.id}
                      item={item}
                      selected={!!selectedItems[item.id]}
                      onToggle={() =>
                        handleToggleItem(shop.shop.id, item.id, shop.cartItems)
                      }
                      onRemove={() => handleRemoveItem(item.id)}
                      onQuantityChange={handleQuantityChange}
                      onVariationChange={handleVariationChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {!isLoading && shopCarts.length > 0 && (
        <MobileCartFooter
          total={total}
          totalSaved={totalSaved}
          selectedCount={selectedCount}
          allSelected={selectAll}
          onCheckout={handleCheckout}
          onDeleteSelected={handleDeleteSelected}
          onToggleAll={handleToggleAll}
        />
      )}
    </div>
  );
}
