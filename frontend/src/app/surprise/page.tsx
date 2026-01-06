'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { SparklesIcon, PlayIcon } from '@heroicons/react/24/solid';

// Configurações da Roleta
const CARD_WIDTH = 140; // Largura da capinha
const GAP = 16;         // Espaço entre elas
const ITEM_SIZE = CARD_WIDTH + GAP; 

export default function SurprisePage() {
  const [genre, setGenre] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  
  // Dados da Roleta
  const [rouletteItems, setRouletteItems] = useState<any[]>([]);
  const [translateX, setTranslateX] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  
  // O Vencedor
  const [winner, setWinner] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const genresList = ["Todos", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural"];

  async function startRoulette() {
    if (spinning) return;
    
    setLoading(true);
    setShowWinnerModal(false);
    setWinner(null);
    setTransitionDuration(0);
    setTranslateX(0); // Reseta posição

    try {
      // 1. Busca animes aleatórios do backend
      const randomPage = Math.floor(Math.random() * 20) + 1;
      let url = `http://127.0.0.1:8000/catalog?page=${randomPage}&sort=POPULARITY_DESC`;
      if (genre !== "Todos") url += `&genre=${genre}`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.media || data.media.length === 0) {
        alert("Nenhum anime encontrado nesse gênero!");
        setLoading(false);
        return;
      }

      // 2. Prepara a "Fita" da roleta
      // Multiplicamos a lista para ter bastante item pra girar
      // O Vencedor estará lá pelo final (ex: index 60 de 80)
      const baseList = data.media;
      let longList: any[] = [];
      
      // Repete a lista 5 vezes para dar volume
      for(let i=0; i<5; i++) {
        longList = [...longList, ...baseList];
      }

      // Escolhe um vencedor randomicamente, mas garantindo que esteja longe (entre o meio e o fim)
      const minIndex = Math.floor(longList.length * 0.6); 
      const maxIndex = longList.length - 2;
      const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
      const winnerAnime = longList[winnerIndex];

      setRouletteItems(longList);
      setLoading(false);
      setSpinning(true);

      // 3. O Pulo do Gato: Calcular onde parar
      // Pequeno delay para o navegador renderizar a lista na posição 0
      setTimeout(() => {
        if (!containerRef.current) return;
        
        // Tamanho da tela para centralizar
        const containerWidth = containerRef.current.clientWidth;
        
        // Posição exata do vencedor na fita
        const winnerPosition = winnerIndex * ITEM_SIZE;
        
        // Centralização: Queremos que o vencedor pare no MEIO da tela
        // Cálculo: (Posição do item) - (Metade da tela) + (Metade do item)
        // Adicionamos um randomJitter para não parar sempre pixel-perfect no meio (mais realismo)
        const randomJitter = Math.floor(Math.random() * (CARD_WIDTH * 0.8)) - (CARD_WIDTH * 0.4);
        const finalPosition = -(winnerPosition - (containerWidth / 2) + (CARD_WIDTH / 2) + randomJitter);

        // Ativa a animação
        setTransitionDuration(6); // 6 segundos de giro
        setTranslateX(finalPosition);

        // 4. Quando parar, mostra o resultado
        setTimeout(() => {
            setWinner(winnerAnime);
            setShowWinnerModal(true);
            setSpinning(false);
        }, 6000); // Tem que bater com o tempo de transição
      }, 100);

    } catch (error) {
      console.error(error);
      setLoading(false);
      setSpinning(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20 overflow-x-hidden">
      <Navbar />

      <div className="pt-32 px-4 max-w-7xl mx-auto text-center space-y-8">
        
        {/* TÍTULO */}
        <div className="space-y-4">
            <SparklesIcon className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500">
                Roleta da Sorte
            </h1>
            <p className="text-gray-400 text-lg">Tente a sorte e descubra seu próximo vício.</p>
        </div>

        {/* CONTROLES */}
        <div className="max-w-md mx-auto bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4 relative z-20">
            <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Filtro de Gênero</label>
                <select 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)}
                    disabled={spinning}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-lg focus:border-yellow-500 outline-none transition-colors disabled:opacity-50"
                >
                    {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>

            <button 
                onClick={startRoulette}
                disabled={loading || spinning}
                className={`w-full font-black text-xl py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 ${spinning ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 hover:scale-105 active:scale-95 text-white'}`}
            >
                {loading ? "Carregando..." : spinning ? "Girando..." : "GIRAR ROLETA 🎲"}
            </button>
        </div>

        {/* --- A ROLETA (CS:GO STYLE) --- */}
        <div className="relative mt-12 w-full max-w-5xl mx-auto h-[240px] bg-gray-950 rounded-lg border-4 border-gray-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Linha Central (Marcador) */}
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-500 z-10 shadow-[0_0_10px_#eab308] transform -translate-x-1/2"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 text-yellow-500 text-2xl z-10">▼</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 text-yellow-500 text-2xl z-10">▲</div>

            {/* Sombra nas bordas para dar profundidade */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none"></div>

            {/* A Fita de Itens */}
            <div 
                ref={containerRef}
                className="flex items-center h-full pl-[50%]" // Padding left 50% para começar do meio
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: `transform ${transitionDuration}s cubic-bezier(0.1, 0, 0.2, 1)`, // Curva de aceleração/desaceleração estilo roleta
                    width: 'max-content'
                }}
            >
                {rouletteItems.length > 0 ? rouletteItems.map((anime, index) => (
                    <div 
                        key={`${anime.id}-${index}`} 
                        className="relative flex-shrink-0"
                        style={{ width: CARD_WIDTH, marginRight: GAP }}
                    >
                        <div className={`w-full aspect-[2/3] rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-lg`}>
                            <img src={anime.coverImage.large} className="w-full h-full object-cover" alt="" />
                        </div>
                        {/* Faixa de raridade falsa (só visual) */}
                        <div className={`h-1.5 w-full mt-2 rounded-full ${index % 2 === 0 ? 'bg-purple-500' : index % 3 === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    </div>
                )) : (
                    // Placeholder antes de girar
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono uppercase tracking-widest">
                        Aguardando Sorteio...
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* --- MODAL DO VENCEDOR (REVEAL) --- */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 rounded-3xl p-1 border-2 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] max-w-4xl w-full transform transition-all animate-[bounceIn_0.8s_ease-out]">
                <div className="bg-gray-900 rounded-[22px] p-8 md:p-12 relative overflow-hidden">
                    
                    {/* Raios de luz de fundo */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(234,179,8,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(234,179,8,0.1)_360deg)] animate-[spin_10s_linear_infinite]"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <img 
                            src={winner.coverImage.extraLarge} 
                            alt={winner.title.romaji}
                            className="w-64 rounded-xl shadow-2xl border-4 border-yellow-500 rotate-[-5deg]" 
                        />
                        <div className="text-center md:text-left space-y-6">
                            <div>
                                <h3 className="text-yellow-500 font-black uppercase tracking-widest text-sm mb-2">Item Dropado!</h3>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">{winner.title.romaji}</h2>
                            </div>
                            
                            <div className="flex justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm font-bold text-gray-300">{winner.genres[0]}</span>
                                <span className="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded text-sm font-bold text-green-400">{winner.averageScore}% Score</span>
                            </div>

                            <div className="flex gap-4 justify-center md:justify-start">
                                <Link href={`/watch/${encodeURIComponent(winner.title.romaji)}`}>
                                    <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:scale-105 transition-transform flex items-center gap-2">
                                        <PlayIcon className="w-6 h-6" /> ASSISTIR AGORA
                                    </button>
                                </Link>
                                <button 
                                    onClick={() => setShowWinnerModal(false)}
                                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold border border-gray-600 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Adicione isso ao seu arquivo global.css se a animação bounceIn não existir, ou use tailwind-animate */}
      <style jsx global>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </main>
  );
}