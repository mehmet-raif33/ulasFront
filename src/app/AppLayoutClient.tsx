'use client'
import React, { useState } from "react";
import ReduxProvider from "./components/ReduxProvider";
import ThemeEffect from "./components/ThemeEffect";
import NavbarCom from "./components/NavbarCom";
import AuthInitializer from "./components/AuthInitializer";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { selectIsInitialized, selectLoading } from "./redux/sliceses/authSlices";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const isInitialized = useSelector((state: RootState) => selectIsInitialized(state));
  const isLoading = useSelector((state: RootState) => selectLoading(state));

  // Authentication henüz başlatılmadıysa loading göster
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ThemeEffect />
      <div className="flex min-h-screen">
        <NavbarCom isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className={`flex-1 w-full ml-0 ${isOpen ? 'lg:ml-64' : 'lg:ml-[72px]'} lg:pt-0 pt-16 lg:pb-0 pb-20`}>
          {children}
        </main>
      </div>
    </>
  );
}

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthInitializer />
      <AppLayoutContent>{children}</AppLayoutContent>
    </ReduxProvider>
  );
} 