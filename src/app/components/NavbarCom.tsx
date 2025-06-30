'use client'
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const NavbarList = [
    { name: "Gösterge Paneli", href: "/", icon: "📊" },
    { name: "İşlem Ekle", href: "/add-transaction", icon: "📋" },
    { name: "Araçlar", href: "/vehicles", icon: "🚗" },
    { name: "Personeller", href: "/personnel", icon: "👥" }
]

const NavbarCom: React.FC = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const loggedIn = () => {
        setIsOpen(!isOpen);
        router.push('/');
    }

    const loggedOut = () => {
        router.push('/auth');
        setIsOpen(false);
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex bg-gradient-to-b from-slate-50 to-slate-100 shadow-lg p-6 w-1/6 h-screen flex-col items-center justify-around border-r border-slate-200 fixed left-0 top-0 z-50">
                <div className="w-full">
                    <div className="flex flex-col justify-around w-full">
                        
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Ulas Tech
                            </h1>
                        </div>

                        {
                            isOpen ? (
                                <div className="flex flex-col space-y-2 w-full">
                                    {
                                        NavbarList.map((item, index) => (
                                            <Link 
                                                href={item.href}  
                                                className="text-base font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-600 hover:shadow-md transition-all duration-300 p-3 rounded-lg border border-slate-200 hover:border-blue-300 flex items-center justify-center group" 
                                                key={index}
                                            >
                                                <span className="group-hover:scale-105 transition-transform duration-200">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        ))
                                    }
                                    
                                    <button 
                                        onClick={loggedOut} 
                                        className="text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 p-3 rounded-lg border border-red-400 hover:border-red-500 transform hover:scale-105 active:scale-95"
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>                            
                            ) : (
                                <div className="flex flex-col space-y-2 w-full">
                                    <button 
                                        onClick={loggedIn} 
                                        className="text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-300 p-3 rounded-lg border border-green-400 hover:border-green-500 transform hover:scale-105 active:scale-95"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex items-center justify-around px-4 py-2">
                    {NavbarList.map((item, index) => (
                        <Link 
                            href={item.href}  
                            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-gray-50 active:bg-gray-100" 
                            key={index}
                        >
                            <span className="text-2xl mb-1">{item.icon}</span>
                            <span className="text-xs font-medium text-gray-700">{item.name}</span>
                        </Link>
                    ))}
                    
                    <button 
                        onClick={loggedOut} 
                        className="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-red-50 active:bg-red-100"
                    >
                        <span className="text-2xl mb-1">🚪</span>
                        <span className="text-xs font-medium text-red-600">Çıkış</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ulas Tech
                    </h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">👤</span>
                        <span className="text-sm font-medium text-gray-700">Kullanıcı</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavbarCom;
