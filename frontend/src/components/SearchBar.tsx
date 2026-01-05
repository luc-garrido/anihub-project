'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { api } from '@/services/api';
import { Anime } from '@/types';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 2) {
        try {
            const data = await api.searchSuggest(query);
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error(error);
            setResults([]);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (animeName: string) => {
    setShowResults(false);
    setQuery(animeName); 
    router.push(`/watch/${encodeURIComponent(animeName)}`);
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(query);
    }
  };

  return (
    <div className="relative group w-full h-full">
      <div className="relative h-full">
        <input 
          type="text"
          placeholder="Buscar anime..."
          className="w-full h-full bg-gray-800/80 border border-gray-600 rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-purple-500 transition-all text-white placeholder-gray-400 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
          onFocus={() => { if(results.length > 0) setShowResults(true) }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-500 transition-colors" />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map((anime, index) => (
            <div 
              key={index}
              onClick={() => handleSelect(anime.title.romaji)}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700/50 last:border-0"
            >
              <img 
                src={anime.coverImage?.medium || anime.coverImage?.large} 
                alt={anime.title.romaji} 
                className="w-10 h-14 object-cover rounded shadow-md"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-100 line-clamp-1">
                  {anime.title.romaji}
                </span>
                <span className="text-xs text-purple-400 font-medium">
                  {anime.format || 'TV'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}