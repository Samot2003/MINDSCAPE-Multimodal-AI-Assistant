import React, { useState, useEffect, useRef } from "react";
import { useToast, Button, VStack } from "@chakra-ui/react";
import { continueChat, getSummary, downloadSummaryPdf } from "../services/api";
import ImageChatUI from "./ImageChatUI";

const ImageChatContainer = ({ selectedImage, initialQuestion }) => {
  // Manejo de estados para el chat, entrada del usuario y estado de carga
  const toast = useToast();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const chatEndRef = useRef(null);
  const [summary, setSummary] = useState("");

  // Agrega la pregunta inicial al chat cuando está disponible
  useEffect(() => {
    if (!initialQuestion || !initialQuestion.message) {
      return;
    }

    setChatMessages([{ sender: "bot", text: initialQuestion.message }]);
    setFinished(initialQuestion.finished || false);
  }, [initialQuestion]);

  // Desplazamiento automático al final del chat cuando se actualizan los mensajes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Desplazamiento al final cuando el chat se marca como finalizada la conversacion
  useEffect(() => {
    if (finished && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [finished]);

  // Maneja el envío de mensajes del usuario y la respuesta del bot
  const handleSend = async () => {
    if (!userInput.trim() || finished) {
      return;
    }

    const newMessage = { sender: "user", text: userInput };
    const updatedChat = [...chatMessages, newMessage];
    setChatMessages(updatedChat);
    setUserInput("");
    setLoading(true);

    try {
      const { message, finished: chatFinished } = await continueChat(updatedChat);

      setChatMessages([...updatedChat, { sender: "bot", text: message }]);
      setFinished(chatFinished);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reinicia la conversación y limpia los estados
  const handleRestart = () => {
    setChatMessages([]);
    setUserInput("");
    setFinished(false);
  };

  // Descarga el resumen de la conversación en formato PDF
  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadSummaryPdf(chatMessages);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resumen_conversacion.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4} w="100%" maxW="95vw" mx="auto" px={6}>
      <ImageChatUI
        selectedImage={selectedImage}
        chatMessages={chatMessages}
        userInput={userInput}
        setUserInput={setUserInput}
        handleSend={handleSend}
        loading={loading}
        disabled={finished}
      />
      {finished && (
        <Button colorScheme="teal" onClick={handleRestart}>
          Reiniciar conversación
        </Button>
      )}
      {finished && (
        <Button colorScheme="blue" onClick={handleDownloadPdf}>
          Descargar resumen en PDF
        </Button>
      )}
      <div ref={chatEndRef} />
    </VStack>
  );
};

export default ImageChatContainer;
