'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ListBulletIcon } from '@heroicons/react/24/solid'; // Ícone de lista

export default function MyListPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]); // Mudamos o nome para ficar claro
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function fetchWatchlist() {
    const token = localStorage.getItem("anihub_token");
    if (!token) {
        router.push("/login");
        return;
    }

    try {
        // AGORA BUSCA DO ENDPOINT CORRETO
        const res = await fetch("http://127.0.0.1:8000/users/me/watchlist", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setWatchlist(data);
        } else {
            localStorage.removeItem("anihub_token");
            router.push("/login");
        }
    } catch (error) {
        console.error("Erro ao buscar watchlist", error);
    } finally {
        setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
      <Navbar />

      <div className="pt-32 px-4 max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <ListBulletIcon className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-black text-white">Minha Lista</h1>
        </div>

        {/* GRADE */}
        {loading ? (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        ) : watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
                {watchlist.map((item) => (
                    <Link key={item.id} href={`/watch/${encodeURIComponent(item.title)}`}>
                        <div className="group cursor-pointer space-y-3">
                            <div className="relative overflow-hidden rounded-xl aspect-[2/3] border border-gray-800 shadow-lg group-hover:border-purple-500 transition-all">
                                <img 
                                    src={item.cover} 
                                    alt={item.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded text-[10px] font-bold text-white shadow">
                                    {item.format || "ANIME"}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 group-hover:text-purple-400 truncate transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-500">Para assistir depois</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            /* ESTADO VAZIO */
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4 border-2 border-dashed border-gray-800 rounded-2xl">
                <p className="text-gray-500 text-lg">Sua lista está vazia.</p>
                <Link href="/catalog">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                        Explorar Catálogo
                    </button>
                </Link>
            </div>
        )}

      </div>
    </main>
  );
}