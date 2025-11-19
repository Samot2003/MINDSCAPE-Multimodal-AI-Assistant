import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageSelectorUI from "./ImageSelectorUI";

const ImageSelectorContainer = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSelectImage = (input) => {
    if (input.target?.files && input.target.files[0]) {
      setSelectedImage({ file: input.target.files[0], isDefault: false });
    } else if (typeof input === "string") {
      setSelectedImage({ file: input, isDefault: true });
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);

    try {
      let imageToSend = selectedImage.file;
      const isDefault = selectedImage.isDefault;

      // Convertir URL predeterminada a File si es necesario
      if (typeof imageToSend === "string") {
        const response = await fetch(imageToSend);
        const blob = await response.blob();
        imageToSend = new File([blob], "default.png", { type: blob.type });
      }

      // Enviar imagen + isDefault a la API
      const { pregunta } = await startChatWithImage(imageToSend, isDefault);

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
      selectedImage={selectedImage?.file || null}
      loading={loading}
      onSelectImage={handleSelectImage}
      onSubmit={handleSubmit}
    />
  );
};

export default ImageSelectorContainer;
