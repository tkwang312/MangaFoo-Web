import React, { useContext, useState, useEffect, useCallback  } from 'react'
import SidebarCreate from "../components/SidebarCreate"
import UserContext from '../authentication/UserContext'
import Cropper from "react-easy-crop"
import { getCroppedImg } from './utils/getCroppedImg';
import plus_sign from './assets/plus_sign.png'
import { Button, Box, ChakraProvider, Flex, Image, SimpleGrid } from "@chakra-ui/react"

const Edit = () => {
    const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext)
    const [images, setImages] = useState([null, null, null, null]);
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedArea, setCroppedArea] = useState(null);
    useEffect(() => {
        if (selectedImage) {
          const newImages = [...images];
    
          newImages[selectedIndex] = selectedImage.photo_url
          setImages(newImages);

        }
      }, [selectedImage]);

    const handleDelete = () => {
        const newImages = [...images];
    
        newImages[selectedIndex] = null
        setImages(newImages);
    }

        // Get the cropped area
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedArea(croppedAreaPixels); // Save the cropped area in pixels
    }, []);

    const handleCropConfirm = async () => {
        if (images[selectedIndex]) {
            const croppedImage = await getCroppedImg(images[selectedIndex], croppedArea); // Crop the image using helper function
            const newImages = [...images];
            newImages[selectedIndex] = croppedImage; // Replace the image with the cropped version
            setImages(newImages); // Update the state with the cropped image
        }
    };

  return (
    <Flex h="100%">
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex='1' p="10px">
        <ChakraProvider>
            <Button onClick={handleDelete}>Remove Image</Button>
            <Button onClick={handleCropConfirm}>Confirm Crop</Button>
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
                        onClick={() => {setSelectedIndex(index)}}
                    >
                        {/* <Image
                        w={img === null ? '15%' : '100%'}
                        h={img === null ? '15%' : '100%'}
                        src={img === null ? plus_sign : img}
                        objectFit={img === null ? 'contain' : 'cover'}
                        position="absolute"
                        /> */}

                        {img !== null ? (
                            <Cropper
                                image={img}
                                crop={crop}
                                zoom={zoom}
                                aspect={5 / 7}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        ) : (
                            <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
                        )}

                        {/* <Cropper
                            image={img === null ? plus_sign : img}
                            crop={crop}
                            zoom={zoom}
                            aspect={5 / 7}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        /> */}
                    </Box>

                    ))}
                </SimpleGrid>
            </Box>
        </ChakraProvider>
      </Box>
    </Flex>
  )
}

export default Edit
