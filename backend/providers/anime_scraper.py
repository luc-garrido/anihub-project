import httpx
from bs4 import BeautifulSoup
from providers.provider import AnimeProvider
import re

class AnimeOnlineScraper(AnimeProvider):
    def __init__(self):
        # Baseado na URL do seu print
        self.site_url = "https://animesonlinecc.to" 
        # Headers para fingir que somos um navegador (evita bloqueio)
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
        print(f"🕵️ [Scraper] Buscando: {anime_title}...")
        
        async with httpx.AsyncClient(headers=self.headers, follow_redirects=True) as client:
            try:
                # --- PASSO 1: BUSCA ---
                search_query = anime_title.replace(" ", "+")
                search_res = await client.get(f"{self.site_url}/?s={search_query}")
                
                if search_res.status_code != 200:
                    print("❌ Erro ao acessar a busca")
                    return None

                soup = BeautifulSoup(search_res.text, 'html.parser')
                
                # AQUI ESTÁ O SEGREDO DO SEU PRINT:
                # Procuramos a div 'poster' e pegamos o link 'a' dentro dela
                anime_card = soup.select_one('div.poster a')
                
                if not anime_card:
                    print("❌ Anime não encontrado na busca.")
                    return None
                
                anime_link = anime_card['href']
                print(f"✅ Anime encontrado: {anime_link}")

                # --- PASSO 2: PÁGINA DO ANIME (Buscar Episódio) ---
                anime_page = await client.get(anime_link)
                soup_anime = BeautifulSoup(anime_page.text, 'html.parser')

                # Tenta encontrar o link do episódio específico.
                # Geralmente esses sites usam uma lista <ul> com classe 'episodios'
                # Vamos tentar um seletor genérico para esse tipo de site
                episode_link = None
                
                # Procura por links que tenham o número do episódio no texto ou estrutura
                # Exemplo: "Episódio 1"
                for link in soup_anime.select('ul.episodios li a'):
                    # Pega o texto do link (ex: "Episódio 1")
                    text = link.get_text().lower()
                    # Verifica se o número do episódio está no texto
                    if f"episodio {episode}" in text.replace("ó", "o") or f"episódio {episode}" in text:
                        episode_link = link['href']
                        break
                
                # Se não achou pelo texto, tenta pegar o primeiro da lista se for ep 1
                if not episode_link and episode == 1:
                    first_ep = soup_anime.select_one('ul.episodios li a')
                    if first_ep:
                        episode_link = first_ep['href']

                if not episode_link:
                    print(f"❌ Episódio {episode} não encontrado na lista.")
                    return None
                
                print(f"✅ Página do Episódio: {episode_link}")

                # --- PASSO 3: EXTRAIR VÍDEO (IFRAME) ---
                # Aqui entramos na página do episódio para pegar o player
                ep_page = await client.get(episode_link)
                soup_ep = BeautifulSoup(ep_page.text, 'html.parser')

                # Procura o primeiro iframe de vídeo
                iframe = soup_ep.select_one('iframe')
                
                if iframe:
                    video_url = iframe['src']
                    print(f"🎬 Link do Player encontrado: {video_url}")
                    return video_url
                else:
                    print("❌ Iframe de vídeo não encontrado.")
                    return None

            except Exception as e:
                print(f"💥 Erro crítico no scraper: {e}")
                return None