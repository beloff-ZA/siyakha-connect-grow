import solarImage from "@/assets/solar-surveillance-banner.png";

const SolarSurveillanceBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10">
      <img
        src={solarImage}
        alt="Siyakha Solar Surveillance — off-grid solar-powered AI cameras for crop monitoring, livestock protection, perimeter security and remote land surveillance with 4K thermal optics and LTE streaming"
        className="w-full h-auto block"
        loading="lazy"
      />
    </section>
  );
};

export default SolarSurveillanceBanner;
