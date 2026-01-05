import { HomeData, Anime } from '@/types'; // Importando do arquivo que acabamos de criar

const API_BASE = "http://127.0.0.1:8000";

export const api = {
  getHome: async (): Promise<HomeData> => {
    const res = await fetch(`${API_BASE}/home`, { cache: 'no-store' });
    return res.json();
  },

  getAnimeDetails: async (name: string): Promise<Anime> => {
    const res = await fetch(`${API_BASE}/anime/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Anime not found");
    return res.json();
  },

  getVideoLink: async (name: string, ep: number) => {
    const res = await fetch(`${API_BASE}/watch/${encodeURIComponent(name)}/${ep}`);
    return res.json();
  },

  searchSuggest: async (query: string): Promise<Anime[]> => {
    const res = await fetch(`${API_BASE}/search/suggest/${query}`);
    return res.json();
  }
};