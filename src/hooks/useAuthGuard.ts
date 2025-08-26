import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { 
  ROUTES, 
  PROTECTED_ROUTES, 
  PUBLIC_ROUTES, 
  ADMIN_ONLY_ROUTES, 
  SELLER_ALLOWED_ROUTES 
} from '@/constants/route';
import { showToast } from '@/components/ui/toastify';
import { useUserData } from './useGetData-UserLogin';

interface UseAuthGuardOptions {
  redirectTo?: string;
  showToastMessage?: boolean;
  silentCheck?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const {
    redirectTo = ROUTES.AUTH.SIGNIN,
    showToastMessage = true,
    silentCheck = false
  } = options;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Gọi hook useUserData ở cấp cao nhất
  const userData = useUserData();

  // Logic kiểm tra authentication
  const checkAuth = useCallback(() => {
    try {
      const accessToken = Cookies.get('access_token');
      const hasToken = !!accessToken;
      const hasReduxData = !!userData;

      // Điều kiện: có token HOẶC có dữ liệu trong Redux
      const isAuthed = hasToken || hasReduxData;

      setIsAuthenticated(isAuthed);
      setIsLoading(false);
      return isAuthed;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, [userData]);

  // Logic kiểm tra route permissions
  const checkRouteAccess = useCallback((pathname: string) => {
    // Kiểm tra route types
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route)
    );
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route.replace(':slug', '').replace(':id', ''))
    );
    
    const isAdminRoute = pathname.startsWith('/admin');

    // Kiểm tra quyền truy cập admin routes
    const canAccessAdminRoute = (userRole: string) => {
      if (!isAdminRoute) return true; // Không phải admin route thì OK
      
      // Normalize role name
      const normalizedRole = userRole?.toUpperCase?.() || '';
      
      console.log(`Checking admin route access: User role "${normalizedRole}", Route: "${pathname}"`);
      
      // ADMIN có thể truy cập tất cả admin routes
      if (normalizedRole === 'ADMIN') {
        console.log('✅ Admin access granted');
        return true;
      }
      
      // SELLER chỉ được truy cập routes được phép
      if (normalizedRole === 'SELLER') {
        const canAccess = SELLER_ALLOWED_ROUTES.some(route => 
          pathname === route || pathname.startsWith(route)
        );
        console.log(`${canAccess ? '✅' : '❌'} Seller access ${canAccess ? 'granted' : 'denied'}`);
        return canAccess;
      }
      
      // CLIENT, CUSTOMER và các role khác không được truy cập admin routes
      console.log(`❌ Access denied for role "${normalizedRole}" to admin routes`);
      return false;
    };

    return {
      isProtectedRoute,
      isPublicRoute,
      isAdminRoute,
      canAccessAdminRoute
    };
  }, []);

  // Lấy redirect URL dựa trên role
  const getHomeRedirectByRole = useCallback((userRole: string) => {
    const normalizedRole = userRole?.toUpperCase?.() || '';
    
    console.log(`Getting home redirect for role: "${normalizedRole}"`);
    
    switch (normalizedRole) {
      case 'ADMIN':
      case 'SELLER':
        console.log('Redirecting to admin dashboard');
        return '/admin';
      case 'CLIENT':
      case 'CUSTOMER':
      default:
        console.log('Redirecting to home page');
        return '/';
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Hàm wrapper để bảo vệ API calls
  const withAuth = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: { showError?: boolean } = {}
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>) => {
      // Gọi lại checkAuth để có được trạng thái mới nhất
      const isAuthed = checkAuth();
      
      if (!isAuthed) {
        if (options.showError !== false && showToastMessage) {
          showToast('Vui lòng đăng nhập để tiếp tục', 'error');
        }
        throw new Error('UNAUTHORIZED');
      }
      
      try {
        return await fn(...args);
      } catch (error: any) {
        // Xử lý các lỗi liên quan đến authentication
        if (error?.response?.status === 401) {
          if (options.showError !== false && showToastMessage) {
            showToast('Phiên đăng nhập đã hết hạn', 'error');
          }
          // TODO: Cần dispatch action để clear Redux state tại đây
          throw new Error('SESSION_EXPIRED');
        }
        throw error;
      }
    };
  };

  // Hàm kiểm tra nhanh trạng thái đăng nhập
  const requireAuth = () => {
    const isAuthed = checkAuth();
    if (!isAuthed && showToastMessage) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'error');
    }
    return isAuthed;
  };

  return { 
    isAuthenticated, 
    isLoading, 
    userData,
    withAuth, 
    requireAuth, 
    checkAuth,
    checkRouteAccess,
    getHomeRedirectByRole
  };
};