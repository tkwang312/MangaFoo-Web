import { useState, useRef, useEffect, useContext } from 'react';
import { Box, Button, ChakraProvider, Flex, HStack, SimpleGrid, VStack } from "@chakra-ui/react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import SidebarCreate from "../components/SidebarCreate";
import plus_sign from './assets/plus_sign.png';
import EditMenu from '../components/EditMenu';
import { EditableText } from "./utils/EditableText";
import UserContext from '../authentication/UserContext';

const WIDTH = 225;
const HEIGHT = 350;

const Edit = () => {
  const [images, setImages] = useState<Array<Array<any>>>([[], [], [], []]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const transformerRef = useRef<any>(null);
  const imageRefs = useRef([]);
  const [history, setHistory] = useState<Array<Array<Array<any>>>>([[[...images]]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);
  const [texts, setTexts] = useState<Array<Array<any>>>([[], [], [], []]);
  const { uid } = useContext(UserContext)

  const handleSelectImage = (cellIndex, imageIndex) => {
    setSelectedCellIndex(cellIndex);
    setSelectedImageIndex(imageIndex);
  };

  const deepCloneImages = (images) => {
    return images.map(cellImages =>
      cellImages.map(imageObj => ({
        ...imageObj,
        image: imageObj.image,
      }))
    );
  };

  const updateImage = (updatedImage, cellIndex, imageIndex) => {
    const newImages = deepCloneImages(images);
    newImages[cellIndex][imageIndex] = updatedImage;

    setImages(newImages);

    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, deepCloneImages(newImages)]);
    setHistoryStep(newHistory.length);
  };

  const updateImagePosition = (e, cellIndex, imageIndex) => {
    const img = images[cellIndex][imageIndex];
    const updatedImage = {
      ...img,
      x: e.target.x(),
      y: e.target.y(),
    };

    updateImage(updatedImage, cellIndex, imageIndex);
  };

  const handleResize = (node, cellIndex, imageIndex) => {
    const updatedImage = {
      ...images[cellIndex][imageIndex],
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    updateImage(updatedImage, cellIndex, imageIndex);
  };

  // const handleSelectText = (cellIndex, textIndex) => {
  //   setSelectedCellIndex(cellIndex);
  //   setSelectedImageIndex(textIndex);
  // }

  const deepCloneText = (texts) => {
    return images.map(cellText =>
      cellText.map(textObj => ({
        ...textObj,
        image: textObj.image,
      }))
    );
  };

  const handleAddText = (cellIndex) => {
    const newTexts = [...texts];
    if (!Array.isArray(newTexts[cellIndex])) {
      newTexts[cellIndex] = [];
    }

    newTexts[cellIndex] = [
      ...newTexts[cellIndex],
      { x: 100, y: 100, text: "New Text", width: 200, isEditing: false, isTransforming: false }
    ];
    setTexts(newTexts);
  };

  const toggleEdit = (cellIndex, textIndex) => {
    const newTexts = [...texts];
    newTexts[cellIndex][textIndex].isEditing = !newTexts[cellIndex][textIndex].isEditing;
    setTexts(newTexts);
  };

  const toggleTransform = (cellIndex, textIndex) => {
    const newTexts = [...texts];
    if (!newTexts[cellIndex] || !newTexts[cellIndex][textIndex]) return;
    newTexts[cellIndex][textIndex].isTransforming = !newTexts[cellIndex][textIndex].isTransforming;
    setTexts(newTexts);
  };

  const handleTextChange = (cellIndex, textIndex, newText) => {
    const newTexts = [...texts];
    if (!newTexts[cellIndex] || !newTexts[cellIndex][textIndex]) return;
    newTexts[cellIndex][textIndex].text = newText;
    setTexts(newTexts);
  };

  const handleResizeText = (cellIndex, textIndex, newWidth) => {
    const newTexts = [...texts];
    newTexts[cellIndex][textIndex] = { ...newTexts[cellIndex][textIndex], width: newWidth };
    setTexts(newTexts);
  };

  const handleTextDragEnd = (cellIndex, textIndex, x, y) => {
    const newTexts = [...texts];
    newTexts[cellIndex][textIndex].x = x;
    newTexts[cellIndex][textIndex].y = y;
    setTexts(newTexts);
  };

  const addTransformer = (node) => {
    if (node && transformerRef.current) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer().batchDraw();

      transformerRef.current.on('transformend', () => {
        if (selectedCellIndex !== null && selectedImageIndex !== null) {
          // console.log("Transform End: scaleX, scaleY update");
          handleResize(node, selectedCellIndex, selectedImageIndex);
        }
      });
    }
  };

  const handleDrop = (event, cellIndex) => {
    event.preventDefault();
    const photoUrl = event.dataTransfer.getData('photoUrl');
    if (photoUrl) {
      const newImage = new window.Image();
      newImage.src = photoUrl;
      newImage.onload = () => {
        const newImages = [...images];
        newImages[cellIndex] = [...newImages[cellIndex], { src: photoUrl, image: newImage, x: 50, y: 50 }];
        setImages(newImages);

        const newHistory = history.slice(0, historyStep + 1);
        setHistory([...newHistory, newImages]);
        setHistoryStep(newHistory.length);
      };
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUndo = () => {
    if (historyStep === 0) {
      return;
    }
    const previousImages = history[historyStep - 1];
    setImages(previousImages);
    setHistoryStep(historyStep - 1);
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    const nextImages = history[historyStep + 1];
    setImages(nextImages);
    setHistoryStep(historyStep + 1);
  };

  const stageRef = useRef(null);
  interface ImageData {
    source: string;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  }

  interface TextData {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fill: string;
  }

  const handleSave = async () => {
    if (stageRef.current) {
      const individualCanvases: { images: ImageData[]; texts: TextData[] }[] = [];
      for (let cellIndex = 0; cellIndex < images.length; cellIndex++) {
        const cellCanvas: { images: ImageData[]; texts: TextData[] } = {
          images: images[cellIndex],
          texts: texts[cellIndex],
        };
        individualCanvases.push(cellCanvas);
      }
      console.log("texts1", texts)
      const stageModelJson = { user_id: uid, canvas_state: individualCanvases };
      console.log("stageModelJson", stageModelJson)
      console.log(images)

      try {
        await fetch('http://127.0.0.1:8000/save_canvas_state/', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stageModelJson),
        }).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        });
      } catch (error) {
        console.error("There was an error saving the stage:", error);
      }
    }
  };

  const loadCanvasState = async () => {
    console.log("texts1", texts)
    if (uid) {
      fetch(`http://127.0.0.1:8000/load_canvas_state/${uid}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            data = data[0]
            const newTexts = []
            for (let index = 0; index < data.length; index++) {
              const newImages = [];
              const imagesArray = data
              const imgs = imagesArray[index]['images']
              for (let imgIndex = 0; imgIndex < imgs.length; imgIndex++) {
                const imageObj = imgs[imgIndex]
                const img = new window.Image();
                img.src = imageObj.src
                newImages.push({
                  image: img,
                  src: imageObj.src,
                  x: imageObj.x || 0,
                  y: imageObj.y || 0,
                  scaleX: imageObj.scaleX || 0.5,
                  scaleY: imageObj.scaleY || 0.5,
                  draggable: imageObj.draggable || true,
                });
                setImages([newImages]);

                newImages.forEach((imageObj, idx) => {
                  imageObj.image.onload = () => {
                    const updatedImages = [...images];
                    updatedImages[index][idx] = imageObj;
                    setImages(updatedImages);
                  };
                });
              }
              const txt = imagesArray[index]['texts'];
              const currentTexts = [];
              for (let txtIndex = 0; txtIndex < txt.length; txtIndex++) {
                const textObj = txt[txtIndex];
                currentTexts.push({
                  text: textObj.text || '',
                  x: textObj.x || 0,
                  y: textObj.y || 0,
                  fontSize: textObj.fontSize || 16,
                  fontFamily: textObj.fontFamily || 'Arial',
                  fill: textObj.fill || 'black',
                  draggable: textObj.draggable || true,
                });
              }
              newTexts.push(currentTexts);

            }
            setTexts(newTexts);
          } else {
            console.error("Expected an array but got:", data);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }

  useEffect(() => {
    if (
      selectedCellIndex !== null &&
      selectedImageIndex !== null &&
      imageRefs.current[selectedCellIndex] &&
      imageRefs.current[selectedCellIndex][selectedImageIndex]
    ) {
      addTransformer(imageRefs.current[selectedCellIndex][selectedImageIndex]);

    }
  }, [selectedCellIndex, selectedImageIndex]);

  useEffect(() => {
    loadCanvasState();
  }, [uid]);

  useEffect(() => {
    const editableElement = document.getElementById('editable-text-id');
    if (editableElement) {
      editableElement.focus();
    }
  }, [texts]);

  return (
    <Flex h="100vh" direction="row">
      <Box w="25%" minW="300px">
        <SidebarCreate />
      </Box>

      <Box as="main" flex="1" display="flex" flexDirection="column">
        <ChakraProvider>
          <HStack spacing={4} mb={4} justifyContent="flex-start" bg="gray.100">
            <Button onClick={handleUndo} isDisabled={historyStep === 0}>
              Undo
            </Button>
            <Button onClick={handleRedo} isDisabled={historyStep === history.length - 1}>
              Redo
            </Button>
            <Button onClick={() => handleAddText(selectedCellIndex)}>
              Add Text Box
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </HStack>

          <Box w="500px" h="750px" borderWidth="1px" borderRadius="lg" overflow="visible" bg="white" alignSelf="center">
            <SimpleGrid spacing={4} columns={2} p="10px">
              {images.map((cellImages, cellIndex) => (
                <Box
                  key={cellIndex}
                  w={`${WIDTH}px`}
                  h={`${HEIGHT}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  position="relative"
                  overflow="visible"
                  onDrop={(e) => handleDrop(e, cellIndex)}
                  onDragOver={handleDragOver}
                  onClick={() => setSelectedCellIndex(cellIndex)}
                  border={selectedCellIndex === cellIndex ? '5px solid #63b3ed' : '3px solid black'}
                >
                  {cellImages.length === 0 ? (
                    <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
                  ) : (
                    <Stage ref={stageRef} width={WIDTH} height={HEIGHT}>
                      <Layer>
                        {cellImages.map((imgObj, imageIndex) => (
                          <KonvaImage
                            key={imageIndex}
                            image={imgObj.image}
                            x={imgObj.x}
                            y={imgObj.y}
                            scaleX={imgObj.scaleX || 0.5}
                            scaleY={imgObj.scaleY || 0.5}
                            draggable
                            onDragEnd={(e) => updateImagePosition(e, cellIndex, imageIndex)}
                            ref={(node) => {
                              imageRefs.current[cellIndex] = imageRefs.current[cellIndex] || [];
                              imageRefs.current[cellIndex][imageIndex] = node;
                              if (selectedCellIndex === cellIndex && selectedImageIndex === imageIndex) {
                                addTransformer(node);
                              }
                            }}
                            onClick={() => handleSelectImage(cellIndex, imageIndex)}
                          />
                        ))}
                        {selectedCellIndex === cellIndex && selectedImageIndex !== null && (
                          <Transformer ref={transformerRef} />
                        )}
                      </Layer>
                      <Layer>
                        {texts[cellIndex]?.map((textObj, textIndex) => (
                          <EditableText
                            key={textIndex}
                            x={textObj.x}
                            y={textObj.y}
                            text={textObj.text}
                            isEditing={textObj.isEditing}
                            isTransforming={textObj.isTransforming}
                            onToggleEdit={() => toggleEdit(cellIndex, textIndex)}
                            onToggleTransform={() => toggleTransform(cellIndex, textIndex)}
                            onChange={(newText) => handleTextChange(cellIndex, textIndex, newText)}
                            onResize={(newWidth, newHeight) => handleResizeText(cellIndex, textIndex, newWidth, newHeight)}
                            onDragEnd={(x, y) => handleTextDragEnd(cellIndex, textIndex, x, y)}
                          />
                        ))}
                      </Layer>
                    </Stage>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </ChakraProvider>
      </Box>

      {/* Edit Menu */}
      <Box w="20%" minW="300px">
        <EditMenu />
      </Box>
    </Flex>


  );
};

export default Edit;
