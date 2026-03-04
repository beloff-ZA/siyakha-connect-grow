import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GiveBack = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Heart className="mx-auto h-14 w-14 mb-6 text-accent" />
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Give Back</h1>
          <p className="text-lg md:text-xl opacity-90">
            Siyakha Technology encourages anonymous and direct donations to
            Gift&nbsp;of&nbsp;the&nbsp;Givers — Africa's largest disaster-response NGO.
          </p>
        </div>
      </section>

      {/* Donation section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <img
            src="/images/gift-of-givers-qr.png"
            alt="Scan to pay – Gift of the Givers"
            className="mx-auto w-56 h-56 md:w-64 md:h-64 rounded-xl shadow-md mb-8"
          />

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Scan to Donate
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Use the QR code above to make an instant donation via Masterpass, or
            click the button below to donate online. Every contribution — big or
            small — makes a difference.
          </p>

          <Button
            asChild
            size="lg"
            className="cta-primary text-base px-8"
          >
            <a
              href="https://giftofthegivers.org/make-a-difference/donate-with-masterpass/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate on Gift of the Givers
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <p className="mt-10 text-sm text-muted-foreground">
            Siyakha Technology does not process or handle any donations.
            All funds go directly to{" "}
            <a
              href="https://giftofthegivers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-accent hover:text-accent/80"
            >
              Gift&nbsp;of&nbsp;the&nbsp;Givers
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GiveBack;
