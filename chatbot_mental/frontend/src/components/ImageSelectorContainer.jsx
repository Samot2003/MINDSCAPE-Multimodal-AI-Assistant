import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageSelectorUI from "./ImageSelectorUI";

const importAll = (r) => r.keys().map(r);
const defaultImages = importAll(
  require.context("../assets/images", false, /\.(png|jpe?g|svg)$/)
);

const ImageSelectorContainer = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);

    try {
      let imageToSend = selectedImage.file;

      if (selectedImage.isDefault && typeof imageToSend === "string") {
        const response = await fetch(imageToSend);
        const blob = await response.blob();
        imageToSend = new File([blob], "default.png", { type: blob.type });
      }

      const { mensaje, finished } = await startChatWithImage(imageToSend, selectedImage.isDefault);

      if (!mensaje) throw new Error("No hay respuesta del backend");

      // Enviamos la pregunta inicial al chat
      onImageSelected({ image: imageToSend, mensaje, finished });
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
