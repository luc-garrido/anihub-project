import httpx

ANILIST_URL = "https://graphql.anilist.co"

# A Query GraphQL define exatamente o que queremos receber
SEARCH_QUERY = """
query ($search: String) {
  Media (search: $search, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      color
    }
    description
    averageScore
    episodes
    status
  }
}
"""

async def search_anime_data(anime_name: str):
    """Busca metadados do anime na API oficial do AniList."""
    variables = {"search": anime_name}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            ANILIST_URL, 
            json={"query": SEARCH_QUERY, "variables": variables}
        )
        
        if response.status_code != 200:
            return None
            
        data = response.json()
        # Retorna apenas o objeto 'Media' se existir
        return data.get("data", {}).get("Media")