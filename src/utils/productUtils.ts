import { ReactNode } from 'react';

/**
 * Interface cho một Variant từ API
 */
export interface VariantGroup {
  value: string;
  options: string[];
}

/**
 * Interface cho một SKU từ API
 */
export interface Sku {
  id: string;
  value: string;
  price: number;
  stock: number;
  image: string | null; // Allow image to be null to match SkuDetail type
  productId: string;
}

/**
 * Interface cho các lựa chọn variant của người dùng
 */
export type SelectedVariants = Record<string, string | null>;

/**
 * Tạo chuỗi value theo định dạng SKU từ các lựa chọn variant
 * Ví dụ: Từ { "Color": "Red", "Size": "L" } -> "L-Red" hoặc "Red-L"
 * Tự động thử cả hai thứ tự để match với SKU từ API
 */
export function createSkuValueFromSelectedVariants(
  selectedVariants: SelectedVariants,
  variantGroups: VariantGroup[]
): string[] {
  console.log('createSkuValueFromSelectedVariants called with:', { selectedVariants, variantGroups });
  
  // Kiểm tra xem đã chọn đủ tất cả variant chưa
  const allVariantsSelected = Object.values(selectedVariants).every(val => val !== null);
  
  if (!allVariantsSelected) {
    console.log('Not all variants selected, returning empty array');
    return [];
  }

  // Lấy tất cả các giá trị variant đã chọn theo thứ tự của variantGroups
  const selectedValues: string[] = [];
  
  if (variantGroups.length > 0) {
    // Sử dụng thứ tự của variantGroups nếu có
    variantGroups.forEach(group => {
      const value = selectedVariants[group.value];
      if (value) {
        selectedValues.push(value);
      }
    });
  } else {
    // Fallback: lấy tất cả values từ selectedVariants
    Object.values(selectedVariants).forEach(value => {
      if (value) {
        selectedValues.push(value);
      }
    });
  }

  console.log('Selected values:', selectedValues);

  if (selectedValues.length === 0) {
    return [];
  }

  if (selectedValues.length === 1) {
    return [selectedValues[0]];
  }

  // Tạo tất cả các kết hợp có thể của thứ tự variants
  const possibleCombinations: string[] = [];
  
  // Hàm tạo permutations
  function getPermutations(arr: string[]): string[][] {
    if (arr.length <= 1) return [arr];
    
    const result: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const perms = getPermutations(rest);
      for (const perm of perms) {
        result.push([arr[i], ...perm]);
      }
    }
    return result;
  }

  const permutations = getPermutations(selectedValues);
  console.log('Generated permutations:', permutations);
  
  // Tạo các format khác nhau cho mỗi permutation
  permutations.forEach(perm => {
    // Format 1: Liền nhau "A-B"
    possibleCombinations.push(perm.join('-'));
    // Format 2: Có khoảng trắng "A - B"
    possibleCombinations.push(perm.join(' - '));
  });

  console.log('Final possible combinations:', possibleCombinations);
  return possibleCombinations;
}

/**
 * Tìm SKU dựa trên các lựa chọn variant
 */
export function findMatchingSku(
  selectedVariants: SelectedVariants,
  skus: Sku[],
  variantGroups: VariantGroup[]
): Sku | null {
  console.log('findMatchingSku called with:', { selectedVariants, skus: skus.map(s => s.value), variantGroups });
  
  const possibleSkuValues = createSkuValueFromSelectedVariants(selectedVariants, variantGroups);
  
  if (possibleSkuValues.length === 0) {
    console.log('No possible SKU values generated');
    return null;
  }
  
  console.log('Possible SKU values to try:', possibleSkuValues);
  console.log('Available SKU values from API:', skus.map(s => s.value));
  
  // Thử match với tất cả các khả năng
  for (const skuValue of possibleSkuValues) {
    console.log(`Trying to match: "${skuValue}"`);
    
    // Normalize cả skuValue và sku.value để so sánh
    const normalizedSkuValue = skuValue.replace(/\s*-\s*/g, '-');
    console.log(`Normalized to: "${normalizedSkuValue}"`);
    
    const foundSku = skus.find(sku => {
      const normalizedApiValue = sku.value.replace(/\s*-\s*/g, '-');
      console.log(`Comparing "${normalizedSkuValue}" with "${normalizedApiValue}" (original: "${sku.value}")`);
      return normalizedApiValue === normalizedSkuValue;
    });
    
    if (foundSku) {
      console.log(`✅ Found matching SKU: ${foundSku.value} for selected variants:`, selectedVariants);
      return foundSku;
    }
  }
  
  console.log(`❌ No matching SKU found for variants:`, selectedVariants);
  console.log(`Tried combinations:`, possibleSkuValues);
  console.log(`Available SKUs:`, skus.map(s => s.value));
  
  return null;
}

