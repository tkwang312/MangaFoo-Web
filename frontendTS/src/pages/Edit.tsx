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

import { useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const Edit = () => {
    const [src, setSrc] = useState(null);
    const [crop, setCrop] = useState({ aspect: 16 / 9 });
    const [image, setImage] = useState(null);
    const [output, setOutput] = useState(null);

    const selectImage = (file) => {
        setSrc(URL.createObjectURL(file));
    };

    const cropImageNow = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
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
            crop.width,
            crop.height,
        );

        // Converting to base64
        const base64Image = canvas.toDataURL('image/jpeg');
        setOutput(base64Image);
    };

    return (
        <div className="App">
            <center>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        selectImage(e.target.files[0]);
                    }}
                />
                <br />
                <br />
                <div>
                    {src && (
                        <div>
                            <ReactCrop src={src} onImageLoaded={setImage}
                                crop={crop} onChange={setCrop} />
                            <br />
                            <button onClick={cropImageNow}>Crop</button>
                            <br />
                            <br />
                        </div>
                    )}
                </div>
                <div>{output && <img src={output} />}</div>
            </center>
        </div>
    );
}

export default Edit;
