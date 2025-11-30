import React from "react";
import { Box, VStack, HStack, Heading, Text, Button, Image, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const importAll = (r) => r.keys().map(r);
const defaultImages = importAll(
  require.context("../assets/images", false, /\.(png|jpe?g|svg)$/)
);

const ImageSelectorUI = ({ selectedImage, previewURL, loading, onSelectImage, onSubmit }) => {
  const selectedDefaultImage =
    typeof selectedImage === "number" ? defaultImages[selectedImage] : null;

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
      </Text>

      <HStack spacing={4} flexWrap="wrap" justify="center" w="100%">
        {defaultImages.map((img, i) => (
          <MotionBox
            key={i}
            borderRadius="xl"
            overflow="hidden"
            boxShadow={selectedImage === i ? "0 0 0 3px teal" : "md"}
            whileHover={{ scale: 1.05 }}
            cursor="pointer"
            onClick={() => onSelectImage(i)}
          >
            <Image src={img} alt={`Imagen ${i + 1}`} boxSize="100px" objectFit="cover" />
          </MotionBox>
        ))}
      </HStack>

      <MotionBox
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="xl"
        w={["90%", "70%", "50%"]}
        textAlign="center"
        whileHover={{ scale: 1.02 }}
      >
        {!selectedDefaultImage && !previewURL && !loading && (
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
            >
              📁 Subir tu propia imagen
            </Button>
          </>
        )}

      {(selectedDefaultImage || previewURL) && !loading && (
        <VStack spacing={4}>
          <Image
            src={selectedDefaultImage || previewURL}
            alt="Vista previa"
            borderRadius="xl"
            maxH="250px"
            objectFit="cover"
            boxShadow="md"
          />

          <HStack spacing={4}>
            <Button
              colorScheme="teal"
              onClick={onSubmit}
              rounded="full"
              px={6}
            >
              Enviar imagen
            </Button>

            <Button
              colorScheme="gray"
              variant="outline"
              rounded="full"
              px={6}
              onClick={() => {
                onSelectImage(null);
              }}
            >
              Cambiar imagen
            </Button>
          </HStack>
        </VStack>
      )}


        {loading && (
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Procesando tu imagen...</Text>
          </VStack>
        )}
      </MotionBox>
    </VStack>
  );
};

export default ImageSelectorUI;
