import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { analytics } from '@/lib/analytics';
import { CookieConsent as CookieConsentType } from '@/types/analytics';

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentType) => void;
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsentType>({
    analytics: false,
    marketing: false,
    functional: true, // Functional cookies are essential
    timestamp: new Date(),
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = analytics.getConsent();
    if (!existingConsent) {
      setIsVisible(true);
    } else {
      setConsent(existingConsent);
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent: CookieConsentType = {
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date(),
    };
    
    updateConsent(newConsent);
  };

  const handleAcceptSelected = () => {
    const newConsent = {
      ...consent,
      timestamp: new Date(),
    };
    
    updateConsent(newConsent);
  };

  const handleRejectAll = () => {
    const newConsent: CookieConsentType = {
      analytics: false,
      marketing: false,
      functional: true, // Keep functional cookies
      timestamp: new Date(),
    };
    
    updateConsent(newConsent);
  };

  const updateConsent = (newConsent: CookieConsentType) => {
    setConsent(newConsent);
    analytics.updateConsent(newConsent);
    onConsentChange?.(newConsent);
    setIsVisible(false);
  };

  const handleConsentChange = (type: keyof CookieConsentType, checked: boolean) => {
    if (type === 'timestamp') return; // Don't allow changing timestamp
    
    setConsent(prev => ({
      ...prev,
      [type]: checked,
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Настройки файлов cookie</CardTitle>
          <CardDescription>
            Мы используем файлы cookie для улучшения вашего опыта использования сайта, 
            анализа трафика и персонализации контента.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showDetails && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="functional"
                  checked={consent.functional}
                  disabled={true} // Functional cookies are required
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="functional"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Функциональные файлы cookie (обязательные)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Необходимы для базовой работы сайта, включая навигацию и доступ к защищенным разделам.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={consent.analytics}
                  onCheckedChange={(checked) => handleConsentChange('analytics', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="analytics"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Аналитические файлы cookie
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Помогают нам понимать, как посетители взаимодействуют с сайтом, собирая и предоставляя информацию анонимно.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={consent.marketing}
                  onCheckedChange={(checked) => handleConsentChange('marketing', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="marketing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Маркетинговые файлы cookie
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Используются для отслеживания посетителей на веб-сайтах с целью показа релевантной рекламы.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 w-full">
            <Button onClick={handleAcceptAll} className="flex-1">
              Принять все
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              Отклонить все
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full">
            {showDetails && (
              <Button onClick={handleAcceptSelected} variant="secondary" className="flex-1">
                Сохранить настройки
              </Button>
            )}
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="flex-1"
            >
              {showDetails ? 'Скрыть настройки' : 'Настроить'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}