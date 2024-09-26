import { Outlet } from "react-router-dom";
import { Container, VStack } from "@chakra-ui/react";
import React from "react";

export default function AuthLayout() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}