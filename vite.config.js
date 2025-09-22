import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: ["crm.trader.abisibg.com","crm-trader.abisibg.com", "crm-trader-dev.abisexport.com"],
    port: 3009,
    strictPort: true,
  },
});
