import { Product } from '@/data/products';
import { SEOHead } from './SEOHead';
import { generateProductSchema, generateMetaTags } from '@/lib/seoUtils';

interface ProductSEOProps {
  product: Product;
  canonicalUrl?: string;
}

export const ProductSEO: React.FC<ProductSEOProps> = ({ product, canonicalUrl }) => {
  const structuredData = generateProductSchema(product);
  const metaTags = generateMetaTags(
    product.seoMeta.title || product.name,
    product.seoMeta.description || product.description,
    product.seoMeta.keywords || product.tags,
    product.seoMeta.ogImage || product.images[0]?.url
  );

  return (
    <SEOHead
      title={metaTags.title}
      description={metaTags.description}
      keywords={metaTags.keywords}
      ogImage={metaTags.ogImage}
      ogType="product"
      canonicalUrl={canonicalUrl}
      structuredData={structuredData}
    >
      {/* Дополнительные мета-теги для продукта */}
      <meta property="product:brand" content={product.brand} />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="RUB" />
      
      {/* Мета-теги для социальных сетей */}
      <meta property="og:price:amount" content={product.price.toString()} />
      <meta property="og:price:currency" content="RUB" />
      
      {/* Дополнительные изображения для галереи */}
      {product.images.slice(1).map((image, index) => (
        <meta key={index} property="og:image" content={image.url} />
      ))}
    </SEOHead>
  );
};