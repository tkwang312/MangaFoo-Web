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

  )
}