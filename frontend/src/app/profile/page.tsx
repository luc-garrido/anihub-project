'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { HeartIcon, ClockIcon, PencilSquareIcon, StarIcon } from '@heroicons/react/24/solid';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newBio, setNewBio] = useState("");
  const [newColor, setNewColor] = useState("purple");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = localStorage.getItem("anihub_token");
    if (!token) return router.push("/login");

    const baseUrl = "http://127.0.0.1:8000";
    
    try {
        const resUser = await fetch(`${baseUrl}/users/me`, { headers: { "Authorization": `Bearer ${token}` } });
        
        if (!resUser.ok) {
            console.warn("Token inválido ou expirado. Fazendo logout...");
            localStorage.removeItem("anihub_token");
            localStorage.removeItem("anihub_user");
            router.push("/login");
            return;
        }

        const dataUser = await resUser.json();
        setUser(dataUser);
        setNewBio(dataUser.bio || "");
        setNewColor(dataUser.avatar_color || "purple");

        // Favoritos
        const resFav = await fetch(`${baseUrl}/users/me/favorites`, { headers: { "Authorization": `Bearer ${token}` } });
        if (resFav.ok) setFavorites(await resFav.json());

        // Histórico
        const resHist = await fetch(`${baseUrl}/users/me/history`, { headers: { "Authorization": `Bearer ${token}` } });
        if (resHist.ok) setHistory(await resHist.json());

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
  }

  async function saveProfile() {
    const token = localStorage.getItem("anihub_token");
    if (!token) return;
    
    await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ bio: newBio, avatar_color: newColor })
    });
    setIsEditing(false);
    loadProfile();
  }

  const colors: any = {
    purple: "from-purple-500 to-pink-600",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-orange-500",
  };

  if (!user) return null;

  // Filtra apenas os top 5 para a vitrine
  const topFavorites = favorites.slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
      <Navbar />

      <div className="pt-32 px-4 max-w-5xl mx-auto space-y-12">
        
        {/* HEADER PERFIL */}
        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Fundo decorativo sutil */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colors[user.avatar_color || 'purple']}`}></div>

            <button onClick={() => setIsEditing(!isEditing)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg transition-all">
                <PencilSquareIcon className="w-5 h-5" />
            </button>

            <div className={`w-32 h-32 bg-gradient-to-br ${colors[user.avatar_color || 'purple']} rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] shrink-0 border-4 border-gray-800`}>
                 <span className="text-5xl font-black text-white">{user.username ? user.username.charAt(0).toUpperCase() : "?"}</span>
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-3 w-full">
                <h1 className="text-4xl font-black text-white">{user.username}</h1>
                
                {!isEditing ? (
                    <p className="text-gray-300 text-lg font-medium">"{user.bio}"</p>
                ) : (
                    <div className="flex flex-col gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-600 animate-fade-in">
                        <label className="text-xs font-bold text-gray-400 uppercase">Editar Bio</label>
                        <input type="text" value={newBio} onChange={e => setNewBio(e.target.value)} className="bg-gray-800 p-3 rounded-lg text-white border border-gray-600 w-full focus:border-purple-500 outline-none" placeholder="Sua bio..." />
                        
                        <label className="text-xs font-bold text-gray-400 uppercase">Cor do Avatar</label>
                        <div className="flex gap-3">
                            {Object.keys(colors).map(c => (
                                <button key={c} onClick={() => setNewColor(c)} className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[c]} ${newColor === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'} transition-all`} />
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                             <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancelar</button>
                             <button onClick={saveProfile} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">Salvar Alterações</button>
                        </div>
                    </div>
                )}
                
                <div className="flex gap-3 justify-center md:justify-start pt-2">
                    <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20">Membro Otaku</span>
                </div>
            </div>
        </div>

        {/* VITRINE TOP 5 FAVORITOS */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-pink-400">
                    <HeartIcon className="w-7 h-7" /> Meus Top 5 Favoritos
                </h2>
                <Link href="/my-list">
                    <span className="text-sm font-bold text-gray-500 hover:text-white cursor-pointer transition-colors">Ver Minha Lista Completa ➔</span>
                </Link>
            </div>

            {topFavorites.length > 0 ? (
                // AQUI ESTÁ A MUDANÇA: Grid fixo em vez de scroll, max 5 itens
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {topFavorites.map((fav: any) => (
                        <Link key={fav.id} href={`/watch/${encodeURIComponent(fav.title)}`}>
                            <div className="group cursor-pointer relative">
                                {/* Forçamos aspect-ratio e object-cover para padronizar qualquer imagem */}
                                <div className="aspect-[2/3] rounded-xl overflow-hidden border border-gray-700 group-hover:border-pink-500 transition-all shadow-lg bg-gray-800">
                                    <img 
                                        src={fav.cover} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                                        alt={fav.title}
                                    />
                                    {/* Medalha de Rank (Opcional, só visual) */}
                                    <div className="absolute top-0 left-0 bg-gradient-to-br from-pink-600 to-purple-600 text-white w-8 h-8 flex items-center justify-center font-black text-xs rounded-br-xl shadow-md z-10">
                                        ★
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-300 mt-3 truncate group-hover:text-pink-400 text-center">{fav.title}</p>
                            </div>
                        </Link>
                    ))}
                    
                    {/* Placeholder se tiver menos de 5 (Opcional, preenche espaço vazio) */}
                    {Array.from({ length: 5 - topFavorites.length }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] rounded-xl border-2 border-dashed border-gray-800 flex items-center justify-center opacity-50">
                            <StarIcon className="w-8 h-8 text-gray-700" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                    <HeartIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Selecione seus animes favoritos para exibi-los aqui.</p>
                </div>
            )}
        </div>

        {/* HISTÓRICO */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-400 border-b border-gray-700 pb-2">
                <ClockIcon className="w-7 h-7" /> Continue Assistindo
            </h2>
            {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((hist: any) => (
                        <Link key={hist.id} href={`/watch/${encodeURIComponent(hist.title)}`}>
                            <div className="flex items-center gap-4 bg-gray-800/40 p-3 rounded-xl border border-gray-700 hover:bg-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group">
                                <img src={hist.cover} className="w-16 h-10 object-cover rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-200 group-hover:text-blue-400 truncate">{hist.title}</h4>
                                    <p className="text-xs text-gray-500">Parou no Episódio {hist.episode}</p>
                                </div>
                                <span className="text-gray-600 text-xs group-hover:text-blue-400">▶</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : <p className="text-gray-500 italic">Nada assistido recentemente.</p>}
        </div>

      </div>
    </main>
  );
}