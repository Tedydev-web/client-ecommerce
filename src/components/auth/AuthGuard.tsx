"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserData } from '@/hooks/useGetData-UserLogin';

// Routes cần đăng nhập
const PROTECTED_ROUTES = ['/admin', '/cart', '/user'];

// Admin-only routes cho SELLER không được truy cập
const ADMIN_ONLY_ROUTES = [
  '/admin/permissions',
  '/admin/roles', 
  '/admin/users',
  '/admin/audit-logs',
  '/admin/languages',
  '/admin/device',
  '/admin/brand',
  '/admin/categories',
  '/admin/system'
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userData = useUserData();
  
  const isAuthenticated = !!userData;

  useEffect(() => {
    const userRole = userData?.role?.name || '';
    
    // Kiểm tra routes cần đăng nhập
    const needsAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (needsAuth && !isAuthenticated) {
      router.replace('/sign-in');
      return;
    }

    // Kiểm tra quyền truy cập admin cho CLIENT
    if (isAuthenticated && pathname.startsWith('/admin')) {
      if (userRole === 'CLIENT') {
        router.replace('/not-found');
        return;
      }
      
      // Kiểm tra admin-only routes cho SELLER
      if (userRole === 'SELLER') {
        const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route => 
          pathname === route || pathname.startsWith(route)
        );
        
        if (isAdminOnlyRoute) {
          router.replace('/not-found');
          return;
        }
      }
    }

    // Redirect nếu đã đăng nhập và đang ở trang auth
    if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
      if (userRole === 'CLIENT') {
        router.replace('/');
      } else {
        router.replace('/admin');
      }
    }
  }, [isAuthenticated, pathname, userData, router]);

  // Render children trực tiếp để tránh chunk errors
  return <>{children}</>;
}