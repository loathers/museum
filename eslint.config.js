// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat["jsx-runtime"],
  {
    ignores: ["public/build", "build"],
  },
);
