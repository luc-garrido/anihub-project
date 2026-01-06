import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import database
import models

# CONFIGURAÇÕES
SECRET_KEY = "sua_chave_secreta_super_poderosa_aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- CRIPTOGRAFIA USANDO BCRYPT PURO (SEM PASSLIB) ---
def get_password_hash(password):
    # Converte string para bytes
    pwd_bytes = password.encode('utf-8')
    # Gera o salt e o hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Retorna como string para salvar no banco
    return hashed.decode('utf-8')

def verify_password(plain_password, hashed_password):
    try:
        # Converte ambos para bytes
        pwd_bytes = plain_password.encode('utf-8')
        # Se o hash veio do banco como string, converte pra bytes
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"Erro na verificação de senha: {e}")
        return False

# --- GERAÇÃO DE TOKEN ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- IDENTIFICAR USUÁRIO LOGADO ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user