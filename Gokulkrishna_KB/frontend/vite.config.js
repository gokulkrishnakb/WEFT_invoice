
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      "creative-miracle-production-13229de7.up.railway.app"
    ]
  }
});
