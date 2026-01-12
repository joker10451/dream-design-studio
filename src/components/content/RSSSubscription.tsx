import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rss, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface RSSFeed {
  url: string;
  title: string;
  description: string;
  category?: string;
  updateFrequency?: string;
}

interface RSSSubscriptionProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

const RSS_FEEDS: RSSFeed[] = [
  {
    url: '/rss.xml',
    title: 'Основной RSS фид',
    description: 'Все новости, статьи и рейтинги об устройствах умного дома',
    category: 'Все',
    updateFrequency: 'Каждый час'
  },
  {
    url: '/rss/news.xml',
    title: 'RSS фид новостей',
    description: 'Только новости индустрии умного дома и IoT',
    category: 'Новости',
    updateFrequency: 'Каждые 30 минут'
  },
  {
    url: '/rss/articles.xml',
    title: 'RSS фид статей',
    description: 'Гайды, обзоры, инструкции и сравнения устройств',
    category: 'Статьи',
    updateFrequency: 'Каждые 2 часа'
  },
  {
    url: '/rss/ratings.xml',
    title: 'RSS фид рейтингов',
    description: 'ТОП-списки и рейтинги лучших устройств умного дома',
    category: 'Рейтинги',
    updateFrequency: 'Каждые 4 часа'
  }
];

const CATEGORY_FEEDS: RSSFeed[] = [
  {
    url: '/rss/category/guides.xml',
    title: 'Гайды',
    description: 'Подробные руководства по выбору устройств',
    category: 'Гайды'
  },
  {
    url: '/rss/category/reviews.xml',
    title: 'Обзоры',
    description: 'Детальные обзоры и тестирования устройств',
    category: 'Обзоры'
  },
  {
    url: '/rss/category/tutorials.xml',
    title: 'Инструкции',
    description: 'Пошаговые инструкции по установке и настройке',
    category: 'Инструкции'
  },
  {
    url: '/rss/category/comparisons.xml',
    title: 'Сравнения',
    description: 'Сравнительные обзоры похожих устройств',
    category: 'Сравнения'
  }
];

export const RSSSubscription: React.FC<RSSSubscriptionProps> = ({
  className = '',
  showTitle = true,
  compact = false
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  const handleCopyUrl = async (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(url);
      toast.success('RSS ссылка скопирована в буфер обмена');
      
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleOpenFeed = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const RSSFeedItem: React.FC<{ feed: RSSFeed; isCompact?: boolean }> = ({ 
    feed, 
    isCompact = false 
  }) => (
    <div className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
      isCompact ? 'p-3' : 'p-4'
    }`}>
      <div className="flex items-start space-x-3 flex-1">
        <div className="flex-shrink-0 mt-1">
          <Rss className="h-4 w-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className={`font-medium text-foreground ${
              isCompact ? 'text-sm' : 'text-base'
            }`}>
              {feed.title}
            </h4>
            {feed.category && (
              <Badge variant="secondary" className="text-xs">
                {feed.category}
              </Badge>
            )}
          </div>
          <p className={`text-muted-foreground ${
            isCompact ? 'text-xs' : 'text-sm'
          }`}>
            {feed.description}
          </p>
          {feed.updateFrequency && !isCompact && (
            <p className="text-xs text-muted-foreground mt-1">
              Обновления: {feed.updateFrequency}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopyUrl(feed.url)}
          className="h-8 w-8 p-0"
          title="Скопировать ссылку"
        >
          {copiedUrl === feed.url ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenFeed(feed.url)}
          className="h-8 w-8 p-0"
          title="Открыть RSS фид"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showTitle && (
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Rss className="h-5 w-5 text-orange-500" />
            <span>RSS подписка</span>
          </h3>
        )}
        <div className="space-y-2">
          {RSS_FEEDS.slice(0, 2).map((feed) => (
            <RSSFeedItem key={feed.url} feed={feed} isCompact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Rss className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">RSS подписка</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Подпишитесь на наши RSS фиды, чтобы получать последние новости и статьи 
            об устройствах умного дома прямо в ваш RSS-ридер
          </p>
        </div>
      )}

      {/* Основные фиды */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Основные RSS фиды</CardTitle>
          <CardDescription>
            Выберите подходящий фид в зависимости от ваших интересов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {RSS_FEEDS.map((feed) => (
            <RSSFeedItem key={feed.url} feed={feed} />
          ))}
        </CardContent>
      </Card>

      {/* Фиды по категориям */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RSS фиды по категориям</CardTitle>
          <CardDescription>
            Подпишитесь на конкретные категории контента
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORY_FEEDS.map((feed) => (
            <RSSFeedItem key={feed.url} feed={feed} />
          ))}
        </CardContent>
      </Card>

      {/* Инструкция по использованию */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Как использовать RSS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              RSS (Really Simple Syndication) позволяет получать обновления сайта 
              автоматически в вашем RSS-ридере.
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground mb-2">Популярные RSS-ридеры:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Feedly</strong> - веб-сервис и мобильные приложения</li>
                  <li>• <strong>Inoreader</strong> - мощный веб-ридер с расширенными функциями</li>
                  <li>• <strong>NewsBlur</strong> - социальный RSS-ридер</li>
                  <li>• <strong>Thunderbird</strong> - почтовый клиент с поддержкой RSS</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Как подписаться:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Скопируйте ссылку на нужный RSS фид</li>
                  <li>2. Откройте ваш RSS-ридер</li>
                  <li>3. Добавьте новую подписку, вставив скопированную ссылку</li>
                  <li>4. Готово! Новые статьи будут появляться автоматически</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSSSubscription;