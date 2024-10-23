import {
  createSystem,
  defaultConfig,
  defineRecipe,
  SystemStyleObject,
} from "@chakra-ui/react";

const linkRecipe = defineRecipe<{
  variant: { underline: SystemStyleObject; plain: SystemStyleObject };
}>({
  defaultVariants: {
    variant: "underline",
  },
});

export const theme = createSystem(defaultConfig, {
  theme: {
    recipes: {
      link: linkRecipe,
    },
  },
});
