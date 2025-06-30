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
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "maintenance": return "bg-yellow-100 text-yellow-800";
            case "inactive": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
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
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 via-blue-50 to-indigo-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/vehicles" className={`transition-colors ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}`}>← Araçlara Dön</Link>
                        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Detayları</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                            {getStatusText(vehicle.status)}
                        </span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Düzenle
                        </button>
                    </div>
                </div>
                
                {/* Vehicle Basic Info Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🚗</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{vehicle.brand} {vehicle.model}</h2>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {vehicle.plate}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-gray-600">Yıl</p>
                                    <p className="text-xl font-bold text-gray-800">{vehicle.year}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <p className="text-sm text-gray-600">Kilometre</p>
                                    <p className="text-xl font-bold text-gray-800">{vehicle.mileage.toLocaleString()} km</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <p className="text-sm text-gray-600">Yakıt</p>
                                    <p className="text-xl font-bold text-gray-800">{vehicle.fuelType}</p>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                                    <p className="text-sm text-gray-600">Renk</p>
                                    <p className="text-xl font-bold text-gray-800">{vehicle.color}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
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
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Vehicle Details */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Araç Bilgileri</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Marka/Model:</span>
                                    <span className="font-semibold">{vehicle.brand} {vehicle.model}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Motor:</span>
                                    <span className="font-semibold">{vehicle.engineSize}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Vites:</span>
                                    <span className="font-semibold">{vehicle.transmission}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Yakıt Tüketimi:</span>
                                    <span className="font-semibold">{vehicle.fuelEfficiency} L/100km</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Maksimum Hız:</span>
                                    <span className="font-semibold">{vehicle.maxSpeed} km/h</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Koltuk Kapasitesi:</span>
                                    <span className="font-semibold">{vehicle.seatingCapacity} Kişi</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Bagaj Kapasitesi:</span>
                                    <span className="font-semibold">{vehicle.trunkCapacity}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Finansal Bilgiler</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Satın Alma Tarihi:</span>
                                    <span className="font-semibold">{new Date(vehicle.purchaseDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Satın Alma Fiyatı:</span>
                                    <span className="font-semibold">₺{vehicle.purchasePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Güncel Değer:</span>
                                    <span className="font-semibold">₺{vehicle.currentValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Sigorta Bitiş:</span>
                                    <span className="font-semibold">{new Date(vehicle.insuranceExpiry).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Ruhsat Bitiş:</span>
                                    <span className="font-semibold">{new Date(vehicle.registrationExpiry).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Özellikler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {vehicle.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                                        <span className="text-blue-600">✓</span>
                                        <span className="text-sm font-medium text-gray-800">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "specifications" && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Teknik Özellikler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Motor</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Motor Hacmi:</span>
                                        <span className="font-medium">{vehicle.engineSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Yakıt Tipi:</span>
                                        <span className="font-medium">{vehicle.fuelType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Yakıt Tüketimi:</span>
                                        <span className="font-medium">{vehicle.fuelEfficiency} L/100km</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Performans</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Maksimum Hız:</span>
                                        <span className="font-medium">{vehicle.maxSpeed} km/h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">0-100 km/h:</span>
                                        <span className="font-medium">~10.5 saniye</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Güç:</span>
                                        <span className="font-medium">125 HP</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Boyutlar</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Uzunluk:</span>
                                        <span className="font-medium">4.63 m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Genişlik:</span>
                                        <span className="font-medium">1.78 m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Yükseklik:</span>
                                        <span className="font-medium">1.45 m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "maintenance" && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Bakım Geçmişi</h3>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                Yeni Bakım Ekle
                            </button>
                        </div>
                        <div className="space-y-4">
                            {vehicle.maintenanceHistory.map((maintenance, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <h4 className="font-semibold text-gray-800">{maintenance.type}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">₺{maintenance.cost.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">{maintenance.mileage.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-2">{maintenance.description}</p>
                                    <p className="text-sm text-gray-500">{new Date(maintenance.date).toLocaleDateString('tr-TR')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "trips" && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Son Seferler</h3>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Yeni Sefer Ekle
                            </button>
                        </div>
                        <div className="space-y-4">
                            {vehicle.recentTrips.map((trip, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🚗</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{trip.destination}</h4>
                                                <p className="text-sm text-gray-500">Sürücü: {trip.driver}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{trip.distance} km</p>
                                            <p className="text-sm text-gray-500">{trip.fuelUsed}L yakıt</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{new Date(trip.date).toLocaleDateString('tr-TR')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Belgeler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">📄</span>
                                    <h4 className="font-semibold text-gray-800">Ruhsat</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Araç ruhsat belgesi</p>
                                <p className="text-xs text-gray-500">Son güncelleme: 15.01.2024</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">🛡️</span>
                                    <h4 className="font-semibold text-gray-800">Sigorta</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Trafik sigortası belgesi</p>
                                <p className="text-xs text-gray-500">Bitiş: 31.12.2024</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">🔧</span>
                                    <h4 className="font-semibold text-gray-800">Bakım Raporu</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Son bakım raporu</p>
                                <p className="text-xs text-gray-500">Tarih: 15.01.2024</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">📋</span>
                                    <h4 className="font-semibold text-gray-800">Satın Alma</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Satın alma belgesi</p>
                                <p className="text-xs text-gray-500">Tarih: 15.03.2022</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">📊</span>
                                    <h4 className="font-semibold text-gray-800">Kilometre Raporu</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Kilometre takip raporu</p>
                                <p className="text-xs text-gray-500">Güncel: 45.678 km</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">➕</span>
                                    <h4 className="font-semibold text-gray-800">Belge Ekle</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Yeni belge yükle</p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehiclePage;