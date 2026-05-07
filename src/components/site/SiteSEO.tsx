import { useEffect } from "react";

const CANONICAL_DOMAIN = "https://siyakhatechnology.co.za";

interface Props {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
}

const SiteSEO = ({ title, description, path, jsonLd }: Props) => {
  useEffect(() => {
    document.title = title;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${CANONICAL_DOMAIN}${path}`);
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${CANONICAL_DOMAIN}${path}`);
  }, [title, description, path]);

  if (!jsonLd) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default SiteSEO;