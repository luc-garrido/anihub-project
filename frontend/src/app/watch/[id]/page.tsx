'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactHlsPlayer from 'react-hls-player';
import { 
  FilmIcon, StarIcon, RectangleStackIcon, ListBulletIcon, 
  HeartIcon, PlusIcon, CheckIcon 
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import Navbar from '@/components/Navbar';

interface Relation { type: string; title: string; format: string; cover: string; }
interface AnimeData { id: number; title: string; cover: string; banner?: string; description: string; score: number; episodes: number; status: string; year?: number; genres?: string[]; studio?: string; relations?: Relation[]; format?: string; }

export default function PlayerPage({ params }: { params: { id: string } }) {
  const animeNameFromUrl = decodeURIComponent(params.id);
  
  const [searchTerm] = useState(animeNameFromUrl); 
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [episode, setEpisode] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'episodes' | 'seasons'>('episodes');
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchList, setIsInWatchList] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const isM3U8 = (url: string) => url?.includes('.m3u8');
  const isMP4 = (url: string) => url?.includes('.mp4');

  useEffect(() => {
    setToken(localStorage.getItem("anihub_token"));
  }, []);

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
      
      checkStatus(dataMeta.id); 
      
      await fetchVideo(searchTerm, 1, dataMeta);
    } catch (error) { console.error("Erro:", error); } finally { setLoading(false); }
  }

  async function fetchVideo(animeName: string, epNumber: number, dataMeta: AnimeData | null = null) {
    setVideoUrl(null);
    try {
      const baseUrl = "http://127.0.0.1:8000";
      const resVideo = await fetch(`${baseUrl}/watch/${animeName}/${epNumber}`);
      const dataVideo = await resVideo.json();
      setVideoUrl(dataVideo.stream_url);

      const currentData = dataMeta || animeData;
      const myToken = localStorage.getItem("anihub_token");
      if (myToken && currentData) {
        await fetch(`${baseUrl}/users/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${myToken}` },
            body: JSON.stringify({
                anime_id: currentData.id,
                title: currentData.title,
                cover: currentData.cover,
                episode: epNumber
            })
        });
      }

    } catch (error) { console.error("Erro ao buscar video:", error); }
  }

  async function checkStatus(animeId: number) {
     const myToken = localStorage.getItem("anihub_token");
     if (!myToken) return;
     const baseUrl = "http://127.0.0.1:8000";

     try {
        const resFav = await fetch(`${baseUrl}/users/me/favorites`, { headers: { "Authorization": `Bearer ${myToken}` } });
        if(resFav.ok) {
            const favs = await resFav.json();
            setIsFavorite(!!favs.find((f: any) => f.anime_id === animeId));
        }
        
        const resList = await fetch(`${baseUrl}/users/me/watchlist`, { headers: { "Authorization": `Bearer ${myToken}` } });
        if(resList.ok) {
            const list = await resList.json();
            setIsInWatchList(!!list.find((f: any) => f.anime_id === animeId));
        }

     } catch (e) { console.error(e); }
  }

  async function toggleFavorite() {
    if (!token || !animeData) return alert("Faça login!");
    const baseUrl = "http://127.0.0.1:8000";
    
    if (isFavorite) {
        await fetch(`${baseUrl}/users/favorites/${animeData.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
        setIsFavorite(false);
    } else {
        await fetch(`${baseUrl}/users/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ anime_id: animeData.id, title: animeData.title, cover: animeData.cover, format: animeData.format || "TV" })
        });
        setIsFavorite(true);
    }
  }

  async function toggleWatchList() {
    if (!token || !animeData) return alert("Faça login!");
    const baseUrl = "http://127.0.0.1:8000";
    
    if (isInWatchList) {
        await fetch(`${baseUrl}/users/watchlist/${animeData.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
        setIsInWatchList(false);
    } else {
        await fetch(`${baseUrl}/users/watchlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ anime_id: animeData.id, title: animeData.title, cover: animeData.cover, format: animeData.format || "TV" })
        });
        setIsInWatchList(true);
    }
  }

  const changeEpisode = (epNumber: number) => {
    setEpisode(epNumber);
    if (animeData) { fetchVideo(animeData.title || searchTerm, epNumber); }
  };

  const playNext = () => { if (episode < (animeData?.episodes || 999)) changeEpisode(episode + 1); };
  const playPrev = () => { if (episode > 1) changeEpisode(episode - 1); };

  useEffect(() => { loadPageData(); }, []);

  const seasonsList = animeData?.relations?.filter(r => r.type === 'PREQUEL' || r.type === 'SEQUEL' || r.type === 'PARENT') || [];
  const relatedList = animeData?.relations?.filter(r => r.type !== 'PREQUEL' && r.type !== 'SEQUEL' && r.type !== 'PARENT') || [];

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      <Navbar />
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        {loading && <div className="flex justify-center h-[60vh]"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div></div>}

        {!loading && animeData && (
          <div className="animate-fade-in space-y-12">
            
            {/* HERO INFO CARD */}
            <div className="bg-gray-800/40 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-gray-700/50 shadow-2xl relative overflow-hidden">
              
              <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${animeData.banner || animeData.cover})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start">
                
                {/* CAPA */}
                <div className="w-full lg:w-1/4 shrink-0">
                   <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-600/50">
                      <img src={animeData.cover} alt={animeData.title} className="w-full h-full object-cover" />
                   </div>
                </div>

                {/* --- AQUI FOI A CORREÇÃO: min-w-0 --- */}
                {/* 'min-w-0' força o flexbox a respeitar o limite de largura e quebrar o texto */}
                <div className="flex-1 space-y-6 w-full min-w-0">
                    
                    {/* TÍTULO - Com break-words para não vazar */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg break-words">
                        {animeData.title}
                    </h1>
                    
                    {/* BADGES */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                        <span className="text-green-400 flex items-center gap-1">
                            <StarIcon className="w-5 h-5" /> {animeData.score}% Relevância
                        </span>
                        <span className="text-gray-300">{animeData.year}</span>
                        <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs border border-gray-600">
                            {animeData.episodes || "?"} Eps
                        </span>
                        <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs border border-gray-600 uppercase">
                            {animeData.format || "TV"}
                        </span>
                    </div>

                    {/* BOTÕES */}
                    <div className="flex flex-wrap gap-4 py-2">
                        <button 
                            onClick={toggleWatchList}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all border-2 ${isInWatchList ? 'bg-white text-gray-900 border-white hover:bg-gray-200' : 'bg-gray-600/50 text-white border-gray-500 hover:border-white hover:bg-gray-600'}`}
                        >
                            {isInWatchList ? <CheckIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                            <span>Minha Lista</span>
                        </button>
                        <button 
                            onClick={toggleFavorite}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all border-2 ${isFavorite ? 'bg-pink-600/20 text-pink-400 border-pink-500 hover:bg-pink-600/30' : 'bg-gray-600/50 text-white border-gray-500 hover:border-pink-400 hover:text-pink-400'}`}
                        >
                            {isFavorite ? <HeartIcon className="w-6 h-6" /> : <HeartOutline className="w-6 h-6" />}
                            <span>Favorito</span>
                        </button>
                    </div>

                    {/* SINOPSE */}
                    <div className="text-gray-300 text-lg leading-relaxed w-full">
                        <p className="font-bold text-gray-500 text-xs uppercase mb-2">Sinopse</p>
                        <div dangerouslySetInnerHTML={{ __html: animeData.description }} className="break-words" />
                    </div>

                    {/* GÊNEROS */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {animeData.genres?.map(g => (
                            <span key={g} className="text-xs text-gray-400 border-b border-gray-600 pb-0.5 px-1">{g}</span>
                        ))}
                    </div>

                    {/* RELACIONADOS (Ajustado) */}
                    {relatedList.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-gray-700/50 w-full overflow-hidden">
                            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                                <RectangleStackIcon className="w-6 h-6 text-purple-500" /> 
                                Relacionados & Spin-offs
                            </h3>
                            {/* Adicionei 'pb-4' e 'pr-4' para a rolagem não cortar sombras */}
                            <div className="flex gap-4 overflow-x-auto pb-4 pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {relatedList.map((rel, idx) => (
                                    <Link key={idx} href={`/watch/${encodeURIComponent(rel.title)}`}>
                                        <div className="min-w-[140px] w-[140px] cursor-pointer group flex-shrink-0">
                                            <div className="relative rounded-lg overflow-hidden aspect-[2/3] mb-3 border border-gray-700 group-hover:border-purple-500 transition-all shadow-lg">
                                                <img src={rel.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                                <span className="absolute bottom-0 left-0 bg-black/80 text-[10px] w-full text-center py-1 text-gray-300 font-bold uppercase backdrop-blur-sm">
                                                    {rel.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium line-clamp-2 group-hover:text-white transition-colors leading-tight">
                                                {rel.title}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
              </div>
            </div>

            {/* PLAYER E EPISÓDIOS (Mantido igual) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center gap-3 text-xl font-bold text-purple-400"><FilmIcon className="w-6 h-6" /> Assistindo: Episódio {episode}</div>
                 <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 relative z-10 flex items-center justify-center">
                    {videoUrl ? (
                      isM3U8(videoUrl) ? (
                        /* @ts-ignore */
                        <ReactHlsPlayer src={videoUrl} controls={true} width="100%" height="100%" playerRef={null} />
                      ) : isMP4(videoUrl) ? (
                        <video src={videoUrl} controls className="w-full h-full" playsInline preload="auto" poster={animeData.cover}><p>Seu navegador não suporta este vídeo.</p></video>
                      ) : (<iframe src={videoUrl} className="w-full h-full border-none" allowFullScreen allow="autoplay; encrypted-media" />)
                    ) : (<div className="flex flex-col items-center gap-4 text-gray-500"><div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div><p>Buscando link...</p></div>)}
                 </div>
                 <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl">
                    <button onClick={playPrev} disabled={episode === 1} className="bg-gray-700 px-5 py-2 rounded-lg font-bold disabled:opacity-30"> Anterior </button>
                    <span className="font-mono font-bold">EP {episode}</span>
                    <button onClick={playNext} className="bg-purple-600 px-5 py-2 rounded-lg font-bold text-white"> Próximo </button>
                 </div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 h-[600px] flex flex-col shadow-lg overflow-hidden">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setSidebarTab('episodes')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 ${sidebarTab === 'episodes' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:bg-gray-700'}`}><ListBulletIcon className="w-4 h-4" /> Episódios</button>
                    {seasonsList.length > 0 && <button onClick={() => setSidebarTab('seasons')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 ${sidebarTab === 'seasons' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:bg-gray-700'}`}><RectangleStackIcon className="w-4 h-4" /> Temporadas</button>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {sidebarTab === 'episodes' && (
                        <div className="grid grid-cols-4 gap-2 content-start">
                             {Array.from({ length: animeData.episodes || 12 }, (_, i) => i + 1).map((ep) => (
                                <button key={ep} onClick={() => changeEpisode(ep)} className={`aspect-square rounded-lg font-bold text-sm border flex items-center justify-center transition-all ${episode === ep ? 'bg-purple-600 text-white border-purple-400 shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>{ep}</button>
                            ))}
                        </div>
                    )}
                    {sidebarTab === 'seasons' && (
                        <div className="space-y-3">{seasonsList.map((rel, idx) => ( <Link key={idx} href={`/watch/${encodeURIComponent(rel.title)}`}><div className="flex gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700 hover:bg-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"><img src={rel.cover} className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0" /><div className="flex flex-col justify-center"><span className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">{rel.type}</span><h4 className="text-sm font-bold text-gray-200 group-hover:text-white line-clamp-2 leading-tight">{rel.title}</h4></div></div></Link>))}</div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}