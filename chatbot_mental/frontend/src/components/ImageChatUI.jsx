import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ColorThief from "color-thief-browser";

const MotionBox = motion(Box);

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
  loading,
}) => {
  const [bgColor, setBgColor] = useState("rgba(72, 187, 120, 0.4)");
  const imgRef = useRef(null);

  useEffect(() => {
    if (!selectedImage) return;

    const image = imgRef.current;
    if (!image) return;

    const handleLoad = () => {
      try {
        const colorThief = new ColorThief();
        const rgb = colorThief.getColor(image);
        setBgColor(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)`);
      } catch (err) {
        console.warn("No se pudo extraer color de la imagen", err);
      }
    };

    if (image.complete) {
      handleLoad();
    } else {
      image.addEventListener("load", handleLoad);
      return () => image.removeEventListener("load", handleLoad);
    }
  }, [selectedImage]);

  // Limpieza de URLs de File para evitar leaks
  const [objectUrl, setObjectUrl] = useState(null);
  useEffect(() => {
    if (selectedImage instanceof File) {
      const url = URL.createObjectURL(selectedImage);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [selectedImage]);

  const displayImage = objectUrl || selectedImage;

  return (
    <VStack
      spacing={6}
      align="center"
      justify="flex-start"
      minH="85vh"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
    >
      {selectedImage && (
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          backgroundImage={`url(${displayImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          filter="blur(20px) brightness(0.7)"
          zIndex={0}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
        />
      )}

      <VStack spacing={4} zIndex={1} p={6}>
        <Heading color="teal.50" size="lg" textAlign="center">Mindscape AI</Heading>
        <Text color="teal.100" fontSize="sm" textAlign="center" maxW="500px" lineHeight="1.5">
          Reflexiona sobre tus emociones a partir de la imagen seleccionada.
          La IA te acompañará en un diálogo empático.
        </Text>
      </VStack>

      <HStack spacing={4} align="flex-start" justify="center" flexWrap="wrap" w="95%" zIndex={1}>
        <MotionBox
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(10px)"
          borderRadius="2xl"
          boxShadow="xl"
          w={["90%", "70%", "55%"]}
          display="flex"
          flexDirection="column"
        >
          <VStack
            spacing={2}
            align="stretch"
            flex="1"
            overflowY="auto"
            pr={2}
            minH="550px"
            css={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.4)", borderRadius: "3px" },
            }}
          >
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                bg={msg.sender === "bot" ? bgColor.replace(/0\.4/, "0.6") : "rgba(255,255,255,0.25)"}
                color="white"
                p={2}
                borderRadius="xl"
                alignSelf={msg.sender === "bot" ? "flex-start" : "flex-end"}
                whiteSpace="pre-line"
                boxShadow="sm"
              >
                <Text fontSize="sm">{msg.text}</Text>
              </Box>
            ))}

            {chatMessages.length === 0 && (
              <VStack align="center" mt={2}>
                <Spinner color="teal.200" size="md" />
                <Text color="teal.100" fontSize="sm">Iniciando chat...</Text>
              </VStack>
            )}
          </VStack>

          <HStack mt={3} spacing={2}>
            <Input
              placeholder="Escribe tu respuesta..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              isDisabled={loading}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
              size="sm"
              bg="rgba(255,255,255,0.3)"
              color="white"
              flex="1"
            />

            <Button
              colorScheme="teal"
              onClick={handleSend}
              rounded="full"
              px={4}
              size="sm"
              isDisabled={loading || !userInput.trim()}
              leftIcon={loading ? <Spinner size="xs" /> : null}
              opacity={loading ? 0.6 : 1}
              cursor={loading ? "not-allowed" : "pointer"}
              transition="all 0.2s ease"
            >
              {loading ? "Esperando..." : "Enviar"}
            </Button>
          </HStack>
        </MotionBox>
      </HStack>

      {selectedImage && <img ref={imgRef} src={displayImage} crossOrigin="anonymous" alt="Dominant" style={{ display: "none" }} />}
    </VStack>
  );
};

export default ImageChatUI;
