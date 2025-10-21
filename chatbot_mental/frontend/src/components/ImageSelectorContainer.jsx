// src/components/ImageSelectorContainer.jsx
import React, { useState } from "react";
import { Box, Input, Button, VStack, useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";

const ImageSelectorContainer = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!selectedImage) return;

    try {
      const { pregunta } = await startChatWithImage(selectedImage);
      if (!pregunta) throw new Error("No se recibió pregunta del backend");
      onImageSelected({ image: selectedImage, pregunta });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4} align="center">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
      />
      <Button colorScheme="teal" onClick={handleSubmit} isDisabled={!selectedImage}>
        Enviar imagen
      </Button>
    </VStack>
  );
};

export default ImageSelectorContainer;
