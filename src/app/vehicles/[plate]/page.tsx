"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface VehiclePageProps {
    params: Promise<{ plate: string }>;
}

interface VehicleData {
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    fuelType: string;
    transmission: string;
    engineSize: string;
    mileage: number;
    status: "active" | "maintenance" | "inactive";
    lastService: string;
    nextService: string;
    owner: string;
    insuranceExpiry: string;
    registrationExpiry: string;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    fuelEfficiency: number;
    maxSpeed: number;
    seatingCapacity: number;
    trunkCapacity: string;
    features: string[];
    maintenanceHistory: Array<{
        date: string;
        type: string;
        cost: number;
        description: string;
        mileage: number;
    }>;
    recentTrips: Array<{
        date: string;
        destination: string;
        distance: number;
        driver: string;
        fuelUsed: number;
    }>;
}

const VehiclePage: React.FC<VehiclePageProps> = ({ params }) => {
    const [vehicle, setVehicle] = useState<VehicleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [plate, setPlate] = useState<string>("");
    const theme = useSelector((state: RootState) => state.theme.theme);

    // Handle async params
    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setPlate(resolvedParams.plate);
        };
        getParams();
    }, [params]);

    // Mock data - in real app, this would come from API
    useEffect(() => {
        if (!plate) return;

        const mockVehicle: VehicleData = {
            plate: plate,
            brand: "Toyota",
            model: "Corolla",
            year: 2022,
            color: "Beyaz",
            fuelType: "Benzin",
            transmission: "Otomatik",
            engineSize: "1.6L",
            mileage: 45678,
            status: "active",
            lastService: "2024-01-15",
            nextService: "2024-04-15",
            owner: "Ulas Tech A.Ş.",
            insuranceExpiry: "2024-12-31",
            registrationExpiry: "2025-06-30",
            purchaseDate: "2022-03-15",
            purchasePrice: 450000,
            currentValue: 380000,
            fuelEfficiency: 6.8,
            maxSpeed: 180,
            seatingCapacity: 5,
            trunkCapacity: "470L",
            features: ["ABS", "ESP", "Hava Yastığı", "Klima", "Navigasyon", "Geri Görüş Kamerası"],
            maintenanceHistory: [
                {
                    date: "2024-01-15",
                    type: "Periyodik Bakım",
                    cost: 2500,
                    description: "Yağ değişimi, filtre değişimi, fren kontrolü",
                    mileage: 45000
                },
                {
                    date: "2023-10-20",
                    type: "Lastik Değişimi",
                    cost: 3200,
                    description: "4 adet yeni lastik takıldı",
                    mileage: 42000
                },
                {
                    date: "2023-07-10",
                    type: "Periyodik Bakım",
                    cost: 1800,
                    description: "Yağ değişimi, filtre değişimi",
                    mileage: 38000
                }
            ],
            recentTrips: [
                {
                    date: "2024-02-15",
                    destination: "İstanbul - Ankara",
                    distance: 450,
                    driver: "Ahmet Yılmaz",
                    fuelUsed: 30.6
                },
                {
                    date: "2024-02-10",
                    destination: "İstanbul - Bursa",
                    distance: 155,
                    driver: "Mehmet Demir",
                    fuelUsed: 10.5
                },
                {
                    date: "2024-02-05",
                    destination: "İstanbul - İzmir",
                    distance: 480,
                    driver: "Fatma Kaya",
                    fuelUsed: 32.6
                }
            ]
        };

        setTimeout(() => {
            setVehicle(mockVehicle);
            setIsLoading(false);
        }, 500);
    }, [plate]);

    const getStatusColor = (status: string) => {
        if (theme === 'dark') {
            switch (status) {
                case "active": return "bg-green-900 text-green-200";
                case "maintenance": return "bg-yellow-900 text-yellow-200";
                case "inactive": return "bg-red-900 text-red-200";
                default: return "bg-gray-800 text-gray-200";
            }
        } else {
            switch (status) {
                case "active": return "bg-green-100 text-green-800";
                case "maintenance": return "bg-yellow-100 text-yellow-800";
                case "inactive": return "bg-red-100 text-red-800";
                default: return "bg-gray-100 text-gray-800";
            }
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active": return "Aktif";
            case "maintenance": return "Bakımda";
            case "inactive": return "Pasif";
            default: return "Bilinmiyor";
        }
    };

    if (isLoading) {
        return (
            <div className={`flex-1 bg-gradient-to-br min-h-screen flex items-center justify-center ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 via-blue-50 to-indigo-50'}`}>
                <div className={`text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                    <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
                    <p className="font-medium">Araç bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className={`flex-1 bg-gradient-to-br min-h-screen flex items-center justify-center ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 via-blue-50 to-indigo-50'}`}>
                <div className={`text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <div className="text-6xl mb-4">🚗</div>
                    <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Bulunamadı</h1>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Bu plakaya sahip araç sistemde bulunmamaktadır.</p>
                    <Link href="/vehicles" className={`px-6 py-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-blue-800 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Araçlara Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-3 sm:p-4 lg:p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 via-blue-50 to-indigo-50'}`}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link href="/vehicles" className={`transition-colors text-sm sm:text-base ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}>← Araçlara Dön</Link>
                        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Detayları</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                            {getStatusText(vehicle.status)}
                        </span>
                        <button className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                            Düzenle
                        </button>
                    </div>
                </div>
                
                {/* Vehicle Basic Info Card */}
                <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center">
                            <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🚗</div>
                            <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.brand} {vehicle.model}</h2>
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {vehicle.plate}
                            </p>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                                <div className={`text-center p-2 sm:p-4 rounded-lg sm:rounded-xl ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Yıl</p>
                                    <p className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.year}</p>
                                </div>
                                <div className={`text-center p-2 sm:p-4 rounded-lg sm:rounded-xl ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50'}`}>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Kilometre</p>
                                    <p className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.mileage.toLocaleString()} km</p>
                                </div>
                                <div className={`text-center p-2 sm:p-4 rounded-lg sm:rounded-xl ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Yakıt</p>
                                    <p className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.fuelType}</p>
                                </div>
                                <div className={`text-center p-2 sm:p-4 rounded-lg sm:rounded-xl ${theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-50'}`}>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Renk</p>
                                    <p className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.color}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 sm:mb-6">
                <div className={`flex flex-wrap sm:flex-nowrap gap-1 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 shadow-lg ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                    {[
                        { id: "overview", name: "Genel Bakış", icon: "📊" },
                        { id: "specifications", name: "Teknik Özellikler", icon: "⚙️" },
                        { id: "maintenance", name: "Bakım Geçmişi", icon: "🔧" },
                        { id: "trips", name: "Seferler", icon: "🗺️" },
                        { id: "documents", name: "Belgeler", icon: "📄" }
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
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Vehicle Details */}
                        <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                            <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Bilgileri</h3>
                            <div className="space-y-4">
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Marka/Model:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.brand} {vehicle.model}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Motor:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.engineSize}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Vites:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.transmission}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Yakıt Tüketimi:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.fuelEfficiency} L/100km</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Maksimum Hız:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.maxSpeed} km/h</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Koltuk Kapasitesi:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.seatingCapacity} Kişi</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Bagaj Kapasitesi:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.trunkCapacity}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                            <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Finansal Bilgiler</h3>
                            <div className="space-y-4">
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Satın Alma Tarihi:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{new Date(vehicle.purchaseDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Satın Alma Fiyatı:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>₺{vehicle.purchasePrice.toLocaleString()}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Güncel Değer:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>₺{vehicle.currentValue.toLocaleString()}</span>
                                </div>
                                <div className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Sigorta Bitiş:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{new Date(vehicle.insuranceExpiry).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Ruhsat Bitiş:</span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{new Date(vehicle.registrationExpiry).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className={`lg:col-span-2 ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                            <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Özellikler</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                {vehicle.features.map((feature, index) => (
                                    <div key={index} className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                                        <span className={`text-sm sm:text-base ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>✓</span>
                                        <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "specifications" && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Teknik Özellikler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                <h4 className={`font-semibold border-b pb-2 ${theme === 'dark' ? 'text-gray-100 border-slate-600' : 'text-gray-800 border-gray-200'}`}>Motor</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Motor Hacmi:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.engineSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Yakıt Tipi:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.fuelType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Yakıt Tüketimi:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.fuelEfficiency} L/100km</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className={`font-semibold border-b pb-2 ${theme === 'dark' ? 'text-gray-100 border-slate-600' : 'text-gray-800 border-gray-200'}`}>Performans</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Maksimum Hız:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.maxSpeed} km/h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>0-100 km/h:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>~10.5 saniye</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Güç:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>125 HP</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className={`font-semibold border-b pb-2 ${theme === 'dark' ? 'text-gray-100 border-slate-600' : 'text-gray-800 border-gray-200'}`}>Boyutlar</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Uzunluk:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>4.63 m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Genişlik:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>1.78 m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Yükseklik:</span>
                                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>1.45 m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "maintenance" && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Bakım Geçmişi</h3>
                            <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base">
                                Yeni Bakım Ekle
                            </button>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {vehicle.maintenanceHistory.map((maintenance, index) => (
                                <div key={index} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 rounded-full"></div>
                                            <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{maintenance.type}</h4>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>₺{maintenance.cost.toLocaleString()}</p>
                                            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{maintenance.mileage.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                    <p className={`mb-2 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{maintenance.description}</p>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(maintenance.date).toLocaleDateString('tr-TR')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "trips" && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Seferler</h3>
                            <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                                Yeni Sefer Ekle
                            </button>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {vehicle.recentTrips.map((trip, index) => (
                                <div key={index} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="text-xl sm:text-2xl">🚗</span>
                                            <div>
                                                <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{trip.destination}</h4>
                                                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sürücü: {trip.driver}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{trip.distance} km</p>
                                            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{trip.fuelUsed}L yakıt</p>
                                        </div>
                                    </div>
                                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(trip.date).toLocaleDateString('tr-TR')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className={`${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border p-4 sm:p-6`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Belgeler</h3>
                            <button className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base">
                                Belge Yükle
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">📄</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Ruhsat</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Araç ruhsat belgesi</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Son güncelleme: 15.01.2024</p>
                            </div>
                            
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">🛡️</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Sigorta</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Trafik sigortası belgesi</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Bitiş: 31.12.2024</p>
                            </div>
                            
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">🔧</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Bakım Raporu</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Son bakım raporu</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tarih: 15.01.2024</p>
                            </div>
                            
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">📋</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Satın Alma</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Satın alma belgesi</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tarih: 15.03.2022</p>
                            </div>
                            
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">📊</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Kilometre Raporu</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Kilometre takip raporu</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Güncel: 45.678 km</p>
                            </div>
                            
                            <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <span className="text-xl sm:text-2xl">➕</span>
                                    <h4 className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Belge Ekle</h4>
                                </div>
                                <p className={`text-xs sm:text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Yeni belge yükle</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>PDF, JPG, PNG</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehiclePage;