import React, { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import gallery from "../assets/gallery";
import ImageSelectorUI from "./ImageSelectorUI";

const ImageSelectorContainer = ({ onImageSelected, onBack }) => {
  // Imagen elegida: predeterminada ({ isDefault, index }) o propia ({ file, previewURL })
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Libera la URL temporal de la imagen propia al cambiarla o salir
  useEffect(() => {
    const url = selectedImage?.previewURL;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedImage]);

  // Selecciona una imagen de la galería (por índice), una propia (evento del input) o ninguna (null)
  const handleSelectImage = (input) => {
    if (input === null) {
      setSelectedImage(null);
      return;
    }

    if (typeof input === "number") {
      setSelectedImage({ isDefault: true, index: input });
      return;
    }

    const file = input.target?.files?.[0];
    if (file) {
      setSelectedImage({ isDefault: false, file, previewURL: URL.createObjectURL(file) });
      input.target.value = "";
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

      // Si es una imagen predeterminada, descarga el original y lo convierte en un archivo
      if (selectedImage.isDefault) {
        const response = await fetch(gallery[selectedImage.index].full);
        const blob = await response.blob();
        imageToSend = new File([blob], "default.png", { type: blob.type });
      }

      const { message, focus, finished } = await startChatWithImage(imageToSend, selectedImage.isDefault);

      if (!message) {
        throw new Error("No se pudo iniciar la conversación. Inténtalo de nuevo.");
      }

      onImageSelected({ image: imageToSend, message, focus, finished });
    } catch (err) {
      toast({ title: "No se pudo iniciar la conversación", description: err.message, status: "error" });
      setLoading(false);
    }
  };

  // Datos de la imagen elegida para mostrarla en la vista
  const preview = selectedImage
    ? selectedImage.isDefault
      ? { thumb: gallery[selectedImage.index].thumb, full: gallery[selectedImage.index].full }
      : { thumb: selectedImage.previewURL, full: selectedImage.previewURL }
    : null;

  return (
    <ImageSelectorUI
      images={gallery}
      selectedIndex={selectedImage?.isDefault ? selectedImage.index : null}
      preview={preview}
      isOwnImage={selectedImage ? !selectedImage.isDefault : false}
      loading={loading}
      onSelectImage={handleSelectImage}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
};

export default ImageSelectorContainer;
