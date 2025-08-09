import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const logos = [
  { src: "/brands/cisco.svg", alt: "Cisco logo" },
  { src: "/brands/dell.svg", alt: "Dell logo" },
  { src: "/brands/cisco.svg", alt: "Cisco logo" },
  { src: "/brands/dell.svg", alt: "Dell logo" }
];

const BrandCarousel = () => {
  return (
    <section aria-labelledby="brands-heading" className="py-12 md:py-16 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 id="brands-heading" className="text-center text-sm font-medium text-muted-foreground tracking-widest uppercase">Trusted Technology Brands</h2>
        <div className="mt-6">
          <Carousel opts={{ align: "start", loop: true }} className="relative">
            <CarouselContent>
              {logos.map((logo, i) => (
                <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                  <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-center">
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-full max-w-[140px] object-contain filter grayscale brightness-0"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" aria-label="Previous brands" />
            <CarouselNext className="hidden md:flex" aria-label="Next brands" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
