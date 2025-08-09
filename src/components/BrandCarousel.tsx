import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const logos = [
  { src: "/lovable-uploads/ab10f531-3c98-4fc1-9d19-dff2ea49d639.png", alt: "MikroTik logo" },
  { src: "/lovable-uploads/4f3ad49c-5df2-4a9e-be7b-19e242202b1f.png", alt: "Lenovo logo" },
  { src: "/lovable-uploads/f638f406-44d9-42a7-8f35-fc4678930328.png", alt: "Hikvision logo" },
  { src: "/lovable-uploads/b0e40c4d-73a7-46ae-8e4e-d4e603c9513a.png", alt: "Grandstream logo" },
  { src: "/lovable-uploads/b5123bb8-e9c6-4737-bd9b-3e6d9a97df2e.png", alt: "TP-Link logo" },
  { src: "/lovable-uploads/2b4ffa3c-019a-4a23-bf18-e2241963773f.png", alt: "Cisco Meraki logo" }
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
                      className="h-full max-w-[160px] object-contain filter grayscale brightness-0"
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
