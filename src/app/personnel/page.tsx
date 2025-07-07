"use client"
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Link from "next/link";
import { motion } from 'framer-motion';

interface Personnel {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
}

const statCards = [
  {
    label: "Toplam Personel",
    icon: "👥",
    getValue: (list: Personnel[]) => list.length,
    color: "bg-blue-500",
  },
  {
    label: "Aktif Personel",
    icon: "✅",
    getValue: (list: Personnel[]) => list.filter((p) => p.status === "active").length,
    color: "bg-green-500",
  },
  {
    label: "Sürücüler",
    icon: "🚗",
    getValue: (list: Personnel[]) => list.filter((p) => p.position === "driver").length,
    color: "bg-purple-500",
  },
  {
    label: "Yeni Bu Ay",
    icon: "🆕",
    getValue: () => 2,
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

const mockPersonnel: Personnel[] = [
  {
    id: '1',
    name: 'Zeynep Aksoy',
    email: 'zeynep.aksoy@ulas.com',
    phone: '0555 111 2233',
    department: 'Finans',
    position: 'Uzman',
    status: 'active',
  },
  {
    id: '2',
    name: 'Emre Kılıç',
    email: 'emre.kilic@ulas.com',
    phone: '0554 222 3344',
    department: 'Operasyon',
    position: 'Yönetici',
    status: 'active',
  },
  {
    id: '3',
    name: 'Selin Yıldız',
    email: 'selin.yildiz@ulas.com',
    phone: '0553 333 4455',
    department: 'Lojistik',
    position: 'Sürücü',
    status: 'inactive',
  },
];

const PersonnelPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>(mockPersonnel);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "active",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredPersonnel = personnel.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // personnelUtils.createPersonnel(newPersonnelData);
      alert("Personel başarıyla eklendi!");
      setShowAddForm(false);
      
      // Reload personnel
      // const updatedPersonnelData = await personnelUtils.getAllPersonnel();
      setPersonnel(mockPersonnel);
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        status: "active",
      });
    } catch (error: unknown) {
      console.error('Error creating personnel:', error);
      let message = 'Personel eklenirken hata oluştu';
      if (error && typeof error === 'object' && 'message' in error) {
        message += `: ${(error as { message?: string }).message}`;
      }
      setError(message);
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
            className={`flex items-center gap-4 rounded-xl p-4 sm:p-8 shadow-sm border ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.2 + (index * 0.05) }}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 ${card.color} text-white rounded-lg flex items-center justify-center text-xl sm:text-2xl`}
            >
              {card.icon}
            </div>
            <div>
              <div
                className={`text-xs sm:text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {card.label}
              </div>
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {card.getValue(filteredPersonnel)}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Add */}
      <motion.div 
        className="flex gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <input
          type="text"
          placeholder="Personel ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
            theme === "dark"
              ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500"
              : "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400"
          }`}
        />
        <button
          onClick={() => setShowAddForm(true)}
          className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-lg sm:text-xl ${
            theme === "dark" 
              ? "bg-slate-800 text-white" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title="Yeni Personel Ekle"
        >
          ➕
        </button>
      </motion.div>

      {/* Personnel List */}
      {/* Mobile: Cards, Desktop: Table */}
      <motion.div 
        className="block sm:hidden space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {filteredPersonnel.length === 0 && (
          <div className={`text-center py-8 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`}>Kayıt bulunamadı.</div>
        )}
        {filteredPersonnel.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.6 + (index * 0.05) }}
          >
            <Link
              href={`/auth/userPage?id=${person.id}&name=${encodeURIComponent(person.name)}&email=${encodeURIComponent(person.email)}&role=${encodeURIComponent(person.position)}&department=${encodeURIComponent(person.department)}&phone=${encodeURIComponent(person.phone)}&status=${person.status}`}
              className={`rounded-xl p-5 shadow-sm border flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === "dark" 
                    ? "bg-blue-900" 
                    : "bg-blue-100"
                }`}>
                  <span className={`font-semibold text-lg ${
                    theme === "dark" 
                      ? "text-blue-200" 
                      : "text-blue-600"
                  }`}>
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div
                    className={`text-base font-medium ${
                      theme === "dark" ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {person.name}
                  </div>
                  <div
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {person.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Pozisyon:</span> 
                <span className={theme === "dark" ? "text-gray-100" : "text-gray-800"}>{person.position}</span>
                <span className={`font-medium ml-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Departman:</span> 
                <span className={theme === "dark" ? "text-gray-100" : "text-gray-800"}>{person.department}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Telefon:</span> 
                <span className={theme === "dark" ? "text-gray-100" : "text-gray-800"}>{person.phone}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status, theme)}`}>
                  {person.status === "active" ? "Aktif" : "Pasif"}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${theme === "dark" ? "bg-blue-900 text-blue-200 hover:bg-blue-800" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${theme === "dark" ? "bg-red-900 text-red-200 hover:bg-red-800" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop Table */}
      <motion.div 
        className="hidden sm:block overflow-x-auto rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <table className={`min-w-[700px] w-full text-sm ${theme === "dark" ? "bg-slate-800" : "bg-slate-50"}`}>
          <thead className={`sticky top-0 z-10 ${theme === "dark" ? "bg-slate-800" : "bg-gray-50"}`}>
            <tr>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>Personel</th>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>Pozisyon</th>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>Departman</th>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>İletişim</th>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>Durum</th>
              <th className={`px-6 py-3 text-left font-medium uppercase tracking-wider ${
                theme === "dark" ? "text-gray-300" : "text-gray-500"
              }`}>İşlemler</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === "dark" ? "divide-slate-700" : "divide-gray-200"}`}>
            {filteredPersonnel.length === 0 && (
              <tr>
                <td colSpan={6} className={`text-center py-8 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>Kayıt bulunamadı.</td>
              </tr>
            )}
            {filteredPersonnel.map((person, index) => (
              <motion.tr 
                key={person.id} 
                className={`hover:${theme === "dark" ? "bg-slate-700" : "bg-gray-100"} transition-colors`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.6 + (index * 0.05) }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/auth/userPage?id=${person.id}&name=${encodeURIComponent(person.name)}&email=${encodeURIComponent(person.email)}&role=${encodeURIComponent(person.position)}&department=${encodeURIComponent(person.department)}&phone=${encodeURIComponent(person.phone)}&status=${person.status}`}
                    className="block hover:bg-opacity-50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        theme === "dark" 
                          ? "bg-blue-900" 
                          : "bg-blue-100"
                      }`}>
                        <span className={`font-semibold ${
                          theme === "dark" 
                            ? "text-blue-200" 
                            : "text-blue-600"
                        }`}>
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{person.name}</div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{person.email}</div>
                      </div>
                    </div>
                  </Link>
                </td>

                <td className={`px-6 py-4 whitespace-nowrap ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{person.position}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{person.department}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{person.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status, theme)}`}>
                    {person.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className={`mr-3 text-xs font-medium px-3 py-1 rounded-lg transition-colors ${theme === "dark" ? "bg-blue-900 text-blue-200 hover:bg-blue-800" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${theme === "dark" ? "bg-red-900 text-red-200 hover:bg-red-800" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                  >
                    Sil
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Add Personnel Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className={`w-full max-w-md rounded-xl shadow-lg p-4 sm:p-6 ${theme === "dark" ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Yeni Personel Ekle</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Ad Soyad *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500" : "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400"}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>E-posta *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500" : "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400"}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500" : "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400"}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Pozisyon *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100" : "bg-slate-50 border-gray-300 text-gray-900"}`}
                  required
                >
                  <option value="driver">Sürücü</option>
                  <option value="operator">Operatör</option>
                  <option value="manager">Yönetici</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Departman</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500" : "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400"}`}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelPage;