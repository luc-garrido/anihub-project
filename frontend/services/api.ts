// frontend/src/services/api.ts

const API_BASE = "http://127.0.0.1:8000";

export const api = {
  getHomeData: async () => {
    const res = await fetch(`${API_BASE}/home`);
    return res.json();
  },

  searchAnime: async (query: string) => {
    const res = await fetch(`${API_BASE}/search/suggest/${query}`);
    return res.json();
  },

  getAnimeDetails: async (name: string) => {
    const res = await fetch(`${API_BASE}/anime/${name}`);
    if (!res.ok) throw new Error("Anime not found");
    return res.json();
  },

  getVideoLink: async (name: string, episode: number) => {
    const res = await fetch(`${API_BASE}/watch/${name}/${episode}`);
    return res.json();
  }
};