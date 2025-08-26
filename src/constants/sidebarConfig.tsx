'use client'

import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings,
  BarChart2,
  MessageSquare,
  FileText,
  Tickets ,
  MonitorCog,
  FolderClosed,
  ScrollText,
  Undo,
  Tags // Thêm icon cho Brand
} from 'lucide-react'
import { useTranslations } from "next-intl";
import { useUserData } from '@/hooks/useGetData-UserLogin';

export type SidebarItem = {
  title: string
  href: string
  icon?: React.ReactNode
  subItems?: SidebarItem[]
  isTitle?: boolean
}

export const useSidebarConfig = (): SidebarItem[] => {
  const t = useTranslations("admin.sidebar");
  const userData = useUserData();
  
  // Lấy role name từ user data
  const userRole = userData?.role?.name;

  // Base items cho tất cả role
  const baseItems: SidebarItem[] = [
    {
      title: t('dashboard'),
      href: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: t('products.products'),
      href: '/admin/products',
      icon: <Package className="w-5 h-5" />,
      subItems: [
        {
          title: t('products.productsList'),
          href: '/admin/products',
          icon: null,
        },
        {
          title: t('products.addProducts'),
          href: '/admin/products/new',
          icon: null,
        },
        {
          title: t('categories.categories'),
          href: '/admin/category',
          icon: null,
        },
      ],
    },  
    {
      title: t('orders.orders'),
      href: '/admin/order',
      icon: <ScrollText className="w-5 h-5" />,
      subItems: [
        {
          title: t('orders.listOrders'),
          href: '/admin/order',
          icon: null,
        }
      ],
    },
    {
      title: t('voucher.voucher'),
      href: '/admin/voucher',
      icon: <Tickets  className="w-5 h-5" />,
      subItems: [
        {
          title: t('voucher.listVoucher'),
          href: '/admin/voucher',
          icon: null,
        },
        {
          title: t('voucher.newVoucher'),
          href: '/admin/voucher/new',
          icon: null,
        }
      ],
    }
  ];

  // Items chỉ dành cho ADMIN
  const adminOnlyItems: SidebarItem[] = [
    {
      title: t('system.system'),
      href: '/admin/system',
      icon: <MonitorCog className="w-5 h-5" />,
      subItems: [
        {
          title: t('permission.permissionManager'),
          href: '/admin/permissions',
          icon: null,
        },
        {
          title: t('role.roleManager'),
          href: '/admin/roles',
          icon: null,
        },
        {
          title: t('user.userManager'),
          href: '/admin/users',
          icon: null,
        },
        // {
        //   title: t('system.systemLog'),
        //   href: '/admin/audit-logs',
        //   icon: null,
        // },
      ],
    },  
    {
      title: t('category.category'),
      href: '/admin/categories',
      icon: <FolderClosed className="w-5 h-5" />,
      subItems: [
        {
          title: t('language.languageManager'),
          href: '/admin/languages',
          icon: null,
        },
        // {
        //   title: t('device.deviceManager'),
        //   href: '/admin/device',
        //   icon: null,
        // },
        {
          title: t('brand.brandManager'),
          href: '/admin/brand',
          icon: <Tags className="w-4 h-4" />,
        }
      ],
    }
  ];

  // Trả về items dựa trên role
  if (userRole === 'ADMIN') {
    return [...baseItems, ...adminOnlyItems];
  } else {
    // SELLER hoặc role khác chỉ có access vào base items
    return baseItems;
  }
}

export const useSettingsSidebarConfig = (): SidebarItem[] => {
  const t = useTranslations("admin.sidebar.settings");
  const userData = useUserData();
  
  // Lấy role name từ user data
  const userRole = userData?.role?.name;

  // Base settings cho tất cả role
  const baseSettingsItems: SidebarItem[] = [
    {
      title: t('systemSettings'),
      href: '/admin',
      icon: <Undo className="w-5 h-5" />,
      isTitle: true
    },
    {
      title: t('accountSettings'),
      href: '/admin/settings',
      subItems:[
        {
          title: t('profile'),
          href: '/admin/settings/profile',
        },
        {
          title: t('passwordAndSecurity'),
          href: '/admin/settings/password-and-security',
        },
      ]
    }
  ];

  // Settings chỉ dành cho ADMIN (có thể mở rộng sau)
  const adminOnlySettingsItems: SidebarItem[] = [
    // Có thể thêm các settings chỉ dành cho admin ở đây nếu cần
  ];

  // Trả về settings items dựa trên role
  if (userRole === 'ADMIN') {
    return [...baseSettingsItems, ...adminOnlySettingsItems];
  } else {
    // SELLER hoặc role khác chỉ có access vào base settings
    return baseSettingsItems;
  }
}
