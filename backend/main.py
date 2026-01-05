from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Agora esses imports vão funcionar porque os arquivos existem!
from routers import anime, video 

app = FastAPI(title="AniHub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectando os roteadores que acabamos de criar
app.include_router(anime.router)
app.include_router(video.router)

if __name__ == "__main__":
    import uvicorn
    # Importante: No Windows, as vezes o reload buga com imports complexos
    # Se der erro de "spawn", tente rodar sem o reload ou apenas 'python main.py'
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)