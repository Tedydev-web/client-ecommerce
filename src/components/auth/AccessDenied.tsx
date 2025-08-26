'use client';

import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useRoleCheck } from '@/utils/auth';

interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function AccessDenied({ 
  message,
  showBackButton = true,
  showHomeButton = true 
}: AccessDeniedProps) {
  const router = useRouter();
  const { isAdmin, isSeller, isClient } = useRoleCheck();

  const defaultMessage = message || "Bạn không có quyền truy cập trang này";

  const getHomeRoute = () => {
    if (isAdmin || isSeller) return '/admin';
    if (isClient) return '/';
    return '/';
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Không có quyền truy cập
          </CardTitle>
          <CardDescription className="text-center">
            {defaultMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            {showHomeButton && (
              <Button 
                onClick={() => router.push(getHomeRoute())}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            )}
            
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
