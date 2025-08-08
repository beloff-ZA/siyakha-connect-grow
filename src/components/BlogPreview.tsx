import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, ArrowRight, Clock } from "lucide-react";

const BlogPreview = () => {
  const articles = [
    {
      title: "5 Signs Your Business Needs a Wi-Fi Upgrade",
      excerpt: "Is your current network holding back productivity? Learn the key indicators that it's time to modernize your wireless infrastructure.",
      date: "January 15, 2025",
      readTime: "5 min read",
      category: "Networking",
      link: "/blog/5-signs-wifi-upgrade",
      featured: true
    },
    {
      title: "CCTV Compliance for Schools in 2025",
      excerpt: "Navigate the latest security regulations and best practices for educational institutions with our comprehensive compliance guide.",
      date: "January 12, 2025", 
      readTime: "8 min read",
      category: "Security",
      link: "/blog/cctv-compliance-schools-2025",
      featured: false
    },
    {
      title: "Affordable Cloud Solutions for SMEs",
      excerpt: "Discover cost-effective cloud strategies that can transform your small business operations without breaking the budget.",
      date: "January 10, 2025",
      readTime: "6 min read",
      category: "Cloud",
      link: "/blog/affordable-cloud-solutions-smes",
      featured: false
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Latest Insights & Updates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed with expert advice, industry trends, and technology insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {articles.map((article, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                article.featured ? 'lg:col-span-2 lg:row-span-1' : ''
              }`}
              onClick={() => window.location.href = article.link}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                </div>
                <h3 className={`font-semibold text-primary group-hover:text-accent transition-colors leading-tight ${
                  article.featured ? 'text-2xl' : 'text-lg'
                }`}>
                  {article.title}
                </h3>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className={`text-muted-foreground leading-relaxed mb-4 ${
                  article.featured ? 'text-base' : 'text-sm'
                }`}>
                  {article.excerpt}
                </p>

                <Button 
                  variant="ghost" 
                  className="text-accent hover:text-accent-hover group/btn p-0 h-auto font-medium"
                >
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blog CTA */}
        <div className="text-center mt-12">
          <Button className="cta-secondary">
            View All Articles
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Stay Updated with Tech Insights
            </h3>
            <p className="text-muted-foreground mb-6">
              Get monthly technology tips, industry updates, and exclusive insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
              <Button className="cta-primary px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;