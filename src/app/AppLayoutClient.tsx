'use client'
import React, { useState } from "react";
import ReduxProvider from "./components/ReduxProvider";
import ThemeEffect from "./components/ThemeEffect";
import NavbarCom from "./components/NavbarCom";
import AuthInitializer from "./components/AuthInitializer";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <ReduxProvider>
      <AuthInitializer />
      <ThemeEffect />
      <div className="flex min-h-screen">
        <NavbarCom isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className={`flex-1 w-full ml-0 ${isOpen ? 'lg:ml-64' : 'lg:ml-[72px]'} lg:pt-0 pt-16 pb-20`}>
          {children}
        </main>
      </div>
    </ReduxProvider>
  );
} 