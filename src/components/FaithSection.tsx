import { BookOpen } from "lucide-react";

const verses = [
  {
    text: "Commit to the Lord whatever you do, and He will establish your plans.",
    ref: "Proverbs 16:3",
  },
  {
    text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
    ref: "Galatians 6:9",
  },
  {
    text: "Whatever you do, work heartily, as for the Lord and not for men.",
    ref: "Colossians 3:23",
  },
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    ref: "Jeremiah 29:11",
  },
];

const FaithSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-5xl">
        <div className="text-center mb-14">
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

        <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
          {verses.map((v) => (
            <blockquote
              key={v.ref}
              className="bg-background p-7 md:p-8"
            >
              <p className="font-display text-lg md:text-xl font-light text-foreground leading-snug mb-4">
                &ldquo;{v.text}&rdquo;
              </p>
              <cite className="text-[11px] uppercase tracking-[0.22em] text-accent not-italic">
                — {v.ref}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaithSection;
