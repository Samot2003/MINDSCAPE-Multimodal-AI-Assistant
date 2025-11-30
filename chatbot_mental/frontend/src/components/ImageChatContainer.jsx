import React, { useState, useEffect, useRef } from "react";
import { useToast, Button, VStack } from "@chakra-ui/react";
import { continueChat, getSummary } from "../services/api";
import ImageChatUI from "./ImageChatUI";

const ImageChatContainer = ({ selectedImage, initialQuestion }) => {
  const toast = useToast();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const chatEndRef = useRef(null);
  const [summary, setSummary] = useState("");

  // Cuando llega la pregunta inicial, la añadimos al chat
  useEffect(() => {
    if (!initialQuestion || !initialQuestion.mensaje) return;

    setChatMessages([{ sender: "bot", text: initialQuestion.mensaje }]);
    setFinished(initialQuestion.finished || false);
  }, [initialQuestion]);

  // Scroll automático al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!userInput.trim() || finished) return;

    const newMessage = { sender: "user", text: userInput };
    const updatedChat = [...chatMessages, newMessage];
    setChatMessages(updatedChat);
    setUserInput("");
    setLoading(true);

    try {
      const { mensaje, finished: chatFinished } = await continueChat(updatedChat);

      setChatMessages([...updatedChat, { sender: "bot", text: mensaje }]);
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

  const handleRestart = () => {
    setChatMessages([]);
    setUserInput("");
    setFinished(false);
  };

  const handleGetSummary = async () => {
    try {
      const res = await getSummary(chatMessages);
      setSummary(res.resumen);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <VStack spacing={4} w="100%" maxW="600px" mx="auto">
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
    </VStack>
  );
};

export default ImageChatContainer;
