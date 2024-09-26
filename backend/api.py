from http.client import HTTPException
from keys import HUGGINGFACE_TOKEN as token
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import torch
from torch import autocast
from io import BytesIO
import base64
from PIL.Image import Image
import boto3
import psycopg2
import keys
import os
from pipeline import generate_image
from pydantic import BaseModel
from auth import auth_router
import uvicorn
from typing import List

# python -m uvicorn api:app --reload
app = FastAPI()

my_images = []
BUCKET_NAME = 'mangapics'

s3 = boto3.client('s3',
                    aws_access_key_id = keys.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key = keys.AWS_ACCESS_SECRET_KEY,
                     )

s3_resource = boto3.resource('s3',
                    aws_access_key_id = keys.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key = keys.AWS_ACCESS_SECRET_KEY,
                     )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

app.include_router(auth_router)


class Params(BaseModel):
    user_id: str
    modelID: str
    prompt: str
    negative_prompt: str
    guidance_scale: int
    inference_steps: int

class ImageModel(BaseModel):
    id: int
    userID: str
    photo_name: str
    photo_url: str
    is_deleted: bool


@app.get("/")
def root():
    return {'stable diffusion api'}


@app.post("/txt2img/")
# async def generate(prompt: str, negative_prompt:str, guidance_scale: int, inference_steps: int): 
async def generate(params: Params):
    user_id = params.user_id 
    modelID = int(params.modelID)
    prompt = params.prompt
    negative_prompt = params.negative_prompt
    guidance_scale = params.guidance_scale
    inference_steps = params.inference_steps

    image = await generate_image(modelID, prompt, negative_prompt, guidance_scale, inference_steps)
    image_name = f'{prompt[:100]}.png'
    buffer = BytesIO()
    image.save(image_name)
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue())
    buffer.seek(0)
    s3.upload_fileobj(buffer, BUCKET_NAME, image_name)
    os.remove(image_name)

    #add photo to postgresql
    #TODO edit
    uploaded_file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{image_name}"

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO images (user_id, photo_name, photo_url) VALUES ('{user_id}', '{image_name}', '{uploaded_file_url}')"
    )
    conn.commit()
    cur.close()
    conn.close()

    return Response(content=imgstr, media_type="image/png")

@app.get("/images/", response_model=List[ImageModel])
async def get_all_images(uid: str):
    #TODO edit
    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()
    curr.execute("SELECT * FROM images WHERE user_id = %s ORDER BY id DESC", (uid, ))
    rows = curr.fetchall()

    formatted_photos = []
    for row in rows:
        formatted_photos.append(
            ImageModel(
                id=row[0], userID=row[1], photo_name=row[2], photo_url=row[3], is_deleted=row[4]
            )
        )

    curr.close()
    conn.close()
    return formatted_photos


@app.delete("/remove_image/")
async def remove(img: ImageModel):
    id = img.id
    userID = img.userID
    photo_name = img.photo_name
    photo_url = img.photo_url
    is_deleted = True

    s3.delete_object(Bucket=BUCKET_NAME, Key=photo_name)
    print(f"Deleted image with key: {photo_name}")

    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )

    curr = conn.cursor()

    try:
        curr.execute("DELETE FROM images WHERE user_id = %s AND photo_name = %s", (userID, photo_name))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=404, detail="delete error")
    finally:
        curr.close()
        conn.close()
    
    print("delete success")
    
@app.get("/image/")
async def get_image(img_url: str):
    img_name = img_url.split('/')[-1]
    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()
    
    curr.execute("SELECT * FROM images WHERE photo_url = %s", (img_url,))
    row = curr.fetchone()  # Get a single image

    if row:
        image_data = ImageModel(
            id=row[0],
            userID=row[1],
            photo_name=row[2],
            photo_url=row[3],
            is_deleted=row[4],
        )
    else:
        raise HTTPException(status_code=404, detail="Image not found")

    curr.close()
    conn.close()

    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=img_name)
        return {
            "image_url": image_data.photo_url,
            "image_data": base64.b64encode(response['Body'].read()).decode('utf-8')  # Base64 encode the image data
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error fetching image: {str(e)}")
        

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

