"use client"
import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/sliceses/authSlices';

const AddTransactionPage: React.FC = () => {
    const user = useSelector(selectUser);
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
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Yeni İşlem Ekle
                </h1>
                <p className="text-gray-600">
                    Araç ve personel bilgileri ile yeni işlem kaydı oluşturun
                </p>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vehicle and Driver Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Araç Plakası *
                                </label>
                                <input
                                    type="text"
                                    id="vehiclePlate"
                                    name="vehiclePlate"
                                    value={formData.vehiclePlate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="34 ABC 123"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sürücü Adı *
                                </label>
                                <input
                                    type="text"
                                    id="driverName"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ahmet Yılmaz"
                                    required
                                />
                            </div>
                        </div>

                        {/* Transaction Type and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-2">
                                    İşlem Türü *
                                </label>
                                <select
                                    id="transactionType"
                                    name="transactionType"
                                    value={formData.transactionType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tutar (₺)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Date and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tarih *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Durum *
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Açıklama
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="İşlem detaylarını buraya yazın..."
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>📋</span>
                                <span>İşlem Ekle</span>
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
                                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>🔄</span>
                                <span>Formu Temizle</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recent Transactions Preview */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Son Eklenen İşlemler</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">34 ABC 123 - Teslim Alma</p>
                                <p className="text-sm text-gray-500">Ahmet Yılmaz • 2 saat önce</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Tamamlandı
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">06 XYZ 789 - Bakım</p>
                                <p className="text-sm text-gray-500">Mehmet Demir • 5 saat önce</p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                Devam Ediyor
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionPage;