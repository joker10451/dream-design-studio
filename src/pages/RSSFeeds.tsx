import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Rss, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useRSS, useRSSFreshness, useAvailableRSSFeeds, RSSFeedType } from '@/hooks/useRSS';
import RSSSubscription from '@/components/content/RSSSubscription';

const RSSFeeds: React.FC = () => {
  const [selectedFeedType, setSelectedFeedType] = useState<RSSFeedType>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [feedLimit, setFeedLimit] = useState<number>(50);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const availableFeeds = useAvailableRSSFeeds();
  const freshness = useRSSFreshness(selectedFeedType);

  const rssOptions = {
    feedType: selectedFeedType,
    category: selectedCategory || undefined,
    author: selectedAuthor || undefined,
    limit: feedLimit
  };

  const { 
    rssContent, 
    isLoading, 
    error, 
    lastModified, 
    isValid, 
    validationErrors,
    refresh,
    downloadRSS,
    copyRSSUrl,
    getRSSUrl
  } = useRSS(rssOptions);

  const handleCopyUrl = async () => {
    try {
      await copyRSSUrl();
      setCopiedUrl(getRSSUrl());
      toast.success('RSS ссылка скопирована в буфер обмена');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleDownload = () => {
    downloadRSS();
    toast.success('RSS фид загружен');
  };

  const handleOpenFeed = () => {
    window.open(getRSSUrl(), '_blank', 'noopener,noreferrer');
  };

  const FeedStatusIndicator: React.FC = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm">Генерация фида...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Ошибка генерации</span>
        </div>
      );
    }

    if (!isValid) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Фид содержит ошибки</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Фид готов</span>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>RSS фиды - Smart Home 2026</title>
        <meta 
          name="description" 
          content="RSS фиды Smart Home 2026. Подпишитесь на новости, статьи и рейтинги устройств умного дома. Настройте персональные RSS подписки." 
        />
        <meta name="keywords" content="rss фиды, подписка на новости, умный дом rss, iot новости" />
        <link rel="alternate" type="application/rss+xml" title="Smart Home 2026 - Основной RSS" href="/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="Smart Home 2026 - Новости" href="/rss/news.xml" />
        <link rel="alternate" type="application/rss+xml" title="Smart Home 2026 - Статьи" href="/rss/articles.xml" />
        <link rel="alternate" type="application/rss+xml" title="Smart Home 2026 - Рейтинги" href="/rss/ratings.xml" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <Rss className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold">RSS фиды</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Настройте персональные RSS подписки и получайте актуальную информацию 
            об устройствах умного дома прямо в ваш RSS-ридер
          </p>
        </div>

        <Tabs defaultValue="feeds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feeds">Готовые фиды</TabsTrigger>
            <TabsTrigger value="custom">Настройка фида</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          {/* Готовые RSS фиды */}
          <TabsContent value="feeds" className="space-y-6">
            <RSSSubscription showTitle={false} />
          </TabsContent>

          {/* Настройка персонального фида */}
          <TabsContent value="custom" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Настройки фида */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Настройки фида</span>
                  </CardTitle>
                  <CardDescription>
                    Настройте параметры персонального RSS фида
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedType">Тип фида</Label>
                    <Select 
                      value={selectedFeedType} 
                      onValueChange={(value: RSSFeedType) => setSelectedFeedType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип фида" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Основной фид</SelectItem>
                        <SelectItem value="news">Только новости</SelectItem>
                        <SelectItem value="articles">Только статьи</SelectItem>
                        <SelectItem value="ratings">Только рейтинги</SelectItem>
                        <SelectItem value="category">По категории</SelectItem>
                        <SelectItem value="author">По автору</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFeedType === 'category' && (
                    <div className="space-y-2">
                      <Label htmlFor="category">Категория</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guides">Гайды</SelectItem>
                          <SelectItem value="reviews">Обзоры</SelectItem>
                          <SelectItem value="tutorials">Инструкции</SelectItem>
                          <SelectItem value="comparisons">Сравнения</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedFeedType === 'author' && (
                    <div className="space-y-2">
                      <Label htmlFor="author">Автор</Label>
                      <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите автора" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expert1">Алексей Смирнов</SelectItem>
                          <SelectItem value="expert2">Мария Петрова</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="limit">Количество элементов</Label>
                    <Input
                      id="limit"
                      type="number"
                      min="5"
                      max="100"
                      value={feedLimit}
                      onChange={(e) => setFeedLimit(parseInt(e.target.value) || 50)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preview"
                      checked={previewMode}
                      onCheckedChange={setPreviewMode}
                    />
                    <Label htmlFor="preview">Режим предпросмотра</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={refresh} disabled={isLoading} className="flex-1">
                      {isLoading ? 'Генерация...' : 'Обновить фид'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Результат и действия */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Результат</span>
                    <FeedStatusIndicator />
                  </CardTitle>
                  <CardDescription>
                    Ваш персональный RSS фид готов к использованию
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lastModified && (
                    <div className="text-sm text-muted-foreground">
                      Последнее обновление: {lastModified.toLocaleString('ru-RU')}
                    </div>
                  )}

                  {!isValid && validationErrors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-destructive">Ошибки валидации:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {rssContent && (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">RSS URL:</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {getRSSUrl()}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyUrl}
                          className="flex-1"
                        >
                          {copiedUrl ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Копировать URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Скачать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenFeed}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {previewMode && rssContent && (
                    <div className="space-y-2">
                      <Label>Предпросмотр RSS (первые 500 символов):</Label>
                      <Textarea
                        value={rssContent.substring(0, 500) + (rssContent.length > 500 ? '...' : '')}
                        readOnly
                        className="font-mono text-xs"
                        rows={10}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Аналитика RSS */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Статистика фидов</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-sm text-muted-foreground">Общее количество подписчиков</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Активность подписчиков</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-muted-foreground">Новых подписчиков за неделю</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Популярные фиды</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Основной фид</span>
                      <Badge variant="secondary">687</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Новости</span>
                      <Badge variant="secondary">423</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Статьи</span>
                      <Badge variant="secondary">298</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Рейтинги</span>
                      <Badge variant="secondary">156</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Актуальность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Основной фид</span>
                      <Badge variant="outline" className="text-green-600">
                        Актуален
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Новости</span>
                      <Badge variant="outline" className="text-green-600">
                        Актуален
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Статьи</span>
                      <Badge variant="outline" className="text-yellow-600">
                        Обновляется
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Рейтинги</span>
                      <Badge variant="outline" className="text-green-600">
                        Актуален
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Популярные материалы в RSS</CardTitle>
                <CardDescription>
                  Самые читаемые статьи и новости через RSS подписки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Полный гайд по выбору умных розеток в 2026 году', views: 1420, type: 'Статья' },
                    { title: 'Яндекс анонсировал новую линейку умных устройств', views: 987, type: 'Новость' },
                    { title: 'ТОП-10 лучших умных розеток 2026 года', views: 756, type: 'Рейтинг' },
                    { title: 'Сравнение экосистем умного дома', views: 634, type: 'Статья' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.views}</p>
                        <p className="text-sm text-muted-foreground">просмотров</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default RSSFeeds;