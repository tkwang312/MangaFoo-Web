import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


const ImageCropper = forwardRef(({ imageProp, onCropComplete, cropWidth, cropHeight }, ref) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: cropWidth / cropHeight });
  const [image, setImage] = useState();

  
  useEffect(() => {
    if (imageProp) {
      const imgUrl = imageProp.photo_url; // Adjust this line according to your data structure
      console.log("Setting image source:", imgUrl); 
      setSrc(imgUrl); 
  
      fetch(`http://127.0.0.1:8000/image/?img_url=${encodeURIComponent(imgUrl)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);  
        const htmlimg = new Image();
        htmlimg.src = data.image_data;
        setImage(htmlimg); // Adjust this line based on your API response
      })
      .catch((error) => console.error('Error fetching data:', error));
    }
  }, [imageProp]);

  const handleImageLoaded = (img) => {
    console.log("IMG loaded successfully:", img);
    setImage(img);
    console.log("Image loaded successfully:", img);
    return false; 
  };

  const cropImageNow = () => {
    if (!image) {
      console.error('Image is not loaded yet!'); // Error if image isn't loaded
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
    canvas.width = cropWidth * pixelRatio;
    canvas.height = cropHeight * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image); 
  };

  return (
    <div className="App">
      {src ? (
        <ReactCrop
          src={src}
          onImageLoaded={handleImageLoaded}
          crop={crop}
          onChange={setCrop}
        />
      ) : (
        <p>No image selected.</p> 
      )}
      <button onClick={cropImageNow}>Crop</button>
    </div>
  );
});

export default ImageCropper;