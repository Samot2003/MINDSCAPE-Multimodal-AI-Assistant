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
      <Box minH="100vh" py={8}>
        <Container maxW="container.lg">

          {/* ---------------- HOME ---------------- */}
          {view === "home" && (
            <VStack spacing={6} textAlign="center" minH="80vh" justify="center">
              <Heading fontSize="4xl">Mindscape AI</Heading>
              <Button size="lg" onClick={handleStartSession}>
                Empezar sesión
              </Button>
            </VStack>
          )}

          {/* -------- SELECTOR DE IMAGEN -------- */}
          {view === "image-chat" && !selectedImage && (
            <ImageSelectorContainer onImageSelected={handleImageSelected} />
          )}

          {/* -------- CHAT CON IMAGEN -------- */}
          {view === "image-chat" && selectedImage && initialQuestion && (
            <>
              <Button mb={4} variant="outline" onClick={handleBackHome}>
                ← Volver
              </Button>

              <ImageChatContainer
                selectedImage={selectedImage}
                initialQuestion={initialQuestion}
              />
            </>
          )}
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
