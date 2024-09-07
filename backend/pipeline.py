import torch
from diffusers import (
    StableDiffusionXLPipeline, 
    EulerAncestralDiscreteScheduler,
    AutoencoderKL
)
from PIL import Image

# Initialize LoRA model and weights
lora_model_id = "Linaqruf/anime-nouveau-xl-lora"
lora_filename = "anime-nouveau-xl.safetensors"

# Load VAE component
vae = AutoencoderKL.from_pretrained(
    "madebyollin/sdxl-vae-fp16-fix", 
    torch_dtype=torch.float16
)

# Configure the pipeline
pipe = StableDiffusionXLPipeline.from_pretrained(
    "Linaqruf/animagine-xl-2.0", 
    vae=vae,
    torch_dtype=torch.float16, 
    use_safetensors=True, 
    variant="fp16"
)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.to('cuda')

# Load and fuse LoRA weights
pipe.load_lora_weights(lora_model_id, weight_name=lora_filename)
pipe.fuse_lora(lora_scale=0.6)

# Define prompts and generate image
p = "basketball, face focus, cute, masterpiece, best quality, 1girl, sketch, monochrome, greyscale, green hair, sweater, looking at viewer, upper body, beanie, outdoors, night, turtleneck"
np = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"

async def generate_image(prompt, negative_prompt, guidance_scale, inference_steps) -> Image:

    image = pipe(
        prompt, 
        negative_prompt=negative_prompt, 
        width=1024,
        height=1024,
        guidance_scale=guidance_scale,
        num_inference_steps=inference_steps
    ).images[0]

    # Unfuse LoRA before saving the image
    pipe.unfuse_lora()
    return image