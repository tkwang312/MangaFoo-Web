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

# python -m uvicorn api:app --reload
app = FastAPI()
app.include_router(auth_router)

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

class Params(BaseModel):
    modelID: str
    prompt: str
    negative_prompt: str
    guidance_scale: int
    inference_steps: int

class ImageModel(BaseModel):
    id: int
    userID: int
    photo_name: str
    photo_url: str
    is_deleted: bool


@app.get("/")
def root():
    return {'stable diffusion api'}


@app.post("/txt2img/")
# async def generate(prompt: str, negative_prompt:str, guidance_scale: int, inference_steps: int): 
async def generate(params: Params): 
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
        database="exampledb", user="docker", password="docker", host="0.0.0.0"
    )
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO photo (photo_name, photo_url) VALUES ('{image_name}', '{uploaded_file_url}' )"
    )
    conn.commit()
    cur.close()
    conn.close()


    return Response(content=imgstr, media_type="image/png")

@app.get("/images/")
async def get_all_images():
    #TODO edit
    conn = psycopg2.connect(
        database="exampledb", user="docker", password="docker", host="localhost"
    )
    curr = conn.cursor()
    curr.execute("SELECT * FROM photo ORDER BY id DESC")
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


@app.delete("/remove_images/")
async def remove():
    for item in my_images:
        os.remove(item)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

