import psycopg2
import uvicorn
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

BUCKET_NAME = 'pfpbucket1'

auth_router = APIRouter()

class User(BaseModel):
    id: int
    userID: int
    username: str
    password: str
    email: str

class NewUser(BaseModel):
    username: str
    password: str
    email: str

class LoginUser(BaseModel):
    email: str
    password: str

class PFPModel(BaseModel):
    email: str
    pfpurl: str


@auth_router.post("/signup", response_model=PFPModel)
def signup(user: NewUser):
    username = user.username
    password = user.password
    email = user.email
    image_name = 'defaultpfp88888888.jpg'
    uploaded_file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{image_name}"

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()
    curr.execute(
        """
        INSERT INTO users (username, password, email, pfpurl) 
        VALUES (%s, %s, %s, %s)
        """, 
        (username, password, email, uploaded_file_url)  # Ensure the URL is passed as a parameter
    )
    conn.commit()
    curr.close()
    conn.close()
    
    return PFPModel(email=email, pfpurl=uploaded_file_url)

@auth_router.post("/signin")
def signin(user: LoginUser):
    email = user.email
    password = user.password

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()

    try:
        curr.execute(
            "SELECT email, password FROM users WHERE email = %s AND password = %s",
            (email, password)
        )

        valid = curr.fetchone()

        if valid is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        curr.execute(
            "SELECT id, user_id, username, password, email, pfpurl FROM users WHERE email = %s",
            (email,)
        )

        values = curr.fetchone()

        if values is None:
            raise HTTPException(status_code=404, detail="User not found")

        res = {
            'id': values[0],
            'userID': values[1],
            'username': values[2],
            'password': values[3],
            'email': values[4],
            'pfpurl': values[5]
        }

        return JSONResponse(content=res)

    finally:
        curr.close()
        conn.close()
