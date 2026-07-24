import type { Config } from "tailwindcss";
import preset from "@spellbound/config/tailwind/preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}"],
};

export default config;
