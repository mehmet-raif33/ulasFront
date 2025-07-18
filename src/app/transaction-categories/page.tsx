"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectIsLoggedIn, selectUser } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getTransactionCategoriesApi, createTransactionCategoryApi, updateTransactionCategoryApi, deleteTransactionCategoryApi } from '../api';

// Transaction Category interface
interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const TransactionCategoriesPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
    const [formData, setFormData] = useState({
        name: ''
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

    // Load categories on component mount
    useEffect(() => {
        if (isLoggedIn) {
            const loadCategories = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('Token bulunamadı');
                        return;
                    }
                    setLoading(true);
                    const response = await getTransactionCategoriesApi(token);
                    
                    setCategories(response.data || []);
                } catch (error: unknown) {
                    console.error('Error loading categories:', error);
                    setError('Kategoriler yüklenirken hata oluştu');
                } finally {
                    setLoading(false);
                }
            };
            loadCategories();
        }
    }, [isLoggedIn]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setEditingCategory(null);
        setShowAddForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!formData.name.trim()) {
                setError('İşlem türü adı zorunludur');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token bulunamadı');
            }

            if (editingCategory) {
                // Update existing category
                const response = await updateTransactionCategoryApi(token, editingCategory.id, {
                    name: formData.name.trim()
                });
                setCategories(prev => prev.map(cat => 
                    cat.id === editingCategory.id ? response.data : cat
                ));
                setSuccess('İşlem türü başarıyla güncellendi!');
            } else {
                // Create new category
                const response = await createTransactionCategoryApi(token, {
                    name: formData.name.trim()
                });
                setCategories(prev => [...prev, response.data]);
                setSuccess('İşlem türü başarıyla eklendi!');
            }
            resetForm();
        } catch (error: unknown) {
            console.error('Error saving category:', error);
            let message = 'İşlem türü kaydedilirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: TransactionCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name
        });
        setShowAddForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Bu işlem türünü silmek istediğinizden emin misiniz?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token bulunamadı');
            }
            await deleteTransactionCategoryApi(token, categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            setSuccess('İşlem türü başarıyla silindi!');
        } catch (error: unknown) {
            console.error('Error deleting category:', error);
            let message = 'İşlem türü silinirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
        }
    };

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

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>İşlem Türleri</h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>İşlem türlerini yöneterek daha iyi takip edin</p>
            </motion.div>

            {/* Success Message */}
            {success && (
                <motion.div 
                    className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {success}
                </motion.div>
            )}

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
            {loading && categories.length === 0 && (
                <motion.div 
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </motion.div>
            )}

            {/* Add Button */}
            {user?.role === 'admin' && (
                <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        + İşlem Türü Ekle
                    </button>
                </motion.div>
            )}

            {/* Add/Edit Form Modal */}
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
                            <h2 className="text-xl font-semibold">
                                {editingCategory ? 'İşlem Türü Düzenle' : 'Yeni İşlem Türü Ekle'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">İşlem Türü Adı *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Yakıt, Bakım, Sigorta..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Ekle')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Categories Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        whileHover={{ y: -2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-500 text-white`}>
                                    {category.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {category.name}
                                    </h3>
                                </div>
                            </div>
                            {user?.role === 'admin' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span>Oluşturulma: {category.created_at ? new Date(category.created_at).toLocaleDateString('tr-TR') : 'Tarih yok'}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Empty State */}
            {categories.length === 0 && !loading && (
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        Henüz İşlem Türü Yok
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {user?.role === 'admin' 
                            ? 'İlk işlem türünüzü eklemek için "İşlem Türü Ekle" butonuna tıklayın.'
                            : 'Henüz işlem türü eklenmemiş. Yöneticinizle iletişime geçin.'
                        }
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default TransactionCategoriesPage; 