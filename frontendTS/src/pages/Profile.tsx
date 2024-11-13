import React, { useContext, useState } from 'react';
import { Button, Input, Box, Heading, Stack, Flex } from "@chakra-ui/react";
import UserContext from '../authentication/UserContext';
import SidebarCreate from '../components/SidebarCreate';

const Profile = () => {
  const { username, setContextUsername, password, setContextPassword, pfp, setContextPFP, uid, setUID } = useContext(UserContext);
  const [un, setUsername] = useState('')
  const [pass, setPassword] = useState('')
  const [p, setPFP] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userDict = {
      userID: uid,
      username: un ? un : username,
      password: pass ? pass : password,
    }

    await fetch('http://127.0.0.1:8000/changeusernamepassword/', {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userDict)
    })

    setContextUsername(un ? un : username)
    setContextPassword(pass ? pass : password)
    console.log(username)
    console.log(password)

    if (p) {
      const formData = new FormData();
      formData.append('user_id', uid);
      formData.append('file', p, p.name);
      console.log(formData)

      fetch('http://127.0.0.1:8000/pfpupload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          setContextPFP(data.pfpurl);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }

  return (
    <Flex>
      <SidebarCreate />
      <Box maxW="400px" mx="auto" mt="10" p="4" borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading mb="4" textAlign="center">Profile</Heading>
        <Stack spacing="4">
          <Input type="username" placeholder="Enter new username" value={un} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Enter new password" value={pass} onChange={(e) => setPassword(e.target.value)} />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPFP(e.target.files[0])}
            display="none"
            id="fileInput"
          />
          <Button
            colorScheme="blue"
            onClick={() => document.getElementById('fileInput').click()}
          >
            Upload Profile Picture
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>Submit</Button>
          {pfp && <img src={pfp} alt="Profile Picture" boxSize="150px" objectFit="cover" borderRadius="full" mx="auto" />}
        </Stack>
      </Box>
    </Flex>
  );
};

export default Profile;