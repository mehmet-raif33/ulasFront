"use client"
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LandingPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const router = useRouter();

  // Giriş yapmış kullanıcıları ana sayfaya yönlendir (sadece landing page'de)
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // Giriş yapmış kullanıcılar için loading göster
  if (isLoggedIn) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-blue-900 to-slate-900' : 'from-blue-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full shadow-lg mb-4 ${
              theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
            }`}>
              <Image
                src="/logo.png"
                alt="Demirhan Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-5xl md:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Demirhan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-xl md:text-2xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            İşletme Yönetim Sistemi
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className={`text-lg mb-12 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Demirhan ile araç işlemlerinizi kaydedin, ciro hesaplamalarınızı yapın ve 
            işletmenizin tüm finansal verilerini kolayca yönetin.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'} shadow-lg`}>
              <div className="text-3xl mb-4">🚗</div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Araç İşlemleri
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Araç işlemlerinizi kaydedin, takip edin ve detaylı raporlar alın.
              </p>
            </div>

            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'} shadow-lg`}>
              <div className="text-3xl mb-4">💰</div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ciro Hesaplama
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Gelir ve gider işlemlerinizi kategorize edin, ciro hesaplamalarınızı yapın.
              </p>
            </div>

            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'} shadow-lg`}>
              <div className="text-3xl mb-4">📊</div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                İşletme Raporları
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                İşletmenizin performansını takip edin ve detaylı finansal raporlar alın.
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Giriş Yap
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage; 