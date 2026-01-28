const logos = [
  { name: "Marist Brothers", path: "/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png" },
  { name: "KFC", path: "/lovable-uploads/e34b216a-0325-45dd-996f-b6b727e542ee.png" },
  { name: "Village Bakery", path: "/lovable-uploads/dfdcf468-60c2-4f7c-8f51-8ac52f9789ae.png" },
  { name: "Greestone", path: "/lovable-uploads/5bd4b5cb-7c24-44d6-8df7-89a1f3a76c1f.png" },
  { name: "CampusKey", path: "/lovable-uploads/ab10f531-3c98-4fc1-9d19-dff2ea49d639.png" },
];

const ClientLogos = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
          Trusted by leading organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={logo.path}
                alt={logo.name}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
