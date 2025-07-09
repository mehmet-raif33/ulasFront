"use client"
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  },
  {
    id: '3',
    plate: '35GHI789',
    brand: 'Volkswagen',
    model: 'Crafter',
    year: 2019,
    fuel_type: 'dizel',
    status: 'maintenance',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const VehiclesPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const router = useRouter();
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        fuel_type: 'dizel',
        status: 'active'
    });

    // Giriş yapmamış kullanıcıları landing page'e yönlendir
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/landing');
        }
    }, [isLoggedIn, router]);

    // Load vehicles on component mount
    useEffect(() => {
        if (isLoggedIn) {
            const loadVehicles = async () => {
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setVehicles(mockVehicles);
                } catch (error: unknown) {
                    console.error('Error loading vehicles:', error);
                    setError('Araçlar yüklenirken hata oluştu');
                }
            };
            loadVehicles();
        }
    }, [isLoggedIn]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Giriş yapmamış kullanıcılar için loading göster
    if (!isLoggedIn) {
        return (
            <div className="flex-1 min-h-screen w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted, starting...');
        setLoading(true);
        setError(null);

        try {
            // Form validasyonu
            if (!formData.plate.trim()) {
                setError('Plaka alanı zorunludur');
                return;
            }
            
            if (!formData.brand.trim()) {
                setError('Marka alanı zorunludur');
                return;
            }
            
            if (!formData.model.trim()) {
                setError('Model alanı zorunludur');
                return;
            }
            
            if (!formData.year || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
                setError('Geçerli bir yıl giriniz');
                return;
            }

            const vehicleData = {
                id: Date.now().toString(),
                plate: formData.plate.trim().toUpperCase(),
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year),
                fuel_type: formData.fuel_type,
                status: formData.status as 'active' | 'inactive' | 'maintenance',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Sending vehicle data:', vehicleData);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add to local state
            setVehicles(prev => [...prev, vehicleData]);
            
            console.log('Vehicle created successfully:', vehicleData);
            alert('Araç başarıyla eklendi!');
            setShowAddForm(false);
            setError(null);
            setLoading(false);
            
            setFormData({
                plate: '',
                brand: '',
                model: '',
                year: '',
                fuel_type: 'dizel',
                status: 'active'
            });
        } catch (error: unknown) {
            console.error('Error creating vehicle:', error);
            let message = 'Araç eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
            setLoading(false);
        } finally {
            console.log('Form submission completed');
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        if (theme === 'dark') {
          if (status === 'active') return 'bg-green-900 text-green-200';
          if (status === 'maintenance') return 'bg-yellow-900 text-yellow-200';
          if (status === 'inactive') return 'bg-red-900 text-red-200';
        }
        if (status === 'active') return 'bg-green-100 text-green-800';
        if (status === 'maintenance') return 'bg-yellow-100 text-yellow-800';
        if (status === 'inactive') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts = {
            active: 'Aktif',
            maintenance: 'Bakımda',
            inactive: 'Pasif'
        };
        return texts[status as keyof typeof texts] || status;
    };

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Yönetimi</h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Araç bilgilerini görüntüleyin ve yönetin</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Araç</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🚗
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.25 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aktif Araçlar</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.filter(v => v.status === 'active').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.3 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bakımda</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.filter(v => v.status === 'maintenance').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🔧
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pasif Araçlar</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.filter(v => v.status === 'inactive').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            ❌
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Search and Add Button */}
            <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Araç ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'dark' 
                                ? 'bg-slate-800 border-slate-600 text-gray-100 placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    + Araç Ekle
                </button>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div 
                    className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}

            {/* Add Vehicle Form */}
            {showAddForm && (
                <motion.div 
                    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className={`w-full max-w-md rounded-xl shadow-lg p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Yeni Araç Ekle</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Plaka *</label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="34ABC123"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Marka *</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Mercedes"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Model *</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Sprinter"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Yıl *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="2020"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Yakıt Tipi</label>
                                <select
                                    name="fuel_type"
                                    value={formData.fuel_type}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                >
                                    <option value="dizel">Dizel</option>
                                    <option value="benzin">Benzin</option>
                                    <option value="elektrik">Elektrik</option>
                                    <option value="hibrit">Hibrit</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Durum</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Pasif</option>
                                    <option value="maintenance">Bakımda</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Vehicles List */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                {filteredVehicles.map((vehicle, index) => (
                    <motion.div
                        key={vehicle.id}
                        className={`rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        whileHover={{ y: -2 }}
                    >
                        <Link href={`/vehicles/${vehicle.plate}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                    {vehicle.plate}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                    {getStatusText(vehicle.status)}
                                </span>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Marka:</span>
                                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{vehicle.brand}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Model:</span>
                                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{vehicle.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Yıl:</span>
                                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{vehicle.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Yakıt:</span>
                                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{vehicle.fuel_type}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && vehicles.length > 0 && (
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        Araç Bulunamadı
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        &quot;{searchTerm}&quot; ile eşleşen araç bulunamadı.
                    </p>
                </motion.div>
            )}

            {vehicles.length === 0 && (
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        Henüz Araç Yok
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        İlk aracınızı eklemek için &quot;Araç Ekle&quot; butonuna tıklayın.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default VehiclesPage;