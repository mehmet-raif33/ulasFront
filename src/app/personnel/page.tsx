"use client"
import React, { useState } from 'react';

const PersonnelPage: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: 'driver',
        department: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active'
    });

    // Mock personnel data
    const personnel = [
        { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@ulas.com', phone: '0532 123 4567', position: 'Sürücü', department: 'Lojistik', status: 'active', hireDate: '2023-01-15' },
        { id: 2, name: 'Mehmet Demir', email: 'mehmet@ulas.com', phone: '0533 234 5678', position: 'Sürücü', department: 'Lojistik', status: 'active', hireDate: '2023-03-20' },
        { id: 3, name: 'Ayşe Kaya', email: 'ayse@ulas.com', phone: '0534 345 6789', position: 'Operatör', department: 'Operasyon', status: 'active', hireDate: '2023-02-10' },
        { id: 4, name: 'Fatma Özkan', email: 'fatma@ulas.com', phone: '0535 456 7890', position: 'Yönetici', department: 'Yönetim', status: 'inactive', hireDate: '2022-11-05' },
        { id: 5, name: 'Ali Çelik', email: 'ali@ulas.com', phone: '0536 567 8901', position: 'Sürücü', department: 'Lojistik', status: 'active', hireDate: '2023-04-12' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Personnel data:', formData);
        alert('Personel başarıyla eklendi!');
        setShowAddForm(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            position: 'driver',
            department: '',
            hireDate: new Date().toISOString().split('T')[0],
            status: 'active'
        });
    };

    const filteredPersonnel = personnel.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        return status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Personel Yönetimi
                </h1>
                <p className="text-gray-600">
                    Personel bilgilerini görüntüleyin ve yönetin
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Toplam Personel</p>
                            <p className="text-2xl font-bold text-gray-800">{personnel.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            👥
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Aktif Personel</p>
                            <p className="text-2xl font-bold text-gray-800">{personnel.filter(p => p.status === 'active').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Sürücüler</p>
                            <p className="text-2xl font-bold text-gray-800">{personnel.filter(p => p.position === 'Sürücü').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🚗
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Yeni Bu Ay</p>
                            <p className="text-2xl font-bold text-gray-800">2</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🆕
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Personel ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <span>➕</span>
                    <span>Yeni Personel</span>
                </button>
            </div>

            {/* Personnel List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departman</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPersonnel.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {person.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                                <div className="text-sm text-gray-500">{person.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                                            {person.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">Düzenle</button>
                                        <button className="text-red-600 hover:text-red-900">Sil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Personnel Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Personel Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon *</label>
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="driver">Sürücü</option>
                                    <option value="operator">Operatör</option>
                                    <option value="manager">Yönetici</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Ekle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
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