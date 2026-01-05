import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Container,
  Button,
  Heading,
  VStack
} from "@chakra-ui/react";

import ImageSelectorContainer from "./components/ImageSelectorContainer";
import ImageChatContainer from "./components/ImageChatContainer";
import customTheme from "./theme/customTheme";

function App() {
  
  const [view, setView] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [initialQuestion, setInitialQuestion] = useState(null);

  const handleStartSession = () => {
    setView("image-chat");
  };

  const handleImageSelected = ({ image, mensaje, pregunta, finished }) => {
    setSelectedImage(image);
    setInitialQuestion({
      mensaje: mensaje || pregunta,  // ← esta línea lo arregla todo
      finished: finished || false
    });
  };

  const handleBackHome = () => {
    setSelectedImage(null);
    setInitialQuestion(null);
    setView("home");
  };

  return (
    <ChakraProvider theme={customTheme}>
      <Box
        minH="100vh"
        py={12}
        bg="linear-gradient(135deg, #f3f7f5 0%, #e8f1ef 100%)"
      >
        <Container maxW="container.lg">

          {/* ---------------- HOME ---------------- */}
          {view === "home" && (
            <VStack
              spacing={8}
              minH="80vh"
              justify="center"
              textAlign="center"
            >
              <Heading
                fontSize={["4xl", "5xl"]}
                fontWeight="600"
                letterSpacing="1px"
                lineHeight="1.1"
              >
                Mindscape
              </Heading>

              <Box
                maxW="420px"
                fontSize="sm"
                color="gray.600"
                lineHeight="1.7"
              >
                Explora tu mundo emocional a través de imágenes y un diálogo
                reflexivo guiado por inteligencia artificial.
              </Box>

              <Button
                size="lg"
                px={12}
                py={6}
                rounded="full"
                bg="teal.500"
                color="white"
                fontWeight="500"
                letterSpacing="0.5px"
                _hover={{
                  bg: "teal.600",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.25s ease"
                onClick={handleStartSession}   // 🔒 lógica intacta
              >
                Empezar sesión
              </Button>
            </VStack>
          )}

          {/* -------- SELECTOR DE IMAGEN -------- */}
          {view === "image-chat" && !selectedImage && (
            <Box
              mt={4}
              borderRadius="3xl"
              overflow="hidden"
            >
              <ImageSelectorContainer onImageSelected={handleImageSelected} />
            </Box>
          )}

          {/* -------- CHAT CON IMAGEN -------- */}
          {view === "image-chat" && selectedImage && initialQuestion && (
            <VStack spacing={4} align="stretch">
              <Button
                alignSelf="flex-start"
                variant="ghost"
                fontSize="sm"
                onClick={handleBackHome}   // 🔒 lógica intacta
              >
                ← Volver
              </Button>

              <Box
                borderRadius="3xl"
                overflow="hidden"
              >
                <ImageChatContainer
                  selectedImage={selectedImage}
                  initialQuestion={initialQuestion}
                />
              </Box>
            </VStack>
          )}

        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
