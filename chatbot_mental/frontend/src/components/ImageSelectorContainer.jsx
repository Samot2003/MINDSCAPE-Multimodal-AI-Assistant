import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageSelectorUI from "./ImageSelectorUI";

// Importa todas las imágenes predeterminadas de la carpeta de assets
const importAll = (r) => r.keys().map(r);
const defaultImages = importAll(
  require.context("../assets/images", false, /\.(png|jpe?g|svg)$/)
);

const ImageSelectorContainer = ({ onImageSelected }) => {
  // Estados para manejar la imagen seleccionada, la vista previa y el estado de carga
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Maneja la selección de imágenes, ya sea desde el sistema de archivos o imágenes predeterminadas
  const handleSelectImage = (input) => {
    if (input === null) {
      setSelectedImage(null);
      setPreviewURL(null);
      return;
    }

    if (input.target?.files && input.target.files[0]) {
      const file = input.target.files[0];
      setSelectedImage({ file, isDefault: false, index: null });
      setPreviewURL(URL.createObjectURL(file));
      return;
    }

    if (typeof input === "number") {
      setSelectedImage({ file: defaultImages[input], isDefault: true, index: input });
      setPreviewURL(null);
    }
  };

  // Envía la imagen seleccionada al backend para iniciar el chat
  const handleSubmit = async () => {
    if (!selectedImage) {
      return;
    }
    setLoading(true);

    try {
      let imageToSend = selectedImage.file;

      // Si es una imagen predeterminada, convierte la URL en un archivo
      if (selectedImage.isDefault && typeof imageToSend === "string") {
        const response = await fetch(imageToSend);
        const blob = await response.blob();
        imageToSend = new File([blob], "default.png", { type: blob.type });
      }

      const { message, finished } = await startChatWithImage(imageToSend, selectedImage.isDefault);

      if (!message) {
        toast({ title: "Error", description: "No se pudo iniciar la conversación", status: "error" });
      }

      // Envía la pregunta inicial al componente padre
      onImageSelected({ image: imageToSend, message, finished });
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageSelectorUI
      selectedImage={selectedImage?.isDefault ? selectedImage.index : selectedImage?.file || null}
      previewURL={previewURL}
      loading={loading}
      onSelectImage={handleSelectImage}
      onSubmit={handleSubmit}
    />
  );
};

export default ImageSelectorContainer;
