'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayIcon, FilmIcon } from '@heroicons/react/24/solid';
import SearchBar from '@/components/SearchBar';

interface AnimeData {
  title: string;
  cover: string;
  description: string;
  score: number;
  episodes: number;
  status: string;
}

export default function PlayerPage({ params }: { params: { id: string } }) {
  const animeNameFromUrl = decodeURIComponent(params.id);
  
  const [searchTerm] = useState(animeNameFromUrl); 
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [episode, setEpisode] = useState(1);

  const playNext = () => {
    if (episode < (animeData?.episodes || 999)) changeEpisode(episode + 1);
  };
  const playPrev = () => {
    if (episode > 1) changeEpisode(episode - 1);
  };

  const isDirectFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.m3u8');
  };

  async function loadPageData() {
    setLoading(true);
    setAnimeData(null);
    setVideoUrl(null);
    setEpisode(1); 

    try {
      const baseUrl = "http://127.0.0.1:8000";
      const resMeta = await fetch(`${baseUrl}/anime/${searchTerm}`);
      
      if (!resMeta.ok) throw new Error("Anime não encontrado");
      const dataMeta = await resMeta.json();
      setAnimeData(dataMeta);

      await fetchVideo(searchTerm, 1);

    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideo(animeName: string, epNumber: number) {
    setVideoUrl(null);
    try {
      const baseUrl = "http://127.0.0.1:8000";
      const resVideo = await fetch(`${baseUrl}/watch/${animeName}/${epNumber}`);
      const dataVideo = await resVideo.json();
      setVideoUrl(dataVideo.stream_url);
    } catch (error) {
      console.error("Erro ao buscar video:", error);
    }
  }

  const changeEpisode = (epNumber: number) => {
    setEpisode(epNumber);
    if (animeData) {
      fetchVideo(animeData.title || searchTerm, epNumber); 
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex gap-4 justify-between items-center">
          
          <Link href="/">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hidden sm:block cursor-pointer hover:opacity-80 transition-opacity">
                AniHub
            </h1>
          </Link>
          
          <div className="flex-1 max-w-lg ml-4">
            <SearchBar />
          </div>
        </div>
      </nav>

      {/* --- CONTEÚDO --- */}
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        
        {loading && (
          <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="text-gray-400 animate-pulse">Carregando {searchTerm}...</p>
          </div>
        )}

        {!loading && animeData && (
          <div className="animate-fade-in space-y-12">
            
            {/* HERO INFO */}
            <div className="flex flex-col lg:flex-row gap-8 items-start bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50 shadow-xl">
              <div className="w-full lg:w-1/4 shrink-0 relative group">
                <img 
                  src={animeData.cover} 
                  alt={animeData.title} 
                  className="w-full rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-transform group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl lg:text-6xl font-black leading-tight text-white">{animeData.title}</h2>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/20">
                    {animeData.score}% Aprovado
                  </span>
                  <span className="bg-purple-500/10 text-purple-400 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-500/20">
                    {animeData.episodes || "?"} Episódios
                  </span>
                  <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20">
                    {animeData.status}
                  </span>
                </div>
                <div 
                  className="text-gray-300 text-lg leading-relaxed max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: animeData.description }} 
                />
              </div>
            </div>

            {/* PLAYER & EPISÓDIOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center gap-3 text-xl font-bold text-purple-400">
                    <FilmIcon className="w-6 h-6" />
                    Assistindo: Episódio {episode}
                 </div>
                 
                 <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 relative z-10">
                    {videoUrl ? (
                      isDirectFile(videoUrl) ? (
                        <video
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                        playsInline
                      />

                      ) : (
                        <iframe 
                          src={videoUrl} 
                          className="w-full h-full border-none contrast-[1.1] saturate-[1.2]"
                          allowFullScreen
                          allow="autoplay; encrypted-media"
                          referrerPolicy="no-referrer"
                        />
                      )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 bg-gray-900/50">
                           <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                           <p>Buscando link do episódio {episode}...</p>
                        </div>
                    )}
                 </div>

                 <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 shadow-md">
                    <button 
                      onClick={playPrev}
                      disabled={episode === 1}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2 rounded-lg font-bold transition-all"
                    >
                      ⏮ Anterior
                    </button>
                    <span className="text-gray-400 text-sm font-mono font-bold">
                      EP {episode} 
                    </span>
                    <button 
                      onClick={playNext}
                      disabled={episode === (animeData?.episodes || 999)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-purple-500/20"
                    >
                      Próximo ⏭
                    </button>
                 </div>
              </div>

              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 h-[500px] flex flex-col shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PlayIcon className="w-5 h-5 text-purple-500" />
                  Navegar Episódios
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 content-start">
                  {Array.from({ length: animeData.episodes || 12 }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => changeEpisode(ep)}
                      className={`
                        aspect-square rounded-lg font-bold text-sm transition-all
                        flex items-center justify-center border
                        ${episode === ep 
                          ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-110' 
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-500'}
                      `}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </main>
  );
}