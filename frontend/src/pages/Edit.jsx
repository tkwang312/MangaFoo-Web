import React, { useContext } from 'react'
import SidebarCreate from "../components/SidebarCreate"
import UserContext from '../authentication/UserContext'
import { Button, Box, ChakraProvider } from "@chakra-ui/react"

const Edit = () => {
    const { selectedImage, setUpdateToggle, updateToggle } = useContext(UserContext)
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
  return (
    <>
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex='1' p="10px">
        <ChakraProvider>
            <Button onClick={handleDelete}>DELETE</Button>
        </ChakraProvider>
      </Box>
    </>
  )
}

export default Edit
