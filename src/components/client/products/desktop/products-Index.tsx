"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import ProductGallery from "./products-Gallery";
import ProductInfo from "./products-Info";
import ProductSpecs from "./products-Spec";
import ProductShopInfo from "../products-ShopInfo";
import ProductReviews from "../products-Reviews";
import ProductSuggestions from "./products-Suggestion";
import { productMock } from "./mockData";
import { slugify } from "@/utils/slugify";
import { ClientProductDetail } from "@/types/client.products.interface";
import { MediaItem, transformProductImagesToMedia } from "../shared/productTransformers";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

interface Props {
  slug: string;
  product?: ClientProductDetail | null;
  isLoading?: boolean;
}

export default function ProductDetail({ slug, product: productData, isLoading = false }: Props) {
  // Show loading state if needed
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }
  
  // Sử dụng real data hoặc fallback về mock data
  let productToUse;
  let media: MediaItem[];
  
  if (productData) {
    // Case 1: Có real data từ API
    productToUse = productData;
    // Biến đổi images từ API thành media format
    media = transformProductImagesToMedia(productData);
  } else {
    // Case 2: Sử dụng mock data
    productToUse = productMock;
    // Chuyển đổi mock data media sang đúng kiểu MediaItem
    media = (productMock.media || []).map(item => ({
      type: item.type === "video" ? "video" : "image",
      src: item.src
    })) as MediaItem[];
  }

  // Extract các variant để hiển thị
  const sizes =
    productToUse?.variants?.find((v: any) => v.value === "Kích thước")?.options || [];
  const colors =
    productToUse?.variants?.find((v: any) => v.value === "Màu sắc")?.options || [];
  
  // Tạo product object hoàn chỉnh cho UI
  const product = {
    ...productToUse,
    sizes,
    colors,
    media,
  };

  const category =
    product.categories && product.categories.length > 0
      ? product.categories[0]
      : null;

  const brand = product.brand?.name || "";

  return (
    <div className="bg-[#f5f5f5] py-4">
      {/* ✅ Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 mb-3">
        <Breadcrumb className="mb-3 flex flex-wrap items-center text-sm text-muted-foreground">
          <BreadcrumbItem className="flex items-center gap-1">
            <BreadcrumbLink asChild>
              <Link href="/" className="text-[#05a] hover:underline">
                Shopsifu
              </Link>
            </BreadcrumbLink>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </BreadcrumbItem>

          {category && (
            <BreadcrumbItem className="flex items-center gap-1">
              <BreadcrumbLink asChild>
                <Link
                  href={`/category/${slugify(category.name)}`}
                  className="text-[#05a] hover:underline"
                >
                  {category.name}
                </Link>
              </BreadcrumbLink>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </BreadcrumbItem>
          )}

          {brand && (
            <BreadcrumbItem className="flex items-center gap-1">
              <BreadcrumbLink asChild>
                <Link
                  href={`/brand/${slugify(brand)}`}
                  className="text-[#05a] hover:underline"
                >
                  {brand}
                </Link>
              </BreadcrumbLink>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </BreadcrumbItem>
          )}

          <BreadcrumbItem>
            <span className="text-foreground font-medium line-clamp-1">
              {product.name}
            </span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* ✅ Chi tiết sản phẩm */}
      <div className="max-w-[1200px] mx-auto bg-white p-4 rounded">
        <div className="grid md:grid-cols-[450px_1fr] gap-4 md:items-start">
          <div className="w-full">
            <ProductGallery media={product.media} />
          </div>
          <div className="w-full">
            <ProductInfo product={product as any} />
          </div>
        </div>

        {/* ✅ Block thông tin chi tiết riêng biệt */}
      </div>
      <div className="max-w-[1200px] mx-auto mt-6 rounded space-y-6">
        {/* ✅ Thông tin Shop */}
        {/* <div>
          <ProductShopInfo shop={{
            id: "cool-crew-12345",
            name: "Cool Crew",
            avatar: "/assets/demo/shop-avatar.png",
            isOnline: true,
            lastActive: "1 Giờ Trước",
            rating: 3.7,
            responseRate: 100,
            responseTime: "trong vài giờ",
            followers: 5500,
            joinedDate: "9 tháng trước",
            productsCount: 86
          }} />
        </div> */}

        {/* ✅ Thông số kỹ thuật */}
        <div>
          <ProductSpecs product={product as any} />
        </div>

        {/* ✅ Đánh giá */}
        <div>
          <ProductReviews productId={String(product.id)} />
        </div>

        {/* ✅ Gợi ý sản phẩm */}
        <div>
          <ProductSuggestions products={[]} />
        </div>
      </div>
    </div>
  );
}
