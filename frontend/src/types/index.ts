export interface Anime {
  id?: number;
  title: { romaji: string };
  coverImage: { extraLarge: string; large: string; medium: string };
  bannerImage?: string;
  description?: string;
  format?: string;
  episodes?: number;
  score?: number;
  status?: string;
}

export interface HomeData {
  trending: { media: Anime[] };
  popular: { media: Anime[] };
  action: { media: Anime[] };
  romance: { media: Anime[] };
  horror: { media: Anime[] };
  sports: { media: Anime[] };
}