/**
 * Kiểm tra xem một option có sẵn không dựa trên các lựa chọn hiện tại
 * và các SKU hiện có
 */
export function isOptionAvailable(
  variantType: string,
  option: string,
  selectedVariants: SelectedVariants,
  skus: Sku[],
  variantGroups: VariantGroup[] = []
): boolean {
  // Tạo một bản sao của selectedVariants với giả định rằng chọn option này
  const testVariants = { 
    ...selectedVariants, 
    [variantType]: option 
  };
  
  // Kiểm tra xem có variant nào chưa được chọn không
  const hasUnselectedVariants = Object.values(testVariants).some(val => val === null);
  
  if (hasUnselectedVariants) {
    // Nếu còn variant chưa chọn, chỉ cần kiểm tra xem option này có trong bất kỳ SKU nào không
    return skus.some(sku => sku.value.includes(option));
  } else {
    // Nếu đã chọn đủ tất cả variant, thử tìm SKU matching với variantGroups đúng
    const possibleSkuValues = createSkuValueFromSelectedVariants(testVariants, variantGroups);
    
    return possibleSkuValues.some(skuValue => {
      const normalizedSkuValue = skuValue.replace(/\s*-\s*/g, '-');
      return skus.some(sku => {
        const normalizedApiValue = sku.value.replace(/\s*-\s*/g, '-');
        return normalizedApiValue === normalizedSkuValue;
      });
    });
  }
}

/**
 * Tính tổng stock cho tất cả SKU
 */
export function getTotalStock(skus: Sku[]): number {
  return skus.reduce((sum, sku) => sum + sku.stock, 0);
}

/**
 * Lấy stock hiện tại dựa trên SKU đã chọn hoặc tổng stock
 */
export function getCurrentStock(
  selectedVariants: SelectedVariants,
  skus: Sku[],
  variantGroups: VariantGroup[]
): number {
  const currentSku = findMatchingSku(selectedVariants, skus, variantGroups);
  return currentSku ? currentSku.stock : getTotalStock(skus);
}

// /**
//  * Tạo thông báo về stock
//  */
// export function getStockMessage(stock: number): ReactNode {
//   if (stock <= 0) {
//     return <span className="text-red-500">Hết hàng</span>;
//   }
  
//   if (stock <= 5) {
//     return <span className="text-orange-500">Sắp hết hàng (còn {stock})</span>;
//   }
  
//   return <span>Còn {stock}</span>;
// }

/**
 * Kiểm tra xem tất cả các variants đã được chọn chưa
 */
export function areAllVariantsSelected(selectedVariants: SelectedVariants): boolean {
  return Object.keys(selectedVariants).length > 0 && 
    Object.values(selectedVariants).every(val => val !== null);
}

/**
 * Tìm giá của SKU tương ứng với các variant đã chọn
 */
export function findSelectedSkuPrice(
  selectedVariants: SelectedVariants,
  skus: Sku[],
  variantGroups: VariantGroup[],
  defaultPrice: number
): number {
  const sku = findMatchingSku(selectedVariants, skus, variantGroups);
  return sku ? sku.price : defaultPrice;
}

/**
 * Hàm xử lý thêm sản phẩm vào giỏ hàng
 * @param selectedVariants Các variant đã được người dùng chọn
 * @param skus Danh sách SKU của sản phẩm
 * @param variantGroups Danh sách nhóm variant của sản phẩm
 * @param quantity Số lượng sản phẩm cần thêm vào giỏ hàng
 * @param addToCartFn Hàm addToCart từ useCart hook
 * @returns Promise với cart item ID hoặc false nếu thất bại
 */
export async function handleAddToCart(
  selectedVariants: SelectedVariants,
  skus: Sku[],
  variantGroups: VariantGroup[],
  quantity: number,
  addToCartFn: (data: {skuId: string, quantity: number}, showNotification?: boolean) => Promise<string | boolean>
): Promise<string | false> {
  // Tìm SKU phù hợp với các lựa chọn variant
  const selectedSku = findMatchingSku(selectedVariants, skus, variantGroups);
  
  // Nếu không tìm thấy SKU phù hợp, trả về false
  if (!selectedSku) {
    console.error("Không tìm thấy SKU phù hợp với các lựa chọn");
    return false;
  }
  
  // Kiểm tra tồn kho
  if (selectedSku.stock <= 0) {
    console.error("Sản phẩm đã hết hàng");
    return false;
  }
  
  // Đảm bảo số lượng không vượt quá tồn kho
  const safeQuantity = Math.min(quantity, selectedSku.stock);
  
  // Gọi hàm addToCart từ hook useCart
  try {
    const result = await addToCartFn({
      skuId: selectedSku.id,
      quantity: safeQuantity
    }, true); // true để hiển thị thông báo
    
    // Return cart item ID if available, otherwise false
    return typeof result === 'string' ? result : false;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    return false;
  }
}
