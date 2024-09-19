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
    FiSettings
} from 'react-icons/fi'
import UserContext from '../authentication/UserContext'

const SidebarCreate = () => {
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
            console.log('lol')   
        })
    }
    const navigate = useNavigate();
    console.log(updateToggle)
    useEffect(() => { 
        console.log(updateToggle)
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



    return (
        <Flex>
            <Flex
                h="1080px"
                // pos="sticky"
                // boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
                // borderRadius={navSize == "small" ? "15px" : "30px"}
                w="60px"
                flexDir="column"
                bg="purple.200"
            >
                <Flex
                    p="5%"
                    flexDir="column"
                    w="100%"
                    alignItems="center"
                    as="nav"
                >
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.200' }}
                        icon={<FiMenu />}
                        onClick={() => {
                            if (navSize == "small")
                                changeNavSize("large")
                            // else
                            //     changeNavSize("small")
                        }}
                    />
                </Flex>
                <Flex
                    p="5%"
                    flexDir="column"
                    w="100%"
                    alignItems="center"
                    as="nav"
                >
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.200' }}
                        icon={<FiUser />}
                        onClick={() => {
                            if (navSize == "small")
                                changeNavSize("large")
                            // else
                            //     changeNavSize("small")
                        }}
                    />
                    <Text size="2px">haha</Text>
                </Flex>

                <Flex
                    p="5%"
                    flexDir="column"
                    w="100%"
                    alignItems="center"
                    as="nav"
                >
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.200' }}
                        icon={<FiCalendar />}
                        onClick={() => {
                            if (navSize == "small")
                                changeNavSize("large")
                            // else
                            //     changeNavSize("small")
                        }}
                    />
                </Flex>

                <Flex
                    p="5%"
                    flexDir="column"
                    w="100%"
                    alignItems="center"
                    as="nav"
                >
                    <IconButton
                        background="none"
                        mt={5}
                        _hover={{ background: 'purple.200' }}
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
                <Grid  gap={1}>
                    <GridItem as="main" colSpan="2" p="40px">
                        <VStack align="stretch">
                            <Heading p="10px">Pictures</Heading>
                            <Button onClick={handleDelete}>Delete</Button>
                            <SimpleGrid spacing={2} columns={2} p="10px">
                                {
                                    allPhotos.map((photo) => {
                                        return (
                                            <Image
                                                key={photo.id}
                                                h="200px"
                                                w="150px"
                                                src={photo.photo_url}
                                                objectFit="cover"
                                                border={allPhotos.findIndex(item => item['id'] === photo.id) === selectedID ? '5px solid #63b3ed' : 'none'}
                                                onClick={() => handleImageClick(photo.id)}                                            />
                                        )
                                    })
                                }
                            </SimpleGrid>
                        </VStack>
                    </GridItem>
                </Grid>
            </Flex>
            <IconButton
                top="400px"
                bg="purple.100"
                align="left"
                width={navSize == "small" ? "0px" : "10px"}
                height={navSize == "small" ? "0px" : "50px"}
                icon={navSize == "small" ? "none" : <FiChevronLeft />}
                onClick={() => { changeNavSize("small") }}
            />
        </Flex>
    )
}

export default SidebarCreate