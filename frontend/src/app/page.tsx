'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { PlayIcon } from '@heroicons/react/24/solid';

// Tipagem
interface Anime {
    id: number;
    title: { romaji: string };
    coverImage: { extraLarge: string, large: string, medium: string };
    bannerImage?: string;
    description?: string;
    trailer?: { id: string; site: string } | null;
}
interface HomeData {
    trending: { media: Anime[] };
    popular: { media: Anime[] };
    action: { media: Anime[] };
    romance: { media: Anime[] };
    horror: { media: Anime[] };
    sports: { media: Anime[] };
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/home")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Erro ao carregar home:", err));
      
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-purple-500">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
    </div>
  );

  const heroAnime = data.trending.media[0];
  
  // Lógica de Trailer/Fundo
  const trailerId = heroAnime?.trailer?.site === "youtube" ? heroAnime.trailer.id : null;
  const youtubeEmbedUrl = trailerId 
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerId}&modestbranding=1`
    : undefined;
  const showVideo = !!youtubeEmbedUrl;
  const backgroundImageUrl = heroAnime.bannerImage || heroAnime.coverImage.extraLarge;


  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 overflow-x-hidden font-sans">
      
      <Navbar isScrolled={isScrolled} />

      {/* --- HERO BANNER --- */}
      {heroAnime && (
        <div className="relative h-[90vh] w-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0">
                {showVideo ? (
                    <iframe 
                        src={youtubeEmbedUrl}
                        className="w-full h-full object-cover scale-[1.5] pointer-events-none"
                        allow="autoplay; encrypted-media"
                        // @ts-ignore
                        frameBorder="0"
                    />
                ) : (
                    <img src={backgroundImageUrl} alt={heroAnime.title.romaji} className="w-full h-full object-cover" />
                )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
            
            <div className="absolute inset-0 z-20 flex items-center justify-start px-8 md:px-16 lg:px-24">
                <div className="max-w-2xl space-y-6 mt-20 animate-fade-in-up">
                    <h2 className="text-5xl md:text-7xl font-black leading-none drop-shadow-2xl text-white">
                        {heroAnime.title.romaji}
                    </h2>
                    <div 
                        className="text-gray-200 text-lg md:text-xl line-clamp-3 drop-shadow-md font-medium text-shadow-sm" 
                        dangerouslySetInnerHTML={{__html: heroAnime.description || ""}} 
                    />
                    <Link href={`/watch/${encodeURIComponent(heroAnime.title.romaji)}`}>
                        <button className="mt-6 bg-white text-gray-900 hover:bg-gray-200 px-8 py-3 md:px-10 md:py-4 rounded-lg font-bold text-lg md:text-xl transition-all flex items-center gap-3 shadow-xl hover:scale-105">
                            <PlayIcon className="w-8 h-8" />
                            Assistir Agora
                        </button>
                    </Link>
                </div>
            </div>
        </div>
      )}

      {/* --- LISTAS DE CATEGORIAS COM LINKS --- */}
      <div className="px-8 relative z-30 -mt-32 space-y-12 pb-10 bg-gradient-to-t from-gray-900 to-transparent pt-32">
        
        {/* Passamos o link específico para cada filtro */}
        <AnimeRow 
            title="🔥 Em Alta no Momento" 
            animes={data.trending.media} 
            link="/catalog?sort=TRENDING_DESC" 
        />
        <AnimeRow 
            title="🏆 Populares no AniHub" 
            animes={data.popular.media} 
            link="/catalog?sort=POPULARITY_DESC" 
        />
        <AnimeRow 
            title="⚔️ Ação e Aventura" 
            animes={data.action.media} 
            link="/catalog?genre=Action" 
        />
        <AnimeRow 
            title="💖 Para Maratonar a Dois" 
            animes={data.romance?.media || []} 
            link="/catalog?genre=Romance" 
        />
        <AnimeRow 
            title="👻 Se Tiver Coragem" 
            animes={data.horror?.media || []} 
            link="/catalog?genre=Horror" 
        />
        <AnimeRow 
            title="⚽ Suor e Lágrimas" 
            animes={data.sports?.media || []} 
            link="/catalog?genre=Sports" 
        />
      
      </div>
    </main>
  );
}

// Componente AnimeRow Atualizado (Aceita 'link')
function AnimeRow({ title, animes, link }: { title: string, animes: Anime[], link: string }) {
    if (!animes || animes.length === 0) return null;
    return (
        <div className="animate-fade-in pl-4">
            {/* O título agora é um Link clicável */}
            <Link href={link}>
                <h3 className="text-2xl font-bold mb-4 text-gray-100 hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-2 group w-fit">
                    {title} 
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2 duration-300">
                        Ver tudo ➔
                    </span>
                </h3>
            </Link>
            
            <div className="flex gap-4 overflow-x-auto pb-8 pt-4 px-2 scrollbar-hide scroll-smooth hover:scrollbar-default">
                {animes.map((anime) => (
                    <Link key={anime.id} href={`/watch/${encodeURIComponent(anime.title.romaji)}`}>
                        <div className="flex-none w-[160px] md:w-[200px] cursor-pointer group/card relative transition-all duration-300 hover:scale-110 hover:z-50">
                            <div className="overflow-hidden rounded-lg shadow-lg border border-gray-800 group-hover/card:border-purple-500 aspect-[2/3]">
                                <img 
                                    src={anime.coverImage.large || anime.coverImage.medium} 
                                    alt={anime.title.romaji}
                                    className="w-full h-full object-cover transition-transform duration-300"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg flex items-end p-4">
                                 <p className="text-sm font-bold text-white truncate">{anime.title.romaji}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}