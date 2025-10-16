import React, { useState, useEffect } from "react";
import { 
  ChakraProvider, 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  useToast,
  theme
} from "@chakra-ui/react";
import { FaBrain, FaImage, FaComments } from "react-icons/fa";
import ImageAnalyzer from "./components/ImageAnalyzer";
import { checkServerHealth } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [serverStatus, setServerStatus] = useState("checking");
  const toast = useToast();

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      await checkServerHealth();
      setServerStatus("connected");
    } catch (error) {
      setServerStatus("disconnected");
      console.error("Server connection failed:", error);
    }
  };

  const handleStartChat = () => {
    if (serverStatus !== "connected") {
      toast({
        title: "Servidor no disponible",
        description: "Por favor asegúrate de que el servidor backend esté ejecutándose.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setCurrentView("analyzer");
  };

  const renderServerStatus = () => {
    if (serverStatus === "checking") return null;
    
    return (
      <Alert 
        status={serverStatus === "connected" ? "success" : "error"} 
        variant="subtle" 
        borderRadius="md"
        mb={4}
      >
        <AlertIcon />
        <Box>
          <AlertTitle>
            {serverStatus === "connected" ? "Servidor conectado!" : "Servidor desconectado"}
          </AlertTitle>
          <AlertDescription>
            {serverStatus === "connected" 
              ? "La aplicación está lista para usar."
              : "Ejecuta el backend con: python -m uvicorn main:app --reload"
            }
          </AlertDescription>
        </Box>
      </Alert>
    );
  };

  if (currentView === "analyzer") {
    return (
      <ChakraProvider theme={theme}>
        <Box minH="100vh" bg="gray.50" py={8}>
          <Container maxW="container.lg">
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h1" size="lg" color="teal.600">
                Análisis de Imágenes - Chatbot Mental
              </Heading>
              <Button 
                variant="outline" 
                colorScheme="teal"
                onClick={() => setCurrentView("home")}
              >
                Volver al Inicio
              </Button>
            </Flex>
            {renderServerStatus()}
            <ImageAnalyzer />
          </Container>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box
        minH="100vh"
        bgGradient="linear(to-br, teal.500, green.400)"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Container maxW="container.md">
          <VStack spacing={8} textAlign="center">
            <Icon as={FaBrain} w={20} h={20} />
            
            <Heading as="h1" size="2xl">
              Chatbot Mental 🧠
            </Heading>

            <Text fontSize="xl" maxW="600px">
              Bienvenido a tu asistente virtual de bienestar emocional.  
              Analiza imágenes y descubre las emociones que pueden provocar.
            </Text>

            {renderServerStatus()}

            <VStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="teal.600"
                _hover={{ bg: "teal.100" }}
                onClick={handleStartChat}
                leftIcon={<FaImage />}
                isDisabled={serverStatus !== "connected"}
              >
                Analizar Imagen
              </Button>

              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FaComments />}
                onClick={() => toast({
                  title: "Próximamente",
                  description: "La función de chat estará disponible pronto.",
                  status: "info",
                  duration: 3000,
                  isClosable: true,
                })}
              >
                Chat Conversacional
              </Button>

              <Button
                size="sm"
                variant="ghost"
                color="whiteAlpha.800"
                onClick={checkServer}
                isLoading={serverStatus === "checking"}
              >
                🔄 Verificar Conexión
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
