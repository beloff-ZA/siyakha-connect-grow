import solarImage from "@/assets/solar-surveillance-banner.png";
import InteractiveSectorBanner from "./InteractiveSectorBanner";

const SolarSurveillanceBanner = () => {
  return (
    <InteractiveSectorBanner
      image={solarImage}
      imageAlt="Siyakha Solar Surveillance — off-grid solar-powered AI cameras for crop monitoring, livestock protection, perimeter security and remote land surveillance with 4K thermal optics and LTE streaming"
      eyebrow="03 — Off-Grid Security"
      titleItalic="Solar"
      titleBold="Surveillance"
      tagline="Off-grid eyes on your land — solar-powered AI cameras protect crops, livestock and remote infrastructure with no trenching, no grid power and no blind spots."
      features={[
        { label: "Solar-Powered", detail: "Fully off-grid towers with battery backup — deploy anywhere the sun shines, no civils or grid connection required." },
        { label: "AI Detection", detail: "On-camera AI distinguishes people, vehicles and animals — only verified threats trigger alerts, drastically cutting false alarms." },
        { label: "4K Thermal", detail: "Day-and-night clarity with thermal optics — see in total darkness, smoke, dust and harsh weather." },
        { label: "LTE Streaming", detail: "Live remote viewing from any device over LTE — watch your fields from anywhere in the world." },
        { label: "Crop Monitoring", detail: "Time-lapse and event capture for growth, irrigation and damage — visual evidence for insurance and decisions." },
        { label: "Instant Alerts", detail: "Push notifications to your phone and direct routing to our 24/7 command centre for armed response dispatch." },
      ]}
      ctaLabel="Deploy a tower"
    />
  );
};

export default SolarSurveillanceBanner;
