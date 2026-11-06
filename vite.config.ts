import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * The Hairline kernel is vendored byte-for-byte (app/vendor/hairline/kernel.js,
 * MIT). It declares `var HL` as a classic script; this transform appends one
 * export line at build time so the file on disk stays untouched.
 */
function hairlineKernel(): Plugin {
  return {
    name: "nyro:hairline-kernel",
    enforce: "pre",
    transform(code, id) {
      if (!/[/\\]app[/\\]vendor[/\\]hairline[/\\]kernel\.js(\?.*)?$/.test(id)) return null;
      return { code: `${code}\nexport default HL;\n`, map: null };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.SITE_URL || "http://localhost:5173").replace(/\/+$/, "");
  const robotsAllow = env.ROBOTS_ALLOW !== "false";

  return {
    plugins: [hairlineKernel(), tailwindcss(), !process.env.VITEST && reactRouter()],
    resolve: {
      alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) },
    },
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
      __ROBOTS_ALLOW__: JSON.stringify(robotsAllow),
      __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
    },
    build: {
      cssMinify: true,
      chunkSizeWarningLimit: 250,
    },
    test: {
      include: ["tests/unit/**/*.test.ts"],
      environment: "node",
    },
  };
});
