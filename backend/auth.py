import base64
from io import BytesIO
import logging
import psycopg2
import uvicorn
from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import boto3
import keys
from typing import Annotated, List

BUCKET_NAME = 'pfpbucket1'

s3 = boto3.client('s3',
                    aws_access_key_id = keys.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key = keys.AWS_ACCESS_SECRET_KEY,
                     )

s3_resource = boto3.resource('s3',
                    aws_access_key_id = keys.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key = keys.AWS_ACCESS_SECRET_KEY,
                     )

auth_router = APIRouter()



class User(BaseModel):
    id: int
    userID: str
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
    user_id: str
    pfpurl: str

class PFPUpdateModel(BaseModel):
    user_id: str
    file: UploadFile = File(...)

class UsernamePasswordModel(BaseModel):
    userID: str
    username: str
    password: str

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
        RETURNING user_id
        """, 
        (username, password, email, uploaded_file_url)  # Ensure the URL is passed as a parameter
    )

    user_id = curr.fetchone()[0]

    conn.commit()
    curr.close()
    conn.close()
    
    return PFPModel(user_id=user_id, pfpurl=uploaded_file_url)

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


@auth_router.post("/changeusernamepassword")
async def change_username_password(user: UsernamePasswordModel):
    uid = user.userID
    username = user.username
    password = user.password

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )

    curr = conn.cursor()
    
    try:
        curr.execute("UPDATE users SET username = %s, password = %s WHERE user_id = %s", 
        (username, password, uid,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=404, detail="User not found")
    finally:
        curr.close()
        conn.close()

    print(username)
    print(password)

@auth_router.post("/pfpupload", response_model=PFPModel)
# def change_pfp(uid: Annotated[str, Form], file: Annotated[UploadFile, File()]):
#     user_id = uid
#     pfpfile = file
async def change_pfp(
    user_id: str = Form(...),  # Use Form for non-file data
    file:  UploadFile = File(...)  # Use File for file uploads
):  
    
    pfpfile = file
    print(pfpfile.filename)
    print(pfpfile.content_type)
    
    # buffer = BytesIO()
    # imgstr = base64.b64encode(buffer.getvalue())
    # buffer.seek(0)

    try:
        s3.upload_fileobj(pfpfile.file, BUCKET_NAME, pfpfile.filename)
    except Exception as e:
        logging.error(f"Error during S3 upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading file to S3: {e}")

    uploaded_file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{pfpfile.filename}"


    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()

    try:
        curr.execute(
            "SELECT pfpurl FROM users WHERE user_id = %s",
            (user_id,)
        )
        current_pfp_url = curr.fetchone()

        if current_pfp_url is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        curr.execute(
            "UPDATE users SET pfpurl = %s WHERE user_id = %s",
            (uploaded_file_url, user_id)
        )

        conn.commit()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    finally:
        curr.close()
        conn.close()

    return PFPModel(user_id=user_id, pfpurl=uploaded_file_url)


# @auth_router.post("/pfpupload", response_model=PFPModel)
# async def change_pfp(user_id: int, file: UploadFile = File(...)):
#     # Handle file upload
#     file_content = await file.read()
#     s3.upload_fileobj(file.file, BUCKET_NAME, file.filename)

#     uploaded_file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file.filename}"

#     # Connect to database
#     conn = psycopg2.connect(
#         database="exampledb", user="docker", password="docker", host="localhost"
#     )
#     curr = conn.cursor()

#     try:
#         curr.execute(
#             "SELECT pfpurl FROM users WHERE user_id = %s",
#             (user_id,)
#         )
#         current_pfp_url = curr.fetchone()

#         if current_pfp_url is None:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         curr.execute(
#             "UPDATE users SET pfpurl = %s WHERE user_id = %s",
#             (uploaded_file_url, user_id)
#         )

#         conn.commit()

#     except Exception as e:
#         conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

#     finally:
#         curr.close()
#         conn.close()

#     return PFPModel(user_id=user_id, pfpurl=uploaded_file_url)