import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageSelectorUI from "./ImageSelectorUI";

const ImageSelectorContainer = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSelectImage = (e) => setSelectedImage(e.target.files[0]);

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const { pregunta } = await startChatWithImage(selectedImage);
      if (!pregunta) throw new Error("No se recibió pregunta del backend");
      onImageSelected({ image: selectedImage, pregunta });
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
