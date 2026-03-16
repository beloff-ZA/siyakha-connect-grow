import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return new Response(JSON.stringify({ error: "Domain is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean domain input
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/.*$/, "")
      .trim();

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/;
    if (!domainRegex.test(cleanDomain)) {
      return new Response(
        JSON.stringify({ available: false, domain: cleanDomain, reason: "Invalid domain format" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try DNS lookup - if no records exist, domain is likely available
    try {
      const dnsResponse = await fetch(
        `https://dns.google/resolve?name=${cleanDomain}&type=A`
      );
      const dnsData = await dnsResponse.json();

      // Status 3 = NXDOMAIN (domain doesn't exist) → likely available
      // Status 0 with answers = domain exists → taken
      if (dnsData.Status === 3) {
        return new Response(
          JSON.stringify({ available: true, domain: cleanDomain, message: "Domain appears to be available for registration!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (dnsData.Status === 0 && dnsData.Answer && dnsData.Answer.length > 0) {
        return new Response(
          JSON.stringify({ available: false, domain: cleanDomain, message: "Domain is already registered." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Ambiguous - might be available
        return new Response(
          JSON.stringify({ available: null, domain: cleanDomain, message: "Unable to confirm availability. We'll verify this for you manually." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ available: null, domain: cleanDomain, message: "Could not check domain right now. We'll verify manually." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
