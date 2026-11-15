import shell from "../../index.html?raw";
import { afterEach, describe, expect, it, vi } from "vitest";
import SiteSEO from "@/components/site/SiteSEO";
import { LATEST_PROJECT_SLUGS } from "@/content/caseStudies";

vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));

afterEach(() => vi.unstubAllGlobals());

describe("route-owned canonical URLs", () => {
  it("does not advertise homepage canonical or hreflang from the generic shell", () => {
    expect(shell).not.toMatch(/<link\b[^>]*rel=["']canonical["']/i);
    expect(shell).not.toMatch(/<link\b[^>]*hreflang=/i);
  });

  it.each(["/projects", ...LATEST_PROJECT_SLUGS.map(slug => `/case-studies/${slug}`)])("creates and reuses exactly one custom-domain canonical for %s", path => {
    const tags: { attrs: Record<string, string>; setAttribute: (key: string, value: string) => void }[] = [];
    const querySelector = (selector: string) => tags.find(tag => {
      const attribute = selector.match(/\[(\w+)='([^']+)'\]/);
      return attribute ? tag.attrs[attribute[1]] === attribute[2] : false;
    }) ?? null;
    vi.stubGlobal("document", {
      title: "",
      head: { querySelector, appendChild: (tag: typeof tags[number]) => tags.push(tag) },
      querySelector,
      createElement: () => {
        const attrs: Record<string, string> = {};
        return { attrs, setAttribute: (key: string, value: string) => { attrs[key] = value; } };
      },
    });
    SiteSEO({ title: "Projects", description: "Project overview", path: "/projects" });
    SiteSEO({ title: "Project", description: "Project scope", path });
    const canonicals = tags.filter(tag => tag.attrs.rel === "canonical");
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]?.attrs.href).toBe(`https://siyakhatechnology.co.za${path}`);
  });
});