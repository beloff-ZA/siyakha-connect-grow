import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Boikano Pule",
      role: "Client",
      company: "siyakhatechnology.co.za",
      content: "These folks turned our digital dreams into reality! Emails flowing smoothly, website looking slick. Seriously, they're the email and website superheroes we didn't know we needed. Highly recommend!",
      rating: 5,
      avatar: "BP",
    },
    {
      name: "Mandy Laing",
      role: "Client",
      company: "Siyakha Technology",
      content: "I've had so many bad experiences with tech companies. I must say Siyakha is the best company for all things technology and computers. They are efficient, reliable and professional. With great customer support.",
      rating: 5,
      avatar: "ML",
    },
    {
      name: "Emmy Trish",
      role: "Client",
      company: "The Pelican Club, Bahrain",
      content: "We had an urgent printer issue at The Pelican Club here in Bahrain and reached out to Siyakha Technology for help. Their team responded instantly — they connected remotely and resolved everything quickly.",
      rating: 5,
      avatar: "ET",
    },
    {
      name: "Mfundo",
      role: "School Administrator",
      company: "Marist Brothers School",
      content: "Siyakha Technology has been a trusted partner for our major ICT needs at the school. Their expertise, responsiveness, and dedication give us confidence that our technology is in the best hands.",
      rating: 5,
      avatar: "M",
    },
    {
      name: "Brian",
      role: "Operations Lead",
      company: "Zizwe DSD",
      content: "At Zizwe DSD, Siyakha has been instrumental in managing our complete IT ecosystem—networking, VoIP, internet support, antivirus, and Office 365 services.",
      rating: 5,
      avatar: "B",
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Large Quote Mark */}
          <Quote className="w-20 h-20 text-accent/20 mb-8" strokeWidth={1} />

          {/* Testimonial Content */}
          <div className="min-h-[200px] mb-12">
            <blockquote
              className="text-2xl md:text-3xl lg:text-4xl font-medium text-primary leading-snug mb-8"
              aria-live="polite"
            >
              "{testimonials[currentIndex].content}"
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                {testimonials[currentIndex].avatar}
              </div>
              <div>
                <div className="font-bold text-primary text-lg">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-muted-foreground">
                  {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                </div>
              </div>
              <div className="ml-auto flex gap-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-8">
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-12 h-1 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-accent' : 'bg-border'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-border max-w-4xl mx-auto">
          <div className="stat-block">
            <div className="stat-value">98%</div>
            <div className="stat-label">Retention</div>
          </div>
          <div className="stat-block">
            <div className="stat-value">4.9</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-block">
            <div className="stat-value">&lt;24h</div>
            <div className="stat-label">Response</div>
          </div>
          <div className="stat-block">
            <div className="stat-value">100%</div>
            <div className="stat-label">On-Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
