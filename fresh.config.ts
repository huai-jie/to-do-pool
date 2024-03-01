import tailwind from "$fresh/plugins/tailwind.ts";
import type { FreshConfig } from "$fresh/server.ts";

export default {
  plugins: [
    tailwind(),
  ],
  port: 8000
} satisfies FreshConfig;
