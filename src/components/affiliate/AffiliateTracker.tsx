import { useEffect } from "react";
import { AffiliateLink } from "@/data/products";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AffiliateTrackerProps {
  children: React.ReactNode;
}

interface AffiliateClickEvent {
  linkId: string;
  marketplace: string;
  productId?: string;
  price: number;
  timestamp: Date;
  source: string;
  userAgent: string;
  referrer: string;
}

interface ConversionEvent {
  linkId: string;
  marketplace: string;
  orderId?: string;
  amount: number;
  timestamp: Date;
}

class AffiliateTrackingService {
  private static instance: AffiliateTrackingService;
  private clickEvents: AffiliateClickEvent[] = [];
  private conversionEvents: ConversionEvent[] = [];
  private analyticsTracker: any = null;

  static getInstance(): AffiliateTrackingService {
    if (!AffiliateTrackingService.instance) {
      AffiliateTrackingService.instance = new AffiliateTrackingService();
    }
    return AffiliateTrackingService.instance;
  }

  setAnalyticsTracker(tracker: any): void {
    this.analyticsTracker = tracker;
  }

  // Трекинг клика по партнерской ссылке
  trackClick(link: AffiliateLink, source: string = 'unknown', productId?: string): void {
    const event: AffiliateClickEvent = {
      linkId: link.id,
      marketplace: link.marketplace,
      productId,
      price: link.price,
      timestamp: new Date(),
      source,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.clickEvents.push(event);
    this.sendClickEvent(event);
    this.storeClickLocally(event);
  }

  // Трекинг конверсии (покупки)
  trackConversion(linkId: string, marketplace: string, amount: number, orderId?: string): void {
    const event: ConversionEvent = {
      linkId,
      marketplace,
      orderId,
      amount,
      timestamp: new Date()
    };

    this.conversionEvents.push(event);
    this.sendConversionEvent(event);
    this.storeConversionLocally(event);
  }

  // Отправка события клика в аналитику
  private sendClickEvent(event: AffiliateClickEvent): void {
    // Используем новый сервис аналитики
    if (this.analyticsTracker) {
      this.analyticsTracker.trackAffiliateClick(
        event.productId || event.linkId,
        `Product from ${event.marketplace}`,
        event.marketplace,
        event.price,
        event.linkId
      );
    }

    // Отправка на собственный сервер аналитики (если есть)
    this.sendToAnalyticsServer('click', event);
  }

  // Отправка события конверсии в аналитику
  private sendConversionEvent(event: ConversionEvent): void {
    // Используем новый сервис аналитики
    if (this.analyticsTracker) {
      this.analyticsTracker.trackEvent('conversion', {
        transaction_id: event.orderId,
        value: event.amount,
        currency: 'RUB',
        items: [{
          item_id: event.linkId,
          item_name: `Affiliate Purchase - ${event.marketplace}`,
          item_category: 'affiliate',
          price: event.amount,
          quantity: 1
        }]
      });
    }

    // Отправка на собственный сервер аналитики
    this.sendToAnalyticsServer('conversion', event);
  }

  // Локальное сохранение для офлайн режима
  private storeClickLocally(event: AffiliateClickEvent): void {
    try {
      const stored = localStorage.getItem('affiliate_clicks') || '[]';
      const clicks = JSON.parse(stored);
      clicks.push(event);
      
      // Храним только последние 100 кликов
      if (clicks.length > 100) {
        clicks.splice(0, clicks.length - 100);
      }
      
      localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
    } catch (error) {
      console.warn('Failed to store affiliate click locally:', error);
    }
  }

  private storeConversionLocally(event: ConversionEvent): void {
    try {
      const stored = localStorage.getItem('affiliate_conversions') || '[]';
      const conversions = JSON.parse(stored);
      conversions.push(event);
      
      // Храним только последние 50 конверсий
      if (conversions.length > 50) {
        conversions.splice(0, conversions.length - 50);
      }
      
      localStorage.setItem('affiliate_conversions', JSON.stringify(conversions));
    } catch (error) {
      console.warn('Failed to store affiliate conversion locally:', error);
    }
  }

  // Отправка данных на собственный сервер аналитики
  private async sendToAnalyticsServer(type: 'click' | 'conversion', event: any): Promise<void> {
    try {
      // В реальном проекте здесь будет API endpoint
      const response = await fetch('/api/analytics/affiliate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          event,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics server responded with ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to send to analytics server:', error);
      // В случае ошибки сохраняем в очередь для повторной отправки
      this.queueForRetry(type, event);
    }
  }

  // Очередь для повторной отправки
  private queueForRetry(type: 'click' | 'conversion', event: any): void {
    try {
      const queue = JSON.parse(localStorage.getItem('analytics_retry_queue') || '[]');
      queue.push({ type, event, retryCount: 0 });
      localStorage.setItem('analytics_retry_queue', JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to queue for retry:', error);
    }
  }

  // Получение статистики кликов
  getClickStats(): { total: number; byMarketplace: Record<string, number>; bySource: Record<string, number> } {
    const byMarketplace: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.clickEvents.forEach(event => {
      byMarketplace[event.marketplace] = (byMarketplace[event.marketplace] || 0) + 1;
      bySource[event.source] = (bySource[event.source] || 0) + 1;
    });

    return {
      total: this.clickEvents.length,
      byMarketplace,
      bySource
    };
  }

  // Получение статистики конверсий
  getConversionStats(): { total: number; totalAmount: number; byMarketplace: Record<string, { count: number; amount: number }> } {
    const byMarketplace: Record<string, { count: number; amount: number }> = {};
    let totalAmount = 0;

    this.conversionEvents.forEach(event => {
      if (!byMarketplace[event.marketplace]) {
        byMarketplace[event.marketplace] = { count: 0, amount: 0 };
      }
      byMarketplace[event.marketplace].count++;
      byMarketplace[event.marketplace].amount += event.amount;
      totalAmount += event.amount;
    });

    return {
      total: this.conversionEvents.length,
      totalAmount,
      byMarketplace
    };
  }

  // Очистка старых данных
  cleanup(): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    this.clickEvents = this.clickEvents.filter(event => event.timestamp > oneWeekAgo);
    this.conversionEvents = this.conversionEvents.filter(event => event.timestamp > oneWeekAgo);
  }
}

// Хук для использования трекинга
export function useAffiliateTracking() {
  const tracker = AffiliateTrackingService.getInstance();

  return {
    trackClick: (link: AffiliateLink, source?: string, productId?: string) => 
      tracker.trackClick(link, source, productId),
    trackConversion: (linkId: string, marketplace: string, amount: number, orderId?: string) =>
      tracker.trackConversion(linkId, marketplace, amount, orderId),
    getClickStats: () => tracker.getClickStats(),
    getConversionStats: () => tracker.getConversionStats()
  };
}

// Компонент-провайдер для инициализации трекинга
export function AffiliateTracker({ children }: AffiliateTrackerProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    const tracker = AffiliateTrackingService.getInstance();
    
    // Передаем аналитический трекер в сервис
    tracker.setAnalyticsTracker(analytics);
    
    // Очистка старых данных при загрузке
    tracker.cleanup();

    // Попытка отправить данные из очереди повторов
    const retryQueue = localStorage.getItem('analytics_retry_queue');
    if (retryQueue) {
      try {
        const queue = JSON.parse(retryQueue);
        // Здесь можно добавить логику повторной отправки
        console.log('Retry queue:', queue);
      } catch (error) {
        console.warn('Failed to process retry queue:', error);
      }
    }

    // Периодическая очистка данных
    const cleanupInterval = setInterval(() => {
      tracker.cleanup();
    }, 60 * 60 * 1000); // Каждый час

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [analytics]);

  return <>{children}</>;
}

// Экспорт сервиса для прямого использования
export { AffiliateTrackingService };