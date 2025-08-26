"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTES } from "@/constants/route";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Spinner } from "@/components/ui/spinner";
import { showToast } from "@/components/ui/toastify";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    userData, 
    checkRouteAccess, 
    getHomeRedirectByRole 
  } = useAuthGuard();

  const [hasShownAccessDeniedToast, setHasShownAccessDeniedToast] = useState(false);

  // Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Kiểm tra xem có phải route public không
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading) {
      // Reset toast flag when route changes
      setHasShownAccessDeniedToast(false);
      
      // Nếu chưa đăng nhập và đang ở protected route
      if (!isAuthenticated && isProtectedRoute) {
        router.push(ROUTES.AUTH.SIGNIN);
        return;
      }

      // Nếu đã đăng nhập, kiểm tra quyền truy cập route
      if (isAuthenticated && userData) {
        const userRole = userData.role?.name || '';
        const routeAccess = checkRouteAccess(pathname);
        
        // Kiểm tra quyền truy cập admin routes
        if (routeAccess.isAdminRoute && !routeAccess.canAccessAdminRoute(userRole)) {
          console.log(`Access denied: User role "${userRole}" cannot access admin route: ${pathname}`);
          
          // Show toast notification only once per route change
          if (!hasShownAccessDeniedToast) {
            showToast(
              `Bạn không có quyền truy cập vào trang quản trị. Role hiện tại: ${userRole}`, 
              'error'
            );
            setHasShownAccessDeniedToast(true);
          }
          
          // Redirect về trang chính phù hợp với role
          const homeRoute = getHomeRedirectByRole(userRole);
          router.push(homeRoute);
          return;
        }
      }

      // Nếu đã đăng nhập và đang ở signin/signup page
      if (
        isAuthenticated &&
        (pathname === ROUTES.AUTH.SIGNIN || pathname === ROUTES.AUTH.SIGNUP)
      ) {
        const userRole = userData?.role?.name || '';
        const homeRoute = getHomeRedirectByRole(userRole);
        router.push(homeRoute);
      }
    }
  }, [isAuthenticated, isLoading, isProtectedRoute, pathname, userData, checkRouteAccess, getHomeRedirectByRole, hasShownAccessDeniedToast]);

  // Show loading khi đang kiểm tra auth ở protected route
  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Không render gì nếu chưa auth và đang ở protected route
  if (!isAuthenticated && isProtectedRoute) {
    return null;
  }

  // Kiểm tra quyền truy cập route nếu đã authenticated
  if (isAuthenticated && userData) {
    const userRole = userData.role?.name || '';
    const routeAccess = checkRouteAccess(pathname);
    
    // Nếu không có quyền truy cập admin route thì không render
    if (routeAccess.isAdminRoute && !routeAccess.canAccessAdminRoute(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}