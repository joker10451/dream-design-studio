import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

interface SEOHeadProps extends SEOProps {
  children?: React.ReactNode;
}

const DEFAULT_SEO = {
  title: 'Smart Home 2026 - Умный дом в России',
  description: 'Лучший портал об устройствах умного дома в России. Обзоры, гайды, рейтинги и сравнения IoT устройств. Актуальные цены на Wildberries и OZON.',
  keywords: ['умный дом', 'iot устройства', 'умные розетки', 'домашняя автоматизация', 'обзоры техники'],
  ogImage: '/images/og-default.png',
  ogType: 'website' as const
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  children
}) => {
  const seoTitle = title ? `${title} | Smart Home 2026` : DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = [...DEFAULT_SEO.keywords, ...keywords].join(', ');
  const seoImage = ogImage || DEFAULT_SEO.ogImage;
  const currentUrl = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Основные мета-теги */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />

      {/* Канонический URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Smart Home 2026" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Автор и даты для статей */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Структурированные данные */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Дополнительные теги */}
      {children}
    </Helmet>
  );
};