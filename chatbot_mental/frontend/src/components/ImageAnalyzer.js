import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Image,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Input,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider
} from '@chakra-ui/react';
import { analyzeImage } from '../services/api';

const ImageAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: 'Sin imagen',
        description: 'Por favor selecciona una imagen primero',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await analyzeImage(selectedImage);
      setResults(response);
      toast({
        title: 'Análisis completado',
        description: 'La imagen ha sido analizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error en el análisis',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={6}>
        <Heading as="h2" size="lg" textAlign="center" color="teal.600">
          Análisis de Imágenes con IA
        </Heading>

        {/* Selector de imagen */}
        <Card w="100%">
          <CardHeader>
            <Heading size="md">Seleccionar Imagen</Heading>
          </CardHeader>
          <CardBody>
            <FormLabel htmlFor="image-upload">Elige una imagen para analizar:</FormLabel>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              p={1}
            />
          </CardBody>
        </Card>

        {/* Vista previa de la imagen */}
        {imagePreview && (
          <Card w="100%">
            <CardHeader>
              <Heading size="md">Vista Previa</Heading>
            </CardHeader>
            <CardBody>
              <Image
                src={imagePreview}
                alt="Vista previa"
                maxH="300px"
                objectFit="contain"
                mx="auto"
                borderRadius="md"
              />
            </CardBody>
          </Card>
        )}

        {/* Botones de acción */}
        <VStack spacing={4}>
          <Button
            colorScheme="teal"
            size="lg"
            onClick={handleAnalyze}
            isLoading={analyzing}
            loadingText="Analizando..."
            disabled={!selectedImage}
          >
            Analizar Imagen
          </Button>

          {(selectedImage || results) && (
            <Button variant="outline" onClick={resetAnalysis}>
              Seleccionar Nueva Imagen
            </Button>
          )}
        </VStack>

        {/* Spinner de carga */}
        {analyzing && (
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text>Procesando la imagen con IA...</Text>
          </VStack>
        )}

        {/* Error */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Resultados */}
        {results && !analyzing && (
          <VStack spacing={4} w="100%">
            <Card w="100%">
              <CardHeader>
                <Heading size="md" color="teal.600">Análisis Emocional</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="md" lineHeight="1.6">
                  {results.descripcion}
                </Text>
              </CardBody>
            </Card>

            <Divider />

            <Card w="100%">
              <CardHeader>
                <Heading size="md" color="green.600">Reflexión Terapéutica</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="md" lineHeight="1.6" fontStyle="italic">
                  {results.reflexion}
                </Text>
              </CardBody>
            </Card>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ImageAnalyzer;
