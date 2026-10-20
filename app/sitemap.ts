import type { MetadataRoute } from "next";
import { BASE, PAGINAS } from "@/lib/seo";

// lastmod vem da data real de cada página (lib/seo.ts), não da hora do build.
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(PAGINAS).map(([path, p]) => ({
    url: path === "/" ? `${BASE}/` : `${BASE}${path}`,
    lastModified: p.modificado,
    changeFrequency: p.frequencia,
    priority: p.prioridade,
  }));
}
