'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Imports corrigidos usando os atalhos @/
import SearchBar from '@/components/SearchBar';
import { api } from '@/services/api';
import { HomeData, Anime } from '@/types';

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    // Agora usamos nossa API centralizada! Muito mais limpo.
    api.getHome()
      .then(setData)
      .catch(err => console.error("Erro ao carregar home:", err));
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-purple-500">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
    </div>
  );

  // Pega o primeiro anime dos "Trending" para ser o destaque (Hero)
  const heroAnime = data.trending.media[0];

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 overflow-x-hidden font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-gradient-to-b from-black/90 to-transparent p-6 flex justify-between items-center backdrop-blur-sm">
        <Link href="/">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 cursor-pointer hover:scale-105 transition-transform drop-shadow-lg">
            AniHub
            </h1>
        </Link>
        
        {/* BARRA DE PESQUISA (Agora importada corretamente) */}
        <div className="flex-1 max-w-lg flex justify-end">
           <SearchBar />
        </div>
      </nav>

      {/* --- HERO BANNER --- */}
      {heroAnime && (
        <div className="relative h-[85vh] w-full">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${heroAnime.bannerImage || heroAnime.coverImage.extraLarge})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 p-10 max-w-3xl space-y-6 pb-24">
                <h2 className="text-6xl font-black drop-shadow-2xl leading-tight text-white">
                    {heroAnime.title.romaji}
                </h2>
                <div 
                    className="text-gray-200 line-clamp-3 text-lg drop-shadow-md font-medium" 
                    dangerouslySetInnerHTML={{__html: heroAnime.description || ""}} 
                />
                
                <Link href={`/watch/${encodeURIComponent(heroAnime.title.romaji)}`}>
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-105 hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] flex items-center gap-2">
                        ▶ Assistir Agora
                    </button>
                </Link>
            </div>
        </div>
      )}

      {/* --- LISTAS DE CATEGORIAS --- */}
      <div className="px-8 mt-4 relative z-20 space-y-12 pb-10">
        <AnimeRow title="🔥 Em Alta" animes={data.trending.media} />
        <AnimeRow title="🏆 Mais Populares" animes={data.popular.media} />
        <AnimeRow title="⚔️ Ação e Aventura" animes={data.action.media} />
        <AnimeRow title="💖 Romance" animes={data.romance?.media || []} />
        <AnimeRow title="👻 Terror e Suspense" animes={data.horror?.media || []} />
        <AnimeRow title="⚽ Esportes" animes={data.sports?.media || []} />
      </div>
    </main>
  );
}

// Componente da Linha (Carrossel)
function AnimeRow({ title, animes }: { title: string, animes: Anime[] }) {
    if (!animes || animes.length === 0) return null;

    return (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-gray-100 pl-4 border-l-4 border-purple-500 shadow-sm">{title}</h3>
            <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-4 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                {animes.map((anime) => (
                    <Link key={anime.id || anime.title.romaji} href={`/watch/${encodeURIComponent(anime.title.romaji)}`}>
                        <div className="flex-none w-[180px] cursor-pointer group relative">
                            <div className="overflow-hidden rounded-xl shadow-lg border border-gray-800">
                                <img 
                                    src={anime.coverImage.large || anime.coverImage.medium} 
                                    alt={anime.title.romaji}
                                    className="w-full h-[260px] object-cover transition-transform duration-300 group-hover:scale-110 group-hover:opacity-80"
                                />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-300 group-hover:text-purple-400 truncate transition-colors">
                                {anime.title.romaji}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}