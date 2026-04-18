import { BookOpen } from "lucide-react";

const FaithSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
        <div className="text-center">
          <BookOpen className="mx-auto h-8 w-8 text-accent mb-5" strokeWidth={1.5} />
          <p className="overline mb-5">Our Faith &amp; Guiding Principles</p>
          <h2 className="font-display font-light text-3xl md:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground max-w-3xl mx-auto">
            With God, we will go far —
            <br />
            <span className="italic text-accent">build, grow</span> and trust Him through everything.
          </h2>

          {/* Arabic translation */}
          <p
            dir="rtl"
            lang="ar"
            className="mt-8 font-display text-xl md:text-2xl text-foreground/85 leading-[1.8] max-w-3xl mx-auto"
          >
            بِعَوْنِ اللهِ نَمْضِي بَعِيدًا، نَبْنِي وَنَنْمُو، وَنَتَوَكَّلُ عَلَيْهِ فِي كُلِّ شَيْءٍ.
          </p>

          <p className="mt-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every project we touch — from Johannesburg to Dubai — is built on the
            conviction that faithful work, done with excellence, becomes a quiet
            testimony. We trust God with the outcome and labour with our hands.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaithSection;

