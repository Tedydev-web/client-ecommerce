'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cartService } from '@/services/cartService';
import { Cart, CartItem, CartItemRequest, UpdateCartItemRequest, CartListResponse, ShopCart } from '@/types/cart.interface';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface UseCartOptions {
  /**
   * Xác định liệu giỏ hàng có nên được tải tự động khi hook được khởi tạo
   * @default false
   */
  autoFetch?: boolean;
}

/**
 * Custom hook để xử lý logic giỏ hàng - có thể sử dụng ở bất kỳ đâu trong ứng dụng
 */
export const useCart = (options: UseCartOptions = { autoFetch: false }) => {
  const [shopCarts, setShopCarts] = useState<ShopCart[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { isAuthenticated } = useAuthGuard({ silentCheck: true });

  // Chuyển đổi dữ liệu từ API thành cart object trong client
  const transformCartData = useCallback((data: ShopCart[]): Cart => {
    let totalItems = 0;
    let totalPrice = 0;
    let totalSelectedItems = 0;
    let totalSelectedPrice = 0;

    data.forEach(shopCart => {
      shopCart.cartItems.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.sku.price * item.quantity;

        if (item.isSelected) {
          totalSelectedItems += item.quantity;
          totalSelectedPrice += item.sku.price * item.quantity;
        }
      });
    });

    return {
      shops: data,
      totalItems,
      totalPrice,
      totalSelectedItems,
      totalSelectedPrice,
    };
  }, []);

  // Lấy thông tin giỏ hàng - có thể gọi từ bất kỳ component nào
  const fetchCart = useCallback(async (params?: string) => {
    // Kiểm tra authentication trước khi fetch
    if (!isAuthenticated) {
      setShopCarts([]);
      setCart(null);
      return null;
    }

    try {
      setIsLoading(true);
      // Tạo params object với limit 200 để hiển thị tất cả items trong cart
      const queryParams = params ? JSON.parse(params) : {};
      const finalParams = { limit: 500, ...queryParams };
      
      const response = await cartService.getCart(finalParams);
      
      if (response.data && Array.isArray(response.data)) {
        setShopCarts(response.data as ShopCart[]);
        const transformedCart = transformCartData(response.data as ShopCart[]);
        setCart(transformedCart);
      } else if (response.data as CartListResponse) {
        const cartData = (response.data as CartListResponse).data;
        setShopCarts(cartData);
        const transformedCart = transformCartData(cartData);
        setCart(transformedCart);
      }
      
      return response;
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.';
      toast.error(errorMessage);
      setShopCarts([]);
      setCart(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, transformCartData]);



  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(async (data: CartItemRequest, showNotification: boolean = true) => {
    try {
      setIsUpdating(true);
      const response = await cartService.addToCart(data);
      
      // Cập nhật lại giỏ hàng sau khi thêm thành công
      await fetchCart();
      
      if (showNotification) {
        const successMessage = response.message || 'Đã thêm sản phẩm vào giỏ hàng.';
        toast.success(successMessage);
      }
      
      // Return the cart item ID from the API response
      // Handle both possible response structures
      let cartItemId: string | null = null;
      if (response.data) {
        if ('id' in response.data) {
          // Direct CartItem structure
          cartItemId = response.data.id;
        } else if ('cartItem' in response.data && response.data.cartItem) {
          // Nested structure
          cartItemId = response.data.cartItem.id;
        }
      }
      
      return cartItemId || true;
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      if (showNotification) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.';
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchCart]);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartItem = useCallback(async (itemId: string, data: UpdateCartItemRequest, showNotification: boolean = false) => {
    try {
      setIsUpdating(true);
      const response = await cartService.updateCartItem(itemId, data);

      // Cập nhật UI trực tiếp từ response để đảm bảo dữ liệu mới nhất
      if (response.data) {
        const cartData = (response.data as CartListResponse).data || response.data;
        if (Array.isArray(cartData)) {
          setShopCarts(cartData);
          const transformedCart = transformCartData(cartData);
          setCart(transformedCart);
        } else {
          // Fallback nếu response không đúng định dạng
          await fetchCart();
        }
      } else {
        await fetchCart();
      }
      
      if (showNotification) {
        const successMessage = response.message || 'Cập nhật giỏ hàng thành công';
        toast.success(successMessage);
      }
      return response;
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      if (showNotification) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại sau.';
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchCart, transformCartData]);

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItems = useCallback(async (cartItemIds: string[], showNotification: boolean = true) => {
    try {
      setIsUpdating(true);
      const response = await cartService.deleteCartItems({ cartItemIds });
      
      // Cập nhật lại giỏ hàng sau khi xóa thành công
      await fetchCart();
      
      if (showNotification) {
        const successMessage = response.message || 'Đã xóa sản phẩm khỏi giỏ hàng.';
        toast.success(successMessage);
      }
      return true;
    } catch (error: any) {
      console.error('Error removing items from cart:', error);
      if (showNotification) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchCart]);

  // Chọn tất cả sản phẩm
  const selectAllItems = useCallback(async (isSelected: boolean, showNotification: boolean = false) => {
    try {
      setIsUpdating(true);
      const response = await cartService.selectAllItems(isSelected);
      
      // Cập nhật lại giỏ hàng sau khi chọn/bỏ chọn tất cả
      await fetchCart();
      
      if (showNotification) {
        const successMessage = response.message || `Đã ${isSelected ? 'chọn' : 'bỏ chọn'} tất cả sản phẩm`;
        toast.success(successMessage);
      }
      return true;
    } catch (error: any) {
      console.error('Error selecting all items:', error);
      if (showNotification) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái chọn. Vui lòng thử lại sau.';
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchCart]);

  // Tính tổng tiền cho các sản phẩm đã chọn
  const calculateSelectedTotal = useCallback((): { items: number; price: number } => {
    if (!cart || !cart.shops || cart.shops.length === 0) {
      return { items: 0, price: 0 };
    }

    // Sử dụng giá trị đã được tính toán sẵn trong cart object
    return {
      items: cart.totalSelectedItems,
      price: cart.totalSelectedPrice
    };
  }, [cart]);

  // Tính toán các thông tin chi tiết về giỏ hàng
  const getCartDetails = useCallback(() => {
    if (!cart) {
      return {
        isEmpty: true,
        totalItems: 0,
        totalShops: 0,
        totalPrice: 0,
        selectedItems: 0,
        selectedPrice: 0
      };
    }

    return {
      isEmpty: cart.totalItems === 0,
      totalItems: cart.totalItems,
      totalShops: cart.shops.length,
      totalPrice: cart.totalPrice,
      selectedItems: cart.totalSelectedItems,
      selectedPrice: cart.totalSelectedPrice
    };
  }, [cart]);

  // Lấy thông tin giỏ hàng khi component được mount (nếu autoFetch = true và đã đăng nhập)
  useEffect(() => {
    if (options.autoFetch && isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, options.autoFetch, isAuthenticated]);

  // Cập nhật số lượng của một item trong giỏ hàng
  const updateItemQuantity = useCallback(async (itemId: string, skuId: string, quantity: number) => {
    return await updateCartItem(itemId, { skuId, quantity });
  }, [updateCartItem]);

  return {
    // State
    cart,
    shopCarts,
    isLoading,
    isUpdating,
    isAuthenticated,
    
    // Actions
    fetchCart,
    addToCart,
    updateCartItem,
    removeItems,
    selectAllItems,
    updateItemQuantity,
    
    // Helpers
    calculateSelectedTotal,
    getCartDetails
  };
};
