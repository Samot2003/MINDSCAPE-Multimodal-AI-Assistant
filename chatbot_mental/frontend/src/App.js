import { ChakraProvider, Box, VStack, Heading, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { FaBrain } from "react-icons/fa"; // si quieres el icono del cerebro

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
      <VStack spacing={6}>
        <Heading as="h1" size="2xl" textAlign="center">
          Chatbot Mental 🧠
        </Heading>

        <Text fontSize="xl" textAlign="center" maxW="600px">
          Bienvenido a tu asistente virtual de bienestar emocional.  
          Haz clic en el botón para comenzar una conversación.
        </Text>

        <Button
          size="lg"
          colorScheme="teal"
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
