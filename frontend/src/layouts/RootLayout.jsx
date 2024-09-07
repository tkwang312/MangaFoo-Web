import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import { Container, Grid, GridItem, VStack } from "@chakra-ui/react"
import React from "react"

export default function RootLayout() {
  return (
    <React.Fragment>
      <Navbar />
      <Outlet />
    </React.Fragment>
    // <VStack align="stretch">
    //   <Navbar />
    //   <Grid templateColumns="repeat(6, 1fr)" bg="gray.50">
    //     <GridItem as="aside" colSpan="1" bg="purple.400" minHeight="100vh" p="30px">
    //         <Sidebar />
    //     </GridItem>
    //     <GridItem as="main" colSpan="5" p="40px">
    //         <Outlet />
    //     </GridItem>
    //   </Grid>
    // </VStack>
    // <>
    //   <Sidebar />
    //   <Navbar />
    //   <Outlet />
    // </>

  )
}