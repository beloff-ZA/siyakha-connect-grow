import retailImage from "@/assets/retail-solutions-banner.png";
import InteractiveSectorBanner from "./InteractiveSectorBanner";

const RetailSolutionsBanner = () => {
  return (
    <InteractiveSectorBanner
      image={retailImage}
      imageAlt="Siyakha Retail Solutions — point of sale, inventory management, payment solutions, connectivity, security and surveillance for retail businesses across South Africa and EMEA"
      eyebrow="01 — Commerce Infrastructure"
      titleItalic="Retail"
      titleBold="Solutions"
      tagline="Smart technology and seamless operations for stores, franchises and quick-service brands — POS, payments, inventory, connectivity and surveillance, deployed turnkey."
      features={[
        { label: "Point of Sale", detail: "Fast, reliable touchscreen POS terminals with offline failover, integrated card payments and real-time sync to head office." },
        { label: "Inventory", detail: "Live stock visibility across every store, automatic reorder triggers and consolidated reporting on what sells, where and when." },
        { label: "Payments", detail: "Secure card, tap-to-pay and mobile wallet acceptance — fully PCI compliant with same-day settlement options." },
        { label: "Connectivity", detail: "Dual-link fibre and LTE failover keeping tills, cameras and back-office online even when the primary line drops." },
        { label: "Surveillance", detail: "AI cameras across the floor and storeroom — loss prevention, dwell-time analytics and verified alerts to the command centre." },
        { label: "Support", detail: "24/7 help desk and on-site response across the region — one number, one team, one accountable partner." },
      ]}
      ctaLabel="Build my retail stack"
    />
  );
};

export default RetailSolutionsBanner;
