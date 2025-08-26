"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClientProduct,
  ClientSearchResultItem,
} from "@/types/client.products.interface";
import { clientProductsService } from "@/services/clientProductsService";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { PaginationRequest } from "@/types/base.interface";
import {ENUM} from "@/configs/common";

// Định nghĩa interface cho pagination để tránh lỗi undefined
interface PaginationData {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  [key: string]: any;
}

interface UseProductsProps {
  categoryId?: string | null;
  key?: string; // Key để force re-render khi cần thiết
  querySearch?: string; // Từ khóa tìm kiếm, nếu có
}

interface UseProductsReturn {
  products: ClientProduct[];
  metadata: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  pageLimit: number;
  handlePageChange: (page: number) => void;
  paginationData: {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useProducts({
  categoryId,
  key,
  querySearch,
}: UseProductsProps): UseProductsReturn {
  // Ghi log khi hook được gọi lại để debug
  // console.log("useProducts hook called with:", { categoryId, key });
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = querySearch || searchParams.get("q") || "";

  // Lấy thông tin phân trang từ URL parameters
  const initialPage = Number(searchParams.get("page") || 1);
  const initialLimit = Number(searchParams.get("limit") || 20); 

  // Sử dụng refs để theo dõi giá trị trước đó
  const prevCategoryIdRef = useRef<string | null | undefined>(categoryId);
  const prevSearchQueryRef = useRef<string>(searchQuery);
  const isFirstRenderRef = useRef<boolean>(true);
  const isUpdatingUrlRef = useRef<boolean>(false);

  const [prod, setProd] = useState<ClientProduct[]>([]);
  // Sử dụng hook useServerDataTable
  const {
    data: products,
    loading: isLoading,
    pagination: paginationRaw,
    handlePageChange: internalHandlePageChange,
    refreshData,
  } = useServerDataTable<ClientProduct | ClientSearchResultItem, ClientProduct>(
    {
      fetchData: async (params: PaginationRequest, signal?: AbortSignal) => {
        // Thêm các params đặc biệt
        console.log("Fetching products with params:", params);
        const apiParams: any = { ...params };

        // Logic phân biệt giữa category filter và search
        if (searchQuery && searchQuery.trim()) {
          // CÓ SEARCH QUERY -> Sử dụng Search API
          console.log("Using SEARCH API for query:", searchQuery);
          
          apiParams.q = searchQuery;
          
          // LUÔN sử dụng đúng timestamp từ URL để đảm bảo request khớp với URL hiện tại
          const urlTimestamp = searchParams.get("_t");
          if (urlTimestamp) {
            apiParams._t = urlTimestamp;
          }

          const searchResponse = await clientProductsService.searchProducts({
            search: searchQuery,
            ...apiParams
          });

          // Chuyển đổi dữ liệu từ search API sang định dạng tương thích với ClientProduct
          const convertedData = searchResponse.data.map((item) => ({ 
            id: item.productId,
            name: item.productName,
            description: item.productDescription || "",
            basePrice: item.skuPrice || 0,
            virtualPrice: item.skuPrice || 0,
            brandId: item.brandId || "",
            images: item.productImages || [],
            variants: item.variants || [],
            productTranslations: [],
            publishedAt: item.createdAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdById: 0,
            updatedById: null,
            deletedById: null,
            deletedAt: null,
            isPublished: true,
            brandName: item.brandName || "",
            categories:
              item.categoryIds?.map((id, index) => ({
                id,
                name: item.categoryNames?.[index] || "",
              })) || [],
          })) as unknown as ClientProduct[];

          console.log("Search API response:", {
            itemCount: convertedData.length,
            metadata: searchResponse.metadata,
          });

          setProd(convertedData);

          return searchResponse.success && {
            statusCode: searchResponse.statusCode,
            message: searchResponse.message,
            products: convertedData,
            metadata: searchResponse.metadata,
          };
        } else {
          // KHÔNG CÓ SEARCH QUERY -> Sử dụng Products API
          console.log("Using PRODUCTS API");
          
          if (categoryId) {
            // Có categoryId từ URL slug có -cat.
            apiParams.categories = categoryId;
            console.log("Filtering by categories:", categoryId);
          }

          // Gọi Products API thay vì Search API
          const productsResponse = await clientProductsService.getProducts(apiParams);
          
          console.log("Products API response:", {
            itemCount: productsResponse.data?.length || 0,
            metadata: productsResponse.metadata,
          });

          setProd(productsResponse.data || []);

          return productsResponse;
        }
      },
      getResponseData: (response: any) => response.data || [],
      getResponseMetadata: (response: any) => response.metadata,
      defaultLimit: initialLimit,
      requestConfig: {
        includeSearch: false,
        includeSort: true,
        includeCreatedById: false,
      },
    });

  // Đảm bảo pagination không bao giờ undefined bằng cách tạo object mới với giá trị mặc định
  const pagination: PaginationData = {
    totalItems: paginationRaw?.totalItems || 0,
    page: paginationRaw?.page || initialPage,
    limit: paginationRaw?.limit || initialLimit,
    totalPages: paginationRaw?.totalPages || 1,
    hasNext: paginationRaw?.hasNext || false,
    hasPrevious: paginationRaw?.hasPrevious || false,
  };

  // Đặt trang ban đầu khi component mount
  useEffect(() => {
    if (initialPage > 1) {
      internalHandlePageChange(initialPage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ghi đè handlePageChange để cập nhật URL
  const handlePageChange = (page: number): void => {
    if (page === pagination.page) return; // Nếu trang không thay đổi, không làm gì

    // Set flag để biết là đang update URL
    isUpdatingUrlRef.current = true;

    // Gọi logic internal trước
    internalHandlePageChange(page);

    // Cập nhật URL với tham số page mới
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());

    const pathname = window.location.pathname;
    const queryString = newParams.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newPath);
  };

  // Sử dụng ref để theo dõi timestamp hiện tại để tránh vòng lặp
  const currentTimestampRef = useRef<string | null>(null);

  // Force refresh data khi URL thay đổi và khi categoryId hoặc searchQuery thay đổi
  useEffect(() => {
    // Bỏ qua lần render đầu tiên (chỉ để tránh refresh không cần thiết khi mount)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      // Nếu có search query hoặc timestamp từ URL ngay từ đầu, vẫn cần refreshData
      if (searchQuery || searchParams.get("_t")) {
        console.log("Initial data load with search or timestamp:", {
          searchQuery,
          timestamp: searchParams.get("_t"),
        });
        refreshData();
      }
      return;
    }

    // Kiểm tra xem categoryId hoặc searchQuery có thay đổi không
    const categoryIdChanged = categoryId !== prevCategoryIdRef.current;
    const searchQueryChanged = searchQuery !== prevSearchQueryRef.current;

    // Kiểm tra timestamp trong URL để force refresh khi cần thiết
    const timestamp = searchParams.get("_t");

    // Chỉ coi là timestamp trigger nếu timestamp thay đổi so với lần trước
    const timestampChanged = timestamp !== currentTimestampRef.current;
    const hasTimestampTrigger = !!timestamp && timestampChanged;

    console.log("Change detection:", {
      categoryIdChanged,
      searchQueryChanged,
      hasTimestampTrigger,
      timestamp,
      currentTimestamp: currentTimestampRef.current,
    });

    // Cập nhật timestamp ref để tránh vòng lặp
    if (timestamp) {
      currentTimestampRef.current = timestamp;
    }

    // Force refresh data khi URL chứa search query thay đổi hoặc có timestamp trigger
    if (categoryIdChanged || searchQueryChanged || hasTimestampTrigger) {
      console.log("Data refresh triggered:", {
        categoryId,
        searchQuery,
        hasTimestampTrigger,
        timestampChanged,
      });

      // Cập nhật refs trước khi gọi refreshData để tránh vòng lặp
      prevCategoryIdRef.current = categoryId;
      prevSearchQueryRef.current = searchQuery;

      // Gọi hàm refreshData để lấy dữ liệu mới từ API và reset về trang 1
      refreshData();
      internalHandlePageChange(1);

      // Cập nhật URL với page=1 nếu đang không trong quá trình update URL từ các nơi khác
      // Và không cập nhật URL nếu trigger là từ timestamp (để tránh vòng lặp)
      if (!isUpdatingUrlRef.current && !hasTimestampTrigger) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", "1");
        const pathname = window.location.pathname;
        const queryString = newParams.toString();
        const newPath = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newPath);
      }

      // Reset flag
      isUpdatingUrlRef.current = false;
    }
  }, [
    categoryId,
    searchQuery,
    internalHandlePageChange,
    router,
    searchParams,
    refreshData,
  ]);

  // Tạo dữ liệu phân trang để trả về
  const paginationData = useMemo(
    () => ({
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNext,
      hasPrevPage: pagination.hasPrevious || pagination.page > 1,
    }),
    [pagination]
  );

  return {
    products: prod || [],
    metadata: {
      totalItems: pagination.totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrevious,
    },
    isLoading,
    isError: false,
    error: null,
    currentPage: pagination.page,
    pageLimit: pagination.limit,
    handlePageChange,
    paginationData,
  };
}
