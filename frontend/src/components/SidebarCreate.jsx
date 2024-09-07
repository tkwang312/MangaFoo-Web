import React, { useState } from 'react'
import { Flex, IconButton, Button, Divider, Text, Grid, GridItem, Box, VStack, Heading, SimpleGrid } from "@chakra-ui/react"
import { NavLink } from "react-router-dom"
import {
    FiMenu,
    FiHome,
    FiCalendar,
    FiUser,
    FiDollarSign,
    FiChevronLeft,
    FiSettings
} from 'react-icons/fi'


const SidebarCreate = () => {
    const [navSize, changeNavSize] = useState("large")
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
                        onClick={() => {
                            if (navSize == "small")
                                changeNavSize("large")
                            // else
                            //     changeNavSize("small")
                        }}
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
                            <SimpleGrid spacing={2} columns={2} p="10px">
                                <Box bg="gray.200" h="200px" w='150px' border="1px solid"> </Box>
                                <Box bg="gray.200" h="200px" w='150px' border="1px solid"> </Box>
                                <Box bg="gray.200" h="200px" w='150px' border="1px solid"> </Box>
                                <Box bg="gray.200" h="200px" w='150px' border="1px solid"> </Box>

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