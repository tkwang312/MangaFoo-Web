import {
  ChakraProvider,
  Heading,
  Grid,
  GridItem,
  Text,
  Input,
  Button,
  Wrap,
  Stack, 
  Image,
  Link,
  SkeletonCircle,
  SkeletonText,
  TabList,
  Tab,
  Tabs,
  TabPanels,
  TabPanel,
  Flex,
  Box,
  RadioGroup,
  Radio

} from "@chakra-ui/react";
import axios from "axios";
import { useState, useContext } from "react";
import SidebarCreate from "../components/SidebarCreate"
import ImageCard from '../components/ImageCard'
import UserContext from "../authentication/UserContext";
// import api from '../../../sd-api/api'


const Create = () => {
  const [image, updateImage] = useState();
  const [p, updatePrompt] = useState();
  const [np, updateNp] = useState();
  const [gs, updateGs] = useState();
  const [is, updateIs] = useState();
  const [m, updateModelID] = useState("0")

  const [loading, updateLoading] = useState();
  const [loading_imgs, updateLoading_imgs] = useState();
  const [images, updateImages] = useState();

  const { uid, updateToggle, setUpdateToggle } = useContext(UserContext)

  const generate = async (uid, m, p, np, gs, is) => {
    updateLoading(true);
    const pdict = {
      user_id: uid,
      modelID: m,
      prompt: p,
      negative_prompt: np,
      guidance_scale: gs,
      inference_steps: is
    };
    try {
      await fetch('http://127.0.0.1:8000/txt2img/', {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(pdict),
     }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); 
     }).then(data => {
      updateImage(data)
      setUpdateToggle(!updateToggle)
     })
    } catch (error) {
      console.error("There was an error generating the image:", error);
    } finally {
      updateLoading(false);
    }
  };

  const get_all_images = async() => {
    updateLoading_imgs(true);
    const result = await axios.get('https://127.0.0.1:8000/images/')
    updateImages(result.data);
  }
  return (
    <Flex h="100%">
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex='1' p="10px">
        <ChakraProvider>
          <Tabs>
            <TabList>
              <Tab _selected={{ color: 'white', bg: 'blue.200'}}>Characters</Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.200'}}>Backgrounds</Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.200'}}>Story</Tab>
            </TabList> 
            <TabPanels>
              <TabPanel>
                <Heading>Create Character</Heading>
                <Text marginBottom={"10px"}>
                  please work generation PLEASE PLEASE ASFLKNAKSLFNAKLSN
                </Text>
                <Wrap marginBottom={"10px"}>
                  <Stack direction="column">
                    <RadioGroup onChange={updateModelID} value={m}>
                      <Stack direction='row'>
                        <Radio value="0">neauveau</Radio>
                        <Radio value="1">anythingxl</Radio>
                      </Stack>
                    </RadioGroup>
                    <Input
                      value={p}
                      onChange={(e) => updatePrompt(e.target.value)}
                      width={"350px"}
                      placeholder="Prompt"
                    ></Input>
                    <Input
                      value={np}
                      onChange={(e) => updateNp(e.target.value)}
                      width={"350px"}
                      placeholder="Negtative Prompt"
                    ></Input>
                    <Input
                      value={gs}
                      onChange={(e) => updateGs(e.target.value)}
                      width={"350px"}
                      placeholder="Guidance Scale"
                    ></Input>
                    <Input
                      value={is}
                      onChange={(e) => updateIs(e.target.value)}
                      width={"350px"}
                      placeholder="Inference Steps"
                    ></Input>
                    <Button onClick={(e) => generate(uid, m, p, np, gs, is)} colorScheme={"yellow"}>
                      Generate
                    </Button>
                  </Stack>
                </Wrap>

                {loading ? (
                  <Stack>
                    <SkeletonCircle />
                    <SkeletonText />
                  </Stack>
                ) : image ? (
                  <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
                ) : null}
              </TabPanel>

              <TabPanel>
                <Heading>Create Background</Heading>
                <Text marginBottom={"10px"}>
                  This react application leverages the model trained by Stability AI and
                  Runway ML to generate images using the Stable Diffusion Deep Learning
                  model. The model can be found via github here{" "}
                  <Link href={"https://github.com/CompVis/stable-diffusion"}>
                    Github Repo
                  </Link>
                </Text>

                <Wrap marginBottom={"10px"}>
                  <Input
                    value={prompt}
                    onChange={(e) => updatePrompt(e.target.value)}
                    width={"350px"}
                  ></Input>
                  <Button onClick={(e) => generate(prompt)} colorScheme={"yellow"}>
                    Generate
                  </Button>
                  <Button onClick={(e) => get_all_images()} colorScheme={"purple"}>
                    LMAO
                  </Button>
                </Wrap>

                {loading ? (
                  <Stack>
                    <SkeletonCircle />
                    <SkeletonText />
                  </Stack>
                ) : image ? (
                  // img_src = `data:image/png;base64,${image}`
                  <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
                  // <ImageCard image_src = {`data:image/png;base64,${image}`}/>
                ) : null}

                {loading_imgs ? (
                  <Stack>
                    <SkeletonCircle /> 
                    <SkeletonText /> 
                  </Stack>
                ) : images ? (
                  images
                ) : null}
              </TabPanel>


              <TabPanel>
                <Heading>Create Story</Heading>
                <Text marginBottom={"10px"}>
                  This react application leverages the model trained by Stability AI and
                  Runway ML to generate images using the Stable Diffusion Deep Learning
                  model. The model can be found via github here{" "}
                  <Link href={"https://github.com/CompVis/stable-diffusion"}>
                    Github Repo
                  </Link>
                </Text>

                <Wrap marginBottom={"10px"}>
                  <Input
                    value={prompt}
                    onChange={(e) => updatePrompt(e.target.value)}
                    width={"350px"}
                  ></Input>
                  <Button onClick={(e) => generate(prompt)} colorScheme={"yellow"}>
                    Generate
                  </Button>
                </Wrap>

                {loading ? (
                  <Stack>
                    <SkeletonCircle />
                    <SkeletonText />
                  </Stack>
                ) : image ? (
                  <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
                ) : null}
              </TabPanel>

            </TabPanels>
          </Tabs>
        </ChakraProvider>
      </Box>
    </Flex>

  )
}

export default Create
