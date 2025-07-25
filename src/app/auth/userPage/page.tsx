"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from "../LoginForm";
import { selectIsLoggedIn } from "../../redux/sliceses/authSlices";
import { getActivitiesApi } from '../../api';

const UserPageContent: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const [activeTab, setActiveTab] = useState('profile');
    const searchParams = useSearchParams();
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [userData, setUserData] = useState({
        name: 'Ahmet Yılmaz',
        email: 'ahmet@ulas.com',
        role: 'Sürücü',
        department: 'Lojistik',
        phone: '+90 532 123 4567',
        status: 'active',
        lastLogin: '2024-02-20 14:30',
        joinDate: '2023-03-15',
        vehicleAssigned: '34 ABC 123 - Mercedes Sprinter'
    });

    // URL parametrelerinden kullanıcı verilerini al
    useEffect(() => {
        const id = searchParams.get('id');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const role = searchParams.get('role');
        const department = searchParams.get('department');
        const phone = searchParams.get('phone');
        const status = searchParams.get('status');

        if (id && name && email && role && department && phone && status) {
            setUserData(prev => ({
                ...prev,
                name: decodeURIComponent(name),
                email: decodeURIComponent(email),
                role: decodeURIComponent(role),
                department: decodeURIComponent(department),
                phone: decodeURIComponent(phone),
                status: decodeURIComponent(status),
                lastLogin: new Date().toLocaleString('tr-TR'),
                joinDate: new Date().toLocaleDateString('tr-TR'),
            }));
        }
    }, [searchParams]);

    // Aktiviteleri yükle
    useEffect(() => {
        const loadActivities = async () => {
            if (activeTab === 'activity') {
                try {
                    setLoadingActivities(true);
                    const token = localStorage.getItem('token');
                    if (token) {
                        const response = await getActivitiesApi(token);
                        console.log('Activities response:', response);
                        setActivities(response || []);
                    }
                } catch (error) {
                    console.error('Error loading activities:', error);
                    setActivities([]);
                } finally {
                    setLoadingActivities(false);
                }
            }
        };

        loadActivities();
    }, [activeTab]);

    const getActivityIcon = (action: string) => {
        if (action.includes('giriş') || action.includes('login')) return '🔐';
        if (action.includes('işlem') || action.includes('transaction')) return '💰';
        if (action.includes('araç') || action.includes('vehicle')) return '🚗';
        if (action.includes('personel') || action.includes('personnel')) return '👤';
        if (action.includes('kategori') || action.includes('category')) return '📁';
        if (action.includes('güncell') || action.includes('update')) return '✏️';
        if (action.includes('sil') || action.includes('delete')) return '🗑️';
        if (action.includes('ekle') || action.includes('create')) return '➕';
        return '📊';
    };

    const formatActivityTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (minutes < 60) {
                return `${minutes} dakika önce`;
            } else if (hours < 24) {
                return `${hours} saat önce`;
            } else if (days < 7) {
                return `${days} gün önce`;
            } else {
                return date.toLocaleDateString('tr-TR');
            }
        } catch (error) {
            return 'Bilinmiyor';
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br p-4 sm:p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link href="/" className={`transition-colors text-sm sm:text-base ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}>← Ana Sayfaya Dön</Link>
                        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Kullanıcı Paneli</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            Kullanıcı
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className={`flex flex-wrap sm:flex-nowrap gap-1 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 shadow-lg ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                    {[
                        { id: 'profile', name: 'Profil', icon: '👤' },
                        { id: 'activity', name: 'Aktivite', icon: '📊' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : theme === 'dark' 
                                        ? "text-gray-300 hover:text-gray-100 hover:bg-slate-700"
                                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                        >
                            <span className="text-sm sm:text-base">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'profile' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Profil Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">👤</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ad Soyad</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.name}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📧</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>E-posta</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.email}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📱</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Telefon</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🏢</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Departman</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.department}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Rol</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.role}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🚗</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Atanan Araç</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{userData.vehicleAssigned}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Durum</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            userData.status === 'active' 
                                                ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                                : (theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                        }`}>
                                            {userData.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Aktiviteler</h3>
                        
                        {loadingActivities ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aktiviteler yükleniyor...</span>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id || index} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl sm:text-2xl">
                                                {getActivityIcon(activity.action || '')}
                                            </span>
                                            <div className="flex-1">
                                                <p className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    {activity.action || 'Bilinmeyen aktivite'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {formatActivityTime(activity.created_at)}
                                                    </p>
                                                    {activity.user_name && (
                                                        <>
                                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                                                            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {activity.user_name}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {activity.meta && (
                                                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                                                        {typeof activity.meta === 'string' ? activity.meta : JSON.stringify(activity.meta)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📊</div>
                                <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                    Henüz Aktivite Yok
                                </h4>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Sistem kullanımınız başladığında aktiviteleriniz burada görüntülenecek.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const UserPage: React.FC = () => {
    const isLoggedIn = useSelector(selectIsLoggedIn);
    return (
        <div>
            {!isLoggedIn ? (
                <div className="flex justify-center items-start my-8">
                    <div className="w-full max-w-md">
                        <LoginForm />
                    </div>
                </div>
            ) : (
                <UserPageContent />
            )}
        </div>
    );
};

export default UserPage;