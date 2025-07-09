"use client";
import LoginForm from "./LoginForm";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const AuthPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br p-4 sm:p-8 transition-all duration-300 ${
      theme === 'dark' 
        ? 'from-slate-900 via-slate-800 to-blue-950' 
        : 'from-blue-50 via-indigo-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ulas Tech
          </h1>
          <p className={`transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Araç Filo Yönetim Sistemi
          </p>
        </div>

        <LoginForm />
        
        <div className="text-center mt-6">
          <p className={`text-sm transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Hesabınız yok mu? Lütfen sistem yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;