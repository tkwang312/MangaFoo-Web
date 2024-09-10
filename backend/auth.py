import psycopg2
import uvicorn
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


auth_router = APIRouter()

class User(BaseModel):
    id: int
    userID: int
    username: str
    password: str
    email: str

@auth_router.post("/signup")
def signup(user: User):
    id = user.id
    userID = user.userID
    username = user.username
    password = user.password
    email = user.email

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()
    curr.execute(
        f"INSERT INTO users (username, password, email) VALUES ('{username}', '{password}', '{email}')"
        )
    conn.commit()
    curr.close()
    conn.close()




