'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/layout/Sidebar'
import { Header } from '@/components/admin/layout/Header'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isMobile } = useResponsive()

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  return (
      <div className="relative min-h-screen bg-background">
        <Header onToggleSidebar={handleToggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} onCollapse={handleSidebarCollapse}/>
        <div
          className={cn(
            "min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out",
            isMobile
              ? "mt-16"
              : sidebarCollapsed
                ? "mt-16 ml-0"
                : "mt-16 ml-64"
          )}
        >
          <main>
            <div className="max-w-[2000px] mx-auto bg-[#F6F6F6]">
              {children}
            </div>
          </main>
        </div>
      </div>
  )
}
