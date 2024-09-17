import { Flex, Box, Heading, Text, Button, Spacer, HStack, Image } from "@chakra-ui/react"
import { useContext, useEffect } from "react";
import UserContext from "../authentication/UserContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { username, pfp } = useContext(UserContext);
  const navigate = useNavigate();
  console.log('UserProfilePicture:', pfp);
  const handleClickHome = (e) => {
    e.preventDefault();
    navigate('/dashboard')
  }

  const handleClickProfile = (e) => {
    e.preventDefault();
    navigate('/profile')
  }

  // useEffect(() => {
  //   fetch("https://127.0.0.1:8000/userdata")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data)
  //       setusername
  //     })
  // }, [])

  return (
    <Flex as="nav" p="5px" bg="blue.100">
        <Heading as="h1">APP</Heading>
        <Spacer />
        <HStack spacing="20px">
            <Text>{username}</Text>
            <Box boxSize='30px' onClick={handleClickProfile}>
              <Image src={pfp}/>
            </Box>
            <Button colorScheme="purple" onClick={handleClickHome}>Create</Button>
        </HStack>

    </Flex>
  )
}

export default Navbar