import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import BlogViews from "@/components/BlogViews";

const BlogPreview = ({ showCount }: { showCount?: number }) => {
  const articles = [
    {
      title: "DRaaS: Disaster Recovery as a Service - Complete Guide 2025",
      excerpt: "Discover how DRaaS ensures business continuity with cloud-based backup solutions.",
      date: "January 20, 2025",
      readTime: "8 min read",
      category: "Business Continuity",
      link: "/blog/draas",
      featured: true
    },
    {
      title: "Classroom Playback Technology: Bringing the Soccer Replay Advantage to Education",
      excerpt: "Zoom-integrated lesson replays with AI transcripts—replay, search, and learn.",
      date: "June 2025",
      readTime: "6 min read",
      category: "EdTech",
      link: "/blog/classroom-playback-technology-zoom-ai-lesson-replay",
      featured: true
    },
    {
      title: "Field Support & Smart Hands Services in South Africa",
      excerpt: "Reliable on-site IT support for franchises, SaaS, hospitality and logistics.",
      date: "January 25, 2025",
      readTime: "6 min read",
      category: "Field Support",
      link: "/blog/field-support-and-smart-hands-services-south-africa",
      featured: true
    },
    {
      title: "Understanding the Power of AI in Modern Business and Education",
      excerpt: "AI is transforming work and learning. See how to safely harness AI for impact.",
      date: "July 12, 2019",
      readTime: "6 min read",
      category: "AI",
      link: "/blog/understanding-the-power-of-ai-in-modern-business-and-education",
      featured: false
    }
  ];

  const list = showCount ? articles.slice(0, showCount) : articles.slice(0, 4);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="divider-bold mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight leading-[1.1]">
            Latest Insights
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Stay informed with expert advice, industry trends, and technology insights.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {list.map((article, index) => (
            <Link 
              key={index}
              to={article.link}
              className="group block p-8 bg-secondary rounded-xl hover:bg-accent/5 transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
                  {article.category}
                </span>
                <span className="text-sm text-muted-foreground">{article.date}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors leading-tight">
                {article.title}
              </h3>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                  <BlogViews slug={article.link} />
                </div>
                <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="font-semibold group">
            <Link to="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
