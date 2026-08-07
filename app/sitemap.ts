import type { MetadataRoute } from "next";

const BASE = "https://itsm.sysaid.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/sistema-de-chamados`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/o-que-e-itsm`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/glpi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/freshdesk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/zendesk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/jira`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/movidesk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/topdesk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
