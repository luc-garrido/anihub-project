'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { SparklesIcon, ArrowRightOnRectangleIcon, ListBulletIcon } from '@heroicons/react/24/solid';

export default function Navbar({ isScrolled = true }: { isScrolled?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("anihub_user");
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("anihub_token");
    localStorage.removeItem("anihub_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className={`fixed top-0 w-full z-50 p-4 transition-all duration-500 ${isScrolled ? 'bg-gray-900/95 shadow-lg border-b border-gray-800' : 'bg-gradient-to-b from-gray-900/80 to-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
        
        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
            <Link href="/">
                <h1 className={`text-3xl font-black tracking-tighter cursor-pointer transition-all ${isScrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600' : 'text-white drop-shadow-lg'}`}>
                    AniHub
                </h1>
            </Link>

            <div className="flex items-center gap-6 text-sm font-bold text-gray-200">
                <Link href="/catalog" className="hover:text-white transition-colors">Catálogo</Link>
                
                {/* --- NOVO LINK: MINHA LISTA --- */}
                {user && (
                    <Link href="/my-list" className="hover:text-white transition-colors">Minha Lista</Link>
                )}

                <Link href="/surprise" className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors border border-white/30 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <SparklesIcon className="w-4 h-4" /> Surpreenda-me
                </Link>
            </div>
        </div>
        
        <div className="flex-1 max-w-md w-full flex gap-4 items-center justify-end">
            <div className="flex-1"> <SearchBar /> </div>

            {user ? (
                <div className="flex items-center gap-4">
                    <Link href="/profile">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            {user.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors"><ArrowRightOnRectangleIcon className="w-6 h-6" /></button>
                </div>
            ) : (
                <Link href="/login"> 
                    <button className="bg-white hover:bg-gray-200 text-gray-900 px-5 py-2 rounded-lg font-bold transition-all">Entrar</button>
                </Link>
            )}
        </div>
      </div>
    </nav>
  );
}