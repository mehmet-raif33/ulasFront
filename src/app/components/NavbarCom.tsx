'use client'
import React, { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTheme } from "../redux/sliceses/themeSlice";
import { logout } from "../redux/sliceses/authSlices";
import { authUtils } from "../lib/auth-utils";

const NavbarList = [
    { name: "Gösterge Paneli", href: "/", icon: "📊" },
    { name: "İşlem Ekle", href: "/add-transaction", icon: "📋" },
    { name: "Araçlar", href: "/vehicles", icon: "🚗" },
    { name: "Personeller", href: "/personnel", icon: "👥" }
]

interface NavbarComProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const NavbarCom: React.FC<NavbarComProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter();
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const loggedIn = () => {
        router.push('/auth');
        setIsOpen(false);
    }

    const loggedOut = async () => {
        try {
            await authUtils.signOut();
            dispatch(logout()); // Redux state'i temizle
            router.push('/auth');
            setIsOpen(false);
        } catch (error) {
            console.error('Çıkış hatası:', error);
            // Hata olsa bile Redux state'i temizle
            dispatch(logout());
            router.push('/auth');
        }
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <nav
                className={`hidden lg:flex shadow-lg h-screen fixed left-0 top-0 z-50 overflow-y-auto border-r transition-all duration-300
                    ${isOpen ? 'w-64 max-w-xs min-w-[200px] p-4 flex flex-col items-center justify-between' : 'w-[72px] px-0 py-2 flex flex-col items-center justify-between'}
                    ${theme === 'dark' ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200'}
                `}
            >
                <div className="w-full flex flex-col justify-between h-full">
                    <div>
                        {/* Toggle Button */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <button
                                onClick={toggleSidebar}
                                className={`rounded-lg text-lg font-medium transition-colors duration-200 shadow-sm border flex items-center justify-center
                                    ${theme === 'dark'
                                        ? 'text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-blue-300 hover:border-blue-400'
                                        : 'text-slate-700 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'}
                                    ${isOpen ? 'p-2 h-10' : 'h-12 w-12 p-0 mx-auto'}
                                `}
                                aria-label={isOpen ? 'Menüyü Daralt' : 'Menüyü Aç'}
                            >
                                {isOpen ? <span className="text-lg">«</span> : <span className="text-xl">»</span>}
                            </button>
                            {isOpen && (
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Ulas Tech
                                </h1>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2 w-full px-2">
                            {NavbarList.map((item, index) => (
                                <Link
                                    href={item.href}
                                    className={`text-sm font-medium rounded-lg border flex items-center group transition-all duration-300
                                        ${theme === 'dark'
                                            ? 'text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-blue-300 hover:border-blue-400'
                                            : 'text-slate-700 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'}
                                        ${isOpen ? 'p-2 justify-start w-full' : 'h-12 w-12 justify-center items-center p-0 mx-auto'}
                                    `}
                                    key={index}
                                >
                                    <span className={`text-xl${isOpen ? ' mr-2' : ''}`}>{item.icon}</span>
                                    {isOpen && (
                                        <span className="group-hover:scale-105 transition-transform duration-200">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                            {isLoggedIn ? (
                                isOpen ? (
                                    <button
                                        onClick={loggedOut}
                                        className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-white bg-gradient-to-r from-red-700 to-red-800 border-red-700 hover:from-red-800 hover:to-red-900 hover:border-red-800 hover:shadow-lg'
                                                : 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:border-red-500 hover:shadow-lg'}
                                            transform hover:scale-105 active:scale-95 w-full p-2`}
                                    >
                                        Çıkış Yap
                                    </button>
                                ) : (
                                    <button
                                        onClick={loggedOut}
                                        className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-white bg-gradient-to-r from-red-700 to-red-800 border-red-700 hover:from-red-800 hover:to-red-900 hover:border-red-800 hover:shadow-lg'
                                                : 'text-white bg-gradient-to-r from-green-500 to-green-600 border-green-400 hover:from-green-600 hover:to-green-700 hover:border-green-500 hover:shadow-lg'}
                                            transform hover:scale-105 active:scale-95 h-12 w-12 p-0 mx-auto`}
                                    >
                                        <span className="text-xl">🚪</span>
                                    </button>
                                )
                            ) : (
                                isOpen ? (
                                    <button
                                        onClick={loggedIn}
                                        className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-white bg-gradient-to-r from-green-700 to-green-800 border-green-700 hover:from-green-800 hover:to-green-900 hover:border-green-800 hover:shadow-lg'
                                                : 'text-white bg-gradient-to-r from-green-500 to-green-600 border-green-400 hover:from-green-600 hover:to-green-700 hover:border-green-500 hover:shadow-lg'}
                                            transform hover:scale-105 active:scale-95 w-full p-2`}
                                    >
                                        Giriş Yap
                                    </button>
                                ) : (
                                    <button
                                        onClick={loggedIn}
                                        className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-white bg-gradient-to-r from-green-700 to-green-800 border-green-700 hover:from-green-800 hover:to-green-900 hover:border-green-800 hover:shadow-lg'
                                                : 'text-white bg-gradient-to-r from-green-500 to-green-600 border-green-400 hover:from-green-600 hover:to-green-700 hover:border-green-500 hover:shadow-lg'}
                                            transform hover:scale-105 active:scale-95 h-12 w-12 p-0 mx-auto`}
                                    >
                                        <span className="text-xl">🔓</span>
                                    </button>
                                )
                            )}
                        </div>
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
                    {isLoggedIn ? (
                        <button
                            onClick={loggedOut}
                            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-xs ${theme === 'dark' ? 'hover:bg-red-900 active:bg-red-800 text-red-300' : 'hover:bg-red-50 active:bg-red-100 text-red-600'}`}
                        >
                            <span className="text-xl mb-0.5">🚪</span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Çıkış</span>
                        </button>
                    ) : (
                        <button
                            onClick={loggedIn}
                            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-xs ${theme === 'dark' ? 'hover:bg-green-900 active:bg-green-800 text-green-300' : 'hover:bg-green-50 active:bg-green-100 text-green-600'}`}
                        >
                            <span className="text-xl mb-0.5">🔓</span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>Giriş</span>
                        </button>
                    )}
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
