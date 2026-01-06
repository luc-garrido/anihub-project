from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
import auth

router = APIRouter(tags=["Auth"])

# Modelo de dados que vem do Frontend
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# --- ROTA 1: CRIAR CONTA (REGISTER) ---
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Verifica se usuário já existe
    user_exists = db.query(models.User).filter(models.User.username == user.username).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Usuário já existe")
    
    # Cria novo usuário com senha criptografada
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Usuário criado com sucesso!"}

# --- ROTA 2: LOGIN ---
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Busca usuário pelo nome
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    
    # Verifica se usuário existe e se a senha bate
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
    
    # Gera o Token
    access_token = auth.create_access_token(data={"sub": db_user.username})
    
    return {"access_token": access_token, "token_type": "bearer", "username": db_user.username}