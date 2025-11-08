import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Image,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
}) => {
  return (
    // Cuadro verde superior
    <VStack
      spacing={6}
      align="center"
      justify="flex-start"
      minH="85vh"
      bgGradient="linear(to-br, green.50, teal.50)"
      p={6}
    >
      <Heading color="teal.700" size="lg" textAlign="center">
        Mindscape AI
      </Heading>
      <Text
        color="gray.600"
        fontSize="sm"
        textAlign="center"
        maxW="500px"
        lineHeight="1.5"
      >
        Reflexiona sobre tus emociones a partir de la imagen seleccionada. 
        La IA te acompañará en un diálogo empático.
      </Text>
      <HStack
        spacing={4}
        align="flex-start"
        justify="center"
        flexWrap="wrap"
        w="95%"
      >
        {/* Visualización de la Imagen */}
        <MotionBox
          bg="white"
          p={4}
          borderRadius="2xl"
          boxShadow="xl"
          w={["90%", "70%", "40%"]}
          maxH="300px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          whileHover={{ scale: 1.01 }}
        >
          {selectedImage ? (
            <Image
              src={
                selectedImage instanceof File
                  ? URL.createObjectURL(selectedImage)
                  : selectedImage
              }
              alt="Seleccionada"
              borderRadius="s"
              maxH="250px"
              objectFit="cover"
              boxShadow="md"
            />
          ) : (
            <Text color="gray.500" textAlign="center">
              No hay imagen seleccionada
            </Text>
          )}
        </MotionBox>
        {/* Muestra de la conversación */}
        <MotionBox
          bg="green.50"
          p={4}
          borderRadius="2xl"
          boxShadow="xl"
          w={["90%", "70%", "55%"]}
          H="700px"
          display="flex"
          flexDirection="column"
          whileHover={{ scale: 1.01 }}
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
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(72, 187, 120, 0.5)",
                borderRadius: "3px",
              },
            }}
          >
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                bg={msg.sender === "bot" ? "teal.50" : "green.50"}
                color="black"
                p={2}
                borderRadius="xl"
                alignSelf={msg.sender === "bot" ? "flex-start" : "flex-end"}
                whiteSpace="pre-line"
                boxShadow="sm"
                border="1px solid"
                borderColor={msg.sender === "bot" ? "teal.100" : "green.100"}
              >
                <Text fontSize="sm">{msg.text}</Text>
              </Box>
            ))}

            {chatMessages.length === 0 && (
              <VStack align="center" mt={2}>
                <Spinner color="teal.500" size="md" />
                <Text color="gray.500" fontSize="sm">
                  Iniciando chat...
                </Text>
              </VStack>
            )}
          </VStack>

          <HStack mt={3} spacing={2}>
            <Input
              placeholder="Escribe tu respuesta..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              size="sm"
              bg="white"
              flex="1"
            />
            <Button
              colorScheme="teal"
              onClick={handleSend}
              rounded="full"
              px={4}
              size="sm"
            >
              Enviar
            </Button>
          </HStack>
        </MotionBox>
      </HStack>
    </VStack>
  );
};

export default ImageChatUI;
