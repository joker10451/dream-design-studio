import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, MousePointer, Users, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

interface AnalyticsData {
  pageViews: Array<{ date: string; views: number; }>;
  topPages: Array<{ page: string; views: number; }>;
  affiliateClicks: Array<{ marketplace: string; clicks: number; }>;
  searchQueries: Array<{ query: string; count: number; }>;
  userEngagement: {
    totalUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  realtimeUsers: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for demonstration
const mockData: AnalyticsData = {
  pageViews: [
    { date: '2024-01-01', views: 1200 },
    { date: '2024-01-02', views: 1350 },
    { date: '2024-01-03', views: 1100 },
    { date: '2024-01-04', views: 1450 },
    { date: '2024-01-05', views: 1600 },
    { date: '2024-01-06', views: 1800 },
    { date: '2024-01-07', views: 1950 },
  ],
  topPages: [
    { page: '/', views: 5200 },
    { page: '/catalog', views: 3800 },
    { page: '/calculator', views: 2100 },
    { page: '/search', views: 1500 },
    { page: '/guides', views: 1200 },
  ],
  affiliateClicks: [
    { marketplace: 'Wildberries', clicks: 450 },
    { marketplace: 'OZON', clicks: 320 },
    { marketplace: 'Yandex Market', clicks: 180 },
  ],
  searchQueries: [
    { query: 'умная розетка', count: 89 },
    { query: 'камера видеонаблюдения', count: 67 },
    { query: 'датчик движения', count: 45 },
    { query: 'умный выключатель', count: 38 },
    { query: 'система безопасности', count: 29 },
  ],
  userEngagement: {
    totalUsers: 12450,
    avgSessionDuration: 245,
    bounceRate: 0.32,
    conversionRate: 0.045,
  },
  realtimeUsers: 23,
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>(mockData);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch data from analytics APIs
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}м ${remainingSeconds}с`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Аналитика</h2>
          <p className="text-muted-foreground">
            Отслеживание производительности и поведения пользователей
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {data.realtimeUsers} онлайн
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://analytics.google.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Google Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://metrica.yandex.ru', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Яндекс.Метрика
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userEngagement.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время сессии</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.userEngagement.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              +8% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Показатель отказов</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.userEngagement.bounceRate)}</div>
            <p className="text-xs text-muted-foreground">
              -5% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.userEngagement.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              +15% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        <Button
          variant={timeRange === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('7d')}
        >
          7 дней
        </Button>
        <Button
          variant={timeRange === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('30d')}
        >
          30 дней
        </Button>
        <Button
          variant={timeRange === '90d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('90d')}
        >
          90 дней
        </Button>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="pages">Страницы</TabsTrigger>
          <TabsTrigger value="affiliate">Партнерские ссылки</TabsTrigger>
          <TabsTrigger value="search">Поиск</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Просмотры страниц</CardTitle>
              <CardDescription>
                Динамика просмотров за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.pageViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Популярные страницы</CardTitle>
              <CardDescription>
                Страницы с наибольшим количеством просмотров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Клики по партнерским ссылкам</CardTitle>
              <CardDescription>
                Распределение кликов по маркетплейсам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.affiliateClicks}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {data.affiliateClicks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Популярные поисковые запросы</CardTitle>
              <CardDescription>
                Наиболее часто используемые поисковые запросы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.searchQueries.map((query, index) => (
                  <div key={query.query} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="font-medium">{index + 1}. {query.query}</span>
                    <Badge variant="secondary">{query.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}