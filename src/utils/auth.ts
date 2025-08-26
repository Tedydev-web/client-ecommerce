import { useUserData } from '@/hooks/useGetData-UserLogin';
import { 
  ADMIN_ONLY_ROUTES, 
  SELLER_ALLOWED_ROUTES,
  ALL_ADMIN_ROUTES,
  CLIENT_ONLY_ROUTES 
} from '@/constants/route';

/**
 * Utility functions để check role và permissions
 */

// Type definitions cho roles
export type UserRole = 'ADMIN' | 'SELLER' | 'CLIENT' | 'CUSTOMER' | string;

/**
 * Custom hooks để check role của user hiện tại
 */
export const useRoleCheck = () => {
  const userData = useUserData();
  const currentRole = userData?.role?.name?.toUpperCase() || '';

  const isAdmin = currentRole === 'ADMIN';
  const isSeller = currentRole === 'SELLER';
  const isClient = currentRole === 'CLIENT' || currentRole === 'CUSTOMER';
  const isAuthenticated = !!userData;

  // Check if user can access admin routes
  const canAccessAdmin = isAdmin || isSeller;

  // Check specific permissions
  const hasPermission = (permission: string): boolean => {
    // ADMIN có tất cả quyền
    if (isAdmin) return true;
    
    // SELLER có quyền hạn hẹp hơn
    if (isSeller) {
      const sellerPermissions = [
        'view_dashboard',
        'manage_products', 
        'manage_orders',
        'manage_brands',
        'manage_categories',
        'manage_vouchers'
      ];
      return sellerPermissions.includes(permission);
    }
    
    // CLIENT chỉ có quyền cơ bản
    if (isClient) {
      const clientPermissions = [
        'view_products',
        'manage_cart',
        'place_orders',
        'view_profile'
      ];
      return clientPermissions.includes(permission);
    }
    
    return false;
  };

  return {
    userData,
    currentRole,
    isAdmin,
    isSeller, 
    isClient,
    isAuthenticated,
    canAccessAdmin,
    hasPermission
  };
};

/**
 * Check if a role can access a specific route
 */
export const canRoleAccessRoute = (role: string, pathname: string): boolean => {
  const normalizedRole = role?.toUpperCase() || '';
  
  // ADMIN có thể truy cập tất cả routes
  if (normalizedRole === 'ADMIN') {
    return true;
  }
  
  // SELLER chỉ được truy cập routes được phép
  if (normalizedRole === 'SELLER') {
    return SELLER_ALLOWED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route)
    );
  }
  
  // CLIENT không được truy cập admin routes
  if (normalizedRole === 'CLIENT' || normalizedRole === 'CUSTOMER') {
    // Không được truy cập bất kỳ admin route nào
    if (pathname.startsWith('/admin')) {
      return false;
    }
    return true; // Được truy cập các route khác
  }
  
  return false;
};

/**
 * Get accessible routes for a specific role
 */
export const getAccessibleRoutes = (role: string): string[] => {
  const normalizedRole = role?.toUpperCase() || '';
  
  switch (normalizedRole) {
    case 'ADMIN':
      return [...ALL_ADMIN_ROUTES];
    case 'SELLER':
      return [...SELLER_ALLOWED_ROUTES];
    case 'CLIENT':
    case 'CUSTOMER':
      return [...CLIENT_ONLY_ROUTES];
    default:
      return [];
  }
};

/**
 * Check if user has permission to view UI elements
 */
export const useUIPermissions = () => {
  const { isAdmin, isSeller, isClient, currentRole } = useRoleCheck();
  
  return {
    // Button permissions
    canCreateProduct: isAdmin || isSeller,
    canDeleteProduct: isAdmin,
    canEditProduct: isAdmin || isSeller,
    canManageUsers: isAdmin,
    canManageRoles: isAdmin,
    canViewOrders: isAdmin || isSeller,
    canManageSettings: isAdmin,
    canAccessAnalytics: isAdmin || isSeller,
    
    // Menu permissions
    showAdminMenu: isAdmin || isSeller,
    showUserManagement: isAdmin,
    showSystemSettings: isAdmin,
    showProductManagement: isAdmin || isSeller,
    showOrderManagement: isAdmin || isSeller,
    
    // Feature permissions
    canExportData: isAdmin,
    canImportData: isAdmin,
    canManagePermissions: isAdmin,
    canViewAuditLogs: isAdmin,
    
    // Role info
    currentRole,
    isAdmin,
    isSeller,
    isClient
  };
};

/**
 * Route validation function
 */
export const validateRouteAccess = (role: string, pathname: string) => {
  const canAccess = canRoleAccessRoute(role, pathname);
  const accessibleRoutes = getAccessibleRoutes(role);
  
  return {
    canAccess,
    accessibleRoutes,
    reason: canAccess ? null : `Role ${role} không có quyền truy cập ${pathname}`
  };
};
