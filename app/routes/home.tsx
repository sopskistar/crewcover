import { Navigate } from "react-router";

import { APP_TITLE } from "@/lib/app-config";

const SEO_TITLE = `${APP_TITLE} · Event operations`;
const SEO_DESCRIPTION =
  "Review event coverage and approve qualified staffing repairs.";

export function meta() {
  return [
    { title: SEO_TITLE },
    {
      name: "description",
      content: SEO_DESCRIPTION,
    },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

export default function HomeRoute() {
  return <Navigate to="/operations" replace />;
}
