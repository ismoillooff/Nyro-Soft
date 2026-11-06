import type { Config } from "@react-router/dev/config";
import { finalizeBuild } from "./scripts/build-end";
import { projects } from "./app/content/projects";
import { services } from "./app/content/services";

/** Every public URL, rendered to HTML at build time. */
export function staticPaths(): string[] {
  return [
    "/",
    ...services.map((s) => `/xizmatlar/${s.slug}`),
    ...projects.map((p) => `/loyihalar/${p.slug}`),
    "/404",
  ];
}

export default {
  ssr: false,
  prerender: staticPaths,
  routeDiscovery: { mode: "initial" },
  buildEnd: async ({ viteConfig, reactRouterConfig }) => {
    await finalizeBuild({
      buildDirectory: reactRouterConfig.buildDirectory,
      viteConfig,
      paths: staticPaths().filter((p) => p !== "/404"),
    });
  },
} satisfies Config;
