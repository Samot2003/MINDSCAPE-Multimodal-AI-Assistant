import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageSelectorUI from "./ImageSelectorUI";

const ImageSelectorContainer = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Maneja la selección de imagen
  const handleSelectImage = (input) => {
    // Subida del usuario
    if (input.target?.files && input.target.files[0]) {
      setSelectedImage(input.target.files[0]);
    } 
    // Imagen predeterminada
    else if (typeof input === "string") {
      setSelectedImage(input);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);

    try {
      let imageToSend = selectedImage;

      // Convertir URL predeterminada a File
      if (typeof selectedImage === "string") {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        imageToSend = new File([blob], "default.png", { type: blob.type });
      }

      const { pregunta } = await startChatWithImage(imageToSend);

      if (!pregunta) throw new Error("No se recibió pregunta del backend");

      onImageSelected({ image: imageToSend, pregunta });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al procesar la imagen",
        description: err.message || "Intenta nuevamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageSelectorUI
      selectedImage={selectedImage}
      loading={loading}
      onSelectImage={handleSelectImage}
      onSubmit={handleSubmit}
    />
  );
};

export default ImageSelectorContainer;
