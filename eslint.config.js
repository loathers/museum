// @ts-check
import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat["jsx-runtime"],
  {
    ignores: ["public/build", "build"],
  },
);
