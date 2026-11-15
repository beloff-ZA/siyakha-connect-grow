import { describe, expect, it } from "vitest";
import shell from "../../index.html?raw";
import { buildLocalBusinessSchema, buildServiceSchema, SERVICE_AREAS } from "./seoSchema";

describe("confirmed KZN coverage", () => {
  it.each(["Richards Bay", "Empangeni", "Jozini", "Eshowe"])("includes %s as a service area rather than a premises address", name => {
    expect(SERVICE_AREAS.find(area => area.name === name)?.region).toBe("KwaZulu-Natal");
    const local = buildLocalBusinessSchema();
    const service = buildServiceSchema({ serviceType: "IT support", description: "Support", path: "/managed-it" });
    expect(local.areaServed.some(area => area.name === name)).toBe(true);
    expect(service.areaServed.some(area => area.name === name)).toBe(true);
    expect(local.address).toEqual({ "@type": "PostalAddress", addressRegion: "Gauteng", addressCountry: "ZA" });
    const json = [...shell.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const org = json.find(item => item["@type"] === "ProfessionalService");
    expect(org.areaServed.some((area: { name: string }) => area.name === name)).toBe(true);
    expect(org.address.streetAddress).toBeUndefined();
  });
});