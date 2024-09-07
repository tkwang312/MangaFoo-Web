from http.client import HTTPException
from keys import HUGGINGFACE_TOKEN as token
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from transformers import CLIPTextModel, CLIPTokenizer
from io import BytesIO
import base64
import platform
from PIL.Image import Image
import boto3
import keys
import os
from pipeline import generate_image
from pydantic import BaseModel

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

class Params(BaseModel):
    prompt: str
    negative_prompt: str
    guidance_scale: int
    inference_steps: int

class Params(BaseModel):
    id: int
    user_id: int
    

# tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14", torch_dtype=torch.float16)
# text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14", torch_dtype=torch.float16).to("cuda")

# model_id_list = ["CompVis/stable-diffusion-v1-4", "stablediffusionapi/anything-v5"]

# device = "cuda"
# model_id = "stablediffusionapi/anything-v5"
# # model_id = "CompVis/stable-diffusion-v1-4"
# pipe = StableDiffusionPipeline.from_pretrained(model_id, use_safetensors=True, torch_dtype=torch.float16, token=token)
# pipe.to(device)

# lora_dirs = "Linaqruf/anime-nouveau-xl-lora"
# pipe.load_lora_weights(lora_dirs)

# for ldir, lsc in zip(lora_dirs, lora_scales):
#     # Iteratively add new LoRA.
#     pipe.load_lora_weights(ldir)
#     # And scale them accordingly.
#     pipe.fuse_lora(lora_scale = lsc)

@app.get("/")
def root():
    return {'haha'}

@app.post("/txt2img/")
# async def generate(prompt: str, negative_prompt:str, guidance_scale: int, inference_steps: int): 
async def generate(params: Params): 
    prompt = params.prompt
    negative_prompt = params.negative_prompt
    guidance_scale = params.guidance_scale
    inference_steps = params.inference_steps
    # with autocast(device): 
    #     image = pipe(prompt, guidance_scale=8.5).images[0]

    # image_name = f'{prompt[:100]}.png'
    # buffer = BytesIO()
    # image.save(image_name)
    # image.save(buffer, format="PNG")
    # imgstr = base64.b64encode(buffer.getvalue())
    # buffer.seek(0)
    # s3.upload_fileobj(buffer, BUCKET_NAME, image_name)
    # os.remove(image_name)
    # return Response(content=imgstr, media_type="image/png")

    image = await generate_image(prompt, negative_prompt, guidance_scale, inference_steps)
    image_name = f'{prompt[:100]}.png'
    buffer = BytesIO()
    image.save(image_name)
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue())
    buffer.seek(0)
    s3.upload_fileobj(buffer, BUCKET_NAME, image_name)
    os.remove(image_name)
    return Response(content=imgstr, media_type="image/png")

@app.get("/images/")
async def get_all_images():
    my_bucket = s3_resource.Bucket(BUCKET_NAME)
    for s3_object in my_bucket.objects.all():
        path, filename = os.path.split(s3_object.key)
        my_images.append(filename)
        my_bucket.download_file(s3_object.key, filename)
    
@app.delete("/remove_images/")
async def remove():
    for item in my_images:
        os.remove(item)


# async def get_all_images():
#     try:
#         bucket = s3_resource.Bucket(BUCKET_NAME)
#         for obj in OJH():
#             temp_url = ob
#             bucket.download_file(obj.key, )
            
        # # List all objects (images) in the S3 bucket
        # response = s3.list_objects_v2(Bucket=BUCKET_NAME,Prefix='uploads/admin/')
        # files = response.get("Contents")
        # filename_test =[]
        # for file in files:
        #     # print(f"file_name: {file['Key']}, size: {file['Size']}")
        #     filename_test.append(file['Key'])
        # print(filename_test)
        # # Extract the list of image URLs
        # image_urls = []
        # for obj in response.get("Contents", []):
        #     # print(obj)
        #     # new_obj= obj['Key'].split('/')[-1]
        #     # print(new_obj)
        #     image_urls.append({'url':                
        #         s3.generate_presigned_url(
        #             "get_object",
        #             Params={"Bucket": BUCKET_NAME, "Key": obj["Key"]},
        #             ExpiresIn=3600  # URL expiration time (in seconds)
        #         ),'filename': obj['Key'].split('/')[-1]}
        #     )
        # print(image_urls)
        # return {"image_urls": image_urls,'filename_test': filename_test}
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail="Failed to fetch images") 

# def retrieve(key: str):
    

    

    # with autocast(device): 
    #     image = pipe(prompt, guidance_scale=8.5).images[0]

    # image.save(prompt + " testimage.png")

    # buffer = BytesIO()
    # image.save(buffer, format="PNG")z
    # imgstr = base64.b64encode(buffer.getvalue())

    # return Response(content=imgstr, media_type="image/png")
