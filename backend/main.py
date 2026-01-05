# backend/main.py (Versão Final Limpa)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import anime, video  # Certifique-se que routers/anime.py e routers/video.py existem

app = FastAPI(title="AniHub Core")

# Configs de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conecta as rotas
app.include_router(anime.router)
app.include_router(video.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)