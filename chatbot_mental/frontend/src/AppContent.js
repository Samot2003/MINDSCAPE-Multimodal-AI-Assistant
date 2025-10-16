import React from "react";
import { Box, Heading, Text, Button, VStack, Icon } from "@chakra-ui/react";
import { FaBrain } from "react-icons/fa"; // asegúrate de tener react-icons instalado

function App() {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, teal.500, green.400)"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <VStack spacing={6} textAlign="center">
        <Icon as={FaBrain} w={20} h={20} />
        <Heading as="h1" size="2xl">
          Chatbot Mental 🧠
        </Heading>

        <Text fontSize="xl" maxW="600px">
          Bienvenido a tu asistente virtual de bienestar emocional.  
          Haz clic en el botón para comenzar una conversación.
        </Text>

        <Button
          size="lg"
          bg="white"
          color="teal.600"
          _hover={{ bg: "teal.100" }}
          onClick={() => alert("Aquí se abriría el chatbot.")}
        >
          Comenzar Chat
        </Button>
      </VStack>
    </Box>
  );
}

export default App;
