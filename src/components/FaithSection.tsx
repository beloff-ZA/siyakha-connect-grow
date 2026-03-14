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
    <section className="py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <BookOpen className="mx-auto h-10 w-10 text-accent mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Our Faith & Guiding Principles
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
          Trust God, stay faithful in all actions. Let your efforts and your work
          reflect the power of God in action — He will build and create
          opportunities.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          {verses.map((v) => (
            <blockquote
              key={v.ref}
              className="bg-card border border-border rounded-xl p-5"
            >
              <p className="text-foreground italic mb-3">"{v.text}"</p>
              <cite className="text-sm text-accent font-semibold not-italic">
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
