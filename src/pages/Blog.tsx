import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Tag, Star } from "lucide-react";

const Blog = () => {
  // Sample blog posts - in a real app, these would come from a CMS or database
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Mediumship: Connecting with Spirit in Oxford",
      excerpt: "Explore the sacred art of mediumship and how spiritual connections can bring healing and closure to those seeking answers from loved ones who have passed.",
      content: "Mediumship is a profound spiritual practice that allows communication between the physical and spirit worlds...",
      category: "Mediumship",
      date: "2024-01-15",
      readTime: "5 min read",
      featured: true,
      keywords: ["mediumship Oxford", "spirit communication", "psychic medium"]
    },
    {
      id: 2,
      title: "The History of Tarot: Ancient Wisdom for Modern Guidance",
      excerpt: "Discover the rich history of tarot cards and how this ancient divination tool continues to provide insight and guidance in our modern world.",
      content: "Tarot cards have been guiding seekers for centuries, offering wisdom through symbolic imagery...",
      category: "Tarot",
      date: "2024-01-10",
      readTime: "7 min read",
      featured: false,
      keywords: ["tarot reading Oxford", "tarot history", "divination"]
    },
    {
      id: 3,
      title: "Developing Your Psychic Abilities: A Beginner's Guide",
      excerpt: "Learn about the natural psychic abilities we all possess and discover practical exercises to enhance your intuitive gifts.",
      content: "Everyone has psychic abilities to some degree. The key is learning to recognize and develop these natural gifts...",
      category: "Psychic Development",
      date: "2024-01-05",
      readTime: "6 min read",
      featured: false,
      keywords: ["psychic development", "intuition", "spiritual growth"]
    },
    {
      id: 4,
      title: "Spiritual Protection: Maintaining Positive Energy in Daily Life",
      excerpt: "Explore techniques for protecting your spiritual energy and maintaining a positive aura in challenging environments.",
      content: "Spiritual protection is essential for anyone working with psychic energy or simply wanting to maintain...",
      category: "Spiritual Guidance",
      date: "2023-12-28",
      readTime: "4 min read",
      featured: false,
      keywords: ["spiritual protection", "energy cleansing", "aura"]
    },
    {
      id: 5,
      title: "Signs from Spirit: How Loved Ones Communicate After Passing",
      excerpt: "Recognize the various ways that departed loved ones try to communicate with us and bring comfort to our daily lives.",
      content: "Spirit communication often happens in subtle ways that we might dismiss as coincidence...",
      category: "Spirit Communication",
      date: "2023-12-20",
      readTime: "5 min read",
      featured: true,
      keywords: ["spirit signs", "afterlife communication", "grief support"]
    },
    {
      id: 6,
      title: "The Celtic Connection: Welsh Spiritual Traditions and Modern Practice",
      excerpt: "Explore the rich spiritual heritage of Wales and how Celtic traditions continue to influence contemporary psychic work.",
      content: "Growing up in Wales, I was surrounded by the mystical energy of Celtic spirituality...",
      category: "Celtic Spirituality",
      date: "2023-12-15",
      readTime: "8 min read",
      featured: false,
      keywords: ["Celtic spirituality", "Welsh traditions", "ancient wisdom"]
    }
  ];

  const categories = ["All", "Mediumship", "Tarot", "Psychic Development", "Spiritual Guidance", "Spirit Communication", "Celtic Spirituality"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-mystical text-primary-foreground">
              Spiritual Insights
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Spiritual Guidance Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Explore the world of psychic phenomena, mediumship, and spiritual development. 
              Insights from 35+ years of spiritual practice in Oxford and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={category === "All" ? "bg-gradient-mystical text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            Featured Articles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {blogPosts.filter(post => post.featured).map((post) => (
              <Card key={post.id} className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-primary border-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {post.keywords.slice(0, 2).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            All Articles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    {post.featured && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-serif group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 w-full">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-card/50 rounded-lg p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
              Stay Connected with Spirit
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Subscribe to receive new articles about spiritual development, 
              psychic insights, and guidance for your spiritual journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              I respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;