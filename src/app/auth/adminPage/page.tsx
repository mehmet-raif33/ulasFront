"use client";
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const AdminPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <div className={`rounded-xl shadow-lg p-8 w-full max-w-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Admin Auth Page</h1>
                {/* Add your authentication form or content here */}
            </div>
        </div>
    );
};

export default AdminPage;