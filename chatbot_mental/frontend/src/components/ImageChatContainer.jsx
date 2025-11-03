import React, { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { startChatWithImage, continueChat } from "../services/api";
import ImageChatUI from "./ImageChatUI";

const ImageChatContainer = ({ selectedImage }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!selectedImage) return;

    const iniciarChat = async () => {
      setLoading(true);
      try {
        const { pregunta } = await startChatWithImage(selectedImage);
        setChatMessages([{ sender: "bot", text: pregunta }]);
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

    iniciarChat();
  }, [selectedImage, toast]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    const updatedChat = [...chatMessages, newMessage];
    setChatMessages(updatedChat);
    setUserInput("");
    setLoading(true);

    try {
      const { siguiente_mensaje } = await continueChat(userInput, updatedChat);
      setChatMessages([...updatedChat, { sender: "bot", text: siguiente_mensaje }]);
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
