import React, { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import HomeView from "./components/HomeView";
import ImageSelectorContainer from "./components/ImageSelectorContainer";
import ImageChatContainer from "./components/ImageChatContainer";
import customTheme from "./theme/customTheme";

// Transición suave entre vistas
const viewTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

function App() {

  // Vista actual: "home", "gallery" o "chat"
  const [view, setView] = useState("home");

  // Imagen seleccionada (File) y pregunta inicial generada por el backend
  const [selectedImage, setSelectedImage] = useState(null);
  const [initialQuestion, setInitialQuestion] = useState(null);

  // Abre la galería de imágenes
  const handleStartSession = () => {
    setView("gallery");
  };

  // Recibe la imagen y la pregunta inicial del backend y abre el chat
  const handleImageSelected = ({ image, message, focus, finished }) => {
    setSelectedImage(image);
    setInitialQuestion({ message, focus: focus || null, finished: finished || false });
    setView("chat");
  };

  // Vuelve a la galería para empezar otra conversación
  const handleRestart = () => {
    setSelectedImage(null);
    setInitialQuestion(null);
    setView("gallery");
  };

  // Vuelve a la vista inicial y resetea los estados
  const handleBackHome = () => {
    setSelectedImage(null);
    setInitialQuestion(null);
    setView("home");
  };

  return (
    <ChakraProvider theme={customTheme}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          <motion.div key={view} {...viewTransition}>
            {view === "home" && <HomeView onStart={handleStartSession} />}

            {view === "gallery" && (
              <ImageSelectorContainer onImageSelected={handleImageSelected} onBack={handleBackHome} />
            )}

            {view === "chat" && selectedImage && initialQuestion && (
              <ImageChatContainer
                selectedImage={selectedImage}
                initialQuestion={initialQuestion}
                onExit={handleBackHome}
                onRestart={handleRestart}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </ChakraProvider>
  );
}

export default App;
