import farmImage from "@/assets/farm-solutions-banner.png";
import InteractiveSectorBanner from "./InteractiveSectorBanner";

const FarmSolutionsBanner = () => {
  return (
    <InteractiveSectorBanner
      image={farmImage}
      imageAlt="Siyakha Farm Solutions — livestock tracking, crop monitoring, farm connectivity, solar infrastructure, perimeter security and water management for agriculture across South Africa and EMEA"
      eyebrow="02 — Agri Infrastructure"
      titleItalic="Farm"
      titleBold="Solutions"
      tagline="Smart agri-tech for connected land — protect livestock, monitor crops and digitise operations across remote acres with rugged, off-grid-ready infrastructure."
      features={[
        { label: "Livestock Tracking", detail: "GPS-collared herd monitoring with geofencing, theft alerts and grazing pattern analytics — see every animal from one dashboard." },
        { label: "Crop Monitoring", detail: "Soil moisture, temperature and growth sensors feeding real-time analytics — irrigate smarter and catch problems before they spread." },
        { label: "Farm Connectivity", detail: "Long-range WiFi mesh and LTE backhaul covering hundreds of hectares — homestead, sheds and remote camps online." },
        { label: "Solar Infrastructure", detail: "Off-grid solar with battery backup powering cameras, gates, pumps and connectivity — independent of Eskom." },
        { label: "Perimeter Security", detail: "AI cameras, beam detection and 5km border radar with verified alerts dispatched to command centre and on-site response." },
        { label: "Water Management", detail: "Smart irrigation, leak detection and remote pump control — measure every litre and respond in seconds." },
      ]}
      ctaLabel="Protect my farm"
    />
  );
};

export default FarmSolutionsBanner;
