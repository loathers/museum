import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const Link = defineStyleConfig({
  // The styles all button have in common
  baseStyle: {
    ":hover": {
      textDecoration: "none",
    },
    ":not(.chakra-button)": {
      textDecoration: "underline",
      ":hover": {
        filter: "opacity(0.6)",
        textDecoration: "none",
      },
    },
  },
});

export const theme = extendTheme({
  components: {
    Link,
  },
});
