// utils/slugify.ts

import { url } from "inspector";
import { ENUM } from "@/configs/common";

// Hàm slugify ban đầu (giữ nguyên)
export function slugify(str: string) {
  return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-"); // thay khoảng trắng bằng dấu -
}



// // Kiểm tra xem một slug có phải là slug danh mục không
export function isCategorySlug(slug: string): boolean {
  return slug.includes('-cat.');
}

// Cập nhật hàm tạo slug để hỗ trợ nhiều cấp danh mục (không hash)
export function createCategorySlug(name: string, ids: string[] | string | null | undefined) {
  // Tạo tên URL-friendly nhưng vẫn giữ nguyên chữ viết hoa và dấu
  const urlFriendlyName = name
    .trim()
    .replace(/\s+/g, '-');
  
  // Đảm bảo ids là mảng
  const idsArray = Array.isArray(ids) ? ids : (ids ? [ids] : []);
  
  // Tạo phần ID với format cat.ID1.ID2... (không hash)
  const idPart = idsArray.length > 0 ? `cat.${idsArray.join('.')}` : '';
  
  // Tạo slug theo format: /Tên-cat.Id1.Id2... (ID thật, không hash)
  return `/${urlFriendlyName}-${idPart}`;
}

// Cập nhật hàm trích xuất ID để trả về mảng các ID (không hash)
export function extractCategoryIds(slug: string): string[] {
  // Tìm kiếm pattern "-cat." và lấy tất cả các ID sau nó
  const matches = slug.match(/-cat\.([^/]+)$/);
  if (!matches || !matches[1]) return [];
  
  // Phân tách các ID bằng dấu chấm (ID thật, không cần decrypt)
  return matches[1].split('.');
}

// Hàm lấy ID cuối cùng (ID của danh mục hiện tại)
export function extractCurrentCategoryId(slug: string): string | null {
  const ids = extractCategoryIds(slug);
  return ids.length > 0 ? ids[ids.length - 1] : null;
}

// Hàm lấy ID cha (ID đầu tiên)
export function extractParentCategoryId(slug: string): string | null {
  const ids = extractCategoryIds(slug);
  return ids.length > 0 ? ids[0] : null;
}


/**
 * Tạo URL với search params
 * @param pathname - Đường dẫn cơ bản
 * @param params - URLSearchParams hoặc object chứa params
 * @returns URL đầy đủ với params
 */
export function createUrl(
  pathname: string,
  params: URLSearchParams | Record<string, string> = {}
) {
  const searchParams = params instanceof URLSearchParams
    ? params
    : new URLSearchParams(params);
  
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}



/**
 * Tạo slug sản phẩm từ tên và ID
 * Format: {tên-sản-phẩm}__{id}
 * Sử dụng "__" làm dấu phân tách giữa tên và ID để dễ dàng trích xuất ID UUID
 * Giữ nguyên dấu và chữ hoa, chỉ thay khoảng trắng bằng dấu -
 * @param name Tên sản phẩm
 * @param id ID sản phẩm
 * @returns Slug đã được format
 */
export function createProductSlug(name: string, id: string | number): string {
  // Thay khoảng trắng bằng dấu gạch nối, giữ nguyên dấu và chữ hoa
  const nameSlug = name.trim().replace(/\s+/g, "-");
  // Mã hóa URL để xử lý các ký tự đặc biệt nhưng vẫn giữ nguyên dấu
  const encodedNameSlug = encodeURIComponent(nameSlug);
  return `${encodedNameSlug}__${id}`;
}


/**
 * Tạo URL cho trang chi tiết sản phẩm
 * @param name Tên sản phẩm
 * @param id ID sản phẩm
 * @returns URL đầy đủ đến trang chi tiết sản phẩm
 */
export function getProductUrl(name: string, id: string | number): string {
  return `/products/${createProductSlug(name, id)}`;
}
