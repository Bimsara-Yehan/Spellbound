import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@spellbound/ui", "@spellbound/api-client"],
  // Pins the workspace root explicitly - without this, Next.js can pick the
  // wrong root if a stray lockfile exists elsewhere on the machine (e.g. in
  // the user's home directory), which breaks output file tracing.
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
};

export default nextConfig;
