import { Article, NewsItem, Rating } from '@/data/content';
import { SEOHead } from './SEOHead';
import { 
  generateArticleSchema, 
  generateNewsSchema, 
  generateRatingSchema,
  generateMetaTags,
  generateFAQSchema
} from '@/lib/seoUtils';

interface ArticleSEOProps {
  article: Article;
  canonicalUrl: string;
}

interface NewsSEOProps {
  news: NewsItem;
  canonicalUrl: string;
}

interface RatingSEOProps {
  rating: Rating;
  canonicalUrl: string;
}

export const ArticleSEO: React.FC<ArticleSEOProps> = ({ article, canonicalUrl }) => {
  const structuredData = generateArticleSchema(article, canonicalUrl);
  const metaTags = generateMetaTags(
    article.seoMeta.title || article.title,
    article.seoMeta.description || article.excerpt,
    article.seoMeta.keywords || article.tags.map(tag => tag.name),
    article.seoMeta.ogImage || article.featuredImage
  );

  // Генерируем FAQ Schema если есть FAQ секция
  const faqSchema = article.faqSection && article.faqSection.length > 0 
    ? generateFAQSchema(article.faqSection.map(faq => ({
        question: faq.question,
        answer: faq.answer
      })))
    : null;

  return (
    <SEOHead
      title={metaTags.title}
      description={metaTags.description}
      keywords={metaTags.keywords}
      ogImage={metaTags.ogImage}
      ogType="article"
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
      author={article.author.name}
      publishedTime={article.publishedAt.toISOString()}
      modifiedTime={(article.updatedAt || article.publishedAt).toISOString()}
    >
      {/* Дополнительные мета-теги для статьи */}
      <meta property="article:author" content={article.author.name} />
      <meta property="article:section" content={article.category.name} />
      <meta property="article:published_time" content={article.publishedAt.toISOString()} />
      <meta property="article:modified_time" content={(article.updatedAt || article.publishedAt).toISOString()} />
      
      {/* Теги статьи */}
      {article.tags.map(tag => (
        <meta key={tag.id} property="article:tag" content={tag.name} />
      ))}
      
      {/* Время чтения */}
      <meta name="twitter:label1" content="Время чтения" />
      <meta name="twitter:data1" content={`${article.readingTime} мин`} />
      
      {/* FAQ Schema если есть */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </SEOHead>
  );
};

export const NewsSEO: React.FC<NewsSEOProps> = ({ news, canonicalUrl }) => {
  const structuredData = generateNewsSchema(news, canonicalUrl);
  const metaTags = generateMetaTags(
    news.seoMeta.title || news.title,
    news.seoMeta.description || news.excerpt,
    news.seoMeta.keywords || news.tags.map(tag => tag.name),
    news.seoMeta.ogImage || news.featuredImage
  );

  return (
    <SEOHead
      title={metaTags.title}
      description={metaTags.description}
      keywords={metaTags.keywords}
      ogImage={metaTags.ogImage}
      ogType="article"
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
      author={news.author.name}
      publishedTime={news.publishedAt.toISOString()}
      modifiedTime={(news.updatedAt || news.publishedAt).toISOString()}
    >
      {/* Дополнительные мета-теги для новости */}
      <meta property="article:author" content={news.author.name} />
      <meta property="article:section" content="Новости" />
      <meta property="article:published_time" content={news.publishedAt.toISOString()} />
      <meta property="article:modified_time" content={(news.updatedAt || news.publishedAt).toISOString()} />
      
      {/* Категория новости */}
      <meta property="article:tag" content={news.category} />
      
      {/* Теги новости */}
      {news.tags.map(tag => (
        <meta key={tag.id} property="article:tag" content={tag.name} />
      ))}
      
      {/* Приоритет новости */}
      <meta name="news:priority" content={news.priority} />
    </SEOHead>
  );
};

export const RatingSEO: React.FC<RatingSEOProps> = ({ rating, canonicalUrl }) => {
  const structuredData = generateRatingSchema(rating, canonicalUrl);
  const metaTags = generateMetaTags(
    rating.seoMeta.title || rating.title,
    rating.seoMeta.description || rating.description,
    rating.seoMeta.keywords || [`рейтинг ${rating.category}`, 'лучшие устройства', 'сравнение'],
    rating.seoMeta.ogImage || rating.featuredImage
  );

  return (
    <SEOHead
      title={metaTags.title}
      description={metaTags.description}
      keywords={metaTags.keywords}
      ogImage={metaTags.ogImage}
      ogType="article"
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
      author={rating.author.name}
      publishedTime={rating.publishedAt.toISOString()}
      modifiedTime={(rating.updatedAt || rating.publishedAt).toISOString()}
    >
      {/* Дополнительные мета-теги для рейтинга */}
      <meta property="article:author" content={rating.author.name} />
      <meta property="article:section" content="Рейтинги" />
      <meta property="article:published_time" content={rating.publishedAt.toISOString()} />
      <meta property="article:modified_time" content={(rating.updatedAt || rating.publishedAt).toISOString()} />
      
      {/* Категория рейтинга */}
      <meta property="article:tag" content={`рейтинг ${rating.category}`} />
      <meta property="article:tag" content="сравнение" />
      <meta property="article:tag" content="лучшие устройства" />
      
      {/* Количество продуктов в рейтинге */}
      <meta name="rating:products_count" content={rating.products.length.toString()} />
    </SEOHead>
  );
};