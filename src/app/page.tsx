"use client"
import './globals.css'
import { useSelector } from 'react-redux';
import { selectUser } from './redux/sliceses/authSlices';
import { RootState } from './redux/store';

export default function Home() {
  const user = useSelector(selectUser);
  const theme = useSelector((state: RootState) => state.theme.theme);

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
    <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          Hoş Geldiniz, {user?.email || 'Kullanıcı'}!
        </h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
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
          <div key={index} className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{stat.value}</p>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stat.change}</p>
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
        <div className={`lg:col-span-2 rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Aktiviteler</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-gray-50'}`}>
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{activity.action}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Hızlı İşlemler</h2>
          <div className="space-y-3">
            <button className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'}`}>
              <span>🚗</span>
              <span>Araç Ekle</span>
            </button>
            <button className={`w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-green-800' : 'hover:bg-green-700'}`}>
              <span>👤</span>
              <span>Personel Ekle</span>
            </button>
            <button className={`w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-purple-800' : 'hover:bg-purple-700'}`}>
              <span>📋</span>
              <span>İşlem Ekle</span>
            </button>
            <button className={`w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-orange-800' : 'hover:bg-orange-700'}`}>
              <span>📊</span>
              <span>Rapor Görüntüle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* System Status */}
        <div className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Sistem Durumu</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Veritabanı</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>API Servisi</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Güvenlik</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Güvenli</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Kullanıcı Bilgileri</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-blue-200' : 'text-blue-600'}`}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{user?.email || 'Misafir Kullanıcı'}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.isAdmin ? 'Admin' : 'Kullanıcı'}</p>
              </div>
            </div>
            <div className={`pt-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Son giriş: {new Date().toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

