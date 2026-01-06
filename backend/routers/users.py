from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import database
import models
import auth

router = APIRouter(prefix="/users", tags=["Users"])

class AnimeItem(BaseModel):
    anime_id: int
    title: str
    cover: str
    format: str = "TV"

class HistoryItem(BaseModel):
    anime_id: int
    title: str
    cover: str
    episode: int

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_color: Optional[str] = None

# --- FAVORITOS (VITRINE) ---
@router.post("/favorites")
def add_favorite(item: AnimeItem, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    exists = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id, models.Favorite.anime_id == item.anime_id).first()
    if exists: return {"message": "Já existe"}
    new_fav = models.Favorite(user_id=current_user.id, anime_id=item.anime_id, title=item.title, cover=item.cover, format=item.format)
    db.add(new_fav)
    db.commit()
    return {"message": "Adicionado aos favoritos"}

@router.delete("/favorites/{anime_id}")
def remove_favorite(anime_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    fav = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id, models.Favorite.anime_id == anime_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"message": "Removido"}

@router.get("/me/favorites")
def get_my_favorites(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()

# --- MINHA LISTA (WATCHLIST) --- NOVO!
@router.post("/watchlist")
def add_watchlist(item: AnimeItem, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    exists = db.query(models.WatchList).filter(models.WatchList.user_id == current_user.id, models.WatchList.anime_id == item.anime_id).first()
    if exists: return {"message": "Já existe na lista"}
    new_item = models.WatchList(user_id=current_user.id, anime_id=item.anime_id, title=item.title, cover=item.cover, format=item.format)
    db.add(new_item)
    db.commit()
    return {"message": "Adicionado à lista"}

@router.delete("/watchlist/{anime_id}")
def remove_watchlist(anime_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    item = db.query(models.WatchList).filter(models.WatchList.user_id == current_user.id, models.WatchList.anime_id == anime_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Removido da lista"}

@router.get("/me/watchlist")
def get_my_watchlist(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.WatchList).filter(models.WatchList.user_id == current_user.id).all()

# --- HISTÓRICO & PERFIL ---
@router.post("/history")
def update_history(item: HistoryItem, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    history = db.query(models.History).filter(models.History.user_id == current_user.id, models.History.anime_id == item.anime_id).first()
    if history:
        history.episode = item.episode
        history.title = item.title
        history.cover = item.cover
    else:
        history = models.History(user_id=current_user.id, anime_id=item.anime_id, title=item.title, cover=item.cover, episode=item.episode)
        db.add(history)
    db.commit()
    return {"message": "Histórico atualizado"}

@router.get("/me/history")
def get_my_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.History).filter(models.History.user_id == current_user.id).order_by(models.History.id.desc()).all()

@router.get("/me")
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "email": current_user.email, "bio": current_user.bio, "avatar_color": current_user.avatar_color}

@router.put("/me")
def update_profile(data: ProfileUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if data.bio: current_user.bio = data.bio
    if data.avatar_color: current_user.avatar_color = data.avatar_color
    db.commit()
    return {"message": "Perfil atualizado!"}