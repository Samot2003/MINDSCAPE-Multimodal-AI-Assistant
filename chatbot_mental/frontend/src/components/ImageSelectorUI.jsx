import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, Heading, Text, Button, Image, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Importa automáticamente todas las imágenes predeterminadas
const importAll = (r) => r.keys().map(r);
const defaultImages = importAll(
  require.context("../assets/images", false, /\.(png|jpe?g|svg)$/)
);

const ImageSelectorUI = ({ selectedImage, previewURL, loading, onSelectImage, onSubmit }) => {
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
      <Heading color="teal.700" size="lg">Sube una imagen 🌿</Heading>
      <Text color="gray.600" fontSize="md" textAlign="center" maxW="400px">
        Elige una imagen que represente tu estado emocional.  
        El chatbot reflexionará contigo a partir de ella.
      </Text>

      {/* Imágenes predeterminadas */}
      <HStack spacing={4} flexWrap="wrap" justify="center" w="100%">
        {defaultImages.map((img, i) => (
          <MotionBox
            key={i}
            borderRadius="xl"
            overflow="hidden"
            boxShadow={selectedImage === img ? "0 0 0 3px teal" : "md"}
            whileHover={{ scale: 1.05 }}
            cursor="pointer"
            onClick={() => onSelectImage(img)}
          >
            <Image src={img} alt={`Imagen ${i + 1}`} boxSize="100px" objectFit="cover" />
          </MotionBox>
        ))}
      </HStack>

      {/* Área de subida / botón continuar */}
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
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onSelectImage}
            />
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
              📁 Subir tu propia imagen
            </Button>
          </>
        )}

        {selectedImage && !loading && previewURL && (
          <VStack spacing={4}>
            <Image
              src={previewURL}
              alt="Vista previa"
              borderRadius="xl"
              maxH="250px"
              objectFit="cover"
              boxShadow="md"
            />
            <Text fontSize="sm" color="gray.500">Imagen lista para analizar 🌱</Text>
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
            <Spinner thickness="5px" speed="0.8s" emptyColor="gray.200" color="teal.500" size="xl" />
            <Text fontSize="md" color="gray.600">Procesando tu imagen... ✨</Text>
          </VStack>
        )}
      </MotionBox>
    </VStack>
  );
};

export default ImageSelectorUI;
