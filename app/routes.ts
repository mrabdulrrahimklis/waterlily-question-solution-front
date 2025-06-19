import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/pool.tsx"),
    route("/pool/:id", "routes/singlePool.tsx"),
    route("/pool/submit/:id", "routes/submitPool.tsx"),
  ]),
] satisfies RouteConfig;
