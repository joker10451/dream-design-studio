import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateBreadcrumbSchema, type BreadcrumbItem } from '@/lib/seoUtils';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  // Добавляем главную страницу в начало, если её нет
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Главная', url: '/' },
    ...items
  ];

  const structuredData = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <nav 
        className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
        aria-label="Хлебные крошки"
      >
        {breadcrumbItems.map((item, index) => (
          <div key={item.url} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 mr-2" />
            )}
            
            {index === breadcrumbItems.length - 1 ? (
              // Последний элемент - текущая страница
              <span 
                className="font-medium text-foreground"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              // Ссылки на предыдущие страницы
              <Link
                to={item.url}
                className="hover:text-foreground transition-colors"
                title={`Перейти к: ${item.name}`}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
};