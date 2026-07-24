import { FlatCompat } from "@eslint/eslintrc";
import base from "@spellbound/config/eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ["next-env.d.ts"] },
  ...base,
  ...compat.extends("next/core-web-vitals"),
];

export default config;
