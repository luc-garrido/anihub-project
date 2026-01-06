from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import anime, video, auth, users

# Cria o banco de dados se não existir
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CONFIGURAÇÃO DO CORS (O Segredo do Sucesso) ---
# Isso libera o Frontend (Next.js) para conversar com o Backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Quem pode acessar
    allow_credentials=True,      # Permite cookies/tokens
    allow_methods=["*"],         # Permite GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],         # Permite todos os cabeçalhos (inclusive Authorization)
)

# --- INCLUIR ROTAS ---
app.include_router(anime.router)
app.include_router(video.router)
app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "AniHub API is running! 🚀"}