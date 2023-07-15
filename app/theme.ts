import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const Link = defineStyleConfig({
  // The styles all button have in common
  baseStyle: {
    textDecoration: "underline",
  },
});

export const theme = extendTheme({
  components: {
    Link,
  },
});