export const getCroppedImg = (imageSrc, crop) => {
    const createImage = (url) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; 
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
      });
  
    return new Promise(async (resolve, reject) => {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      canvas.width = crop.width;
      canvas.height = crop.height;
  
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
  
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url); // Return the URL of the cropped image
      }, 'image/jpeg');
    });
  };