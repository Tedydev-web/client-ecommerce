'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, LogOut, ShoppingCart, LucideIcon, LayoutDashboard } from 'lucide-react';
import React, { useRef, type FC, type MouseEvent } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/route';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDropdown } from '../dropdown-context';
import { useUserData } from '@/hooks/useGetData-UserLogin';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  requireDivider?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, label, onClick, requireDivider }) => (
  <>
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium"
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
    {requireDivider && <hr className="border-gray-200" />}
  </>
);

export function ProfileDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { handleLogout, loading: logoutLoading } = useLogout();
  const router = useRouter();
  const { openDropdown, setOpenDropdown } = useDropdown();
  const user = useUserData();
  const isOpen = openDropdown === 'profile';
  
  const menuItems: MenuItemProps[] = [
    {
      icon: User,
      label: 'Tài khoản của tôi',
      onClick: () => router.push(ROUTES.CLIENT.USER.DASHBOARD)
    },
    {
      icon: ShoppingCart,
      label: 'Giỏ hàng của bạn',
      onClick: () => router.push(ROUTES.CLIENT.CART),
      requireDivider: true
    },
    {
      icon: ShoppingCart,
      label: 'Đơn hàng mua',
      onClick: () => router.push(ROUTES.CLIENT.USER.ORDERS),
      requireDivider: true
    },
    {
      icon: LogOut,
      label: logoutLoading ? 'Đang xử lý...' : 'Đăng xuất',
      onClick: () => handleLogout()
    }
  ];

  if (!user) {
    return (
      <button
        onClick={() => router.push(ROUTES.AUTH.SIGNIN)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-white"
      >
        <User className="w-6 h-6" strokeWidth={1}/>
      </button>
    );
  }

  const name = user.username;
  const avatarText = name ? name[0].toUpperCase() : 'U';

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(isOpen ? 'none' : 'profile');
  };

  const handleBackdropClick = () => {
    setOpenDropdown('none');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-primary shadow-sm"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={name || 'Profile'}
            width={32}
            height={32}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-sm font-semibold">{avatarText}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-60"
            >
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                )}
              </div>
              
              {/* Menu Items */}
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
