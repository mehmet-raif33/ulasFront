"use client";
import React, { useState, useEffect } from "react";
import NavbarCom from "./NavbarCom";
import { ThemeFAB } from "./ThemeEffect";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hydration sırasında hiçbir şey render etme
  if (!mounted) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <NavbarCom isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <ThemeFAB />
      <main className={`flex-1 transition-all duration-300 min-h-screen w-full pt-14 pb-14 lg:pt-0 lg:pb-0 relative ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'}`}>
        {children}
      </main>
    </>
  );
} 