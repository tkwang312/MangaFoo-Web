import React, { useContext, useState } from 'react';
import { Button, Input, Box } from "@chakra-ui/react";
import UserContext from '../authentication/UserContext';

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
      password: pass ? pass: password,
    }

    await fetch('http://127.0.0.1:8000/changeusernamepassword/', {
      method: "POST",
      headers: {"content-type": "application/json"},
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
    <>
      <div>Profile</div>
      <Input type="username" placeholder={username} onChange={(e) => { setUsername(e.target.value) }}/>
      <Input type="password" placeholder={password} onChange={(e) => { setPassword(e.target.value) }}/>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setPFP(e.target.files[0])}
        display="none"
        id="fileInput"
      />
      <Button
        onClick={() => document.getElementById('fileInput').click()} // Trigger the file input click
      >
        Upload Picture
      </Button>

      <Button onClick={handleSubmit}>Submit</Button>
      {pfp && <Box as="img" src={pfp} alt="Profile Picture" boxSize="300px"/>}
    </>
  );
};

export default Profile;