// import React, { useContext, useState, useEffect, useRef } from 'react';
// import SidebarCreate from "../components/SidebarCreate";
// import UserContext from '../authentication/UserContext';
// import { Button, Box, ChakraProvider, Flex, Image, SimpleGrid } from "@chakra-ui/react";
// import ImageCropper from './ImageCropper';
// import plus_sign from './assets/plus_sign.png';

// const Edit = () => {
//     const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext);
//     const [images, setImages] = useState([null, null, null, null]);
//     const [selectedIndex, setSelectedIndex] = useState(null);
//     const cropperRef = useRef(null);
    
//     useEffect(() => {
//         if (selectedImage) {
//             const newImages = [...images];
//             newImages[selectedIndex] = selectedImage.photo_url;
//             setImages(newImages);
//         }
//     }, [selectedImage, selectedIndex]);

//     const handleDelete = () => {
//         const newImages = [...images];
//         newImages[selectedIndex] = null;
//         setImages(newImages);
//     };

//     const handleCropComplete = (croppedImage) => {
//         if (selectedIndex !== null) {
//             const newImages = [...images];
//             newImages[selectedIndex] = croppedImage; // Set the actual cropped image
//             setImages(newImages);
//         }
//     };

//     const BOX_WIDTH = 392;
//     const BOX_HEIGHT = 550;

//     return (
//         <Flex h="100%">
//             <Box>
//                 <SidebarCreate />
//             </Box>
//             <Box as="main" flex='1' p="10px">
//                 <ChakraProvider>
//                     <Button onClick={handleDelete}>Remove Image</Button>
//                     <Image src={selectedImage?.photo_url} />
//                     <ImageCropper
//                         ref={cropperRef}
//                         imageProp={selectedImage}
//                         onCropComplete={handleCropComplete}
//                         cropWidth={BOX_WIDTH}
//                         cropHeight={BOX_HEIGHT}
//                     />
//                     <Box w='850px' h='1200px' borderWidth='1px' borderRadius='lg' overflow='hidden'>
//                         <SimpleGrid spacing={2} columns={2} p="2px">
//                             {images.map((img, index) => (
//                                 <Box
//                                     key={index}
//                                     w='392px'
//                                     h='550px'
//                                     display="flex"
//                                     alignItems="center"
//                                     justifyContent="center"
//                                     position="relative"
//                                     bg='#E2E8F0'
//                                     border={index === selectedIndex ? '5px solid #63b3ed' : 'none'}
//                                     onClick={() => { setSelectedIndex(index); }}
//                                 >
//                                     {img ? (
//                                         <ImageCropper
//                                             ref={cropperRef}
//                                             imageProp={img}
//                                             onCropComplete={handleCropComplete}
//                                             cropWidth={BOX_WIDTH}
//                                             cropHeight={BOX_HEIGHT}
//                                         />
//                                     ) : (
//                                         <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
//                                     )}
//                                 </Box>
//                             ))}
//                         </SimpleGrid>
//                     </Box>
//                 </ChakraProvider>
//             </Box>
//         </Flex>
//     );
// }

// export default Edit;

import { useState, useCallback, useEffect, useContext, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Box, ChakraProvider, Flex, Image, SimpleGrid, Input } from "@chakra-ui/react";
import SidebarCreate from "../components/SidebarCreate";
import UserContext from '../authentication/UserContext';
import plus_sign from './assets/plus_sign.png';
import { select } from 'framer-motion/client';

// import './App.css'


// Helper function to crop the image
const getCroppedImg = async (imageSrc, croppedAreaPixels, rotation = 0, flip = { horizontal: false, vertical: false }) => {
  const image = new window.Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Apply rotation if needed
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      // Convert canvas to Blob or Data URL
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/png');
    };
    image.onerror = (error) => {
      reject(error);
    };
  });
};

const Edit = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation] = useState(0); // Default rotation
  const [flip] = useState({ horizontal: false, vertical: false }); // Default flip
  const [croppedImage, setCroppedImage] = useState(null);
  const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext);
  const [images, setImages] = useState([null, null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCropping, setIsCropping] = useState(false)
  const cropperRef = useRef(null);

  useEffect(() => {
        if (selectedImage) {
            const newImages = [...images];
            newImages[selectedIndex] = selectedImage.photo_url;
            setImages(newImages);
        }

    }, [selectedImage, selectedIndex]);


  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) {
      console.error("Cropped area not defined yet.");
      return;
    }
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip);
      setCroppedImage(croppedImage);
      exitCropping();
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, rotation, flip, imageSrc]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImageSrc(fileUrl);
    }
  };

  const exitCropping = () => {
    setImageSrc(null); // Clear the image source to exit cropping state
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom level
  };
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);  // Ensure we set this correctly
  };

  const handleCrop = () => {
    setIsCropping(!isCropping)
    console.log(isCropping)
  }

  return (
    <div>
    <Flex h="100%">
        <Box>
            <SidebarCreate />
        </Box>
        <Box as="main" flex='1' p="10px">
            <ChakraProvider>
                {/* <Input type="file" accept="image/*" onChange={handleFileChange} /> */}
                <br />
                <Button onClick={showCroppedImage}>Show Result</Button>
                <Button onClick={handleCrop}>Handle Crop</Button>
                <Box w='850px' h='1200px' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                         <SimpleGrid spacing={2} columns={2} p="2px">
                             {images.map((img, index) => (
                                <Box
                                    key={index}
                                    w='392px'
                                    h='550px'
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    position="relative"
                                    bg='#E2E8F0'
                                    border={index === selectedIndex ? '5px solid #63b3ed' : 'none'}
                                    onClick={() => { setSelectedIndex(index); }}
                                >
                                {!img ? (
                                    <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
                                ) : (
                                    isCropping ? (
                                        img && (
                                            <div>
                                                <h3>Crop the image below:</h3>
                                                <Cropper
                                                    image={img}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={5 / 7}
                                                    onCropChange={setCrop}
                                                    onCropComplete={onCropComplete}
                                                    onZoomChange={setZoom}
                                                    // cropSize={{ width: '392px', height: '550px' }}
                                                />
                                            </div>
                                        )
                                    ) : (
                                        croppedImage ? (
                                            <div>
                                                <h3>Cropped Image Preview:</h3>
                                                <img src={croppedImage} alt="Cropped" />
                                            </div>
                                        ) : (
                                            <img src={img} alt="Selected" />
                                        )
                                    )
                                )}
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                {croppedImage && (
                    <div>
                        <h3>Cropped Image Preview:</h3>
                        <img src={croppedImage} alt="Cropped" />
                    </div>
                    )}


            </ChakraProvider>
        </Box>
    </Flex>
    {/* <div className="container">
      <div className="container-cropper">
        <h2>Image Crop Demo</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <br />
        {imageSrc && (
          <div>
            <h3>Crop the image below:</h3>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        )}

        {croppedImage && (
          <div>
            <h3>Cropped Image Preview:</h3>
            <img src={croppedImage} alt="Cropped" />
          </div>
        )}
      </div>
      <footer>
        <button onClick={showCroppedImage}>
          Show Result
        </button>
      </footer>
    </div> */}
    </div>
  );
};

export default Edit;