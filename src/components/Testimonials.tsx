import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "I've had so many bad experiences with tech companies. I must say Siyakha is the best company for all things technology and computers. They are efficient, reliable and professional. With great customer support.",
    author: "Mandy Laing",
    role: "Client",
    company: "Siyakha Technology",
    rating: 5,
  },
  {
    quote: "We had an urgent printer issue at The Pelican Club here in Bahrain and reached out to Siyakha Technology for help. Their team responded instantly — they connected remotely and resolved everything quickly.",
    author: "Emmy Trish",
    role: "Manager",
    company: "The Pelican Club, Bahrain",
    rating: 5,
  },
  {
    quote: "Siyakha Technology has been a trusted partner for our major ICT needs at the school. Their expertise, responsiveness, and dedication give us confidence that our technology is in the best hands.",
    author: "Mfundo",
    role: "School Administrator",
    company: "Marist Brothers School",
    rating: 5,
  },
  {
    quote: "At Zizwe DSD, Siyakha has been instrumental in managing our complete IT ecosystem—networking, VoIP, internet support, antivirus, and Office 365 services. Their team is always responsive and reliable.",
    author: "Brian",
    role: "Operations Lead",
    company: "Zizwe DSD",
    rating: 5,
  },
  {
    quote: "These folks turned our digital dreams into reality! Emails flowing smoothly, website looking slick. Seriously, they're the email and website superheroes we didn't know we needed. Highly recommend!",
    author: "Boikano Pule",
    role: "Client",
    company: "Business Owner",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Client Stories
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              What Our Clients Say
            </h2>
          </div>

          <div className="relative">
            {/* Quote Icon */}
            <Quote className="w-16 h-16 text-accent/30 absolute -top-6 -left-4" />

            {/* Testimonial Card */}
            <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-primary-foreground/10">
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-primary-foreground leading-relaxed mb-8">
                "{current.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary-foreground text-lg">{current.author}</p>
                  <p className="text-primary-foreground/70">
                    {current.role}, {current.company}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentIndex
                      ? "w-8 bg-accent"
                      : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
