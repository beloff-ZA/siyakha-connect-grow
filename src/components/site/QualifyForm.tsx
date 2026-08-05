import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ClientType = "Estates" | "Commercial" | "Schools" | "Government" | "Other";
type Region = "South Africa" | "GCC" | "UK" | "Other";

const QualifyForm = () => {
  const location = useLocation();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<Region>("South Africa");
  const [clientType, setClientType] = useState<ClientType>("Estates");
  const [timeline, setTimeline] = useState("0–3 months");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("type");
    if (t) {
      const map: Record<string, ClientType> = {
        estates: "Estates",
        commercial: "Commercial",
        schools: "Schools",
        government: "Government",
      };
      const v = map[t.toLowerCase()];
      if (v) setClientType(v);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-enquiry", {
        body: { name, company, email: emailAddr, phone, region, clientType, timeline, message },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Thanks — we'll be in touch shortly.");
      setName("");
      setCompany("");
      setEmailAddr("");
      setPhone("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try WhatsApp on 081 501 2993.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border px-4 py-3 text-sm focus:outline-none transition-colors";
  const darkFieldCls =
    `${inputCls} bg-foreground text-background placeholder:text-background/50 border-background/35 focus:border-background`;
  const darkSelectCls = `${darkFieldCls} [color-scheme:dark]`;

  return (
    <section id="qualify" className="bg-foreground text-background scroll-mt-24">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
              Talk to us
            </p>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
              Tell us about
              <br />
              <span className="italic font-extralight">your project.</span>
            </h2>
            <p className="mt-8 text-background/70 leading-relaxed max-w-md">
              A short form so we can route your enquiry to the right team on the first call. No
              generic sales sequence — the answers below get a named reply within one business day.
            </p>
            <div className="mt-10 text-[13px] text-background/70 space-y-2">
              <p>Nikita Jacobs · nikita@siyakhatechnology.co.za</p>
              <p>+27 81 501 2993 · +971 50 867 3469</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={darkFieldCls}
              />
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className={darkFieldCls}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                placeholder="Email"
                className={darkFieldCls}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={darkFieldCls}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className={darkSelectCls}
              >
                <option>South Africa</option>
                <option>GCC</option>
                <option>UK</option>
                <option>Other</option>
              </select>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className={darkSelectCls}
              >
                <option>Estates</option>
                <option>Commercial</option>
                <option>Schools</option>
                <option>Government</option>
                <option>Other</option>
              </select>
            </div>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className={darkSelectCls}
            >
              <option>0–3 months</option>
              <option>3–6 months</option>
              <option>6–12 months</option>
              <option>12+ months / planning</option>
            </select>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about the site, scope, and what you're trying to solve."
              rows={5}
              className={`${darkFieldCls} resize-none`}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-background text-foreground px-8 py-4 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QualifyForm;