"use client";
import React, { useState } from "react";
import NavbarCom from "./NavbarCom";
import ThemeEffect, { ThemeFAB } from "./ThemeEffect";
import { useAuth } from "../hooks/useAuth";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Auth state'i dinle
  useAuth();
  
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