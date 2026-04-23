import waterImage from "@/assets/smart-water-reading-banner.png";

const SmartWaterBanner = () => {
  return (
    <section className="relative bg-background border-t border-border">
      <div className="relative w-full overflow-hidden">
        <img
          src={waterImage}
          alt="Siyakha Smart Water Reading — real-time monitoring, leak detection, consumption analytics, remote access and secure reliable infrastructure"
          className="w-full h-auto block"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default SmartWaterBanner;
