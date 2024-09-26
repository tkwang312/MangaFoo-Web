import { Box, Grid, GridItem, SimpleGrid, Heading, VStack } from '@chakra-ui/react'
import SidebarHome from "../components/SidebarHome"

const Dashboard = () => {
  return (
    <Grid templateColumns="repeat(7, 1fr)" bg="gray.50">
      <GridItem as="aside" colSpan="1" bg="purple.400" minHeight="100vh" p="30px">
        <SidebarHome />
      </GridItem>
      <GridItem as="main" colSpan="6" p="40px">
        <VStack align="stretch">
          <Heading p="10px">Projects</Heading>
          <SimpleGrid spacing={10} minChildWidth={250} p="10px">
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>

            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
            <Box bg="gray.200" h="200px" border="1px solid"> </Box>
          </SimpleGrid>
        </VStack>
      </GridItem>
    </Grid>
  )
}

export default Dashboard