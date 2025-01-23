import {
  SystemStyleObject,
  createSystem,
  defaultConfig,
  defineRecipe,
  defineSemanticTokens,
} from "@chakra-ui/react";

const linkRecipe = defineRecipe<{
  variant: { underline: SystemStyleObject; plain: SystemStyleObject };
}>({
  defaultVariants: {
    variant: "underline",
  },
});

const semanticTokens = defineSemanticTokens({
  colors: {
    goldmedal: {
      value: { base: "#fad25a", _dark: "#7d6a36" },
    },
    silvermedal: {
      value: { base: "#cbcace", _dark: "#676668" },
    },
    bronzemedal: {
      value: { base: "#cea972", _dark: "#695840" },
    },
  },
});

export const theme = createSystem(defaultConfig, {
  theme: {
    semanticTokens,
    recipes: {
      link: linkRecipe,
    },
  },
});

export default theme;
