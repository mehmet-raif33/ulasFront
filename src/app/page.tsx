"use client"
import './globals.css'
import { useSelector } from 'react-redux';
import { selectUser } from './redux/sliceses/authSlices';

export default function Home() {
  const user = useSelector(selectUser);

  // Mock data for dashboard
  const stats = [
    { title: "Toplam Araç", value: "24", change: "+12%", icon: "🚗", color: "blue" },
    { title: "Aktif Personel", value: "18", change: "+5%", icon: "👥", color: "green" },
    { title: "Bu Ay İşlem", value: "156", change: "+23%", icon: "📊", color: "purple" },
    { title: "Toplam Gelir", value: "₺45.2K", change: "+8%", icon: "💰", color: "yellow" }
  ];

  const recentActivities = [
    { action: "Yeni araç eklendi", time: "2 saat önce", type: "vehicle" },
    { action: "Personel girişi yapıldı", time: "4 saat önce", type: "personnel" },
    { action: "İşlem tamamlandı", time: "6 saat önce", type: "transaction" },
    { action: "Sistem güncellemesi", time: "1 gün önce", type: "system" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500 text-white",
      green: "bg-green-500 text-white", 
      purple: "bg-purple-500 text-white",
      yellow: "bg-yellow-500 text-white"
    };
    return colors[color as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      vehicle: "🚗",
      personnel: "👤", 
      transaction: "📋",
      system: "⚙️"
    };
    return icons[type as keyof typeof icons] || "📌";
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hoş Geldiniz, {user?.email || 'Kullanıcı'}!
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${getColorClasses(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hızlı İşlemler</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>🚗</span>
              <span>Araç Ekle</span>
            </button>
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>👤</span>
              <span>Personel Ekle</span>
            </button>
            <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>📋</span>
              <span>İşlem Ekle</span>
            </button>
            <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>📊</span>
              <span>Rapor Görüntüle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sistem Durumu</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Veritabanı</span>
              <span className="text-green-600 font-medium">✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Servisi</span>
              <span className="text-green-600 font-medium">✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Güvenlik</span>
              <span className="text-green-600 font-medium">✓ Güvenli</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Kullanıcı Bilgileri</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.email || 'Misafir Kullanıcı'}</p>
                <p className="text-sm text-gray-500">{user?.isAdmin ? 'Admin' : 'Kullanıcı'}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Son giriş: {new Date().toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

