import psycopg2
import uvicorn
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


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


@auth_router.post("/signup")
def signup(user: NewUser):
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

@auth_router.post("/signin")
def signin(user: LoginUser):
    email = user.email
    password = user.password

    # Establish connection to the database
    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()

    try:
        # Parameterized query to prevent SQL injection
        curr.execute(
            "SELECT email, password FROM users WHERE email = %s AND password = %s",
            (email, password)
        )

        # Fetch a single matching result (or None if no match)
        valid = curr.fetchone()

        # If no match is found
        if valid is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # If match is found, retrieve user details
        curr.execute(
            "SELECT id, user_id, username, password, email FROM users WHERE email = %s",
            (email,)
        )

        # Fetch the user's details
        values = curr.fetchone()

        if values is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare the response dictionary
        res = {
            'id': values[0],
            'userID': values[1],
            'username': values[2],
            'password': values[3],
            'email': values[4]
        }

        # Return the user details as a JSON response
        return JSONResponse(content=res)
        # return res

    finally:
        # Ensure the cursor and connection are closed
        curr.close()
        conn.close()

    




