import { motion } from "framer-motion";
import { Calendar, TrendingUp, User, Tag, Share2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem } from "@/data/content";
import { formatDate, generateSocialShareData } from "@/lib/contentUtils";
import { SocialShareButtons } from "./SocialShareButtons";
import { RelatedContent } from "./RelatedContent";

interface NewsViewProps {
  news: NewsItem;
  relatedNews?: NewsItem[];
  onShare?: (platform: string) => void;
}

export function NewsView({ news, relatedNews = [], onShare }: NewsViewProps) {
  const shareData = generateSocialShareData(news);

  const getCategoryColor = (category: string) => {
    const colors = {
      'industry': '#3B82F6',
      'products': '#10B981',
      'reviews': '#F59E0B',
      'events': '#8B5CF6',
      'technology': '#EF4444'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const getCategoryName = (category: string) => {
    const names = {
      'industry': 'Индустрия',
      'products': 'Продукты',
      'reviews': 'Обзоры',
      'events': 'События',
      'technology': 'Технологии'
    };
    return names[category as keyof typeof names] || category;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { text: 'Срочно', color: 'destructive' as const };
      case 'high':
        return { text: 'Важно', color: 'default' as const };
      default:
        return null;
    }
  };

  const priorityBadge = getPriorityBadge(news.priority);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <span>Главная</span>
              <span>/</span>
              <span>Новости</span>
              <span>/</span>
              <span className="text-foreground">{news.title}</span>
            </motion.nav>

            {/* Category and Priority Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 mb-4"
            >
              <Badge 
                variant="secondary" 
                className="text-sm px-3 py-1"
                style={{ 
                  backgroundColor: getCategoryColor(news.category) + '20', 
                  color: getCategoryColor(news.category) 
                }}
              >
                {getCategoryName(news.category)}
              </Badge>
              
              {priorityBadge && (
                <Badge variant={priorityBadge.color} className="text-sm px-3 py-1">
                  {priorityBadge.text}
                </Badge>
              )}

              {news.priority === 'high' && (
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  В тренде
                </Badge>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              {news.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              {news.excerpt}
            </motion.p>

            {/* Meta Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{news.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(news.publishedAt, 'long')}</span>
              </div>
              {news.updatedAt && news.updatedAt > news.publishedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">Обновлено:</span>
                  <span>{formatDate(news.updatedAt, 'short')}</span>
                </div>
              )}
              {news.viewsCount && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{news.viewsCount.toLocaleString()} просмотров</span>
                </div>
              )}
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {news.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {typeof tag === 'string' ? tag : tag.name}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {news.featuredImage && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={news.featuredImage}
                  alt={news.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* News Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              {/* Sources */}
              {news.sources && news.sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mb-12"
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Источники
                      </h3>
                      <div className="space-y-3">
                        {news.sources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                {source.name}
                              </a>
                              {source.publishedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(source.publishedAt, 'short')}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={source.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Social Share */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Поделиться новостью:
                      </span>
                      <SocialShareButtons
                        shareData={shareData}
                        onShare={onShare}
                        size="sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {news.author.avatar && (
                        <img
                          src={news.author.avatar}
                          alt={news.author.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{news.author.name}</h4>
                        {news.author.bio && (
                          <p className="text-muted-foreground mb-3">{news.author.bio}</p>
                        )}
                        {news.author.socialLinks && (
                          <div className="flex gap-2">
                            {news.author.socialLinks.telegram && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={news.author.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                                  Telegram
                                </a>
                              </Button>
                            )}
                            {news.author.socialLinks.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={news.author.socialLinks.website} target="_blank" rel="noopener noreferrer">
                                  Сайт
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related News */}
              {relatedNews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="sticky top-8"
                >
                  <RelatedContent
                    title="Похожие новости"
                    items={relatedNews.map(newsItem => ({
                      id: newsItem.id,
                      title: newsItem.title,
                      excerpt: newsItem.excerpt,
                      url: `/news/${newsItem.slug}`,
                      image: newsItem.featuredImage,
                      publishedAt: newsItem.publishedAt,
                      category: getCategoryName(newsItem.category)
                    }))}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}