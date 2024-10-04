import { useState, useRef, useEffect, useContext } from 'react';
import { Box, Button, ChakraProvider, Flex, HStack, SimpleGrid } from "@chakra-ui/react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import SidebarCreate from "../components/SidebarCreate";
import plus_sign from './assets/plus_sign.png';
import EditMenu from '../components/EditMenu';
import { EditableText } from "./utils/EditableText";
import UserContext from '../authentication/UserContext';

const WIDTH = 500;
const HEIGHT = 700;

const Edit = () => {
  const [images, setImages] = useState<Array<Array<any>>>([[], [], [], []]); 
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null); 
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null); 
  const transformerRef = useRef<any>(null); 
  const imageRefs = useRef([]);
  const [history, setHistory] = useState<Array<Array<Array<any>>>>([[[...images]]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);
  const [texts, setTexts] = useState<Array<any>>([]);
  const { uid } = useContext(UserContext)

  const handleSelect = (cellIndex, imageIndex) => {
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
  
    console.log("History after scaling update:", newHistory);
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
    console.log("Resizing:", updatedImage)
    updateImage(updatedImage, cellIndex, imageIndex);
  };

  const handleAddText = () => {
    const newText = { x: 100, y: 100, text: "New Text", width: 200, isEditing: false, isTransforming: false };
    setTexts([...texts, newText]);
    setSelectedTextIndex(texts.length);
  };

  const toggleEdit = (index: number) => {
    const newTexts = [...texts];
    newTexts[index].isEditing = !newTexts[index].isEditing;
    setTexts(newTexts);
    console.log(newTexts[index].isEditing)
  };

  const toggleTransform = (index: number) => {
    const newTexts = [...texts];
    newTexts[index].isTransforming = !newTexts[index].isTransforming;
    setTexts(newTexts);
  };

  const handleTextChange = (index: number, newText: string) => {
    const newTexts = [...texts];
    newTexts[index].text = newText;
    setTexts(newTexts);
  };

  const handleResizeText = (index, newWidth, newHeight) => {
    const newTexts = [...texts];
    newTexts[index] = { ...newTexts[index], width: newWidth };
    setTexts(newTexts);
  };

    const handleTextDragEnd = (index: number, x: number, y: number) => {
    const newTexts = [...texts];
    newTexts[index].x = x;
    newTexts[index].y = y;
    setTexts(newTexts);
  };

  const addTransformer = (node) => {
    if (node && transformerRef.current) {
      transformerRef.current.nodes([node]); 
      transformerRef.current.getLayer().batchDraw();

      transformerRef.current.on('transformend', () => {
        if (selectedCellIndex !== null && selectedImageIndex !== null) {
          console.log("Transform End: scaleX, scaleY update");
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
        newImages[cellIndex] = [...newImages[cellIndex], { image: newImage, x: 50, y: 50 }];
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

  const handleSave = async () => {
    if (stageRef.current) {
      const stage = stageRef.current.getStage();
  
      // Go through each Image node and ensure the "source" attribute is set
      stage.find('Image').forEach(imageNode => {
        const imageUrl = imageNode.getAttr('source');
        if (!imageUrl) {
          const nativeImage = imageNode.image();
          const src = nativeImage && nativeImage.src;
          if (src) {
            imageNode.setAttr('source', src); // Set source attribute if it's not already set
          }
        }
      });

      stage.find('Text').forEach(textNode => {
        const attrs = textNode.attrs;
        textNode.setAttr('text', attrs.text || ''); // Set text attribute
        textNode.setAttr('x', attrs.x || 0); // Set x position
        textNode.setAttr('y', attrs.y || 0); // Set y position
        textNode.setAttr('fontSize', attrs.fontSize || 16); // Set font size
        textNode.setAttr('fill', attrs.fill || 'black'); // Set fill color
      });
  
      // Now save the JSON, which includes the "source" attribute for each image
      const stageJson = stage.toJSON();
      const stageModelJson = { user_id: uid, canvas_state: JSON.parse(stageJson) };
  
      console.log('Stage JSON:', stageJson);
      console.log(uid);
  
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
    try {
      const response = await fetch(`http://127.0.0.1:8000/load_canvas_state/${uid}`);
      if (!response.ok) {
        throw new Error('Failed to load canvas state');
      }
      const data = await response.json();
      if (data) {
        console.log("data", data);
  
        // Extract image data from JSON and load them
        const loadedImages = data[0].children[0].children
          .filter(item => item.className === 'Image')  // Find image nodes
          .map(imageObj => {
            const img = new window.Image();
            img.src = imageObj.attrs.source;  // Use 'source' attribute for the URL
            return {
              image: img,
              x: imageObj.attrs.x || 0,
              y: imageObj.attrs.y || 0,
              scaleX: imageObj.attrs.scaleX || 1,
              scaleY: imageObj.attrs.scaleY || 1,
              draggable: imageObj.attrs.draggable || false,
            };
          });
        
          console.log("loadedImages", loadedImages)
  
        // Set the loaded images in the correct cell index (assuming single cell for now)
        setImages([loadedImages]);
  
        // Ensure the Konva images are drawn after images have loaded
        loadedImages.forEach((imageObj, idx) => {
          imageObj.image.onload = () => {
            const updatedImages = [...images];
            updatedImages[0][idx] = imageObj; // Update image with actual loaded object
            setImages(updatedImages);
          };
        });

        const loadedText = data[0].children[1].children
        .filter(item => item.className === 'Text')  // Find text nodes
        .map(textObj => {
          console.log("textOBJ", textObj)
          return {
            text: textObj.attrs.text || '',
            x: textObj.attrs.x || 0,
            y: textObj.attrs.y || 0,
            fontSize: textObj.attrs.fontSize || 16,
            fontFamily: textObj.attrs.fontFamily || 'Arial',
            fill: textObj.attrs.fill || 'black',
            draggable: textObj.attrs.draggable || false,
          };
        });

        setTexts(loadedText);
        console.log("loadedText", loadedText)


        // loadedText.forEach((textObj, idx) => {
        //   textObj.text = () => {
        //     const updatedText = [...texts];
        //     updatedText[0][idx] = textObj; 
        //     setTexts(updatedText);
        //   };
        // });
  
      } else {
        console.log("Error loading canvas state:", data.error);
      }
    } catch (error) {
      console.log("Error loading canvas state:", error);
    }
  };
  
  

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
    console.log("images", images)
    console.log("text", texts)
  }, [uid]);

  // useEffect(() => {
  //   if (stageRef.current) {
  //     const layer = stageRef.current.getLayers()[0];
  //     layer.batchDraw(); 
  //   }
  // }, [images]);
  useEffect(() => {
    const editableElement = document.getElementById('editable-text-id'); // Replace with your logic
    if (editableElement) {
      editableElement.focus();
    }
  }, [texts]); 

  return (
    <Flex h="100%">
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex="1" p="10px">
        <ChakraProvider>
          <HStack spacing={4} mt={4}>
                <Button onClick={handleUndo} isDisabled={historyStep === 0}>
                  Undo
                </Button>
                <Button onClick={handleRedo} isDisabled={historyStep === history.length - 1}>
                  Redo
                </Button>
                <Button onClick={handleAddText}>
                  Add Text Box
                </Button>
                <Button onClick={handleSave}>
                  Save
                </Button>
              </HStack>
          <Box w="1100px" h="1400px" borderWidth="1px" borderRadius="lg" overflow="visible">
            <SimpleGrid spacing={2} columns={2} p="2px">
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
                  onDrop={(e) => handleDrop(e, cellIndex)} 
                  onDragOver={handleDragOver} 
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
                              if (
                                selectedCellIndex === cellIndex &&
                                selectedImageIndex === imageIndex
                              ) {
                                addTransformer(node);
                              }
                            }}
                            onClick={() => handleSelect(cellIndex, imageIndex)}
                            />
                          ))}
                        {selectedCellIndex === cellIndex && selectedImageIndex !== null && (
                          <Transformer ref={transformerRef} />
                        )}
                        </Layer>
                        <Layer>
                        {texts.map((textObj, index) => (
                          <EditableText
                            key={index}
                            x={textObj.x}
                            y={textObj.y}
                            text={textObj.text}
                            isEditing={textObj.isEditing}
                            isTransforming={textObj.isTransforming} 
                            onToggleEdit={() => toggleEdit(index)}
                            onToggleTransform={() => toggleTransform(index)}
                            onChange={(newText) => handleTextChange(index, newText)}
                            onResize={(newWidth, newHeight) => handleResizeText(index, newWidth, newHeight)}
                            onDragEnd={(x, y) => handleTextDragEnd(index, x, y)}

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
      <Box>
        <EditMenu />
      </Box>
    </Flex>
  );
};

export default Edit;
