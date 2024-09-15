import { Flex, Box, Heading, Text, Button, Spacer, HStack, Image } from "@chakra-ui/react"
import { useContext } from "react";
import UserContext from "../authentication/UserContext";

const Navbar = () => {
  const { username, pfp } = useContext(UserContext);
  console.log('UserProfilePicture:', pfp);
  return (
    <Flex as="nav" p="5px" bg="blue.100">
        <Heading as="h1">APP</Heading>
        <Spacer />
        <HStack spacing="20px">
            <Text>{username}</Text>
            <Box boxSize='30px'>
              <Image src={pfp}/>
            </Box>
            <Button colorScheme="purple">Create</Button>
        </HStack>

    </Flex>
  )
}

export default Navbar