"use client";
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Link from 'next/link';

const AdminPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const [activeTab, setActiveTab] = useState('profile');

    // Mock admin data
    const adminData = {
        name: 'Admin Kullanıcı',
        email: 'admin@ulas.com',
        role: 'Sistem Yöneticisi',
        department: 'IT',
        phone: '+90 532 123 4567',
        lastLogin: '2024-02-20 14:30',
        permissions: ['user_management', 'vehicle_management', 'system_settings', 'reports'],
        joinDate: '2023-01-15'
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br p-4 sm:p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link href="/" className={`transition-colors text-sm sm:text-base ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}>← Ana Sayfaya Dön</Link>
                        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Admin Paneli</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                            Admin
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className={`flex flex-wrap sm:flex-nowrap gap-1 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 shadow-lg ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                    {[
                        { id: 'profile', name: 'Profil', icon: '👤' },
                        { id: 'users', name: 'Kullanıcılar', icon: '👥' },
                        { id: 'permissions', name: 'Yetkiler', icon: '🔐' },
                        { id: 'activity', name: 'Aktivite', icon: '📊' },
                        { id: 'settings', name: 'Ayarlar', icon: '⚙️' }
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
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{adminData.name}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📧</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>E-posta</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{adminData.email}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📱</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Telefon</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{adminData.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🏢</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Departman</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{adminData.department}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Rol</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{adminData.role}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Katılım Tarihi</p>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{new Date(adminData.joinDate).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Kullanıcı Yönetimi</h3>
                            <button className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${theme === 'dark' ? 'hover:bg-blue-500' : 'hover:bg-blue-700'}`}>
                                + Yeni Kullanıcı
                            </button>
                        </div>
                        
                        {/* Mock Users List */}
                        <div className="space-y-3">
                            {[
                                { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@ulas.com', role: 'employee', status: 'active', lastLogin: '2024-02-20 10:30' },
                                { id: 2, name: 'Fatma Demir', email: 'fatma@ulas.com', role: 'employee', status: 'active', lastLogin: '2024-02-19 15:45' },
                                { id: 3, name: 'Mehmet Kaya', email: 'mehmet@ulas.com', role: 'admin', status: 'active', lastLogin: '2024-02-20 09:15' },
                                { id: 4, name: 'Ayşe Özkan', email: 'ayse@ulas.com', role: 'employee', status: 'inactive', lastLogin: '2024-02-15 14:20' }
                            ].map((user) => (
                                <div key={user.id} className={`border rounded-lg p-4 transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                                            }`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{user.name}</p>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                    ? theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                                                    : theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role === 'admin' ? 'Admin' : 'Çalışan'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.status === 'active'
                                                    ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                                    : theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status === 'active' ? 'Aktif' : 'Pasif'}
                                            </span>
                                            <button className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-100'}`}>
                                                <span className="text-gray-400">⋮</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Son giriş: {new Date(user.lastLogin).toLocaleDateString('tr-TR')} {new Date(user.lastLogin).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'permissions' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yetkiler</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {adminData.permissions.map((permission, index) => (
                                <div key={index} className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50'}`}>
                                    <span className="text-green-600 text-sm sm:text-base">✓</span>
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {permission === 'user_management' && 'Kullanıcı Yönetimi'}
                                        {permission === 'vehicle_management' && 'Araç Yönetimi'}
                                        {permission === 'system_settings' && 'Sistem Ayarları'}
                                        {permission === 'reports' && 'Raporlar'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Aktiviteler</h3>
                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { action: 'Yeni araç eklendi', time: '2 saat önce', type: 'vehicle' },
                                { action: 'Kullanıcı yetkisi güncellendi', time: '1 gün önce', type: 'user' },
                                { action: 'Sistem ayarları değiştirildi', time: '2 gün önce', type: 'settings' },
                                { action: 'Rapor oluşturuldu', time: '3 gün önce', type: 'report' }
                            ].map((activity, index) => (
                                <div key={index} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl sm:text-2xl">
                                            {activity.type === 'vehicle' && '🚗'}
                                            {activity.type === 'user' && '👤'}
                                            {activity.type === 'settings' && '⚙️'}
                                            {activity.type === 'report' && '📊'}
                                        </span>
                                        <div className="flex-1">
                                            <p className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{activity.action}</p>
                                            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Hesap Ayarları</h3>
                        <div className="space-y-4">
                            <button className={`w-full p-3 rounded-lg text-left transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🔐</span>
                                        <div>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Şifre Değiştir</p>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Hesap güvenliği için şifrenizi güncelleyin</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </div>
                            </button>
                            <button className={`w-full p-3 rounded-lg text-left transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🔔</span>
                                        <div>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Bildirim Ayarları</p>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>E-posta ve push bildirimlerini yönetin</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </div>
                            </button>
                            <button className={`w-full p-3 rounded-lg text-left transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🌐</span>
                                        <div>
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Dil Ayarları</p>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Uygulama dilini değiştirin</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;