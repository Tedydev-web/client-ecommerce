// src/components/client/layout/header/header-Main.tsx
'use client';

import { Header as DesktopHeader } from './desktop/desktop-Index';
import { MobileHeader } from './moblie/moblie-Index';  // Sửa lại đường dẫn
import { DropdownProvider } from './dropdown-context';
import { useResponsive } from '@/hooks/useResponsive';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import './style.css';

export function Header() {
  const { isMobile } = useResponsive();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Hydration mismatch prevention
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-gradient-to-r from-red-700 via-red-600 to-red-700" />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isMobile ? (
        <motion.div
          key="mobile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700" style={{ height: 'auto', minHeight: '60px' }}>
            <MobileHeader />
          </header>
        </motion.div>
      ) : (
        <DesktopHeader />
      )}
    </AnimatePresence>
  );
}