'use client'
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTheme } from "../redux/sliceses/themeSlice";

const NavbarList = [
    { name: "Gösterge Paneli", href: "/", icon: "📊" },
    { name: "İşlem Ekle", href: "/add-transaction", icon: "📋" },
    { name: "Araçlar", href: "/vehicles", icon: "🚗" },
    { name: "Personeller", href: "/personnel", icon: "👥" }
]

const NavbarCom: React.FC = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const theme = useSelector((state: RootState) => state.theme.theme);
    const dispatch = useDispatch();

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
            <nav
                className={`hidden lg:flex shadow-lg p-4 w-64 max-w-xs min-w-[200px] h-screen flex-col items-center justify-between fixed left-0 top-0 z-50 overflow-y-auto border-r ${
                    theme === 'dark'
                        ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700'
                        : 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200'
                }`}
            >
                <div className="w-full flex flex-col justify-between h-full">
                    <div>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Ulas Tech
                            </h1>
                        </div>
                        {isOpen ? (
                            <div className="flex flex-col space-y-2 w-full">
                                {NavbarList.map((item, index) => (
                                    <Link
                                        href={item.href}
                                        className={`text-sm font-medium rounded-lg border flex items-center justify-center group p-2 transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-blue-300 hover:border-blue-400'
                                                : 'text-slate-700 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'}
                                        `}
                                        key={index}
                                    >
                                        <span className="group-hover:scale-105 transition-transform duration-200">
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                              
                                <button
                                    onClick={loggedOut}
                                    className={`text-sm font-semibold rounded-lg border p-2 flex items-center justify-center transition-all duration-300
                                        ${theme === 'dark'
                                            ? 'text-white bg-gradient-to-r from-red-700 to-red-800 border-red-700 hover:from-red-800 hover:to-red-900 hover:border-red-800 hover:shadow-lg'
                                            : 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:border-red-500 hover:shadow-lg'}
                                        transform hover:scale-105 active:scale-95`}
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2 w-full">
                                <button
                                    onClick={loggedIn}
                                    className={`text-sm font-semibold rounded-lg border p-2 flex items-center justify-center transition-all duration-300
                                        ${theme === 'dark'
                                            ? 'text-white bg-gradient-to-r from-green-700 to-green-800 border-green-700 hover:from-green-800 hover:to-green-900 hover:border-green-800 hover:shadow-lg'
                                            : 'text-white bg-gradient-to-r from-green-500 to-green-600 border-green-400 hover:from-green-600 hover:to-green-700 hover:border-green-500 hover:shadow-lg'}
                                        transform hover:scale-105 active:scale-95`}
                                >
                                    Giriş Yap
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-around px-2 py-1">
                    {NavbarList.map((item, index) => (
                        <Link
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-xs ${theme === 'dark' ? 'hover:bg-slate-800 active:bg-slate-700 text-gray-200' : 'hover:bg-gray-50 active:bg-gray-100 text-gray-700'}`}
                            key={index}
                        >
                            <span className="text-xl mb-0.5">{item.icon}</span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{item.name}</span>
                        </Link>
                    ))}
                    <button
                        onClick={loggedOut}
                        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-xs ${theme === 'dark' ? 'hover:bg-red-900 active:bg-red-800 text-red-300' : 'hover:bg-red-50 active:bg-red-100 text-red-600'}`}
                    >
                        <span className="text-xl mb-0.5">🚪</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Çıkış</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Header */}
            <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 px-3 py-2 shadow-sm border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ulas Tech
                    </h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
                        </button>
                        <Link
                            href="/auth/adminPage"
                            className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">👤</span>
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Admin</span>
                        </Link>
                        <Link
                            href="/auth/userPage"
                            className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">👨‍💼</span>
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Kullanıcı</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavbarCom;
