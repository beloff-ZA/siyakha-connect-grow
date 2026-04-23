import farmImage from "@/assets/farm-solutions-banner.png";

const FarmSolutionsBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10">
      <img
        src={farmImage}
        alt="Siyakha Farm Solutions — livestock tracking, crop monitoring, farm connectivity, solar infrastructure, perimeter security and water management for agriculture across South Africa and EMEA"
        className="w-full h-auto block"
        loading="lazy"
      />
    </section>
  );
};

export default FarmSolutionsBanner;
