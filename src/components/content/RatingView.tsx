import { motion } from "framer-motion";
import { Calendar, User, Trophy, Star, TrendingUp, TrendingDown, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Rating } from "@/data/content";
import { formatDate, generateSocialShareData } from "@/lib/contentUtils";
import { SocialShareButtons } from "./SocialShareButtons";
import { RelatedContent } from "./RelatedContent";

interface RatingViewProps {
  rating: Rating;
  relatedRatings?: Rating[];
  onShare?: (platform: string) => void;
  onProductClick?: (productId: string) => void;
}

export function RatingView({ rating, relatedRatings = [], onShare, onProductClick }: RatingViewProps) {
  const shareData = generateSocialShareData(rating);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (rank <= 3) return { icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <span>Главная</span>
              <span>/</span>
              <span>Рейтинги</span>
              <span>/</span>
              <span className="text-foreground">{rating.title}</span>
            </motion.nav>

            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Trophy className="w-3 h-3 mr-1" />
                Рейтинг
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              {rating.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-4xl"
            >
              {rating.description}
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
                <span>{rating.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(rating.publishedAt, 'long')}</span>
              </div>
              {rating.updatedAt && rating.updatedAt > rating.publishedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">Обновлено:</span>
                  <span>{formatDate(rating.updatedAt, 'short')}</span>
                </div>
              )}
              {rating.viewsCount && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{rating.viewsCount.toLocaleString()} просмотров</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {rating.featuredImage && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={rating.featuredImage}
                  alt={rating.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Rating Criteria */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-12"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Критерии оценки
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {rating.criteria.map((criterion) => (
                        <div key={criterion.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{criterion.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(criterion.weight * 100)}%
                            </span>
                          </div>
                          <Progress value={criterion.weight * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {criterion.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Products Rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6">Рейтинг продуктов</h2>
                <div className="space-y-6">
                  {rating.products
                    .sort((a, b) => a.rank - b.rank)
                    .map((product, index) => {
                      const rankBadge = getRankBadge(product.rank);
                      const RankIcon = rankBadge.icon;
                      
                      return (
                        <motion.div
                          key={product.productId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => onProductClick?.(product.productId)}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                {/* Rank */}
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${rankBadge.bg}`}>
                                  <RankIcon className={`w-6 h-6 ${rankBadge.color}`} />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg font-bold">#{product.rank}</span>
                                        <h3 className="text-lg font-semibold">
                                          Продукт {product.productId}
                                        </h3>
                                      </div>
                                      {product.priceAtReview && (
                                        <p className="text-sm text-muted-foreground">
                                          Цена на момент обзора: {product.priceAtReview}₽
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-2xl font-bold ${getScoreColor(product.score)}`}>
                                        {product.score}
                                      </div>
                                      <div className="text-xs text-muted-foreground">из 100</div>
                                    </div>
                                  </div>

                                  {/* Scores by Criteria */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {rating.criteria.map((criterion) => {
                                      const score = product.scores[criterion.id] || 0;
                                      return (
                                        <div key={criterion.id} className="text-center">
                                          <div className={`text-sm font-semibold ${getScoreColor(score)}`}>
                                            {score}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {criterion.name}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Pros and Cons */}
                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-green-600 mb-2">
                                        Плюсы:
                                      </h4>
                                      <ul className="text-sm space-y-1">
                                        {product.pros.map((pro, i) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <TrendingUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                            {pro}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-red-600 mb-2">
                                        Минусы:
                                      </h4>
                                      <ul className="text-sm space-y-1">
                                        {product.cons.map((con, i) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <TrendingDown className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                            {con}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  {/* Verdict */}
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <h4 className="text-sm font-semibold mb-1">Вердикт:</h4>
                                    <p className="text-sm text-muted-foreground">{product.verdict}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>

              {/* Methodology */}
              {rating.methodology && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="mb-12"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Методология тестирования</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {rating.methodology}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Social Share */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Поделиться рейтингом:
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
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mb-12"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {rating.author.avatar && (
                        <img
                          src={rating.author.avatar}
                          alt={rating.author.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{rating.author.name}</h4>
                        {rating.author.bio && (
                          <p className="text-muted-foreground mb-3">{rating.author.bio}</p>
                        )}
                        {rating.author.socialLinks && (
                          <div className="flex gap-2">
                            {rating.author.socialLinks.telegram && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={rating.author.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                                  Telegram
                                </a>
                              </Button>
                            )}
                            {rating.author.socialLinks.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={rating.author.socialLinks.website} target="_blank" rel="noopener noreferrer">
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
              {/* Related Ratings */}
              {relatedRatings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  className="sticky top-8"
                >
                  <RelatedContent
                    title="Другие рейтинги"
                    items={relatedRatings.map(ratingItem => ({
                      id: ratingItem.id,
                      title: ratingItem.title,
                      excerpt: ratingItem.description,
                      url: `/rating/${ratingItem.slug}`,
                      image: ratingItem.featuredImage,
                      publishedAt: ratingItem.publishedAt,
                      category: 'Рейтинг'
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