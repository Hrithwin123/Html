"use client";

import React from "react";

interface ComponentDebugProps {
  componentName: string;
  props?: Record<string, any>;
  children: React.ReactNode;
}

export function ComponentDebug({ componentName, props, children }: ComponentDebugProps) {
  if (process.env.NODE_ENV === "development") {
    console.log(`Rendering ${componentName}`, { props });
  }

  return (
    <div data-component={componentName}>
      {children}
    </div>
  );
}

// Hook to debug component renders
export function useComponentDebug(componentName: string, props?: Record<string, any>) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} mounted/updated`, { props });
    }
  }, [componentName, props]);
}