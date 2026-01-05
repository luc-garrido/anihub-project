// frontend/src/types/index.ts

export interface AnimeCard {
  title: { romaji: string };
  coverImage: { extraLarge: string; large: string; medium: string };
  bannerImage?: string;
  description?: string;
  format?: string;
}

export interface AnimeData {
  title: string;
  cover: string;
  description: string;
  score: number;
  episodes: number;
  status: string;
}

export interface HomeData {
  trending: { media: AnimeCard[] };
  popular: { media: AnimeCard[] };
  action: { media: AnimeCard[] };
  romance: { media: AnimeCard[] };
  horror: { media: AnimeCard[] };
  sports: { media: AnimeCard[] };
}