'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface AnimeCard {
  id: number;
  title: { romaji: string };
  coverImage: { extraLarge: string };
  averageScore: number;
  genres: string[];
  seasonYear: number;
  episodes: number;
  format: string;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  
  // --- AQUI ESTÁ A CORREÇÃO ---
  // Agora lemos a URL para definir o valor inicial. Se não tiver nada na URL, usa o padrão.
  const [sort, setSort] = useState(searchParams.get('sort') || "POPULARITY_DESC");
  const [genre, setGenre] = useState(searchParams.get('genre') || "Todos");
  const [format, setFormat] = useState(searchParams.get('format') || "Todos");
  
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jumpPage, setJumpPage] = useState("");

  const genresList = ["Todos", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural"];
  
  const formatsList = [
    { label: "Todos", value: "Todos" },
    { label: "Séries de TV", value: "TV" },
    { label: "Filmes", value: "MOVIE" },
    { label: "OVAs", value: "OVA" },
    { label: "Especiais", value: "SPECIAL" },
  ];

  const sortOptions = [
    { label: "Mais Populares", value: "POPULARITY_DESC" },
    { label: "Em Alta (Trending)", value: "TRENDING_DESC" }, // Adicionei essa opção que faltava no select
    { label: "Melhor Avaliados", value: "SCORE_DESC" },
    { label: "Mais Recentes", value: "START_DATE_DESC" },
    { label: "Ordem Alfabética", value: "TITLE_ROMAJI" },
  ];

  async function fetchCatalog() {
    setLoading(true);
    try {
      let url = `http://127.0.0.1:8000/catalog?page=${page}&sort=${sort}`;
      if (genre !== "Todos") url += `&genre=${genre}`;
      if (format !== "Todos") url += `&format=${format}`;

      const res = await fetch(url);
      const data = await res.json();
      
      setAnimes(data.media || []);
      setLastPage(data.pageInfo?.lastPage || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Monitora mudanças nos filtros para recarregar
  useEffect(() => {
    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, sort, genre, format]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= lastPage) {
        setPage(p);
        setJumpPage("");
    }
  };

  return (
      <div className="pt-28 px-4 max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO E FILTROS */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-end bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
            <div>
                <h2 className="text-3xl font-black text-white mb-2">Explorar Animes</h2>
                <p className="text-gray-400">Total de {lastPage} páginas de conteúdo.</p>
            </div>

            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Formato</label>
                    <select value={format} onChange={(e) => { setFormat(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none">
                        {formatsList.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Gênero</label>
                    <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none">
                        {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Ordenar por</label>
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none">
                        {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* GRADE */}
        {loading ? (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {animes.map((anime) => (
                    <Link key={anime.id} href={`/watch/${encodeURIComponent(anime.title.romaji)}`}>
                        <div className="group cursor-pointer space-y-3">
                            <div className="relative overflow-hidden rounded-xl aspect-[2/3] border border-gray-800 shadow-lg">
                                <img src={anime.coverImage.extraLarge} alt={anime.title.romaji} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-green-400 border border-white/10">
                                    {anime.averageScore}%
                                </div>
                                <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                                    {anime.format || "TV"}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 pt-10">
                                     <span className="text-xs font-bold text-white/80">{anime.seasonYear || "N/A"} • {anime.episodes || "?"} Eps</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 group-hover:text-purple-400 truncate transition-colors">{anime.title.romaji}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">{anime.genres.slice(0, 2).join(", ")}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}

        {/* PAGINAÇÃO */}
        {!loading && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12 bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                <div className="flex items-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-30 transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="font-mono font-bold text-purple-400 px-4">Página {page} de {lastPage}</span>
                    <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-30 transition-colors">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Ir para:</span>
                    <input type="number" min="1" max={lastPage} value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center focus:border-purple-500 outline-none" />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">Ir</button>
                </form>
            </div>
        )}
      </div>
  );
}

// Componente Wrapper para usar Suspense (Necessário no Next.js ao usar useSearchParams)
export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center pt-40"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div></div>}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}