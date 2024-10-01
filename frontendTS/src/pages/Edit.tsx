// import { useState, useCallback, useEffect, useContext, useRef } from 'react';
// import Cropper from 'react-easy-crop';
// import { Button, Box, ChakraProvider, Flex, Image, SimpleGrid, Input } from "@chakra-ui/react";
// import SidebarCreate from "../components/SidebarCreate";
// import UserContext from '../authentication/UserContext';
// import plus_sign from './assets/plus_sign.png';
// import { select } from 'framer-motion/client';

// // import './App.css'


// // Helper function to crop the image
// const getCroppedImg = async (imageSrc, croppedAreaPixels, rotation = 0, flip = { horizontal: false, vertical: false }) => {
//   const image = new window.Image();
//   image.src = imageSrc;

//   return new Promise((resolve, reject) => {
//     image.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       // Set canvas size to cropped area
//       canvas.width = croppedAreaPixels.width;
//       canvas.height = croppedAreaPixels.height;

//       // Apply rotation if needed
//       ctx.save();
//       ctx.translate(canvas.width / 2, canvas.height / 2);
//       ctx.rotate((rotation * Math.PI) / 180);
//       ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
//       ctx.drawImage(
//         image,
//         croppedAreaPixels.x,
//         croppedAreaPixels.y,
//         croppedAreaPixels.width,
//         croppedAreaPixels.height,
//         -canvas.width / 2,
//         -canvas.height / 2,
//         canvas.width,
//         canvas.height
//       );
//       ctx.restore();

//       // Convert canvas to Blob or Data URL
//       canvas.toBlob((blob) => {
//         if (blob) {
//           const croppedImageUrl = URL.createObjectURL(blob);
//           resolve(croppedImageUrl);
//         } else {
//           reject(new Error('Canvas is empty'));
//         }
//       }, 'image/png');
//     };
//     image.onerror = (error) => {
//       reject(error);
//     };
//   });
// };

// const Edit = () => {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [imageSrc, setImageSrc] = useState(null);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [rotation] = useState(0); // Default rotation
//   const [flip] = useState({ horizontal: false, vertical: false }); // Default flip
//   const [croppedImage, setCroppedImage] = useState(null);
//   const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext);
//   const [images, setImages] = useState([null, null, null, null]);
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [isCropping, setIsCropping] = useState(false)
//   const cropperRef = useRef(null);

//   useEffect(() => {
//         if (selectedImage) {
//             const newImages = [...images];
//             newImages[selectedIndex] = selectedImage.photo_url;
//             setImages(newImages);
//         }

//     }, [selectedImage, selectedIndex]);


//   const showCroppedImage = useCallback(async () => {
//     if (!croppedAreaPixels) {
//       console.error("Cropped area not defined yet.");
//       return;
//     }
//     try {
//       const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip);
//       setCroppedImage(croppedImage);
//       exitCropping();
//     } catch (e) {
//       console.error(e);
//     }
//   }, [croppedAreaPixels, rotation, flip, imageSrc]);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const fileUrl = URL.createObjectURL(file);
//       setImageSrc(fileUrl);
//     }
//   };

//   const exitCropping = () => {
//     setImageSrc(null); // Clear the image source to exit cropping state
//     setCrop({ x: 0, y: 0 }); // Reset crop position
//     setZoom(1); // Reset zoom level
//   };
//   const onCropComplete = (croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);  // Ensure we set this correctly
//   };

//   const handleCrop = () => {
//     setIsCropping(!isCropping)
//     console.log(isCropping)
//   }

//   return (
//     <div>
//         <Flex h="100%">
//             <Box>
//                 <SidebarCreate />
//             </Box>
//             <Box as="main" flex='1' p="10px">
//                 <ChakraProvider>
//                     <br />
//                     <Button onClick={showCroppedImage}>Show Result</Button>
//                     <Button onClick={handleCrop}>Handle Crop</Button>
//                     <Box w='850px' h='1200px' borderWidth='1px' borderRadius='lg' overflow='hidden'>
//                             <SimpleGrid spacing={2} columns={2} p="2px">
//                                 {images.map((img, index) => (
//                                     <Box
//                                         key={index}
//                                         w='392px'
//                                         h='550px'
//                                         display="flex"
//                                         alignItems="center"
//                                         justifyContent="center"
//                                         position="relative"
//                                         bg='#E2E8F0'
//                                         border={index === selectedIndex ? '5px solid #63b3ed' : 'none'}
//                                         onClick={() => { setSelectedIndex(index); }}
//                                     >
//                                     {!img ? (
//                                         <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
//                                     ) : (
//                                         isCropping ? (
//                                             img && (
//                                                 <div>
//                                                     <h3>Crop the image below:</h3>
//                                                     <Cropper
//                                                         image={img}
//                                                         crop={crop}
//                                                         zoom={zoom}
//                                                         aspect={5 / 7}
//                                                         onCropChange={setCrop}
//                                                         onCropComplete={onCropComplete}
//                                                         onZoomChange={setZoom}
//                                                         // cropSize={{ width: '392px', height: '550px' }}
//                                                     />
//                                                 </div>
//                                             )
//                                         ) : (
//                                             croppedImage ? (
//                                                 <div>
//                                                     <h3>Cropped Image Preview:</h3>
//                                                     <img src={croppedImage} alt="Cropped" />
//                                                 </div>
//                                             ) : (
//                                                 <img src={img} alt="Selected" />
//                                             )
//                                         )
//                                     )}
//                                     </Box>
//                                 ))}
//                             </SimpleGrid>
//                         </Box>
//                     {croppedImage && (
//                         <div>
//                             <h3>Cropped Image Preview:</h3>
//                             <img src={croppedImage} alt="Cropped" />
//                         </div>
//                         )}


//                 </ChakraProvider>
//             </Box>
//         </Flex>
//     </div>
//   );
// };

// export default Edit;

import { useState, useCallback, useContext, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Box, ChakraProvider, Flex, SimpleGrid } from "@chakra-ui/react";
import SidebarCreate from "../components/SidebarCreate";
import UserContext from '../authentication/UserContext';
import plus_sign from './assets/plus_sign.png';
import EditMenu from '../components/EditMenu';

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

// Function to merge images on canvas
const mergeImages = async (imageUrls) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const targetWidth = 800;  // Final canvas width
  const targetHeight = 1200; // Final canvas height
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const resizedWidth = 400;  // Half of target width
  const resizedHeight = 600; // Half of target height

  for (let i = 0; i < imageUrls.length; i++) {
    if (imageUrls[i]) {
      const img = new Image();
      img.src = imageUrls[i];
      
      // Wait for the image to load before drawing
      await new Promise((resolve) => {
        img.onload = () => {
          const x = (i % 2) * resizedWidth;  // Adjust X position
          const y = Math.floor(i / 2) * resizedHeight;  // Adjust Y position
          ctx.drawImage(img, x, y, resizedWidth, resizedHeight);
          resolve();
        };
      });
    }
  }

  // Return the merged image as a data URL
  return canvas.toDataURL('image/png');
};

const Edit = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation] = useState(0);
  const [flip] = useState({ horizontal: false, vertical: false });
  const [croppedImage, setCroppedImage] = useState(null);
  const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext);
  const [images, setImages] = useState([null, null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const cropperRef = useRef(null);
  const [mergedImage, setMergedImage] = useState(null);

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) {
      console.error("Cropped area not defined yet.");
      return;
    }
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip);
      const newImages = [...images];
      newImages[selectedIndex] = croppedImage;  // Update the selected box with the cropped image
      setImages(newImages);
      setCroppedImage(croppedImage);
      exitCropping();
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, rotation, flip, imageSrc, images, selectedIndex]);

  const mergeCroppedImages = useCallback(async () => {
    const finalMergedImage = await mergeImages(images);
    setMergedImage(finalMergedImage);
  }, [images]);

  const exitCropping = () => {
    setImageSrc(null); // Clear the image source to exit cropping state
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom level
    setIsCropping(false); // Exit cropping mode
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const photoUrl = event.dataTransfer.getData('photoUrl');
    
    if (photoUrl) {
        const newImages = [...images];
        newImages[index] = photoUrl;  // Set the dropped image to the selected box
        setImages(newImages);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();  // Necessary to allow a drop
  };

  const handleCrop = () => {
    setIsCropping(true);  // Activate cropping mode when the crop button is clicked
  };

  return (
    <Flex h="100%">
        <Box>
            <SidebarCreate />
        </Box>
        <Box as="main" flex="1" p="10px">
            <ChakraProvider>
                <Button onClick={handleCrop} disabled={!selectedIndex && images[selectedIndex] === null}>Crop</Button> {/* Crop button */}
                {isCropping && (
                    <Box>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}  // Crop aspect ratio (1:1)
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                        <Button onClick={showCroppedImage}>Save Crop</Button>
                        <Button onClick={exitCropping}>Cancel</Button>
                    </Box>
                )}
                <Box w="850px" h="1200px" borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <SimpleGrid spacing={2} columns={2} p="2px">
                        {images.map((img, index) => (
                            <Box
                                key={index}
                                w="392px"
                                h="550px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                position="relative"
                                bg="#E2E8F0"
                                objectFit="contain"
                                border={index === selectedIndex ? '5px solid #63b3ed' : 'none'}
                                onClick={() => setSelectedIndex(index)}
                                onDrop={(e) => handleDrop(e, index)}  // Handle image drop
                                onDragOver={handleDragOver}  // Allow dragging over
                            >
                                {!img ? (
                                    <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
                                ) : (
                                    <img src={img}  />
                                )}
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </ChakraProvider>
        </Box>
        <Box>
            <EditMenu />
        </Box>
    </Flex>
  );
};

export default Edit;
