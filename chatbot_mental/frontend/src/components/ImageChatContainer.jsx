import React, { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { continueChat, downloadSummaryPdf } from "../services/api";
import { shrinkImage } from "../services/imageUtils";
import ImageChatUI from "./ImageChatUI";

const ImageChatContainer = ({ selectedImage, initialQuestion, onExit, onRestart }) => {
  // Manejo de estados para el chat, entrada del usuario y estado de carga
  const toast = useToast();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Zona de la imagen que la usuaria ha señalado para su próximo mensaje ({ x, y } de 0 a 1)
  const [pendingFocus, setPendingFocus] = useState(null);

  // Versión reducida de la imagen que se envía al modelo en cada mensaje
  const [apiImage, setApiImage] = useState(null);

  useEffect(() => {
    let active = true;
    shrinkImage(selectedImage).then((image) => active && setApiImage(image));
    return () => {
      active = false;
    };
  }, [selectedImage]);

  // Agrega la pregunta inicial (y la zona a la que se refiere) cuando está disponible
  useEffect(() => {
    if (!initialQuestion || !initialQuestion.message) {
      return;
    }

    setChatMessages([{ sender: "bot", text: initialQuestion.message, focus: initialQuestion.focus || null }]);
    setFinished(initialQuestion.finished || false);
  }, [initialQuestion]);

  // Señala una zona de la imagen para el siguiente mensaje (null la quita)
  const handlePoint = (point) => {
    if (finished || loading) {
      return;
    }
    setPendingFocus(point);
  };

  // Maneja el envío de mensajes del usuario y la respuesta del bot
  const handleSend = async () => {
    if (!userInput.trim() || finished || loading) {
      return;
    }

    const newMessage = { sender: "user", text: userInput.trim(), focus: pendingFocus };
    const updatedChat = [...chatMessages, newMessage];
    setChatMessages(updatedChat);
    setUserInput("");
    setPendingFocus(null);
    setLoading(true);

    try {
      const { message, focus, finished: chatFinished } = await continueChat(
        updatedChat,
        apiImage || selectedImage
      );

      setChatMessages([...updatedChat, { sender: "bot", text: message, focus: focus || null }]);
      setFinished(chatFinished);
    } catch (err) {
      toast({
        title: "No se pudo enviar el mensaje",
        description: err.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Descarga el resumen de la conversación en formato PDF
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await downloadSummaryPdf(chatMessages);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resumen_conversacion.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Resumen descargado", status: "success", duration: 3000 });
    } catch (err) {
      toast({
        title: "No se pudo descargar el resumen",
        description: "Inténtalo de nuevo en unos segundos.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ImageChatUI
      selectedImage={selectedImage}
      chatMessages={chatMessages}
      userInput={userInput}
      setUserInput={setUserInput}
      handleSend={handleSend}
      loading={loading}
      finished={finished}
      pendingFocus={pendingFocus}
      onPoint={handlePoint}
      downloading={downloading}
      onDownloadPdf={handleDownloadPdf}
      onRestart={onRestart}
      onExit={onExit}
    />
  );
};

export default ImageChatContainer;
