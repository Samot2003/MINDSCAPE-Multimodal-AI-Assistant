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
      minH="100vh"
      justify="flex-start"
      spacing={8}
      position="relative"
      overflow="hidden"
      bg="linear-gradient(160deg, #f5f7f6, #eef2f1)"
    >
      {/* Fondo orgánico */}
      <MotionBox
        position="absolute"
        inset={0}
        bg="radial-gradient(circle at 30% 20%, rgba(0,0,0,0.06), transparent 60%)"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 25, repeat: Infinity }}
        zIndex={0}
      />

      {/* Texto como pieza */}
      <VStack spacing={3} zIndex={1} textAlign="center">
        <Heading fontSize="4xl" fontWeight="500" letterSpacing="1px">
          Elige una imagen
        </Heading>
        <Text maxW="480px" fontSize="sm" color="gray.600" lineHeight="1.8">
          No busques la correcta. Elige la que te mire primero.
        </Text>
      </VStack>

      {/* Galería flotante */}
      <HStack
        spacing={4}
        wrap="wrap"
        justify="center"
        zIndex={1}
        maxW="900px"
      >
        {defaultImages.map((img, i) => (
          <MotionBox
            key={i}
            whileHover={{ scale: 1.08, rotate: i % 2 === 0 ? 1 : -1 }}
            transition={{ type: "spring", stiffness: 120 }}
            borderRadius="3xl"
            overflow="hidden"
            boxShadow={
              selectedImage === i
                ? "0 0 0 3px rgba(0,0,0,0.25)"
                : "0 20px 40px rgba(0,0,0,0.1)"
            }
            cursor="pointer"
            onClick={() => onSelectImage(i)}
          >
            <Image src={img} boxSize="70px" objectFit="cover" />
          </MotionBox>
        ))}
      </HStack>

      {/* Acción */}
      <MotionBox
        zIndex={1}
        bg="rgba(255,255,255,0.7)"
        backdropFilter="blur(12px)"
        px={10}
        py={8}
        borderRadius="3xl"
        boxShadow="0 40px 80px rgba(0,0,0,0.15)"
        textAlign="center"
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
            <Button as="label" htmlFor="file-upload" variant="ghost" fontSize="sm">
              O subir una imagen propia
            </Button>
          </>
        )}

        {(selectedDefaultImage || previewURL) && !loading && (
          <VStack spacing={5}>
            <Image src={selectedDefaultImage || previewURL} borderRadius="2xl" maxH="280px" />
            <HStack spacing={4}>
              <Button
                onClick={onSubmit}
                rounded="full"
                px={8}
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
              >
                Entrar en el diálogo
              </Button>
              {/* Botón para volver a la selección */}
              <Button
                variant="outline"
                rounded="full"
                px={6}
                onClick={() => onSelectImage(null)}
              >
                Cambiar imagen
              </Button>
            </HStack>
          </VStack>
        )}

        {loading && <Spinner />}
      </MotionBox>
    </VStack>
  );
};

export default ImageSelectorUI;
