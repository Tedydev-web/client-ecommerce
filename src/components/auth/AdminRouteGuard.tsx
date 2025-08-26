'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRoleCheck, canRoleAccessRoute, validateRouteAccess } from '@/utils/auth';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { Spinner } from '@/components/ui/spinner';
import { ADMIN_ONLY_ROUTES } from '@/constants/route';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export function AdminRouteGuard({ children, fallbackComponent }: AdminRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, isAuthenticated, canAccessAdmin, isClient, isSeller, isAdmin } = useRoleCheck();
  const [isChecking, setIsChecking] = useState(true);

  // Kiểm tra xem route hiện tại có phải là admin-only không
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  useEffect(() => {
    // Simulate checking time để tránh flash
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Nếu là CLIENT thì redirect đến not-found (không vào admin layout)
    if (isAuthenticated && isClient && pathname.startsWith('/admin')) {
      console.log('CLIENT user detected, redirecting to not-found...');
      router.replace('/not-found');
      return;
    }
  }, [isAuthenticated, isClient, pathname, router]);

  // Loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có quyền truy cập admin
  if (!isAuthenticated || !canAccessAdmin) {
    return (
      <AccessDenied 
        message="Bạn cần đăng nhập với tài khoản Admin hoặc Seller để truy cập trang quản trị"
      />
    );
  }

  // Xử lý đặc biệt cho SELLER truy cập admin-only routes
  if (isSeller && isAdminOnlyRoute) {
    console.log(`SELLER user trying to access admin-only route: ${pathname}`);
    
    // Nếu có custom fallback component
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    // Hiển thị access denied cho SELLER
    return (
      <AccessDenied 
        message="Tính năng này chỉ dành cho Admin"
      />
    );
  }

  // Kiểm tra quyền truy cập route cụ thể cho các trường hợp khác
  const routeValidation = validateRouteAccess(currentRole, pathname);
  
  if (!routeValidation.canAccess) {
    // Nếu có custom fallback component
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    // Hiển thị access denied mặc định
    return (
      <AccessDenied 
        message={routeValidation.reason || "Bạn không có quyền truy cập trang này"}
      />
    );
  }

  // Có quyền truy cập, render children
  return <>{children}</>;
}
