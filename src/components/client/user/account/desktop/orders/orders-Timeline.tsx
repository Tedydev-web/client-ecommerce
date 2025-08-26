"use client";

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Package,
  Truck,
  Star,
  XCircle,
} from "lucide-react";

// Mock OrderStatus enum for demo
const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  VERIFY_PAYMENT: "VERIFY_PAYMENT", 
  PENDING_PACKAGING: "PENDING_PACKAGING",
  PENDING_PICKUP: "PENDING_PICKUP",
  PICKUPED: "PICKUPED",
  PENDING_DELIVERY: "PENDING_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  finalAmount?: number;
  orderCode: string;
}

export function OrderTimeline({
  status,
  finalAmount,
  createdAt,
  orderCode,
}: OrderTimelineProps) {
  // Hủy đơn -> không hiển thị timeline
  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200 shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
          <XCircle className="relative w-16 h-16 text-red-500 mb-3 drop-shadow-sm" />
        </div>
        <p className="text-lg font-semibold text-red-600 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
          Đơn hàng {orderCode ? `#${orderCode}` : ""} đã bị hủy
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.
        </p>
      </div>
    );
  }

  const isPickuped =
    OrderStatus.PENDING_PICKUP === status ||
    status === OrderStatus.PICKUPED;

  // ===== Labels =====
  let step2Label = "Đã Xác Nhận Thông Tin Thanh Toán";
  let step3Label = "Đang Chuẩn Bị Hàng";

  if (status === OrderStatus.PENDING_PACKAGING) {
    step3Label = "Người Bán Đang Chuẩn Bị Hàng";
  } else if (isPickuped) {
    step3Label = "ĐVVC Đã Lấy Hàng Thành Công";
  }

  let step4Label = "Đang Vận Chuyển";
  if (status === OrderStatus.PENDING_DELIVERY)
    step4Label = "Đơn Hàng Đang Vận Chuyển";
  if (status === OrderStatus.DELIVERED) step4Label = "Đã Giao Hàng Thành Công";

  const steps = [
    { label: "Đơn Hàng Đã Đặt", icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: step2Label, icon: DollarSign, color: "from-emerald-500 to-emerald-600" },
    { label: step3Label, icon: Package, color: "from-amber-500 to-orange-500" },
    { label: step4Label, icon: Truck, color: "from-indigo-500 to-purple-500" },
    { label: "Đơn Hàng Hoàn Thành", icon: Star, color: "from-pink-500 to-rose-500" },
  ];

  // ===== currentStepIndex =====
  let currentStepIndex = 0;

  if (
    status === OrderStatus.VERIFY_PAYMENT ||
    status === OrderStatus.PENDING_PACKAGING
  ) {
    currentStepIndex = 2;
  } else if (isPickuped || status === OrderStatus.PENDING_DELIVERY) {
    currentStepIndex = 3;
  } else if (status === OrderStatus.DELIVERED) {
    currentStepIndex = 4;
  } else if (status === OrderStatus.PENDING_PAYMENT) {
    currentStepIndex = 0;
  }

  return (
    <div className="w-full px-6 py-8">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between relative w-full">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-[4px] -translate-y-1/2 bg-gray-200 rounded-full">
          {/* Progress line with gradient */}
          <div
            className="h-[4px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-[width] duration-700 ease-out shadow-md relative overflow-hidden"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div
              key={index}
              className="relative flex flex-col items-center flex-1 text-center group"
            >
              {/* Glow effect for active step */}
              {isActive && (
                <div className={`absolute top-[22px] w-8 h-8 rounded-full bg-gradient-to-r ${step.color} opacity-20 blur-sm animate-pulse`} />
              )}
              
              {/* Background circle */}
              <div
                className={`absolute top-[22px] w-8 h-8 rounded-full transition-all duration-500 ${
                  isActive 
                    ? "bg-white shadow-lg ring-2 ring-white" 
                    : "bg-gray-100 shadow-sm"
                }`}
              />
              
              {/* Icon container */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full z-10 transition-all duration-500 transform ${
                  isActive 
                    ? `bg-gradient-to-br ${step.color} text-white shadow-lg hover:scale-110 hover:shadow-xl` 
                    : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                } ${isCompleted ? "ring-2 ring-white shadow-xl" : ""}`}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? "drop-shadow-sm" : ""}`} />
                
                {/* Success checkmark overlay for completed steps */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <p
                className={`mt-3 text-sm font-medium leading-snug break-words px-4 max-w-[200px] transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${step.color} bg-clip-text text-transparent font-semibold` 
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-6 md:hidden relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div key={index} className="flex items-start gap-4 relative group">
              {/* Icon container */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 z-10 shrink-0 transition-all duration-500 ${
                  isActive
                    ? `bg-gradient-to-br ${step.color} border-transparent text-white shadow-lg`
                    : "border-gray-300 text-gray-400 bg-white hover:border-gray-400"
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-300" />
                
                {/* Success checkmark for completed steps */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium leading-snug transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${step.color} bg-clip-text text-transparent font-semibold` 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-[3px] h-full rounded-full transition-all duration-500 ${
                    index < currentStepIndex 
                      ? "bg-gradient-to-b from-emerald-400 to-teal-500 shadow-sm" 
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Demo component để test
export default function TimelineDemo() {
  const [currentStatus, setCurrentStatus] = useState(OrderStatus.VERIFY_PAYMENT);
  
  const statusOptions = [
    { value: OrderStatus.PENDING_PAYMENT, label: "Chờ thanh toán" },
    { value: OrderStatus.VERIFY_PAYMENT, label: "Xác nhận thanh toán" },
    { value: OrderStatus.PENDING_PACKAGING, label: "Chuẩn bị hàng" },
    { value: OrderStatus.PENDING_PICKUP, label: "Chờ lấy hàng" },
    { value: OrderStatus.PENDING_DELIVERY, label: "Đang giao hàng" },
    { value: OrderStatus.DELIVERED, label: "Đã giao hàng" },
    { value: OrderStatus.CANCELLED, label: "Đã hủy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Enhanced Order Timeline</h1>
          <div className="inline-flex flex-wrap gap-2 p-1 bg-white rounded-lg shadow-sm border">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCurrentStatus(option.value)}
                className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                  currentStatus === option.value
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <OrderTimeline 
            status={currentStatus}
            createdAt="2024-03-15T10:30:00Z"
            finalAmount={299000}
            orderCode="ORD123456"
          />
        </div>
      </div>
    </div>
  );
}