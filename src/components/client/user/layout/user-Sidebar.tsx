"use client";

import { useCheckDevice } from "@/hooks/useCheckDevices";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const DesktopSidebar = dynamic(() => import("../account/desktop/desktop-sidebar"), {
  loading: () => <Skeleton className="w-full h-full" />,
  ssr: false,
});

export function Sidebar() {
  const deviceType = useCheckDevice();
  const router = useRouter();
  const pathname = usePathname();
  const isMobileView = deviceType === "mobile";

  useEffect(() => {
    // Only redirect on desktop from /user to /user/profile
    if (!isMobileView && pathname === '/user') {
      router.push('/user/dashboard');
    }
  }, [isMobileView, router, pathname]);

  // Return null for mobile, show sidebar for desktop
  if (isMobileView) {
    return null;
  }
  return <DesktopSidebar />;
}