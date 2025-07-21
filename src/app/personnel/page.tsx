"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import { selectIsLoggedIn, selectUser } from "../redux/sliceses/authSlices";
import Link from "next/link";
import { motion } from 'framer-motion';
import { getPersonnelApi, createPersonnelApi } from '../api';
import { useToast } from '../AppLayoutClient';

// Personnel interface matching backend schema
interface Personnel {
  id: string;
  full_name: string;
  username?: string;
  email: string;
  phone?: string;
  hire_date?: string;
  status: string;
  notes?: string;
  is_active: boolean;
  role?: string;
  created_at: string;
  updated_at?: string;
}

const statCards = [
  {
    label: "Toplam Personel",
    icon: "👥",
    getValue: (list: Personnel[]) => list.length,
    color: "bg-blue-500",
  },
  {
    label: "Aktif Durumda",
    icon: "✅",
    getValue: (list: Personnel[]) => list.filter((p) => p.status === "active").length,
    color: "bg-green-500",
  },
  {
    label: "Aktif Kayıt",
    icon: "👥",
    getValue: (list: Personnel[]) => list.filter((p) => p.is_active).length,
    color: "bg-purple-500",
  },
  {
    label: "Yeni Bu Ay",
    icon: "🆕",
    getValue: (list: Personnel[]) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return list.filter((p) => {
        if (!p.hire_date) return false;
        try {
          const hireDate = new Date(p.hire_date);
          return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
        } catch {
          return false;
        }
      }).length;
    },
    color: "bg-yellow-500",
  },
];

function getStatusColor(status: string, theme: string) {
  if (theme === "dark") {
    return status === "active"
      ? "bg-green-900 text-green-200"
      : "bg-red-900 text-red-200";
  }
  return status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
}

const PersonnelPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    hire_date: "",
    status: "active",
    notes: "",
    password: "",
    role: "personnel"
  });

  // Giriş yapmamış kullanıcıları landing page'e yönlendir
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/landing');
    }
  }, [isLoggedIn, router]);

  // Admin olmayan kullanıcıları ana sayfaya yönlendir
  useEffect(() => {
    if (isLoggedIn && user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoggedIn, user, router]);

  // Load personnel on component mount
  useEffect(() => {
    if (isLoggedIn) {
      const loadPersonnel = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Token bulunamadı');
            return;
          }
          
          setLoading(true);
          const response = await getPersonnelApi(token);
          console.log('Personnel API Response:', response);
          // Backend'den gelen response formatını kontrol et
          if (response.success && response.data) {
            setPersonnel(response.data);
          } else if (Array.isArray(response)) {
            setPersonnel(response);
          } else {
            setPersonnel([]);
          }
        } catch (error: unknown) {
          console.error('Error loading personnel:', error);
          setError('Personel listesi yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      };
      loadPersonnel();
    }
  }, [isLoggedIn]);

  // Giriş yapmamış kullanıcılar için loading göster
  if (!isLoggedIn) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin olmayan kullanıcılar için loading göster (yönlendirme sırasında)
  if (isLoggedIn && user?.role !== 'admin') {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredPersonnel = personnel.filter(
    (person) =>
      (person.full_name && person.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.username && person.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.phone && person.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Form validation
      if (!formData.full_name.trim()) {
        setError('Ad Soyad alanı zorunludur');
        showToast('Ad Soyad alanı zorunludur', 'error');
        return;
      }
      
      if (!formData.email.trim()) {
        setError('E-posta alanı zorunludur');
        showToast('E-posta alanı zorunludur', 'error');
        return;
      }
      
      // Email formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Geçerli bir e-posta adresi giriniz');
        showToast('Geçerli bir e-posta adresi giriniz', 'error');
        return;
      }
      
      // Telefon ve hire_date opsiyonel olabilir
      // if (!formData.phone.trim()) {
      //   setError('Telefon alanı zorunludur');
      //   return;
      // }
      
      // if (!formData.hire_date) {
      //   setError('İşe başlama tarihi zorunludur');
      //   return;
      // }
      
      if (formData.username && formData.password && formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalı');
        showToast('Şifre en az 6 karakter olmalı', 'error');
        return;
      }

      const personnelData = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        hire_date: formData.hire_date || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        password: formData.password || undefined,
        role: formData.role
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await createPersonnelApi(token, personnelData);
      
      // Add to local state - response formatını kontrol et
      if (response.success && response.data) {
        setPersonnel(prev => [...prev, response.data]);
      } else if (response.id) {
        setPersonnel(prev => [...prev, response]);
      }
      
      showToast("Personel başarıyla eklendi!", 'success');
      setShowAddForm(false);
      
      setFormData({
        full_name: "",
        username: "",
        email: "",
        phone: "",
        hire_date: "",
        status: "active",
        notes: "",
        password: "",
        role: "personnel"
      });
    } catch (error: unknown) {
      console.error('Error creating personnel:', error);
      let message = 'Personel eklenirken hata oluştu';
      if (error && typeof error === 'object' && 'message' in error) {
        message += `: ${(error as { message?: string }).message}`;
      }
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br p-4 sm:p-8 ${
        theme === "dark"
          ? "from-slate-900 to-blue-950"
          : "from-slate-50 to-blue-50"
      }`}
    >
      {/* Header */}
      <motion.div 
        className="mb-4 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className={`text-xl sm:text-3xl font-bold mb-1 ${
            theme === "dark" ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Personel Yönetimi
        </h1>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
          Personel bilgilerini görüntüleyin ve yönetin
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div 
        className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8 mb-6 sm:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            className={`rounded-xl shadow-sm border p-4 sm:p-6 ${
              theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.1 * (index + 1) }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                  {card.label}
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}>
                  {card.getValue(personnel)}
                </p>
              </div>
              <div className={`w-8 h-8 sm:w-12 sm:h-12 ${card.color} text-white rounded-lg flex items-center justify-center text-sm sm:text-2xl`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
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
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "bg-slate-800 border-slate-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
          />
          {searchTerm && (
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredPersonnel.length} personel bulundu
            </p>
          )}
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            + Personel Ekle
          </button>
        )}
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

      {/* Loading State */}
      {loading && personnel.length === 0 && (
        <motion.div 
          className="flex items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </motion.div>
      )}

      {/* Add Personnel Form */}
      {showAddForm && (
        <motion.div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={`w-full max-w-2xl rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Yeni Personel Ekle</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="ahmet.yilmaz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">E-posta *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="ahmet.yilmaz@ulas.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="0555 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="En az 6 karakter"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="employee">Çalışan</option>
                    <option value="admin">Yönetici</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
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
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notlar</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Personel hakkında ek bilgiler..."
                />
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

      {/* Personnel List */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {filteredPersonnel.map((person, index) => (
          <motion.div
            key={person.id}
            className={`rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow ${
              theme === "dark" ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ y: -2 }}
          >
            <Link href={`/personnel/${person.id}-${person.full_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'personel'}`} title={person.full_name || 'Personel Detayı'}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                  {person.full_name || 'İsimsiz'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status || 'inactive', theme)}`}>
                  {person.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>E-posta:</span>
                  <span className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>{person.email || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Telefon:</span>
                  <span className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>{person.phone || 'Belirtilmemiş'}</span>
                </div>
                {person.username && (
                  <div className="flex justify-between">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Kullanıcı Adı:</span>
                    <span className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>{person.username}</span>
                  </div>
                )}
                {person.role && (
                  <div className="flex justify-between">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Rol:</span>
                    <span className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>{person.role === 'admin' ? 'Yönetici' : 'Personel'}</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredPersonnel.length === 0 && personnel.length > 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
            Personel Bulunamadı
          </h3>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            &quot;{searchTerm}&quot; ile eşleşen personel bulunamadı.
          </p>
        </motion.div>
      )}

      {personnel.length === 0 && !loading && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">👥</div>
          <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
            Henüz Personel Yok
          </h3>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            İlk personelinizi eklemek için &quot;Personel Ekle&quot; butonuna tıklayın.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PersonnelPage;