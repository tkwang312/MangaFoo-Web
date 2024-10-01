import React, { useState, useContext, useEffect } from 'react'
import { Image, Flex, IconButton, Button, Divider, Text, Grid, GridItem, Box, VStack, Heading, SimpleGrid } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import UserContext from '../authentication/UserContext'

const EditMenu = () => {
    const [navSize, changeNavSize] = useState("large")
    const [allPhotos, setAllPhotos] = useState([])
    const [selectedID, setSelectedID] = useState(0)
    const { uid, updateToggle, selectedImage, setSelectedImage, setUpdateToggle } = useContext(UserContext)
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
    const navigate = useNavigate();
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
            {/* Sidebar layout */}
            <Grid gap={1}>
                <GridItem as="main" colSpan="2" p="40px">
                    <VStack align="stretch">
                        <Heading p="10px">Pictures</Heading>
                        <Button onClick={handleDelete}>Delete</Button>
                        <SimpleGrid spacing={2} columns={2} p="10px">
                            {allPhotos.map((photo) => (
                                <Image
                                    key={photo.id}
                                    h="200px"
                                    w="150px"
                                    src={photo.photo_url}
                                    objectFit="cover"
                                    draggable="true"  // Make the image draggable
                                    onDragStart={(e) => handleDragStart(e, photo)}  // Handle drag start
                                    border={
                                        allPhotos.findIndex(item => item['id'] === photo.id) === selectedID 
                                        ? '5px solid #63b3ed' 
                                        : 'none'
                                    }
                                    onClick={() => handleImageClick(photo.id)}
                                />
                            ))}
                        </SimpleGrid>
                    </VStack>
                </GridItem>
            </Grid>
        </Flex>
    );
    
}

export default EditMenu