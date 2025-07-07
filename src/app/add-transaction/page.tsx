"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Mock data types
interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

interface Personnel {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plate: '34ABC123',
    brand: 'Mercedes',
    model: 'Sprinter',
    year: 2020,
    fuel_type: 'dizel',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    plate: '06DEF456',
    brand: 'Ford',
    model: 'Transit',
    year: 2021,
    fuel_type: 'benzin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockPersonnel: Personnel[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@ulas.com',
    phone: '0532 123 4567',
    department: 'Lojistik',
    position: 'Sürücü',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Fatma Demir',
    email: 'fatma.demir@ulas.com',
    phone: '0533 234 5678',
    department: 'İnsan Kaynakları',
    position: 'Müdür',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const AddTransactionPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        personnel_id: '',
        transaction_type: 'fuel',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Load vehicles and personnel on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                setVehicles(mockVehicles);
                setPersonnel(mockPersonnel);
            } catch (error: unknown) {
                console.error('Error loading data:', error);
                setError('Veriler yüklenirken hata oluştu');
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const transactionData = {
                ...formData,
                amount: formData.amount ? parseFloat(formData.amount) : 0,
                date: new Date(formData.date).toISOString(),
                transaction_type: formData.transaction_type as 'fuel' | 'maintenance' | 'repair' | 'toll' | 'parking' | 'other'
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Transaction created:', transactionData);
            alert('İşlem başarıyla eklendi!');
            router.push('/vehicles');
        } catch (error: unknown) {
            console.error('Error creating transaction:', error);
            let message = 'İşlem eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
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
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Vehicle and Personnel Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vehicle_id" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Araç *</label>
                                <select
                                    id="vehicle_id"
                                    name="vehicle_id"
                                    value={formData.vehicle_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="">Araç seçin</option>
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="personnel_id" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Personel *</label>
                                <select
                                    id="personnel_id"
                                    name="personnel_id"
                                    value={formData.personnel_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="">Personel seçin</option>
                                    {personnel.map((person) => (
                                        <option key={person.id} value={person.id}>
                                            {person.name} - {person.position}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Transaction Type and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="transaction_type" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>İşlem Türü *</label>
                                <select
                                    id="transaction_type"
                                    name="transaction_type"
                                    value={formData.transaction_type}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="fuel">Yakıt</option>
                                    <option value="maintenance">Bakım</option>
                                    <option value="repair">Onarım</option>
                                    <option value="toll">Otoyol Ücreti</option>
                                    <option value="parking">Otopark</option>
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
                        {/* Date */}
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
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="İşlem detaylarını buraya yazın..."
                            />
                        </div>
                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-colors duration-200 ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Ekleniyor...' : 'İşlem Ekle'}
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
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son İşlemler</h2>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>34ABC123 - Yakıt</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ahmet Yılmaz</p>
                                    </div>
                                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>₺450.00</span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dizel yakıt alımı</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>2024-01-15</p>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>06DEF456 - Bakım</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fatma Demir</p>
                                    </div>
                                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>₺1,200.00</span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Periyodik bakım</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>2024-01-14</p>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>34ABC123 - Otoyol</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ahmet Yılmaz</p>
                                    </div>
                                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>₺25.00</span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>İstanbul-Ankara otoyol ücreti</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>2024-01-13</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTransactionPage;