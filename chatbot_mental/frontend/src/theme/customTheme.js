import { extendTheme } from "@chakra-ui/react";

// La apariencia se define en styles.css; Chakra se usa para los avisos (toasts)
// y aquí solo se alinea con los tokens globales para no sobrescribirlos.
const customTheme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    body: "var(--sans)",
    heading: "var(--serif)",
  },
  styles: {
    global: {
      body: {
        bg: "var(--noche)",
        color: "var(--alba)",
        fontFamily: "var(--sans)",
        lineHeight: "1.55",
      },
    },
  },
});

export default customTheme;
