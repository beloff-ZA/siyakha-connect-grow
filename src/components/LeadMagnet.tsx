import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ctaVideo from "@/assets/cta-video.mp4";

const LeadMagnet = () => {
  const benefits = [
    "Free technology assessment",
    "Custom solution recommendations", 
    "No obligation pricing",
    "30-minute expert consultation"
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={ctaVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Content Side */}
                <div className="p-8 lg:p-12 bg-white">
                  <div className="mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      Free Consultation Available
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                      Need an ICT Partner You Can Trust?
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We offer free consultations for businesses ready to level up their tech. 
                      Let's discuss your challenges and explore solutions together.
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/contact#quote-form" className="inline-flex w-full sm:w-auto">
                    <Button className="cta-primary text-lg px-8 py-4 w-full sm:w-auto group">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book My Free Consultation
                    </Button>
                  </Link>

                  <p className="text-sm text-muted-foreground mt-4">
                    No spam, no sales pressure. Just expert advice tailored to your business.
                  </p>
                </div>

                {/* Visual Side */}
                <div className="bg-gradient-to-br from-accent to-accent-hover p-8 lg:p-12 text-white flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-90" />
                      <h3 className="text-2xl font-bold mb-2">Join 100+ Happy Clients</h3>
                      <p className="opacity-90">
                        Businesses across South Africa trust us with their technology infrastructure.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div className="bg-white/10 rounded-lg p-4">
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-xl font-bold">30 min</div>
                        <div className="text-sm opacity-90">Consultation</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-xl font-bold">Free</div>
                        <div className="text-sm opacity-90">Assessment</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-12">
          <p className="text-white/80 text-sm mb-4">
            "Best decision we made for our IT infrastructure" - Recent Client
          </p>
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <CheckCircle key={i} className="w-4 h-4 text-accent" />
            ))}
            <span className="text-white/80 text-sm ml-2">Rated 5/5 by our clients</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;