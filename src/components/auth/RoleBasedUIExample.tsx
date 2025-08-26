'use client';

import { Button } from '@/components/ui/button';
import { RoleBasedUI, useRoleBasedRender } from '@/components/auth/RoleBasedUI';
import { useRoleCheck, useUIPermissions } from '@/utils/auth';

/**
 * Component demo cách sử dụng role-based UI
 */
export function RoleBasedUIExample() {
  const { isAdmin, isSeller, isClient, currentRole } = useRoleCheck();
  const { 
    canCreateProduct, 
    canDeleteProduct, 
    canManageUsers,
    showAdminMenu 
  } = useUIPermissions();
  
  const { renderForRole, renderForPermission } = useRoleBasedRender();

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Role Based UI Demo</h2>
      <p>Current Role: <span className="font-medium">{currentRole}</span></p>
      
      {/* Cách 1: Sử dụng RoleBasedUI component */}
      <div className="space-y-2">
        <h3 className="font-medium">Using RoleBasedUI Component:</h3>
        
        <RoleBasedUI requiredRoles={['ADMIN']}>
          <Button variant="destructive">
            🔴 Admin Only Button
          </Button>
        </RoleBasedUI>
        
        <RoleBasedUI requiredRoles={['ADMIN', 'SELLER']}>
          <Button variant="default">
            🟢 Admin & Seller Button
          </Button>
        </RoleBasedUI>
        
        <RoleBasedUI 
          requiredRoles={['CLIENT']}
          fallback={<p className="text-muted-foreground">Client feature not available</p>}
        >
          <Button variant="outline">
            🔵 Client Only Button
          </Button>
        </RoleBasedUI>
      </div>

      {/* Cách 2: Sử dụng hooks trực tiếp */}
      <div className="space-y-2">
        <h3 className="font-medium">Using Hooks Directly:</h3>
        
        {isAdmin && (
          <Button variant="destructive">
            🔴 Admin Hook Button
          </Button>
        )}
        
        {(isAdmin || isSeller) && (
          <Button variant="default">
            🟢 Admin/Seller Hook Button
          </Button>
        )}
        
        {isClient && (
          <Button variant="outline">
            🔵 Client Hook Button
          </Button>
        )}
      </div>

      {/* Cách 3: Sử dụng UI permissions */}
      <div className="space-y-2">
        <h3 className="font-medium">Using UI Permissions:</h3>
        
        {canCreateProduct && (
          <Button>
            ➕ Create Product
          </Button>
        )}
        
        {canDeleteProduct && (
          <Button variant="destructive">
            🗑️ Delete Product
          </Button>
        )}
        
        {canManageUsers && (
          <Button variant="secondary">
            👥 Manage Users
          </Button>
        )}
      </div>

      {/* Cách 4: Sử dụng render functions */}
      <div className="space-y-2">
        <h3 className="font-medium">Using Render Functions:</h3>
        
        {renderForRole(
          ['ADMIN'], 
          <Button variant="destructive">🔴 Admin Render</Button>,
          <p className="text-muted-foreground">Admin required</p>
        )}
        
        {renderForPermission(
          'manage_products',
          <Button>📦 Manage Products</Button>,
          <p className="text-muted-foreground">Product management permission required</p>
        )}
      </div>
    </div>
  );
}
