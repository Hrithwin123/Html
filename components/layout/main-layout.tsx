"use client";

import { ReactNode } from "react";
import { FloatingNavigation } from "@/components/navigation/floating-navigation";
import { AuthProvider } from "@/lib/auth-context";

interface MainLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
  navigationDelay?: number;
}

export function MainLayout({
  children,
  showNavigation = true,
  className = "min-h-screen w-full",
  navigationDelay = 1.8
}: MainLayoutProps) {
  return (
    <AuthProvider>
      <div className={className}>
        <main role="main" className="relative">
          {children}
        </main>
        {showNavigation && <FloatingNavigation delay={navigationDelay} />}
      </div>
    </AuthProvider>
  );
}