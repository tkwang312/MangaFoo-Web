import React from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'


const ImageCard = ({image_src, ...props}) => {
  return (
    <Card>
        <CardBody>
            <Image src={image_src}/>
        </CardBody>
    </Card>
  )
}

export default ImageCard
