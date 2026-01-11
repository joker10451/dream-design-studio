import { motion } from "framer-motion";
import { Calendar, Clock, User, Tag, Share2, BookOpen, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Article } from "@/data/content";
import { formatDate, generateSocialShareData, createSocialShareUrl } from "@/lib/contentUtils";
import { SocialShareButtons } from "./SocialShareButtons";
import { AffiliateLinksSection } from "./AffiliateLinksSection";
import { RelatedContent } from "./RelatedContent";

interface ArticleViewProps {
  article: Article;
  relatedArticles?: Article[];
  onShare?: (platform: string) => void;
  onLike?: () => void;
}

export function ArticleView({ article, relatedArticles = [], onShare, onLike }: ArticleViewProps) {
  const shareData = generateSocialShareData(article);

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
              <span>{article.category.name}</span>
              <span>/</span>
              <span className="text-foreground">{article.title}</span>
            </motion.nav>

            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <Badge 
                variant="secondary" 
                className="text-sm px-3 py-1"
                style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
              >
                {article.category.name}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              {article.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              {article.excerpt}
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
                <span>{article.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedAt, 'long')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readingTime} мин чтения</span>
              </div>
              {article.viewsCount && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewsCount.toLocaleString()} просмотров</span>
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
              {article.tags.map((tag, index) => (
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
      {article.featuredImage && (
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
                  src={article.featuredImage}
                  alt={article.title}
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
              {/* Table of Contents */}
              {article.tableOfContents && article.tableOfContents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mb-8"
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Содержание
                      </h3>
                      <nav className="space-y-2">
                        {article.tableOfContents.map((item, index) => (
                          <a
                            key={index}
                            href={`#${item.anchor}`}
                            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                            style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* FAQ Section */}
              {article.faqSection && article.faqSection.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="mb-12"
                >
                  <h3 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {article.faqSection
                      .sort((a, b) => a.order - b.order)
                      .map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </motion.div>
              )}

              {/* Affiliate Links */}
              {article.affiliateLinks && article.affiliateLinks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="mb-12"
                >
                  <AffiliateLinksSection links={article.affiliateLinks} />
                </motion.div>
              )}

              {/* Social Share & Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onLike}
                          className="flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          {article.likesCount || 0}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Понравилась статья?
                        </span>
                      </div>
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
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {article.author.avatar && (
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{article.author.name}</h4>
                        {article.author.bio && (
                          <p className="text-muted-foreground mb-3">{article.author.bio}</p>
                        )}
                        {article.author.socialLinks && (
                          <div className="flex gap-2">
                            {article.author.socialLinks.telegram && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.author.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                                  Telegram
                                </a>
                              </Button>
                            )}
                            {article.author.socialLinks.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.author.socialLinks.website} target="_blank" rel="noopener noreferrer">
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
              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  className="sticky top-8"
                >
                  <RelatedContent
                    title="Похожие статьи"
                    items={relatedArticles.map(article => ({
                      id: article.id,
                      title: article.title,
                      excerpt: article.excerpt,
                      url: `/article/${article.slug}`,
                      image: article.featuredImage,
                      publishedAt: article.publishedAt,
                      readingTime: article.readingTime
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