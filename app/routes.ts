import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("xizmatlar/:slug", "routes/service.tsx"),
  route("loyihalar/:slug", "routes/project.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
