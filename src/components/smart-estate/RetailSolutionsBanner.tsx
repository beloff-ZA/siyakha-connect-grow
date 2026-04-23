import retailImage from "@/assets/retail-solutions-banner.png";

const RetailSolutionsBanner = () => {
  return (
    <section className="relative bg-background border-t border-foreground/10">
      <img
        src={retailImage}
        alt="Siyakha Retail Solutions — point of sale, inventory management, payment solutions, connectivity, security and surveillance for retail businesses across South Africa and EMEA"
        className="w-full h-auto block"
        loading="lazy"
      />
    </section>
  );
};

export default RetailSolutionsBanner;
