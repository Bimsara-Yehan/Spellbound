import type { Config } from "tailwindcss";
import preset from "@spellbound/config/tailwind/preset";

const config: Config = {
  presets: [preset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};

export default config;
