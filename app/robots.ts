import type { MetadataRoute } from "next";

const BASE = "https://itsm.sysaid.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Área interna e páginas de pós-conversão não devem ser indexadas.
        disallow: ["/admin", "/api/", "/obrigado"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
