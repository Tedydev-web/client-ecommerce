"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ListFilter, 
  MapPin, 
  Truck, 
  Store, 
  X, 
  ChevronDown 
} from "lucide-react";
import { useSidebar } from '../hooks/useSidebar';
import { createCategorySlug } from "@/utils/slugify";
import Link from "next/link";

// Dữ liệu tĩnh cho các bộ lọc
const locations = ['Đồng Nai', 'TP. Hồ Chí Minh', 'Bình Dương', 'Bà Rịa - Vũng Tàu'];
const shippingOptions = ['Nhanh', 'Tiết Kiệm'];
const brands = ['Nike', 'Adidas', 'Uniqlo', 'Zara', 'H&M'];

interface SearchSidebarProps {
  categoryIds?: string[];
  currentCategoryId?: string | null;
}

export default function SearchSidebar({ categoryIds = [], currentCategoryId }: SearchSidebarProps) {
  // Sử dụng custom hook để xử lý tất cả logic
  const { 
    parentCategory,
    selectedCategory,
    subcategories,
    loadingSubcategories,
    selectedFilters,
    setSelectedFilters,
    handleCategorySelect,
    handleCheckboxChange,
    handleClearAll
  } = useSidebar({ categoryIds, currentCategoryId });
  
  return (
    <aside className="w-64 shrink-0 space-y-6 text-sm">
      <CategorySectionWithParent 
        title="Theo Danh Mục"
        icon={<ListFilter className="h-4 w-4" />}
        parentCategory={parentCategory?.label || "Tất cả danh mục"}
        parentCategoryId={parentCategory?.value || ""}
        items={subcategories.map(cat => cat.label)}
        itemIds={subcategories.map(cat => cat.value)}
        subcategories={subcategories}
        selectedValue={selectedCategory}
        onParentSelect={(id, name) => handleCategorySelect(id, name, true)}
        onChildSelect={(id, name) => handleCategorySelect(id, name, false)}
        isLoading={loadingSubcategories}
      />
      <Separator className="my-4" />
      {/* <CheckboxFilterSection 
        title="Nơi Bán" 
        icon={<MapPin className="h-4 w-4" />}
        items={locations} 
        selectedItems={selectedFilters.locations}
        onCheckChange={(item, checked) => handleCheckboxChange('locations', item, checked)}
      />
      <Separator className="my-4" />
      <CheckboxFilterSection    
        title="Thương Hiệu" 
        icon={<Store className="h-4 w-4" />}
        items={brands}
        selectedItems={selectedFilters.brands}
        onCheckChange={(item, checked) => handleCheckboxChange('brands', item, checked)}
      />
      <Separator className="my-4" />
      <CheckboxFilterSection 
        title="Đơn Vị Vận Chuyển" 
        icon={<Truck className="h-4 w-4" />}
        items={shippingOptions}
        selectedItems={selectedFilters.shipping}
        onCheckChange={(item, checked) => handleCheckboxChange('shipping', item, checked)}
      />
      <Separator className="my-4" />
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
          onClick={handleClearAll}
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Xóa tất cả
        </Button>
      </div> */}
    </aside>
  );
}

interface CategoryOption {
  value: string;
  label: string;
  icon?: string | null;
  parentCategoryId?: string | null;
}

function CategorySectionWithParent({ 
  title, 
  icon,
  parentCategory, 
  parentCategoryId,
  items,
  itemIds,
  subcategories,
  selectedValue,
  onParentSelect,
  onChildSelect,
  isLoading,
}: { 
  title: string; 
  icon?: React.ReactNode;
  parentCategory: string;
  parentCategoryId: string;
  items: string[];
  itemIds: string[];
  subcategories?: CategoryOption[];
  selectedValue: string;
  onParentSelect: (id: string, name: string) => void;
  onChildSelect: (id: string, name: string) => void;
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = items.length <= 5 ? items : (expanded ? items : items.slice(0, 5));
  const displayItemIds = items.length <= 5 ? itemIds : (expanded ? itemIds : itemIds.slice(0, 5));
  
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
        {icon}
        {title}
      </h3>
      
      <div className="space-y-1">
        {/* Danh mục cha */}
        <div
          className={`px-3 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
            selectedValue === parentCategoryId ? "font-bold text-red-600" : "hover:bg-gray-50 font-medium"
          }`}
          onClick={() => onParentSelect(parentCategoryId, parentCategory)}
        >
          <Link href={createCategorySlug(parentCategory, [parentCategoryId])} className="block">
            <div className="flex items-center justify-between">
              <span>{parentCategory}</span>
              {selectedValue === parentCategoryId && <ChevronRight className="h-4 w-4 text-red-500" />}
            </div>
          </Link>
        </div>
        
        {/* Danh mục con */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-6 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {displayItems.map((item, index) => {
              const itemId = displayItemIds[index] || "";
              const category = subcategories?.[index];
              const parentId = category?.parentCategoryId || parentCategoryId;
              
              // Xây dựng categoryPath cho trường hợp search
              const categoryPath = parentId ? [parentId, itemId] : [itemId];
              const href = createCategorySlug(item, categoryPath);
              
              return (
                <div
                  key={item}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedValue === itemId
                      ? "bg-red-50 text-red-600" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onChildSelect(itemId, item)}
                >
                  <Link href={href} className="block">
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {selectedValue === itemId && <ChevronRight className="h-4 w-4 text-red-500" />}
                    </div>
                  </Link>
                </div>
              );
            })}
            
            {items.length > 5 && (
              <button 
                className="text-red-600 hover:text-red-800 text-sm font-medium mt-1 flex items-center"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
                <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckboxFilterSection({ 
  title, 
  icon,
  items, 
  selectedItems = [],
  onCheckChange 
}: { 
  title: string; 
  icon?: React.ReactNode;
  items: string[];
  selectedItems?: string[];
  onCheckChange?: (item: string, checked: boolean) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = selectedItems.includes(item);
          return (
            <div 
              key={item} 
              className="flex items-center space-x-2 px-1 py-0.5 rounded-sm transition-colors hover:bg-gray-50"
            >
              <Checkbox 
                id={`${title}-${item}`} 
                checked={isChecked}
                onCheckedChange={(checked) => onCheckChange?.(item, checked === true)}
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label 
                htmlFor={`${title}-${item}`} 
                className={`text-sm cursor-pointer w-full ${isChecked ? "text-red-600" : "font-normal"}`}
              >
                {item}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}