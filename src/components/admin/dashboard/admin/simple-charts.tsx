import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from '../hooks/useDbAdmin';

interface SimpleChartsProps {
  chartData: ChartData;
}

const SimpleCharts: React.FC<SimpleChartsProps> = ({ chartData }) => {
  const { usersByRole, usersByStatus, isLoading } = chartData;

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
          <div className="space-y-3">
            {usersByRole.map((item) => {
              const total = usersByRole.reduce((sum, role) => sum + role.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Simple bar chart */}
          <div className="mt-4 space-y-2">
            {usersByRole.map((item) => {
              const total = usersByRole.reduce((sum, role) => sum + role.value, 0);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              
              return (
                <div key={`bar-${item.name}`} className="flex items-center space-x-2">
                  <span className="text-xs w-12 text-gray-600">{item.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                  <span className="text-xs w-10 text-right">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usersByStatus.map((item) => {
              const total = usersByStatus.reduce((sum, status) => sum + status.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Simple donut chart representation */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-gray-200"
                  strokeWidth="3"
                />
                {usersByStatus.map((item, index) => {
                  const total = usersByStatus.reduce((sum, status) => sum + status.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const strokeDashoffset = index === 0 ? '0' : '-25';
                  
                  return (
                    <circle
                      key={`donut-${item.name}`}
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="3"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {usersByStatus.reduce((sum, status) => sum + status.value, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCharts;
