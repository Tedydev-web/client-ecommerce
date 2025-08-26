    "use client";

import { Card } from '@/components/ui/card';
import { useDbAdmin } from '../hooks/useDbAdmin';
import OverviewStatsTable from '../admin/overview-stats-table'    ;
import SimpleCharts from '../admin/simple-charts'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Shield,
  Store,
  User,
  Activity,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardAdmin() {
  const { userStats, dashboardStats, overviewStats, chartData, refreshStats } = useDbAdmin();

    // Stats cards data cho User module
    const userStatsCards = [
        {
        title: 'Tổng người dùng',
        value: dashboardStats.totalUsers.toLocaleString(),
        icon: <Users className="w-6 h-6" />,
        changeType: 'info',
        color: 'blue'
        },
        {
        title: 'Admin',
        value: dashboardStats.adminUsersCount.toString(),
        icon: <Shield className="w-6 h-6" />,
        change: 'Quản trị viên',
        changeType: 'neutral',
        color: 'purple'
        },
        {
        title: 'Seller',
        value: dashboardStats.sellerUsersCount.toString(),
        icon: <Store className="w-6 h-6" />,
        change: 'Người bán',
        changeType: 'neutral',
        color: 'orange'
        },
        {
        title: 'Client',
        value: dashboardStats.clientUsersCount.toString(),
        icon: <User className="w-6 h-6" />,
        change: 'Khách hàng',
        changeType: 'neutral',
        color: 'blue'
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
        blue: 'bg-blue-500/10 text-blue-600',
        green: 'bg-green-500/10 text-green-600',
        emerald: 'bg-emerald-500/10 text-emerald-600',
        purple: 'bg-purple-500/10 text-purple-600',
        orange: 'bg-orange-500/10 text-orange-600',
        };
        return colorMap[color as keyof typeof colorMap] || 'bg-gray-500/10 text-gray-600';
    };

    const getChangeColor = (type: string) => {
        switch (type) {
        case 'positive': return 'text-green-500';
        case 'negative': return 'text-red-500';
        case 'info': return 'text-blue-500';
        default: return 'text-gray-500';
        }
    };

    if (userStats.isLoading) {
        return (
        <div className="space-y-6 p-6 h-screen bg-white">
            <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
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
        {/* Error handling */}
        {userStats.error && (
            <Card className="p-4 border-red-200 bg-red-50">
            <p className="text-red-600 text-sm">
                ⚠️ {userStats.error}
            </p>
            </Card>
        )}  

        {/* Overview Statistics Table */}
        <OverviewStatsTable overviewStats={overviewStats} />

        {/* User Statistics Cards */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Thống kê người dùng chi tiết
                </h2>
                <Button 
                    onClick={refreshStats}
                    variant="outline" 
                    size="sm"
                    disabled={userStats.isLoading || overviewStats.isLoading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${(userStats.isLoading || overviewStats.isLoading) ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            {userStatsCards.map((stat, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                    </p>
                    <p className="text-2xl font-bold mb-2">{stat.value}</p>
                    <div className="flex items-center">
                        <span className={`text-xs ${getChangeColor(stat.changeType)}`}>
                        {stat.change}
                        </span>
                    </div>
                    </div>
                    <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                    {stat.icon}
                    </div>
                </div>
                </Card>
            ))}
            </div>
        </div>

        {/* Quick Stats & Charts */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Thống kê hệ thống</h3>
                <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                <span>Tổng người dùng</span>
                <span className="font-medium text-blue-600">{dashboardStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                <span>Tổng thương hiệu</span>
                <span className="font-medium text-green-600">{dashboardStats.totalBrands.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                <span>Tổng danh mục</span>
                <span className="font-medium text-purple-600">{dashboardStats.totalCategories.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                <span>Audit logs</span>
                <span className="font-medium text-orange-600">{dashboardStats.totalAuditLogs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2">
                <span>Tỷ lệ người dùng hoạt động</span>
                <span className="font-medium text-green-600">
                    {((dashboardStats.activeUsersCount / dashboardStats.totalUsers) * 100 || 0).toFixed(1)}%
                </span>
                </div>
            </div>
            </Card>

           
        </div>

        {/* Charts Section */}
        <SimpleCharts chartData={chartData} />
        </div>
    );
    }
