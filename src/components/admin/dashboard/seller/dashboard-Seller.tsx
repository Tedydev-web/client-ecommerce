"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Package, 
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Percent,
  Tag,
  Gift
} from 'lucide-react';
import { useDbSeller } from '../hooks/useDbSeller';

export default function DashboardSeller() {
  const { sellerStats, discountStats, refreshStats } = useDbSeller();

  // Stats cards data cho đơn hàng
  const orderStatsCards = [
    {
      title: 'Tổng số đơn hàng',
      value: sellerStats.totalOrders.toString(),
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Chưa thanh toán',
      value: sellerStats.pendingPayment.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'orange'
    },
    {
      title: 'Chờ đóng gói',
      value: sellerStats.pendingPackaging.toString(),
      icon: <Package className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Chờ giao hàng',
      value: sellerStats.pendingDelivery.toString(),
      icon: <Truck className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Đã giao',
      value: sellerStats.delivered.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Đã hủy',
      value: sellerStats.cancelled.toString(),
      icon: <XCircle className="w-6 h-6" />,
      color: 'red'
    }
  ];

  // Stats cards data cho discount
  const discountStatsCards = [
    {
      title: 'Tổng số khuyến mãi',
      value: discountStats.totalDiscounts.toString(),
      icon: <Gift className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Đang hoạt động',
      value: discountStats.activeDiscounts.toString(),
      icon: <Tag className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Hết hạn',
      value: discountStats.expiredDiscounts.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'red'
    },
    {
      title: 'Khuyến mãi shop',
      value: discountStats.shopDiscounts.toString(),
      icon: <Store className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Khuyến mãi sản phẩm',
      value: discountStats.productDiscounts.toString(),
      icon: <Package className="w-6 h-6" />,
      color: 'orange'
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500/10 text-blue-600',
      green: 'bg-green-500/10 text-green-600',
      purple: 'bg-purple-500/10 text-purple-600',
      orange: 'bg-orange-500/10 text-orange-600',
      red: 'bg-red-500/10 text-red-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500/10 text-gray-600';
  };

  if (sellerStats.isLoading || discountStats.isLoading) {
    return (
      <div className="space-y-6 p-6 h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 h-screen bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground">
            Quản lý cửa hàng và theo dõi đơn hàng của bạn
          </p>
        </div>
        <Button 
          onClick={refreshStats}
          variant="outline" 
          size="sm"
          disabled={sellerStats.isLoading || discountStats.isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(sellerStats.isLoading || discountStats.isLoading) ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Đơn hàng section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Thống kê đơn hàng
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {orderStatsCards.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Khuyến mãi section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Gift className="w-5 h-5 mr-2" />
          Thống kê khuyến mãi
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5">
          {discountStatsCards.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary cards - tổng hợp không lặp lại */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tổng quan đơn hàng</h2>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Tỷ lệ thành công</span>
              <span className="font-medium text-green-600">
                {sellerStats.totalOrders > 0 ? ((sellerStats.delivered / sellerStats.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Đang xử lý</span>
              <span className="font-medium text-orange-600">
                {(sellerStats.pendingPayment + sellerStats.pendingPackaging + sellerStats.pendingDelivery).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
              📦 {sellerStats.totalOrders.toLocaleString()} đơn hàng tổng cộng
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hiệu suất khuyến mãi</h2>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Tỷ lệ hoạt động</span>
              <span className="font-medium text-green-600">
                {discountStats.totalDiscounts > 0 ? ((discountStats.activeDiscounts / discountStats.totalDiscounts) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Cần gia hạn</span>
              <span className="font-medium text-red-600">
                {discountStats.expiredDiscounts.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground p-2 bg-purple-50 rounded">
              🎁 {discountStats.totalDiscounts.toLocaleString()} khuyến mãi tổng cộng
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Phân bổ khuyến mãi</h2>
            <Percent className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center">
                <Store className="w-4 h-4 mr-2 text-blue-500" />
                Shop
              </span>
              <span className="font-medium">{discountStats.shopDiscounts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-orange-500" />
                Sản phẩm
              </span>
              <span className="font-medium">{discountStats.productDiscounts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center">
                <Percent className="w-4 h-4 mr-2 text-purple-500" />
                Hệ thống
              </span>
              <span className="font-medium">{discountStats.platformDiscounts.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
