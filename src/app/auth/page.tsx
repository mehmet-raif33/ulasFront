'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, setLoading } from '../redux/sliceses/authSlices';
import { RootState } from '../redux/store';

const Auth: React.FC = () => {
    const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const theme = useSelector((state: RootState) => state.theme.theme);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));
        
        // Simulate API call
        setTimeout(() => {
            dispatch(login({
                email: formData.email,
                isAdmin: isAdmin
            }));
            dispatch(setLoading(false));
        }, 1000);
    };

    return (
        <div className={`flex-1 min-h-screen bg-gradient-to-br p-4 flex items-center justify-center ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-blue-50 to-indigo-100'}`}>
            <div className={`rounded-2xl shadow-xl p-8 w-full max-w-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Giriş Yap</h1>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Hesabınıza erişim sağlayın</p>
                </div>
                {/* Toggle Button */}
                <div className={`mb-6 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg p-1`}>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => setIsAdmin(false)}
                            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${!isAdmin ? (theme === 'dark' ? 'bg-slate-800 text-blue-300 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800')}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Normal Kullanıcı
                            </div>
                        </button>
                        <button
                            onClick={() => setIsAdmin(true)}
                            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${isAdmin ? (theme === 'dark' ? 'bg-slate-800 text-blue-300 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800')}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin
                            </div>
                        </button>
                    </div>
                </div>
                {/* Form */}
                {!isAdmin && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>E-posta</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Şifre</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200`}
                        >
                            Giriş Yap
                        </button>
                    </form>
                )}
                <div className="mt-6 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{isAdmin ? 'Admin paneli' : 'Kullanıcı paneli'} için giriş yapıyorsunuz</p>
                </div>
                {/* Google Sign-In for Admin Only */}
                {isAdmin && (
                    <div className="mt-6">
                        <button
                            type="button"
                            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 hover:bg-slate-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200`}
                            onClick={() => {
                                // Google Sign-In logic will go here
                                console.log('Google Sign-In clicked for admin');
                            }}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google ile Admin Girişi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;