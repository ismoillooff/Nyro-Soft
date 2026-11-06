import { index, prefix, route, type RouteConfig } from "@react-router/dev/routes";
import { isEnabled } from "./i18n/types";

/** Uzbek at the root; Russian under /ru once its translation is complete. */
export default [
  index("routes/home.tsx"),
  route("xizmatlar/:slug", "routes/service.tsx"),
  route("loyihalar/:slug", "routes/project.tsx"),
  ...(isEnabled("ru")
    ? prefix("ru", [
        index("routes/home.tsx", { id: "ru-home" }),
        route("xizmatlar/:slug", "routes/service.tsx", { id: "ru-service" }),
        route("loyihalar/:slug", "routes/project.tsx", { id: "ru-project" }),
      ])
    : []),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
