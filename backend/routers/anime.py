from fastapi import APIRouter
import httpx
from typing import Optional

router = APIRouter(tags=["Anime"])
ANILIST_URL = "https://graphql.anilist.co"

# --- ROTA 1: HOME (Mantida) ---
@router.get("/home")
async def get_home_data():
    query = """
    query {
      # Adicionei 'trailer { id site }' na consulta de trending
      trending: Page(perPage: 10) { 
          media(sort: TRENDING_DESC, type: ANIME) { 
              id, 
              title { romaji }, 
              coverImage { extraLarge, large, medium }, 
              bannerImage, 
              description,
              trailer { id, site } 
          } 
      }
      popular: Page(perPage: 10) { media(sort: POPULARITY_DESC, type: ANIME) { id, title { romaji }, coverImage { extraLarge, large, medium } } }
      action: Page(perPage: 10) { media(genre: "Action", sort: POPULARITY_DESC, type: ANIME) { id, title { romaji }, coverImage { extraLarge, large, medium } } }
      romance: Page(perPage: 10) { media(genre: "Romance", sort: POPULARITY_DESC, type: ANIME) { id, title { romaji }, coverImage { extraLarge, large, medium } } }
      horror: Page(perPage: 10) { media(genre: "Horror", sort: POPULARITY_DESC, type: ANIME) { id, title { romaji }, coverImage { extraLarge, large, medium } } }
      sports: Page(perPage: 10) { media(genre: "Sports", sort: POPULARITY_DESC, type: ANIME) { id, title { romaji }, coverImage { extraLarge, large, medium } } }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ANILIST_URL, json={'query': query})
            return resp.json().get('data', {})
        except Exception:
            return {}

# --- ROTA 2: CATÁLOGO ---
@router.get("/catalog")
async def get_catalog(
    page: int = 1,
    sort: str = "POPULARITY_DESC",
    genre: Optional[str] = None,
    search: Optional[str] = None,
    format: Optional[str] = None # <--- NOVO PARÂMETRO
):
    args_list = [f"sort: {sort}", "type: ANIME"]
    if genre and genre != "Todos":
        args_list.append(f'genre: "{genre}"')
    if search:
        args_list.append(f'search: "{search}"')
        
    # Filtro de Formato (TV, MOVIE, OVA, etc)
    if format and format != "Todos":
        args_list.append(f'format: {format}')

    args_string = ", ".join(args_list)

    query = f"""
    query ($page: Int) {{
      Page(page: $page, perPage: 18) {{
        pageInfo {{
          total
          perPage
          lastPage
          currentPage
          hasNextPage
        }}
        media({args_string}) {{
          id
          title {{ romaji }}
          coverImage {{ extraLarge, large }}
          averageScore
          genres
          seasonYear
          episodes
          format
        }}
      }}
    }}
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ANILIST_URL, json={'query': query, 'variables': {'page': page}})
            return resp.json().get('data', {}).get('Page', {})
        except Exception as e:
            print(f"Erro Catalogo: {e}")
            return {"media": []}

# --- ROTA 3: DETALHES DO ANIME (ATUALIZADA COM RELATIONS/TEMPORADAS) ---
@router.get("/anime/{anime_name}")
async def get_anime_info(anime_name: str):
    query = """
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title { romaji }
        coverImage { extraLarge, large }
        bannerImage
        description
        averageScore
        episodes
        status
        format
        seasonYear
        genres
        studios(isMain: true) {
            nodes { name }
        }
        relations {
            edges {
                relationType(version: 2)
                node {
                    id
                    title { romaji }
                    format
                    type
                    coverImage { medium }
                }
            }
        }
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
            
            # Limpa as relações para mandar só o que importa (Sequel, Prequel, etc)
            relations = []
            if media.get('relations'):
                for edge in media['relations']['edges']:
                    if edge['node']['type'] == 'ANIME': # Só queremos animes, não mangás
                        relations.append({
                            "type": edge['relationType'],
                            "title": edge['node']['title']['romaji'],
                            "format": edge['node']['format'],
                            "cover": edge['node']['coverImage']['medium']
                        })

            return {
                "id": media['id'],
                "title": media['title']['romaji'],
                "cover": media['coverImage']['extraLarge'],
                "banner": media['bannerImage'],
                "description": media['description'],
                "score": media['averageScore'],
                "episodes": media['episodes'],
                "status": media['status'],
                "year": media['seasonYear'],
                "genres": media['genres'],
                "studio": media['studios']['nodes'][0]['name'] if media['studios']['nodes'] else None,
                "relations": relations
            }
        except Exception as e:
            print(f"Erro Anime Info: {e}")
            return {"error": "Erro interno"}

# --- ROTA 4: PESQUISA (Mantida) ---
@router.get("/search/suggest/{term}")
async def search_suggest(term: str):
    query = """
    query ($search: String) {
      Page(perPage: 5) { media(search: $search, type: ANIME, sort: POPULARITY_DESC) { title { romaji }, coverImage { medium }, format } }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(ANILIST_URL, json={'query': query, 'variables': {'search': term}})
            return resp.json()['data']['Page']['media']
        except Exception: return []