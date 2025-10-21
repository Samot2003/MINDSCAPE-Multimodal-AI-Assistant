// src/components/ui/ImageChatUI.jsx
import React from "react";
import {
  HStack,
  VStack,
  Box,
  Image,
  Input,
  Button,
  Text,
  Heading,
  Spinner,
} from "@chakra-ui/react";

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
  loading,
}) => {
  return (
    <HStack align="start" spacing={4}>
      {/* Imagen */}
      <Box w="40%" borderRadius="md" overflow="hidden">
        <Image
          src={
            selectedImage instanceof File
              ? URL.createObjectURL(selectedImage)
              : selectedImage
          }
          alt="Seleccionada"
          borderRadius="md"
          maxH="400px"
          objectFit="cover"
        />
      </Box>

      {/* Chat */}
      <VStack
        w="60%"
        h="400px"
        p={4}
        border="1px solid #CBD5E0"
        borderRadius="md"
        overflowY="auto"
        spacing={3}
        align="stretch"
      >
        <Heading size="md">Chat Empático</Heading>
        {chatMessages.map((msg, idx) => (
          <Box
            key={idx}
            bg={msg.sender === "bot" ? "teal.100" : "green.100"}
            color="black"
            p={2}
            borderRadius="md"
            alignSelf={msg.sender === "bot" ? "flex-start" : "flex-end"}
          >
            <Text>{msg.text}</Text>
          </Box>
        ))}

        {loading && <Spinner color="teal.500" />}

        {!loading && (
          <HStack mt="auto">
            <Input
              placeholder="Escribe tu respuesta..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button colorScheme="teal" onClick={handleSend}>
              Enviar
            </Button>
          </HStack>
        )}
      </VStack>
    </HStack>
  );
};

export default ImageChatUI;
