"use client"
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Define Personnel type
interface Personnel {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
}

const mockPersonnel: Personnel[] = [
  { id: 1, name: "Ahmet Yılmaz", email: "ahmet@ulas.com", phone: "0532 123 4567", position: "Sürücü", department: "Lojistik", status: "active", hireDate: "2023-01-15" },
  { id: 2, name: "Mehmet Demir", email: "mehmet@ulas.com", phone: "0533 234 5678", position: "Sürücü", department: "Lojistik", status: "active", hireDate: "2023-03-20" },
  { id: 3, name: "Ayşe Kaya", email: "ayse@ulas.com", phone: "0534 345 6789", position: "Operatör", department: "Operasyon", status: "active", hireDate: "2023-02-10" },
  { id: 4, name: "Fatma Özkan", email: "fatma@ulas.com", phone: "0535 456 7890", position: "Yönetici", department: "Yönetim", status: "inactive", hireDate: "2022-11-05" },
  { id: 5, name: "Ali Çelik", email: "ali@ulas.com", phone: "0536 567 8901", position: "Sürücü", department: "Lojistik", status: "active", hireDate: "2023-04-12" },
];

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
    getValue: (list: Personnel[]) => list.filter((p) => p.position === "Sürücü").length,
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

const PersonnelPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "driver",
    department: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "active",
  });

  const personnel: Personnel[] = mockPersonnel.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Personel başarıyla eklendi!");
    setShowAddForm(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "driver",
      department: "",
      hireDate: new Date().toISOString().split("T")[0],
      status: "active",
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br p-2 sm:p-6 ${
        theme === "dark"
          ? "from-slate-900 to-blue-950"
          : "from-slate-50 to-blue-50"
      }`}
    >
      {/* Header */}
      <div className="mb-4 sm:mb-8">
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
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6 mb-4 sm:mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-xl p-3 sm:p-6 shadow-sm border ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
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
                {card.getValue(personnel)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
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
          className={`w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base`}
        >
          <span>➕</span>
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* Personnel List */}
      {/* Mobile: Cards, Desktop: Table */}
      <div className="block sm:hidden space-y-3">
        {personnel.length === 0 && (
          <div className="text-center text-gray-400 py-8">Kayıt bulunamadı.</div>
        )}
        {personnel.map((person) => (
          <div
            key={person.id}
            className={`rounded-xl p-4 shadow-sm border flex flex-col gap-2 ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
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
              <span className="font-medium">Pozisyon:</span> {person.position}
              <span className="font-medium ml-2">Departman:</span> {person.department}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-medium">Telefon:</span> {person.phone}
              <span className="font-medium ml-2">Durum:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${getStatusColor(person.status, theme)}`}>
                {person.status === "active" ? "Aktif" : "Pasif"}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <button className={`text-blue-600 ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "hover:text-blue-900"} text-xs font-medium`}>Düzenle</button>
              <button className={`text-red-600 ${theme === "dark" ? "text-red-400 hover:text-red-300" : "hover:text-red-900"} text-xs font-medium`}>Sil</button>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto rounded-xl">
        <table className={`min-w-[700px] w-full text-sm ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}>
          <thead className={`sticky top-0 z-10 ${theme === "dark" ? "bg-slate-900" : "bg-gray-50"}`}>
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Personel</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Departman</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === "dark" ? "divide-slate-700" : "divide-gray-200"}`}>
            {personnel.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">Kayıt bulunamadı.</td>
              </tr>
            )}
            {personnel.map((person) => (
              <tr key={person.id} className={`hover:${theme === "dark" ? "bg-slate-800" : "bg-gray-100"} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{person.name}</div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{person.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{person.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">{person.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">{person.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status, theme)}`}>
                    {person.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className={`text-blue-600 ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "hover:text-blue-900"} mr-3 text-xs font-medium`}>Düzenle</button>
                  <button className={`text-red-600 ${theme === "dark" ? "text-red-400 hover:text-red-300" : "hover:text-red-900"} text-xs font-medium`}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Personnel Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className={`w-full max-w-md rounded-xl shadow-lg p-4 sm:p-6 ${theme === "dark" ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Yeni Personel Ekle</h2>
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
                  className="flex-1 bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  Ekle
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