'use client';

import { ReactNode } from 'react';
import { useRoleCheck, useUIPermissions } from '@/utils/auth';

interface RoleBasedUIProps {
  children: ReactNode;
  requiredRoles?: ('ADMIN' | 'SELLER' | 'CLIENT')[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // true = cần tất cả roles/permissions, false = chỉ cần 1 trong số đó
}

/**
 * Component để ẩn/hiện UI elements dựa trên role
 */
export function RoleBasedUI({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallback = null,
  requireAll = false 
}: RoleBasedUIProps) {
  const { currentRole, hasPermission } = useRoleCheck();
  
  // Kiểm tra roles
  const hasRequiredRole = requiredRoles.length === 0 || (
    requireAll 
      ? requiredRoles.every(role => currentRole === role)
      : requiredRoles.some(role => currentRole === role)
  );
  
  // Kiểm tra permissions
  const hasRequiredPermission = requiredPermissions.length === 0 || (
    requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission))
  );
  
  const canRender = hasRequiredRole && hasRequiredPermission;
  
  return canRender ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher Order Component để bảo vệ components
 */
export function withRoleCheck<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: ('ADMIN' | 'SELLER' | 'CLIENT')[],
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleBasedUI requiredRoles={requiredRoles} fallback={fallback}>
        <Component {...props} />
      </RoleBasedUI>
    );
  };
}

/**
 * Hook để sử dụng trong components
 */
export const useRoleBasedRender = () => {
  const roleCheck = useRoleCheck();
  const uiPermissions = useUIPermissions();
  
  const renderForRole = (roles: string[], content: ReactNode, fallback: ReactNode = null) => {
    const hasRole = roles.some(role => roleCheck.currentRole === role.toUpperCase());
    return hasRole ? content : fallback;
  };
  
  const renderForPermission = (permission: string, content: ReactNode, fallback: ReactNode = null) => {
    const hasPermission = roleCheck.hasPermission(permission);
    return hasPermission ? content : fallback;
  };
  
  return {
    ...roleCheck,
    ...uiPermissions,
    renderForRole,
    renderForPermission
  };
};
