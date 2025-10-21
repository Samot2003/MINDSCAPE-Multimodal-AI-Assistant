// src/components/ImageChatContainer.jsx
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage } from "../services/api";
import ImageChatUI from "./ImageChatUI";

const ImageChatContainer = ({ selectedImage, initialQuestion }) => {
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: initialQuestion?.pregunta || "Hola! 😊" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const lastBotMessage = chatMessages
      .slice()
      .reverse()
      .find((m) => m.sender === "bot")?.text;

    setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setUserInput("");
    setLoading(true);

    try {
      const { siguiente_pregunta } = await startChatWithImage(
        null,
        lastBotMessage,
        userInput
      );
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: siguiente_pregunta },
      ]);
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

  return (
    <ImageChatUI
      selectedImage={selectedImage}
      chatMessages={chatMessages}
      userInput={userInput}
      setUserInput={setUserInput}
      handleSend={handleSend}
      loading={loading}
    />
  );
};

export default ImageChatContainer;
