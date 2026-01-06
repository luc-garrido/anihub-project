from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Personalização
    bio = Column(String, default="Apenas um fã de animes.")
    avatar_color = Column(String, default="purple")

    favorites = relationship("Favorite", back_populates="owner")
    watchlist = relationship("WatchList", back_populates="owner") # <--- NOVO
    history = relationship("History", back_populates="owner")

class Favorite(Base): # Vitrine do Perfil
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    anime_id = Column(Integer) 
    title = Column(String)
    cover = Column(String)
    format = Column(String)

    owner = relationship("User", back_populates="favorites")

class WatchList(Base): # Minha Lista (Assistir Mais Tarde) <--- NOVO
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    anime_id = Column(Integer) 
    title = Column(String)
    cover = Column(String)
    format = Column(String)

    owner = relationship("User", back_populates="watchlist")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    anime_id = Column(Integer)
    title = Column(String)
    cover = Column(String)
    episode = Column(Integer)
    
    owner = relationship("User", back_populates="history")