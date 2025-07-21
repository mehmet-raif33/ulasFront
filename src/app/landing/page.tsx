"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const LandingPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const features = [
    {
      icon: "🚗",
      title: "Otomotiv Yönetimi",
      description: "Araç satış, servis ve stok takibi için kapsamlı çözümler"
    },
    {
      icon: "🏠",
      title: "Gayrimenkul Yönetimi",
      description: "Emlak portföyü ve müşteri ilişkileri yönetimi"
    },
    {
      icon: "💧",
      title: "Oto Yıkama Takibi",
      description: "Yıkama hizmetleri ve randevu sistemi yönetimi"
    },
    {
      icon: "📊",
      title: "Merkezi Yönetim",
      description: "Tüm iş alanlarını tek platformdan yönetin"
    }
  ];

  const services = [
    {
      icon: "🔧",
      title: "Araç Servisi",
      description: "Teknik servis ve bakım hizmetleri"
    },
    {
      icon: "💰",
      title: "Araç Satışı",
      description: "Yeni ve ikinci el araç satış platformu"
    },
    {
      icon: "🏢",
      title: "Emlak Danışmanlığı",
      description: "Konut ve ticari gayrimenkul hizmetleri"
    },
    {
      icon: "✨",
      title: "Detaylı Yıkama",
      description: "Profesyonel araç yıkama ve detay hizmetleri"
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 pt-14 lg:pt-0 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100'
    }`}>
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex-1">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 opacity-10 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' 
              : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
          }`}></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
            }`}></div>
            <div className={`absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${
              theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
            }`}></div>
            <div className={`absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse delay-2000 ${
              theme === 'dark' ? 'bg-pink-500' : 'bg-pink-300'
            }`}></div>
          </div>
        </div>

        <div className="text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 backdrop-blur-sm border ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/50 border-gray-200'
          }">
            <span className={`text-sm font-medium bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-blue-400 to-purple-400' 
                : 'from-blue-600 to-purple-600'
            } bg-clip-text text-transparent leading-tight`}>🏆 Güvenilir Marka</span>
          </div>

          <h1 className={`text-5xl sm:text-7xl font-bold mb-6 transition-colors duration-300 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-white via-blue-200 to-purple-200' 
              : 'from-gray-900 via-blue-600 to-purple-600'
          } bg-clip-text text-transparent leading-tight`}>
            Demirhan
          </h1>
          
          <p className={`text-xl sm:text-2xl mb-4 transition-colors duration-300 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Otomotiv • Gayrimenkul • Oto Yıkama
          </p>
          
          <p className={`text-lg mb-8 transition-colors duration-300 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Çok yönlü işletme yönetim sistemi ile tüm hizmetlerinizi dijitalleştirin
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth"
              className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Sisteme Giriş</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            
            <div className={`flex items-center gap-2 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>7/24 erişim</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-4 backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white/50 border-gray-200'
            }">
              <span className={`text-sm font-medium bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-purple-400 to-pink-400' 
                  : 'from-purple-600 to-pink-600'
              } bg-clip-text text-transparent leading-tight`}>🛠️ Hizmetlerimiz</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors duration-300 bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-white to-blue-200' 
                : 'from-gray-900 to-blue-600'
            } bg-clip-text text-transparent leading-tight`}>
              Kapsamlı Hizmet Ağı
            </h2>
            <p className={`text-lg transition-colors duration-300 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Otomotiv, gayrimenkul ve oto yıkama alanlarında profesyonel çözümler
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:border-blue-500/50'
                    : 'bg-white/50 border border-gray-200 hover:bg-white/70 hover:border-blue-300'
                } backdrop-blur-sm relative overflow-hidden`}
              >
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  theme === 'dark' 
                    ? 'from-blue-500 to-purple-500' 
                    : 'from-blue-400 to-purple-400'
                }`}></div>
                
                <div className="relative z-10">
                  <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 ${
                    theme === 'dark' ? 'filter brightness-110' : ''
                  }`}>
                    {service.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`transition-colors duration-300 leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-4 backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white/50 border-gray-200'
            }">
              <span className={`text-sm font-medium bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-green-400 to-blue-400' 
                  : 'from-green-600 to-blue-600'
              } bg-clip-text text-transparent leading-tight`}>✨ Sistem Özellikleri</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors duration-300 bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-white to-green-200' 
                : 'from-gray-900 to-green-600'
            } bg-clip-text text-transparent leading-tight`}>
              Güçlü Yönetim Araçları
            </h2>
            <p className={`text-lg transition-colors duration-300 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              İşletmenizi büyütmek için ihtiyacınız olan her şey tek platformda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:border-green-500/50'
                    : 'bg-white/50 border border-gray-200 hover:bg-white/70 hover:border-green-300'
                } backdrop-blur-sm relative overflow-hidden`}
              >
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  theme === 'dark' 
                    ? 'from-green-500 to-blue-500' 
                    : 'from-green-400 to-blue-400'
                }`}></div>
                
                <div className="relative z-10">
                  <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 ${
                    theme === 'dark' ? 'filter brightness-110' : ''
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`transition-colors duration-300 leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 opacity-5 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600' 
              : 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400'
          }`}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 backdrop-blur-sm border ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/50 border-gray-200'
          }">
            <span className={`text-sm font-medium bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-orange-400 to-red-400' 
                : 'from-orange-600 to-red-600'
            } bg-clip-text text-transparent leading-tight`}>🎯 Hemen Başlayın</span>
          </div>
          
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-colors duration-300 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-white via-orange-200 to-red-200' 
              : 'from-gray-900 via-orange-600 to-red-600'
          } bg-clip-text text-transparent leading-tight`}>
            İşletmenizi Dijitalleştirin
          </h2>
          
          <p className={`text-xl mb-8 transition-colors duration-300 max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Demirhan yönetim sistemi ile tüm iş süreçlerinizi optimize edin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth"
              className={`group relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl hover:scale-105'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>Sisteme Giriş Yap</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">🚀</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            
            <div className={`flex items-center gap-3 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex -space-x-2">
                <div className={`w-8 h-8 rounded-full border-2 ${
                  theme === 'dark' ? 'border-slate-800 bg-blue-500' : 'border-white bg-blue-500'
                } flex items-center justify-center text-white text-xs font-bold`}>D</div>
                <div className={`w-8 h-8 rounded-full border-2 ${
                  theme === 'dark' ? 'border-slate-800 bg-green-500' : 'border-white bg-green-500'
                } flex items-center justify-center text-white text-xs font-bold`}>M</div>
                <div className={`w-8 h-8 rounded-full border-2 ${
                  theme === 'dark' ? 'border-slate-800 bg-purple-500' : 'border-white bg-purple-500'
                } flex items-center justify-center text-white text-xs font-bold`}>H</div>
              </div>
              <span>Demirhan Ekibi</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={`border-t transition-all duration-300 ${
        theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl">🏆</span>
              <span className={`font-semibold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Demirhan
              </span>
            </div>
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              © 2024 Demirhan. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 