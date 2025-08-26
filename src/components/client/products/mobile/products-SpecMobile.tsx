"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { slugify } from "@/utils/slugify";
import HTMLPreview from "@/components/ui/component/html-preview";

interface Product {
  weight?: string;
  description?: string; // HTML Markdown content
  categories?: {
    id: string;
    name: string;
    parentCategoryId: string | null;
  }[];
  brand?: {
    id: string;
    name: string;
  };
  series?: string;
  skus?: {
    id: string;
    value: string;
    stock: number;
  }[];
  material?: string;
  origin?: string;
  warrantyType?: string;
  warrantyTime?: string;
  stock?: number;
  shipFrom?: string;
  name?: string;
  specifications?: {
    name: string;
    value: string;
  }[];
}

export default function ProductSpecsMobile({ product }: { product: Product }) {
  // Xử lý hiển thị danh mục sản phẩm với các liên kết
  const renderCategoryLinks = () => {
    if (!product.categories || product.categories.length === 0) return "Đang cập nhật";
    
    return (
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {product.categories.map((category, index) => (
          <Link 
            key={category.id}
            href={`/category/${slugify(category.name)}`}
            className="text-[#05a] flex items-center"
          >
            {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
            {category.name}
          </Link>
        ))}
      </div>
    );
  };  

  return (
    <div className="bg-white p-4 mt-2 rounded-sm">
      <h2 className="text-sm font-semibold mb-3">CHI TIẾT SẢN PHẨM</h2>
      <div className="text-xs space-y-2.5 mb-4">
        {/* Danh mục */}
        <div className="flex">
          <div className="w-1/3 text-muted-foreground">Danh mục</div>
          <div className="flex-1">{renderCategoryLinks()}</div>
        </div>
        
        <SpecRowMobile label="Thương hiệu" value={product.brand?.name} />
        <SpecRowMobile label="Dòng sản phẩm" value={product.series ?? product.name} />
        {/* <SpecRowMobile label="SKU" value={product.sku} />
        <SpecRowMobile label="Chất liệu" value={product.material} />
        <SpecRowMobile label="Xuất xứ" value={product.origin} />
        <SpecRowMobile label="Loại bảo hành" value={product.warrantyType} />
        <SpecRowMobile label="Thời gian bảo hành" value={product.warrantyTime} />
        <SpecRowMobile label="Kho hàng" value={product.stock?.toString()} />
        <SpecRowMobile label="Gửi từ" value={product.shipFrom} />
        <SpecRowMobile label="Trọng lượng" value={product.weight} /> */}
        
        {/* Dynamic specifications */}
        {product.specifications?.map((specification) => (
          <SpecRowMobile
            key={specification.name}
            label={specification.name}
            value={specification.value}
          />
        ))}
      </div>
      
      {/* Mô tả sản phẩm */}
      {product.description && (
        <div className="mt-2 pt-3 border-t">
          <h3 className="text-sm font-semibold mb-2">MÔ TẢ SẢN PHẨM</h3>
          <div className="text-xs">
            <HTMLPreview
            content={product.description.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="font-medium">$1</span>')}
          />
          </div>
        </div>
      )}
    </div>
  );
}

function SpecRowMobile({ label, value }: { label: string; value?: string | React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-1/3 text-muted-foreground">{label}</div>
      <div className="flex-1">{value ?? "Đang cập nhật"}</div>
    </div>
  );
}