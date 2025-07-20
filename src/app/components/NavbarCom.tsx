'use client'
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTheme } from "../redux/sliceses/themeSlice";
import { logout } from "../redux/sliceses/authSlices";
import { broadcastLogout } from "../utils/broadcastChannel";
import Image from "next/image";

const NavbarList = [
    { name: "Gösterge Paneli", href: "/", icon: "📊", requiresAuth: true, adminOnly: false },
    { name: "İşlemler", href: "/transactions", icon: "📋", requiresAuth: true, adminOnly: false },
    { name: "Ciro Hesaplama", href: "/revenue", icon: "💰", requiresAuth: true, adminOnly: true },
    { name: "İşlem Türleri", href: "/transaction-categories", icon: "🏷️", requiresAuth: true, adminOnly: true },
    { name: "Araçlar", href: "/vehicles", icon: "🚗", requiresAuth: true, adminOnly: false },
    { name: "Personeller", href: "/personnel", icon: "👥", requiresAuth: true, adminOnly: true }
]

interface NavbarComProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarCom: React.FC<NavbarComProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter();
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const loggedIn = () => {
        router.push('/auth');
        setIsOpen(false);
    }

    const loggedOut = async () => {
        try {
            // localStorage'dan token'ı sil
            localStorage.removeItem('token');
            dispatch(logout()); // Redux state'i temizle
            
            // Diğer sekmelere logout mesajı gönder
            broadcastLogout();
            
            router.push('/auth');
            setIsOpen(false);
        } catch (error) {
            console.error('Çıkış hatası:', error);
            // Hata olsa bile localStorage ve Redux state'i temizle
            localStorage.removeItem('token');
            dispatch(logout());
            
            // Diğer sekmelere logout mesajı gönder
            broadcastLogout();
            
            router.push('/auth');
        }
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <nav
                className={`hidden lg:flex shadow-lg h-screen fixed left-0 top-0 z-50 overflow-y-auto border-r transition-all duration-300
                    ${isOpen ? 'w-64 max-w-xs min-w-[200px] p-4 flex flex-col items-center justify-between' : 'w-[72px] px-0 py-2 flex flex-col items-center justify-between'}
                    ${theme === 'dark' ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700' : 'bg-red-700 border-red-600'}
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
                                        ? 'text-gray-200 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:text-white hover:border-slate-500'
                                        : 'text-white bg-red-500 border-red-400 hover:bg-red-600 hover:text-white hover:border-red-500'}
                                    ${isOpen ? 'p-2 h-10' : 'h-12 w-12 p-0 mx-auto'}
                                `}
                                aria-label={isOpen ? 'Menüyü Daralt' : 'Menüyü Aç'}
                            >
                                {isOpen ? <span className="text-lg">«</span> : <span className="text-xl">»</span>}
                            </button>
                            {isOpen && (
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src="/logo.png"
                                        alt="Demirhan Logo"
                                        width={120}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2 w-full px-2">
                            {isLoggedIn && NavbarList.map((item, index) => {
                                // Admin olmayan kullanıcılar için adminOnly sayfalarını gizle
                                if (item.adminOnly && user?.role !== 'admin') {
                                    return null;
                                }
                                
                                return (
                                    <Link
                                        href={item.href}
                                        className={`text-sm font-medium rounded-lg border flex items-center group transition-all duration-300
                                            ${theme === 'dark'
                                                ? 'text-gray-200 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:text-white hover:border-slate-500'
                                                : 'text-white bg-red-500 border-red-400 hover:bg-red-600 hover:text-white hover:border-red-500'}
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
                                );
                            })}
                            {/* Rol bazlı butonlar (sadece giriş yapıldıysa) */}
                            {isLoggedIn && isOpen && (
                                <div className="flex flex-col space-y-2 mt-2">
                                    {user?.role === 'admin' && (
                                        <Link
                                            href="/auth/adminPage"
                                            className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                                ${theme === 'dark'
                                                    ? 'text-white bg-gradient-to-r from-demirhan-700 to-demirhan-800 border-demirhan-700 hover:from-demirhan-800 hover:to-demirhan-900 hover:border-demirhan-800 hover:shadow-lg'
                                                    : 'text-white bg-gradient-to-r from-green-600 to-green-700 border-green-500 hover:from-green-700 hover:to-green-800 hover:border-green-600 hover:shadow-lg'}
                                                transform hover:scale-105 active:scale-95 w-full p-2`}
                                        >
                                            <span className="text-lg mr-2">👤</span> Admin
                                        </Link>
                                    )}
                                    {user?.role === 'user' && (
                                        <Link
                                            href="/auth/userPage"
                                            className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                                ${theme === 'dark'
                                                    ? 'text-white bg-gradient-to-r from-demirhan-600 to-demirhan-700 border-demirhan-600 hover:from-demirhan-700 hover:to-demirhan-800 hover:border-demirhan-700 hover:shadow-lg'
                                                    : 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:border-red-500 hover:shadow-lg'}
                                                transform hover:scale-105 active:scale-95 w-full p-2`}
                                        >
                                            <span className="text-lg mr-2">👨‍💼</span> Kullanıcı
                                        </Link>
                                    )}
                                </div>
                            )}
                            {/* Çıkış/Giriş butonları */}
                            {isLoggedIn ? (
                                isOpen ? (
                                    <button
                                        onClick={loggedOut}
                                                                            className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                        ${theme === 'dark'
                                            ? 'text-white bg-gradient-to-r from-red-700 to-red-800 border-red-700 hover:from-red-800 hover:to-red-900 hover:border-red-800 hover:shadow-lg'
                                            : 'text-white bg-gradient-to-r from-red-900 to-red-950 border-red-800 hover:from-red-950 hover:to-red-950 hover:border-red-900 hover:shadow-lg'}
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
                                            : 'text-white bg-gradient-to-r from-red-900 to-red-950 border-red-800 hover:from-red-950 hover:to-red-950 hover:border-red-900 hover:shadow-lg'}
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
                                            ? 'text-white bg-gradient-to-r from-demirhan-600 to-demirhan-700 border-demirhan-600 hover:from-demirhan-700 hover:to-demirhan-800 hover:border-demirhan-700 hover:shadow-lg'
                                            : 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:border-red-500 hover:shadow-lg'}
                                        transform hover:scale-105 active:scale-95 w-full p-2`}
                                    >
                                        Giriş Yap
                                    </button>
                                ) : (
                                    <button
                                        onClick={loggedIn}
                                                                            className={`text-sm font-semibold rounded-lg border flex items-center justify-center transition-all duration-300
                                        ${theme === 'dark'
                                            ? 'text-white bg-gradient-to-r from-demirhan-600 to-demirhan-700 border-demirhan-600 hover:from-demirhan-700 hover:to-demirhan-800 hover:border-demirhan-700 hover:shadow-lg'
                                            : 'text-white bg-gradient-to-r from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:border-red-500 hover:shadow-lg'}
                                        transform hover:scale-105 active:scale-95 h-12 w-12 p-0 mx-auto`}
                                    >
                                        <span className="text-xl">🔓</span>
                                    </button>
                                )
                            )}
                            
                            {/* Theme Toggle Button */}
                            <div className="mt-4">
                                <button
                                    onClick={() => dispatch(toggleTheme())}
                                    className={`w-full p-2 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                                        theme === 'dark'
                                            ? 'text-gray-200 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:text-white hover:border-slate-500'
                                            : 'text-white bg-red-500 border-red-400 hover:bg-red-600 hover:text-white hover:border-red-500'
                                    }`}
                                    aria-label={theme === 'dark' ? 'Light Mode\'a Geç' : 'Dark Mode\'a Geç'}
                                >
                                    <span className={`text-xl${isOpen ? ' mr-2' : ''}`}>
                                        {theme === 'dark' ? '☀️' : '🌙'}
                                    </span>
                                    {isOpen && (
                                        <span className="font-medium">
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            {isLoggedIn && (
                <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t h-20 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-red-700 border-red-600'}`}>
                    <div className="flex items-center justify-around px-2 py-1">
                        {NavbarList.map((item, index) => {
                            // Admin olmayan kullanıcılar için adminOnly sayfalarını gizle
                            if (item.adminOnly && user?.role !== 'admin') {
                                return null;
                            }
                            
                            return (
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-xs ${
                                        theme === 'dark' 
                                            ? 'hover:bg-slate-700 active:bg-slate-800 text-gray-200'
                                            : 'hover:bg-red-600 active:bg-red-800 text-white'
                                    }`}
                                    key={index}
                                >
                                    <span className="text-xl mb-0.5">{item.icon}</span>
                                    <span className={`font-medium ${
                                        theme === 'dark' ? 'text-gray-200' : 'text-white'
                                    }`}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}

            {/* Mobile Header */}
            <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 px-3 py-2 shadow-sm border-b h-16 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-red-700 border-red-600'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/logo.png"
                            alt="Demirhan Logo"
                            width={80}
                            height={80}
                            className="rounded-lg"
                        />

                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-red-600'}`}
                        >
                            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
                        </button>
                        {isLoggedIn && user?.role === 'admin' && (
                            <Link
                                href="/auth/adminPage"
                                className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-red-600'}`}
                            >
                                <span className="text-lg">👤</span>
                                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}>Admin</span>
                            </Link>
                        )}
                        {isLoggedIn && user?.role === 'user' && (
                            <Link
                                href="/auth/userPage"
                                className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-red-600'}`}
                            >
                                <span className="text-lg">👨‍💼</span>
                                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}>Kullanıcı</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavbarCom;
