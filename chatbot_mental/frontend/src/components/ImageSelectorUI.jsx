import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const ImageSelectorUI = ({
  selectedImage,
  loading,
  onSelectImage,
  onSubmit,
}) => {
  return (
    <VStack
      spacing={8}
      align="center"
      justify="center"
      minH="80vh"
      bgGradient="linear(to-br, green.50, teal.50)"
      borderRadius="2xl"
      p={8}
    >
      <Heading color="teal.700" size="lg">
        Sube una imagen 🌿
      </Heading>

      <Text color="gray.600" fontSize="md" textAlign="center" maxW="400px">
        Elige una imagen que represente tu estado emocional.  
        El chatbot reflexionará contigo a partir de ella.
      </Text>

      <MotionBox
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="xl"
        w={["90%", "70%", "50%"]}
        textAlign="center"
        whileHover={{ scale: 1.02 }}
        transition="all 0.2s ease-in-out"
      >
        {!selectedImage && !loading && (
          <>
            <Button
              as="label"
              htmlFor="file-upload"
              size="lg"
              colorScheme="teal"
              rounded="full"
              px={8}
              cursor="pointer"
              _hover={{ bg: "teal.500" }}
            >
              📁 Seleccionar imagen
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onSelectImage}
            />
          </>
        )}
        {selectedImage && !loading && (
          <VStack spacing={4}>
            <Image
              src={
                selectedImage instanceof File
                  ? URL.createObjectURL(selectedImage)
                  : selectedImage
              }
              alt="Vista previa"
              borderRadius="xl"
              maxH="250px"
              objectFit="cover"
              boxShadow="md"
            />
            <Text fontSize="sm" color="gray.500">
              Imagen lista para analizar 🌱
            </Text>
            <Button
              colorScheme="teal"
              onClick={onSubmit}
              rounded="full"
              px={8}
              _hover={{ bg: "teal.500" }}
            >
              Enviar imagen
            </Button>
          </VStack>
        )}
        {loading && (
          <VStack spacing={4}>
            <Spinner
              thickness="5px"
              speed="0.8s"
              emptyColor="gray.200"
              color="teal.500"
              size="xl"
            />
            <Text fontSize="md" color="gray.600">
              Procesando tu imagen... ✨
            </Text>
          </VStack>
        )}
      </MotionBox>
    </VStack>
  );
};

export default ImageSelectorUI;
