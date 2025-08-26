'use client';
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { clientProductsService } from '@/services/clientProductsService';
import { extractProductId } from './shared/productSlug';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ProductPageDynamic = dynamic(
  () => import("./products-Index").then(mod => mod.ProductPage),
  { ssr: false }
);

interface ProductWrapperProps {
  slug: string;
  initialData?: any;
  error?: any;
}

export default function ProductPageWrapper({ slug, initialData, error: serverError }: ProductWrapperProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(serverError);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(!!serverError);
  const router = useRouter();

  // Gọi API 1 lần để cập nhật stock khi component mount
  useEffect(() => {
    if (initialData) {
      const refreshProductData = async () => {
        try {
          const productId = extractProductId(slug);
          const freshData = await clientProductsService.getProductDetail(productId);
          setData(freshData);
        } catch (err) {
          console.error('Error refreshing product data:', err);
          // Không set error để không ảnh hưởng UI
        }
      };

      refreshProductData();
    }
  }, [slug, initialData]);

  // Auto-retry mechanism mỗi 8 giây khi có lỗi
  useEffect(() => {
    if (!error || !autoRetryEnabled) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRetry();
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [error, autoRetryEnabled]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const productId = extractProductId(slug);
      const productData = await clientProductsService.getProductDetail(productId);
      setData(productData);
      setError(null);
      setAutoRetryEnabled(false);
    } catch (err) {
      console.error('Retry failed:', err);
      setError(err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualRetry = () => {
    setAutoRetryEnabled(false);
    handleRetry();
  };

  const goHome = () => {
    router.push('/');
  };

  // Hiển thị error UI nếu có lỗi từ server và chưa có data
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Không thể tải sản phẩm
              </h2>
              <p className="text-gray-600 mb-2">Đã xảy ra lỗi khi tải thông tin sản phẩm.</p>
              <p className="text-sm text-gray-500">
                {error?.message || 'Vui lòng thử lại sau ít phút.'}
              </p>
            </div>

            {autoRetryEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    Tự động thử lại sau {countdown} giây
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="w-full"
                variant="default"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang thử lại...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Thử lại ngay
                  </>
                )}
              </Button>

              <Button 
                onClick={goHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>

              {autoRetryEnabled && (
                <Button 
                  onClick={() => setAutoRetryEnabled(false)}
                  variant="ghost"
                  className="w-full text-gray-500"
                  size="sm"
                >
                  Tắt tự động thử lại
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProductPageDynamic slug={slug} initialData={data} error={error} />;
}
