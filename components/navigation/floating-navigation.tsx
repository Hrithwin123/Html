"use client";

import { motion } from "framer-motion";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { NAVIGATION_ITEMS, AUTHENTICATED_NAVIGATION_ITEMS, ANIMATION_DURATIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import type { NavigationItem } from "@/lib/types";

interface FloatingNavigationProps {
  items?: NavigationItem[];
  className?: string;
  delay?: number;
}

export function FloatingNavigation({ items, className, delay = 1.8 }: FloatingNavigationProps) {
  const { user, signOut } = useAuth();
  
  // Use authenticated items if user is logged in, otherwise use default items
  const navigationItems = items || (user ? AUTHENTICATED_NAVIGATION_ITEMS : NAVIGATION_ITEMS);

  // Transform NavigationItem[] to the format expected by FloatingDock
  const dockItems = React.useMemo(() => 
    navigationItems.map(item => {
      const IconComponent = item.icon;
      return {
        title: item.title,
        icon: <IconComponent size={22} aria-hidden="true" />,
        href: item.href,
        onClick: item.href === "#signout" ? signOut : undefined,
      };
    }), [navigationItems, signOut]
  );

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ 
        duration: 0.8,
        delay: delay 
      }}
      className={className}
    >
      <FloatingDock
        items={dockItems}
        desktopClassName="
          fixed bottom-8 left-1/2 -translate-x-1/2
          bg-white/60 backdrop-blur-md shadow-xl
          rounded-2xl px-6 py-3
          z-50
          border border-gray-200
        "
        mobileClassName="
          fixed bottom-0 left-0 w-full
          bg-white border-t border-gray-200
          flex justify-around items-center py-3
          z-50
        "
      />
    </motion.div>
  );
}