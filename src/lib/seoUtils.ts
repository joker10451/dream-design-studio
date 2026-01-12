import { Product } from '@/data/products';
import { Article, NewsItem, Rating } from '@/data/content';

// Базовые интерфейсы для Schema.org
export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: {
    '@type': 'ContactPoint';
    telephone?: string;
    email?: string;
    contactType: string;
  };
  sameAs: string[];
}

export interface SchemaWebsite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  publisher: {
    '@type': 'Organization';
    name: string;
  };
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface SchemaProduct {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  category: string;
  sku: string;
  offers: {
    '@type': 'AggregateOffer';
    priceCurrency: 'RUB';
    lowPrice: number;
    highPrice: number;
    offerCount: number;
    offers: Array<{
      '@type': 'Offer';
      url: string;
      priceCurrency: 'RUB';
      price: number;
      availability: string;
      seller: {
        '@type': 'Organization';
        name: string;
      };
    }>;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating: 5;
    worstRating: 1;
  };
  review?: Array<{
    '@type': 'Review';
    reviewRating: {
      '@type': 'Rating';
      ratingValue: number;
      bestRating: 5;
    };
    author: {
      '@type': 'Person';
      name: string;
    };
  }>;
}

export interface SchemaArticle {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image: string[];
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection: string;
  keywords: string[];
}

export interface SchemaNewsArticle extends Omit<SchemaArticle, '@type'> {
  '@type': 'NewsArticle';
  dateline?: string;
}

export interface SchemaReview {
  '@context': 'https://schema.org';
  '@type': 'Review';
  itemReviewed: {
    '@type': 'Product';
    name: string;
  };
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewBody: string;
  datePublished: string;
}

// Утилиты для генерации структурированных данных

export const generateOrganizationSchema = (): SchemaOrganization => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Smart Home 2026',
  url: 'https://smarthome2026.ru',
  logo: 'https://smarthome2026.ru/images/logo.png',
  description: 'Лучший портал об устройствах умного дома в России. Обзоры, гайды, рейтинги и сравнения IoT устройств.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@smarthome2026.ru',
    contactType: 'customer service'
  },
  sameAs: [
    'https://t.me/smarthome2026',
    'https://vk.com/smarthome2026'
  ]
});

export const generateWebsiteSchema = (): SchemaWebsite => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Smart Home 2026',
  url: 'https://smarthome2026.ru',
  description: 'Портал об устройствах умного дома в России',
  publisher: {
    '@type': 'Organization',
    name: 'Smart Home 2026'
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://smarthome2026.ru/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
});

export const generateProductSchema = (product: Product): SchemaProduct => {
  const offers = product.stores.map(store => ({
    '@type': 'Offer' as const,
    url: store.url,
    priceCurrency: 'RUB' as const,
    price: store.price,
    availability: store.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization' as const,
      name: store.marketplace === 'wildberries' ? 'Wildberries' : 
            store.marketplace === 'ozon' ? 'OZON' : 
            store.marketplace === 'yandex' ? 'Яндекс.Маркет' : store.marketplace
    }
  }));

  const prices = product.stores.map(store => store.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.fullDescription || product.description,
    image: product.images.map(img => img.url),
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    category: product.category,
    sku: product.id,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: offers.length,
      offers
    },
    aggregateRating: product.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: 5,
      worstRating: 1
    } : undefined
  };
};

export const generateArticleSchema = (article: Article, url: string): SchemaArticle => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.excerpt,
  image: article.featuredImage ? [article.featuredImage] : [],
  author: {
    '@type': 'Person',
    name: article.author.name
  },
  publisher: {
    '@type': 'Organization',
    name: 'Smart Home 2026',
    logo: {
      '@type': 'ImageObject',
      url: 'https://smarthome2026.ru/images/logo.png'
    }
  },
  datePublished: article.publishedAt.toISOString(),
  dateModified: (article.updatedAt || article.publishedAt).toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url
  },
  articleSection: article.category.name,
  keywords: article.tags.map(tag => tag.name)
});

export const generateNewsSchema = (news: NewsItem, url: string): SchemaNewsArticle => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: news.title,
  description: news.excerpt,
  image: news.featuredImage ? [news.featuredImage] : [],
  author: {
    '@type': 'Person',
    name: news.author.name
  },
  publisher: {
    '@type': 'Organization',
    name: 'Smart Home 2026',
    logo: {
      '@type': 'ImageObject',
      url: 'https://smarthome2026.ru/images/logo.png'
    }
  },
  datePublished: news.publishedAt.toISOString(),
  dateModified: (news.updatedAt || news.publishedAt).toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url
  },
  articleSection: news.category,
  keywords: news.tags.map(tag => tag.name)
});

export const generateRatingSchema = (rating: Rating, url: string): SchemaArticle => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: rating.title,
  description: rating.description,
  image: rating.featuredImage ? [rating.featuredImage] : [],
  author: {
    '@type': 'Person',
    name: rating.author.name
  },
  publisher: {
    '@type': 'Organization',
    name: 'Smart Home 2026',
    logo: {
      '@type': 'ImageObject',
      url: 'https://smarthome2026.ru/images/logo.png'
    }
  },
  datePublished: rating.publishedAt.toISOString(),
  dateModified: (rating.updatedAt || rating.publishedAt).toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url
  },
  articleSection: 'Рейтинги',
  keywords: [`рейтинг ${rating.category}`, 'лучшие устройства', 'сравнение', 'топ']
});

// Утилиты для генерации мета-тегов
export const generateMetaTags = (
  title: string,
  description: string,
  keywords: string[] = [],
  image?: string
) => ({
  title: `${title} | Smart Home 2026`,
  description: description.length > 160 ? `${description.substring(0, 157)}...` : description,
  keywords: [...keywords, 'умный дом', 'iot', 'smart home'],
  ogImage: image || '/images/og-default.jpg'
});

// Утилита для генерации breadcrumbs
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

// Утилита для генерации FAQ Schema
export interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQSchema = (faqItems: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
});

// Утилита для очистки и валидации мета-данных
export const sanitizeMetaContent = (content: string): string => {
  return content
    .replace(/[<>]/g, '') // Удаляем HTML теги
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на одинарные
    .trim();
};

export const validateMetaLength = (content: string, maxLength: number): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength - 3)}...`;
};