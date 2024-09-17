// import { AuthProvider } from "./authentication/AuthContext";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";

// layouts and pages
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard'
import Create from './pages/Create'
import Profile from './pages/Profile'
import Login from './authentication/Login'
import Register from './authentication/Register'
import Edit from "./pages/Edit.jsx";
import React, { useState } from 'react'
import UserContext from './authentication/UserContext.jsx'
import { ViewIcon } from '@chakra-ui/icons'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/signin" />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/signin" element={<Login />} />
      </Route>

      <Route element={<RootLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit" element={<Edit />} />
      </Route>

    </>
  )
)

function App() {
  const [username, setContextUsername] = useState('');
  const [password, setContextPassword] = useState('');
  const [pfp, setContextPFP] = useState(null);
  const [uid, setUID] = useState('')

  const contextValue = {
    username, setContextUsername,
    password, setContextPassword,
    pfp, setContextPFP,
    uid, setUID
  };

  return (
    <UserContext.Provider value={contextValue}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  )
}

export default App
