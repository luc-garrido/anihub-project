from fastapi import APIRouter
from pydantic import BaseModel
# Importando o Scraper que estávamos usando (AnimeOnline - Blogger)
from providers.anime_scraper import AnimeOnlineScraper

# Cria o roteador específico para vídeos
router = APIRouter(tags=["Video"])

# Instancia o provider
active_provider = AnimeOnlineScraper()

class VideoResponse(BaseModel):
    stream_url: str | None

@router.get("/watch/{anime_name}/{episode}")
async def get_episode_link(anime_name: str, episode: int):
    video_url = await active_provider.search_video(anime_name, episode)
    if not video_url:
        return {"stream_url": None}
    return {"stream_url": video_url}