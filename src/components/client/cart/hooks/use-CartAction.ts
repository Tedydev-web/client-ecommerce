import { useState, useCallback } from 'react';
import { productsService } from '@/services/productsService';
import { clientProductsService } from '@/services/clientProductsService'
import { ProductDetail } from '@/types/products.interface';
import { ClientProductDetail } from '@/types/client.products.interface';

export const useCartAction = () => {
  const [productDetails, setProductDetails] = useState<ClientProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = useCallback(async (productId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await clientProductsService.getProductDetail(productId);
      setProductDetails(details);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setError('Không thể tải chi tiết sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    productDetails,
    isLoading,
    error,
    fetchProductDetails,
  };
};
