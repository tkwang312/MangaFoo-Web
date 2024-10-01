import { useState, useRef, useEffect } from 'react';
import { Box, ChakraProvider, Flex, SimpleGrid } from "@chakra-ui/react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import SidebarCreate from "../components/SidebarCreate";
import plus_sign from './assets/plus_sign.png';
import EditMenu from '../components/EditMenu';

const WIDTH = 500;
const HEIGHT = 700;

const Edit = () => {
  const [images, setImages] = useState<Array<Array<any>>>([[], [], [], []]); 
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null); 
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null); 
  const transformerRef = useRef<any>(null); 
  const imageRefs = useRef([]); 
  const handleSelect = (cellIndex, imageIndex) => {
    setSelectedCellIndex(cellIndex);
    setSelectedImageIndex(imageIndex);
  };

  const updateImagePosition = (e, cellIndex, imageIndex) => {
    const newImages = [...images];
    newImages[cellIndex][imageIndex] = {
      ...newImages[cellIndex][imageIndex],
      x: e.target.x(),
      y: e.target.y(),
    };
    setImages(newImages);
  };

  const addTransformer = (node) => {
    if (node && transformerRef.current) {
      transformerRef.current.nodes([node]); 
      transformerRef.current.getLayer().batchDraw();
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
        newImages[cellIndex] = [...newImages[cellIndex], { image: newImage, x: 50, y: 50 }]; // Add the new image to the cell
        setImages(newImages);
      };
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); 
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

  return (
    <Flex h="100%">
      <Box>
        <SidebarCreate />
      </Box>
      <Box as="main" flex="1" p="10px">
        <ChakraProvider>
          <Box w="850px" h="1200px" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <SimpleGrid spacing={2} columns={2} p="2px">
              {images.map((cellImages, cellIndex) => (
                <Box
                  key={cellIndex}
                  w={`${WIDTH}px`}
                  h={`${HEIGHT}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="#E2E8F0"
                  position="relative"
                  onDrop={(e) => handleDrop(e, cellIndex)} 
                  onDragOver={handleDragOver} 
                  border={selectedCellIndex === cellIndex ? '5px solid #63b3ed' : 'none'}
                >
                  {cellImages.length === 0 ? (
                    <img src={plus_sign} alt="plus-sign" style={{ width: '15%' }} />
                  ) : (
                    <Stage width={WIDTH} height={HEIGHT}>
                      <Layer>
                        {cellImages.map((imgObj, imageIndex) => (
                          <KonvaImage
                            key={imageIndex}
                            image={imgObj.image}
                            x={imgObj.x}
                            y={imgObj.y}
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
