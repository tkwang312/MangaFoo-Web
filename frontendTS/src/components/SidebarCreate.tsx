import React, { useState, useContext, useEffect } from 'react'
import { Image, Flex, IconButton, Button, Divider, Text, Grid, GridItem, Box, VStack, Heading, SimpleGrid } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import {
    FiMenu,
    FiHome,
    FiCalendar,
    FiUser,
    FiDollarSign,
    FiChevronLeft,
    FiSettings,
    FiChevronRight
} from 'react-icons/fi'
import UserContext from '../authentication/UserContext'

const SidebarCreate = () => {
    const [navSize, changeNavSize] = useState("large")
    const [allPhotos, setAllPhotos] = useState([])
    const [selectedID, setSelectedID] = useState(0)
    const { uid, updateToggle, selectedImage, setSelectedImage, setUpdateToggle } = useContext(UserContext)
    const navigate = useNavigate();
    const handleDelete = (e) => {

        const imageDict = selectedImage
    
        fetch('http://127.0.0.1:8000/remove_image/', {
            method: "DELETE",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(imageDict)
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            response.json()
        }).then((data) => {
            setUpdateToggle(!updateToggle)
        })
    }
    useEffect(() => { 
        if (uid) {  
            fetch(`http://127.0.0.1:8000/images/?uid=${uid}`)  
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched data:", data);  
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
    
        navigate("/edit")

    }

    const handleImageClick = (imageId) => {
        console.log("Image clicked with ID:", imageId);

        const index = allPhotos.findIndex(item => item['id'] === imageId);
        console.log(allPhotos[index])
        setSelectedImage(allPhotos[index])
        setSelectedID(index)
    };


    const handleDragStart = (event, photo) => {
        event.dataTransfer.setData('photoUrl', photo.photo_url);
    };
    
    return (
        <Flex>
            {/* Sidebar navigation */}
            <Flex
                h="1080px"
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
                        icon={<FiMenu />}
                        onClick={() => changeNavSize(navSize === "small" ? "large" : "small")}
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiUser />}
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiCalendar />}
                    />
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.300' }}
                        icon={<FiSettings />}
                        onClick={handleClickEdit}
                    />
                </Flex>
            </Flex>

            <Flex
                w={navSize == "small" ? "0px" : "400px"}
                bg="purple.100"
                flexBasis={'auto'}
                overflow={'hidden'}
            >
                <VStack align="stretch">
                    <Heading p="10px">Pictures</Heading>
                    <Button onClick={handleDelete} isDisabled={!selectedImage}>Delete</Button>
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
                            />
                        ))}
                    </SimpleGrid>
                </VStack>
            </Flex>
        </Flex>
    );
};
    


export default SidebarCreate