import httpx
from bs4 import BeautifulSoup
from providers.provider import AnimeProvider
import re

class AnimeOnlineScraper(AnimeProvider):
    def __init__(self):
        self.site_url = "https://animesonlinecc.to" 
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    @property
    def name(self) -> str:
        return "AnimesOnlineCC"

    @property
    def base_url(self) -> str:
        return self.site_url

    async def search_video(self, anime_title: str, episode: int):
        print(f"🕵️ [Scraper Original] Buscando: {anime_title}...")
        
        async with httpx.AsyncClient(headers=self.headers, follow_redirects=True) as client:
            try:
                # --- PASSO 1: BUSCA ---
                search_query = anime_title.replace(" ", "+")
                search_res = await client.get(f"{self.site_url}/?s={search_query}")
                
                if search_res.status_code != 200:
                    return None

                soup = BeautifulSoup(search_res.text, 'html.parser')
                anime_card = soup.select_one('div.poster a')
                
                if not anime_card:
                    return None
                
                anime_link = anime_card['href']

                # --- PASSO 2: PÁGINA DO ANIME ---
                anime_page = await client.get(anime_link)
                soup_anime = BeautifulSoup(anime_page.text, 'html.parser')

                episode_link = None
                for link in soup_anime.select('ul.episodios li a'):
                    text = link.get_text().lower()
                    if f"episodio {episode}" in text.replace("ó", "o") or f"episódio {episode}" in text:
                        episode_link = link['href']
                        break
                
                # Fallback para ep 1
                if not episode_link and episode == 1:
                    first_ep = soup_anime.select_one('ul.episodios li a')
                    if first_ep:
                        episode_link = first_ep['href']

                if not episode_link:
                    return None
                
                # --- PASSO 3: EXTRAIR VÍDEO (IFRAME) ---
                ep_page = await client.get(episode_link)
                soup_ep = BeautifulSoup(ep_page.text, 'html.parser')

                iframe = soup_ep.select_one('iframe')
                
                if iframe:
                    video_url = iframe['src']
                    print(f"🎬 Iframe encontrado: {video_url}")
                    return video_url
                
                return None

            except Exception as e:
                print(f"💥 Erro: {e}")
                return None