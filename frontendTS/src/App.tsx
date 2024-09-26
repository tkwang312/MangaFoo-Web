// import { AuthProvider } from "./authentication/AuthContext";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";

// layouts and pages
import RootLayout from './layouts/RootLayout.js'
import AuthLayout from './layouts/AuthLayout.js';
import Dashboard from './pages/Dashboard.js'
import Create from './pages/Create.js'
import Profile from './pages/Profile.js'
import Login from './authentication/Login.js'
import Register from './authentication/Register.js'
import Edit from "./pages/Edit.js";
import React, { useState } from 'react'
import UserContext from './authentication/UserContext.js'


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
  const [selectedImage, setSelectedImage] = useState({});
  const [updateToggle, setUpdateToggle] = useState(false);

  const contextValue = {
    username, setContextUsername,
    password, setContextPassword,
    pfp, setContextPFP,
    uid, setUID,
    selectedImage, setSelectedImage,
    updateToggle, setUpdateToggle
  };

  return (
    <UserContext.Provider value={contextValue}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  )
}

export default App
