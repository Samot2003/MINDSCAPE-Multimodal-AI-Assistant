import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bgGradient: "linear(to-b, #e6f4ea, #cde8d1)", // fondo verde suave
        color: "#1a202c",
        fontFamily: "'Inter', sans-serif",
        lineHeight: "tall",
      },
    },
  },
  colors: {
    brand: {
      50: "#e6f4ea",
      100: "#cde8d1",
      200: "#b4ddb8",
      300: "#9adfa0",
      400: "#81d187",
      500: "#68c36f",
      600: "#4da556",
      700: "#35863f",
      800: "#1c6528",
      900: "#034311",
    },
  },
  components: {
    Button: {
      baseStyle: { rounded: "lg", fontWeight: "medium" },
      variants: {
        solid: { bg: "brand.500", color: "white", _hover: { bg: "brand.600" } },
        outline: { borderColor: "brand.500", color: "brand.700", _hover: { bg: "brand.100" } },
      },
    },
    Heading: { baseStyle: { color: "brand.700" } },
    Input: { baseStyle: { field: { bg: "whiteAlpha.900", borderColor: "brand.200", _focus: { borderColor: "brand.500", boxShadow: "0 0 0 1px #68c36f" } } } },
    Box: { baseStyle: { borderRadius: "md" } },
  },
});

export default customTheme;
