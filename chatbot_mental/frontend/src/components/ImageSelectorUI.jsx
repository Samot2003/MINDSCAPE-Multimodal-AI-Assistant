// src/components/ui/ImageChatUI.jsx
import React, { useState } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
  loading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewSrc, setPreviewSrc] = useState(null);

  const handlePreview = () => {
    const src =
      selectedImage instanceof File
        ? URL.createObjectURL(selectedImage)
        : selectedImage;
    setPreviewSrc(src);
    onOpen();
  };

  return (
    <Box
      bgGradient="linear(to-br, green.50, teal.50)"
      p={6}
      borderRadius="2xl"
      boxShadow="lg"
      w="100%"
    >
      <HStack align="start" spacing={6}>
        {/* Imagen con vista previa */}
        <Box
          w="40%"
          borderRadius="xl"
          overflow="hidden"
          bg="white"
          boxShadow="md"
          p={3}
          _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
          cursor="pointer"
          onClick={handlePreview}
        >
          <Image
            src={
              selectedImage instanceof File
                ? URL.createObjectURL(selectedImage)
                : selectedImage
            }
            alt="Seleccionada"
            borderRadius="md"
            maxH="350px"
            objectFit="cover"
            w="100%"
          />
          <Text fontSize="sm" mt={2} textAlign="center" color="gray.600">
            Haz clic para ampliar imagen
          </Text>
        </Box>

        {/* Chat */}
        <VStack
          w="60%"
          h="450px"
          p={5}
          border="1px solid"
          borderColor="green.100"
          borderRadius="xl"
          bg="whiteAlpha.900"
          boxShadow="md"
          overflowY="auto"
          spacing={4}
          align="stretch"
        >
          <Heading size="md" color="teal.700">
            Chat Empático 🌱
          </Heading>

          {chatMessages.map((msg, idx) => (
            <Box
              key={idx}
              bg={msg.sender === "bot" ? "green.100" : "teal.100"}
              color="gray.800"
              p={3}
              borderRadius="lg"
              alignSelf={msg.sender === "bot" ? "flex-start" : "flex-end"}
              maxW="80%"
              boxShadow="sm"
            >
              <Text>{msg.text}</Text>
            </Box>
          ))}

          {loading && (
            <HStack justify="center">
              <Spinner color="teal.500" />
            </HStack>
          )}

          {!loading && (
            <HStack mt="auto" spacing={3}>
              <Input
                placeholder="Escribe tu respuesta..."
                bg="white"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                borderColor="green.200"
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.300" }}
              />
              <Button
                colorScheme="teal"
                onClick={handleSend}
                _hover={{ bg: "teal.500" }}
              >
                Enviar
              </Button>
            </HStack>
          )}
        </VStack>
      </HStack>

      {/* Modal de vista previa */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="white" p={4} borderRadius="2xl" boxShadow="xl">
          <ModalBody>
            <Image
              src={previewSrc}
              alt="Vista previa"
              borderRadius="xl"
              w="100%"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageChatUI;
