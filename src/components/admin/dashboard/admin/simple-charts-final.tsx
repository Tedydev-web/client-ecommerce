import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from '../hooks/useDbAdmin';

interface SimpleChartsProps {
  chartData: ChartData;
}

const SimpleCharts: React.FC<SimpleChartsProps> = ({ chartData }) => {
  const { usersByRole, usersByStatus, isLoading } = chartData;

  // Color mapping cho roles
  const getRoleColorClass = (name: string) => {
    switch (name) {
      case 'Admin': return 'bg-purple-500';
      case 'Seller': return 'bg-amber-500'; 
      case 'Client': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Color mapping cho status
  const getStatusColorClass = (name: string) => {
    switch (name) {
      case 'Active': return 'bg-green-500';
      case 'Inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố vai trò</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* User Roles Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố vai trò</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usersByRole.map((item) => {
              const total = usersByRole.reduce((sum, role) => sum + role.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getRoleColorClass(item.name)}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary cho roles */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
            <div className="text-sm text-gray-600">Tổng phân bố</div>
            <div className="text-lg font-bold text-purple-600">
              {usersByRole.reduce((sum, role) => sum + role.value, 0).toLocaleString()} người dùng
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usersByStatus.map((item) => {
              const total = usersByStatus.reduce((sum, status) => sum + status.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full ${getStatusColorClass(item.name)}`} />
                    <div>
                      <span className="text-sm font-medium block">{item.name}</span>
                      <span className="text-xs text-gray-500">
                        {item.name === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{item.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{percentage}% tổng</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary cho status */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-sm text-gray-600">Tổng người dùng</div>
            <div className="text-2xl font-bold text-blue-600">
              {usersByStatus.reduce((sum, status) => sum + status.value, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Active: {usersByStatus.find(s => s.name === 'Active')?.value || 0} | 
              Inactive: {usersByStatus.find(s => s.name === 'Inactive')?.value || 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCharts;
