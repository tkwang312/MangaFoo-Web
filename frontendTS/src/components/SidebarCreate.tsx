import React, { useState, useContext, useEffect } from 'react'
import { Image, Flex, IconButton, Button, VStack, Heading, SimpleGrid, useToast } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FiChevronLeft, FiChevronRight, FiUser, FiCalendar, FiSettings } from 'react-icons/fi'
import UserContext from '../authentication/UserContext'

const SidebarCreate = () => {
    const [navSize, changeNavSize] = useState("large")
    const [allPhotos, setAllPhotos] = useState([])
    const [selectedID, setSelectedID] = useState(0)
    const { uid, updateToggle, selectedImage, setSelectedImage, setUpdateToggle } = useContext(UserContext)
    const navigate = useNavigate();
    const toast = useToast();

    const handleDelete = () => {
        const imageDict = selectedImage;

        fetch('http://127.0.0.1:8000/remove_image/', {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(imageDict)
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(() => {
            setUpdateToggle(!updateToggle);
            toast({
                title: "Image deleted",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }).catch((error) => {
            console.error('Error deleting image:', error);
            toast({
                title: "Error deleting image",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        });
    }

    useEffect(() => {
        if (uid) {
            fetch(`http://127.0.0.1:8000/images/?uid=${uid}`)
                .then((response) => response.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setAllPhotos(data);
                    } else {
                        console.error("Expected an array but got:", data);
                        setAllPhotos([]);
                    }
                })
                .catch((error) => console.error('Error fetching data:', error));
        }
    }, [updateToggle]);

    const handleClickEdit = (e) => {
        e.preventDefault();
        navigate("/edit");
    }

    const handleClickGenerate = (e) => {
        e.preventDefault();
        navigate("/create");
    }

    const handleClickProfile = (e) => {
        e.preventDefault();
        navigate("/profile");
    }

    const handleImageClick = (imageId) => {
        const index = allPhotos.findIndex(item => item['id'] === imageId);
        setSelectedImage(allPhotos[index]);
        setSelectedID(index);
    };

    const handleDragStart = (event, photo) => {
        event.dataTransfer.setData('photoUrl', photo.photo_url);
    };

    return (
        <Flex>
            <Flex
                h="100vh"
                w="60px"
                flexDir="column"
                bg="purple.200"
                p="5%"
                justifyContent="space-between"
            >
                <Flex flexDir="column" alignItems="center">
                    <IconButton
                        mt={5}
                        icon={navSize === "small" ? <FiChevronRight /> : <FiChevronLeft />}
                        onClick={() => changeNavSize(navSize === "small" ? "large" : "small")}
                        bg="purple.100"
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiUser />}
                        onClick={handleClickGenerate}
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiCalendar />}
                        onClick={handleClickEdit}
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiSettings />}
                        onClick={handleClickProfile}
                    />
                </Flex>
            </Flex>

            <Flex
                w={navSize === "small" ? "0px" : { base: "300px", lg: "400px" }}
                bg="purple.100"
                flexBasis={'auto'}
                overflow={'auto'}
                transition="width 0.3s"
            >
                <VStack align="stretch" spacing={4} p="10px">
                    <Heading size="md">Pictures</Heading>
                    <Button onClick={handleDelete} isDisabled={!selectedImage} colorScheme="red">Delete</Button>
                    <SimpleGrid spacing={4} columns={2} p="10px">
                        {allPhotos.map((photo) => (
                            <Image
                                key={photo.id}
                                h="200px"
                                w="150px"
                                src={photo.photo_url}
                                objectFit="cover"
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, photo)}
                                border={allPhotos.findIndex(item => item['id'] === photo.id) === selectedID ? '5px solid #63b3ed' : 'none'}
                                onClick={() => handleImageClick(photo.id)}
                                transition="transform 0.2s"
                                _hover={{ transform: 'scale(1.05)' }}
                            />
                        ))}
                    </SimpleGrid>
                </VStack>
            </Flex>
        </Flex>
    );
};

export default SidebarCreate;
