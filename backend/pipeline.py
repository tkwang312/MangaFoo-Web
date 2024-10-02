import torch
from diffusers import (
    StableDiffusionXLPipeline, 
    EulerAncestralDiscreteScheduler,
    AutoencoderKL
)
from PIL import Image

lora_model_id = "Linaqruf/anime-nouveau-xl-lora"
lora_filename = "anime-nouveau-xl.safetensors"

vae = AutoencoderKL.from_pretrained(
    "madebyollin/sdxl-vae-fp16-fix", 
    torch_dtype=torch.float16
)

model_list = ["Linaqruf/animagine-xl-2.0", "eienmojiki/Anything-XL"]


p = "basketball, face focus, cute, masterpiece, best quality, 1girl, sketch, monochrome, greyscale, green hair, sweater, looking at viewer, upper body, beanie, outdoors, night, turtleneck"
np = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"

async def generate_image(modelID, prompt, negative_prompt, guidance_scale, inference_steps) -> Image:

    pipe = StableDiffusionXLPipeline.from_pretrained(
        model_list[modelID], 
        vae=vae,
        torch_dtype=torch.float16, 
        use_safetensors=True,
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.to('cuda')
    pipe.load_lora_weights(lora_model_id, weight_name=lora_filename)
    pipe.fuse_lora(lora_scale=0.6)

    image = pipe(
        prompt, 
        negative_prompt=negative_prompt, 
        width=512,
        height=768,
        guidance_scale=guidance_scale,
        num_inference_steps=inference_steps
    ).images[0]

    pipe.unfuse_lora()
    return image