import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ColorThief from "color-thief-browser";
import TextareaAutosize from "react-textarea-autosize";

const MotionBox = motion(Box);

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
  loading,
}) => {
  // Estado para el color de fondo dinámico basado en la imagen
  const [bgColor, setBgColor] = useState("rgba(255,255,255,0.15)");
  const imgRef = useRef(null);
  const chatRef = useRef(null);

  // Desplazamiento automático al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Detecta el color dominante de la imagen seleccionada
  useEffect(() => {
    if (!selectedImage) {
      return;
    }
    const image = imgRef.current;
    if (!image) {
      return;
    }

    const handleLoad = () => {
      try {
        const colorThief = new ColorThief();
        const rgb = colorThief.getColor(image);
        setBgColor(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`);
      } catch {}
    };

    image.complete ? handleLoad() : image.addEventListener("load", handleLoad);
    return () => image.removeEventListener("load", handleLoad);
  }, [selectedImage]);

  // Genera una URL para mostrar la imagen seleccionada
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
      minH="90vh"
      w="100%"
      position="relative"
      overflow="hidden"
      align="center"
      spacing={0}
    >
      {/* Fondo dinámico basado en la imagen seleccionada */}
      {selectedImage && (
        <MotionBox
          position="absolute"
          inset={0}
          backgroundImage={`url(${displayImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          filter="blur(26px) brightness(0.55) contrast(1.1)"
          animate={{ scale: [1.05, 1.12, 1.05] }}
          transition={{ duration: 30, repeat: Infinity }}
        />
      )}

      {/* Título de la aplicación */}
      <MotionBox mt={12} mb={6} zIndex={2} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Heading
          color="white"
          fontWeight="300"
          letterSpacing="0.2em"
          fontSize="lg"
          textAlign="center"
        >
          MINDSCAPE
        </Heading>
      </MotionBox>

      {/* Zona del chat donde se muestran los mensajes */}
      <MotionBox
        ref={chatRef}
        zIndex={2}
        w="100%"
        maxW="1600px"
        h="70vh"
        overflowY="auto"
        px={8}
        py={6}
        style={{ scrollbarWidth: "none" }}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        <VStack spacing={6} align="stretch">
          {chatMessages.map((msg, idx) => {
            const isBot = msg.sender === "bot";
            return (
              <MotionBox
                key={idx}
                alignSelf={isBot ? "flex-start" : "flex-end"}
                maxW="90%"
                px={6}
                py={4}
                bg={isBot ? bgColor : "rgba(0,0,0,0.35)"}
                color="white"
                borderRadius="18px"
                boxShadow="0 20px 50px rgba(0,0,0,0.45)"
                transform={`rotate(${isBot ? -0.6 : 0.6}deg)`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Text fontSize="sm" lineHeight="1.7" letterSpacing="0.3px">
                  {msg.text}
                </Text>
              </MotionBox>
            );
          })}

          {/* Mensaje de carga cuando no hay mensajes */}
          {chatMessages.length === 0 && (
            <VStack pt={20}>
              <Spinner color="whiteAlpha.600" />
              <Text color="whiteAlpha.700" fontSize="sm">
                Escuchando la imagen…
              </Text>
            </VStack>
          )}
        </VStack>
      </MotionBox>

      {/* Input para escribir mensajes */}
      <MotionBox
        zIndex={3}
        w="95%"
        maxW="1600px"
        mt={4}
        mb={10}
        px={6}
        py={4}
        bg="rgba(0,0,0,0.45)"
        borderRadius="999px"
        boxShadow="0 30px 80px rgba(0,0,0,0.6)"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HStack spacing={4}>
          <Box
            as={TextareaAutosize}
            minRows={1}
            maxRows={4}
            placeholder="Escribe lo que surja…"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            style={{
              width: "100%",
              background: "transparent",
              color: "white",
              border: "none",
              outline: "none",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          />
          <Button
            onClick={handleSend}
            isDisabled={loading || !userInput.trim()}
            bg="white"
            color="black"
            rounded="full"
            px={6}
            size="sm"
          >
            →
          </Button>
        </HStack>
      </MotionBox>
    </VStack>
  );
};

export default ImageChatUI;
