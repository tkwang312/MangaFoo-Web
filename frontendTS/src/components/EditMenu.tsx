import React, { useState, useContext, useEffect } from 'react'
import { Image, Flex, VStack, Heading, SimpleGrid, Spinner, Box, useToast } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import UserContext from '../authentication/UserContext'

const EditMenu = () => {
    const [navSize, changeNavSize] = useState("large")
    const [allPhotos, setAllPhotos] = useState([])
    const [selectedID, setSelectedID] = useState(0)
    const [loading, setLoading] = useState(true);
    const { uid, updateToggle, selectedImage, setSelectedImage } = useContext(UserContext);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (uid) {
            setLoading(true);
            fetch(`http://127.0.0.1:8000/speechbubbles/`)
                .then((response) => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then((data) => {
                    if (Array.isArray(data)) {
                        setAllPhotos(data);
                    } else {
                        console.error("Expected an array but got:", data);
                        setAllPhotos([]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    toast({
                        title: "Error fetching images.",
                        description: error.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                })
                .finally(() => setLoading(false)); 
    }, [uid, updateToggle]);

    const handleImageClick = (imageId) => {
        const index = allPhotos.findIndex(item => item['id'] === imageId);
        if (index !== -1) {
            setSelectedImage(allPhotos[index]);
            setSelectedID(index);
        }
    };

    const handleDragStart = (event, photo) => {
        event.dataTransfer.setData('photoUrl', photo.image_url);
    };

    return (
        <Flex flexDirection="column" alignItems="center" p={4} bg="purple.50" h="100vh">
            <VStack spacing={4} align="stretch" w="full">
                <Heading size="lg">Text Boxes</Heading>
                {loading ? (
                    <Flex justify="center" align="center" h="60vh">
                        <Spinner size="xl" color="purple.500" />
                    </Flex>
                ) : (
                    <SimpleGrid spacing={4} columns={{ base: 1, md: 2, lg: 3 }} p={2}>
                        {allPhotos.map((photo) => (
                            <Box
                                key={photo.id}
                                position="relative"
                                borderRadius="md"
                                overflow="hidden"
                                onClick={() => handleImageClick(photo.id)}
                                _hover={{ boxShadow: "md", cursor: "pointer" }} 
                            >
                                <Image
                                    h="200px"
                                    w="100%"
                                    src={photo.image_url}
                                    objectFit="contain"
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, photo)}
                                    border={allPhotos.findIndex(item => item['id'] === photo.id) === selectedID ? '5px solid #63b3ed' : 'none'}
                                />
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </VStack>
        </Flex>
    );
}

export default EditMenu;
