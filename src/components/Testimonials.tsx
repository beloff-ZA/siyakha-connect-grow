import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Boikano Pule",
      role: "Client",
      company: "siyakhatechnology.co.za",
      content:
        "These folks turned our digital dreams into reality! Emails flowing smoothly, website looking slick. Seriously, they're the email and website superheroes we didn't know we needed. Highly recommend!",
      rating: 5,
      avatar: "BP",
    },
    {
      name: "Mandy Laing",
      role: "Client",
      company: "Siyakha Technology",
      content:
        "I've had so many bad experiences with tech companies. I must say Siyakha is the best company for all things technology and computers. They are efficient, reliable and professional. With great customer support. I highly recommend them.",
      rating: 5,
      avatar: "ML",
    },
    {
      name: "Emmy Trish",
      role: "Client",
      company: "The Pelican Club, Bahrain",
      content:
        "We had an urgent printer issue at The Pelican Club here in Bahrain and reached out to Siyakha Technology for help. Their team responded instantly — they connected remotely and resolved everything quickly and professionally. The support was smooth, efficient, and incredibly reassuring. It's great to work with a team that delivers results across borders.",
      rating: 5,
      avatar: "ET",
    },
    {
      name: "Mfundo",
      role: "School Administrator",
      company: "Marist Brothers School",
      content:
        "Siyakha Technology has been a trusted partner for our major ICT needs at the school. Their expertise, responsiveness, and dedication give us confidence that our technology is in the best hands.",
      rating: 5,
      avatar: "M",
    },
    {
      name: "Brian",
      role: "Operations Lead",
      company: "Zizwe DSD",
      content:
        "At Zizwe DSD, Siyakha has been instrumental in managing our complete IT ecosystem—networking, VoIP, internet support, antivirus, and Office 365 services. They also helped upgrade our website, ensuring everything runs smoothly and securely. We couldn’t ask for a more dependable ICT partner.",
      rating: 5,
      avatar: "B",
    },
    {
      name: "Benedict",
      role: "Client",
      company: "Helpdesk Review",
      content:
        "Ben was very quick in resolving my issue. Excellent service and very responsive — 5 stars all the way!",
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            What Johannesburg Businesses Say About Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from clients across education, retail, and businesses in the Northern Suburbs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Card className="border-2 border-accent/20 shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-6">
                  <Quote className="w-8 h-8 text-accent opacity-60" />
                  <div className="flex space-x-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>

                <blockquote
                  className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic min-h-28"
                  aria-live="polite"
                  role="status"
                >
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonials[currentIndex].avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-primary text-lg">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-muted-foreground">
                        {testimonials[currentIndex].role}
                      </div>
                      <div className="text-sm text-accent">
                        {testimonials[currentIndex].company}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevTestimonial}
                      className="w-10 h-10 p-0"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextTestimonial}
                      className="w-10 h-10 p-0"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Client Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">&lt;24hr</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">100%</div>
              <div className="text-sm text-muted-foreground">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;