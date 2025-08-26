import { publicAxios, privateAxios } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/api";
import { 
  CartResponse,
  CartItemRequest,
  UpdateCartItemRequest,
  DeleteCartRequest
} from "@/types/cart.interface";

/**
 * Service xử lý các thao tác với giỏ hàng
 */
export const cartService = {
  /**
   * Lấy thông tin giỏ hàng của người dùng hiện tại
   * @param params Query parameters (có thể bao gồm limit, page, etc.)
   * @returns Promise với thông tin giỏ hàng
   */
  getCart: async (params?: { limit?: number; page?: number; [key: string]: any }): Promise<CartResponse> => {
    try {
      const response = await privateAxios.get(API_ENDPOINTS.CART.GET_CART, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param data Thông tin sản phẩm cần thêm (skuId và quantity)
   * @returns Promise với thông tin giỏ hàng đã cập nhật
   */
  addToCart: async (data: CartItemRequest): Promise<CartResponse> => {
    try {
      const response = await privateAxios.post(API_ENDPOINTS.CART.ADD_TO_CART, data);
      return response.data;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một sản phẩm trong giỏ hàng
   * @param itemId ID của item cần cập nhật
   * @param data Thông tin cần cập nhật (số lượng hoặc trạng thái chọn)
   * @returns Promise với thông tin giỏ hàng đã cập nhật
   */
  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<CartResponse> => {
    try {
      const url = API_ENDPOINTS.CART.UPDATE_CART_ITEM.replace(":id", itemId);
      const response = await privateAxios.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating cart item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một hoặc nhiều sản phẩm khỏi giỏ hàng
   * @param data Danh sách ID của các item cần xóa
   * @returns Promise với thông tin giỏ hàng đã cập nhật
   */
  deleteCartItems: async (data: DeleteCartRequest): Promise<CartResponse> => {
    try {
      const response = await privateAxios.post(API_ENDPOINTS.CART.DELETE_CART, data);
      return response.data;
    } catch (error) {
      console.error("Error deleting items from cart:", error);
      throw error;
    }
  },
  
  /**
   * Chọn tất cả các sản phẩm trong giỏ hàng
   * @param isSelected Trạng thái chọn (true/false)
   * @returns Promise với thông tin giỏ hàng đã cập nhật
   */
  selectAllItems: async (isSelected: boolean): Promise<CartResponse> => {
    try {
      const response = await privateAxios.patch(API_ENDPOINTS.CART.GET_CART, { isSelected });
      return response.data;
    } catch (error) {
      console.error("Error selecting all items:", error);
      throw error;
    }
  }
};