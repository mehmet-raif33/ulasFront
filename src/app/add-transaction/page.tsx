"use client"
import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { motion } from 'framer-motion';

const AddTransactionPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const [formData, setFormData] = useState({
        vehiclePlate: '',
        driverName: '',
        transactionType: 'pickup',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Transaction data:', formData);
        // Here you would typically send the data to your API
        alert('İşlem başarıyla eklendi!');
    };

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yeni İşlem Ekle</h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Araç ve personel bilgileri ile yeni işlem kaydı oluşturun</p>
            </motion.div>

            {/* Form and Recent Transactions */}
            <motion.div 
                className="max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <motion.div 
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    > 
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yeni İşlem Formu</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Vehicle and Driver Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vehiclePlate" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Araç Plakası *</label>
                                <input
                                    type="text"
                                    id="vehiclePlate"
                                    name="vehiclePlate"
                                    value={formData.vehiclePlate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    placeholder="34 ABC 123"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="driverName" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Sürücü Adı *</label>
                                <input
                                    type="text"
                                    id="driverName"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    placeholder="Ahmet Yılmaz"
                                    required
                                />
                            </div>
                        </div>
                        {/* Transaction Type and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="transactionType" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>İşlem Türü *</label>
                                <select
                                    id="transactionType"
                                    name="transactionType"
                                    value={formData.transactionType}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="pickup">Teslim Alma</option>
                                    <option value="delivery">Teslim Etme</option>
                                    <option value="maintenance">Bakım</option>
                                    <option value="fuel">Yakıt</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Tutar (₺)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        {/* Date and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Tarih *</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Durum *</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="in-progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                    <option value="cancelled">İptal Edildi</option>
                                </select>
                            </div>
                        </div>
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="İşlem detaylarını buraya yazın..."
                            />
                        </div>
                        {/* Submit Buttons */}
                        <div className="flex justify-center gap-4 pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}">
                            <button
                                type="submit"
                                className={`bg-blue-600 text-white py-4 px-8 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 min-w-[120px]`}
                            >
                                <span>📋</span>
                                <span>Ekle</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        vehiclePlate: '',
                                        driverName: '',
                                        transactionType: 'pickup',
                                        description: '',
                                        amount: '',
                                        date: new Date().toISOString().split('T')[0],
                                        status: 'pending'
                                    });
                                }}
                                className={`bg-gray-500 text-white py-4 px-8 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-700'} focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 min-w-[120px]`}
                            >
                                <span>🔄</span>
                                <span>Temizle</span>
                            </button>
                        </div>
                    </form>
                    </motion.div>

                    {/* Recent Transactions Preview */}
                    <motion.div 
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Eklenen İşlemler</h2>
                        <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <motion.div 
                                className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                            > 
                                <div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>34 ABC 123 - Teslim Alma</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ahmet Yılmaz • 2 saat önce</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                                    Tamamlandı
                                </span>
                            </motion.div>
                            <motion.div 
                                className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                            > 
                                <div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>06 XYZ 789 - Bakım</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Mehmet Demir • 5 saat önce</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Devam Ediyor
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTransactionPage;