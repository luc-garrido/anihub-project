from fastapi import APIRouter
import httpx

router = APIRouter(tags=["Anime"])
ANILIST_URL = "https://graphql.anilist.co"

# --- ROTA 1: HOME (Vitrine) ---
@router.get("/home")
async def get_home_data():
    query = """
    query {
      trending: Page(perPage: 10) {
        media(sort: TRENDING_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }, bannerImage, description
        }
      }
      popular: Page(perPage: 10) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }
        }
      }
      action: Page(perPage: 10) {
        media(genre: "Action", sort: POPULARITY_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }
        }
      }
      romance: Page(perPage: 10) {
        media(genre: "Romance", sort: POPULARITY_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }
        }
      }
      horror: Page(perPage: 10) {
        media(genre: "Horror", sort: POPULARITY_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }
        }
      }
      sports: Page(perPage: 10) {
        media(genre: "Sports", sort: POPULARITY_DESC, type: ANIME) {
          id, title { romaji }, coverImage { extraLarge, large }
        }
      }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ANILIST_URL, json={'query': query})
            data = resp.json()
            return data.get('data', {})
        except Exception as e:
            print(f"Erro Home: {e}")
            return {}

# --- ROTA 2: DETALHES DO ANIME ---
@router.get("/anime/{anime_name}")
async def get_anime_info(anime_name: str):
    query = """
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { romaji }
        coverImage { extraLarge }
        description
        averageScore
        episodes
        status
      }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(ANILIST_URL, json={'query': query, 'variables': {'search': anime_name}})
            data = response.json()
            if not data.get('data') or not data['data'].get('Media'):
                return {"error": "Anime não encontrado"}

            media = data['data']['Media']
            return {
                "title": media['title']['romaji'],
                "cover": media['coverImage']['extraLarge'],
                "description": media['description'],
                "score": media['averageScore'],
                "episodes": media['episodes'],
                "status": media['status']
            }
        except Exception:
            return {"error": "Erro interno"}

# --- ROTA 3: PESQUISA (Autocomplete) ---
@router.get("/search/suggest/{term}")
async def search_suggest(term: str):
    query = """
    query ($search: String) {
      Page(perPage: 5) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          title { romaji }
          coverImage { medium } 
          format
        }
      }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ANILIST_URL, json={'query': query, 'variables': {'search': term}})
            data = resp.json()
            return data['data']['Page']['media']
        except Exception:
            return []