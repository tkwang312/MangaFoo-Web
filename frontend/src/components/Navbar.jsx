import { Flex, Box, Heading, Text, Button, Spacer, HStack } from "@chakra-ui/react"

const Navbar = () => {
  return (
    <Flex as="nav" p="5px" bg="blue.100">
        <Heading as="h1">APP</Heading>
        <Spacer />
        <HStack spacing="20px">
            <Text>potato-lover-102</Text>
            <Box bg="gray.200" p="10px">A</Box>
            <Button colorScheme="purple">Create</Button>
        </HStack>

    </Flex>
  )
}

export default Navbar