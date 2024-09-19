import React, { useContext, useState, useEffect } from 'react'
import SidebarCreate from "../components/SidebarCreate"
import UserContext from '../authentication/UserContext'
import plus_sign from './assets/plus_sign.png'
import { Button, Box, ChakraProvider, Flex, Image, SimpleGrid } from "@chakra-ui/react"

const Edit = () => {
    const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext)
    const [images, setImages] = useState([null, null, null, null]);
    const [selectedIndex, setSelectedIndex] = useState(null)

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

  return (
    <Flex h="100%">
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex='1' p="10px">
        <ChakraProvider>
            <Button onClick={handleDelete}>Remove Image</Button>
            <Box w='850px' h='1200px' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                <SimpleGrid spacing={2} columns={2} p="2px">
                    {images.map((img, index) => (
                    <Box
                        key={index}
                        w='400px'
                        h='550px'
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        bg='#E2E8F0'
                        border={index === selectedIndex ? '5px solid #63b3ed' : 'none'}
                        onClick={() => {setSelectedIndex(index)}}
                    >
                        <Image
                        w={img === null ? '15%' : '100%'}
                        h={img === null ? '15%' : '100%'}
                        src={img === null ? plus_sign : img}
                        objectFit={img === null ? 'contain' : 'cover'}
                        position="absolute"
                        />
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
