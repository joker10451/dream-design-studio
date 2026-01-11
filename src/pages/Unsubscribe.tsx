import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  ArrowLeft
} from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';
import { Link } from 'react-router-dom';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    unsubscribe, 
    isUnsubscribing, 
    unsubscribeError, 
    unsubscribeSuccess, 
    unsubscribeData 
  } = useNewsletter();

  // Автоматическая отписка при наличии токена
  useEffect(() => {
    if (email && token && !isProcessing && !unsubscribeSuccess) {
      setIsProcessing(true);
      handleUnsubscribe();
    }
  }, [email, token]); // Убираем зависимости, которые могут вызвать бесконечный цикл

  const handleUnsubscribe = async (userReason?: string) => {
    if (!email) return;

    try {
      await unsubscribe({
        email,
        token: token || undefined,
        reason: userReason || reason || undefined
      });
    } catch (error) {
      // Ошибка обрабатывается через unsubscribeError
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualUnsubscribe = () => {
    handleUnsubscribe(reason);
  };

  // Если нет email параметра
  if (!email) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <CardTitle>Неверная ссылка</CardTitle>
                  <CardDescription>
                    Ссылка для отписки неполная или повреждена
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Если вы хотите отписаться от рассылки, воспользуйтесь формой управления подпиской
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        На главную
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/manage-subscription">
                        Управление подпиской
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Успешная отписка
  if (unsubscribeSuccess && unsubscribeData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-green-800">Отписка выполнена</CardTitle>
                  <CardDescription>
                    {unsubscribeData.message}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Мы больше не будем отправлять письма на адрес:
                    </p>
                    <p className="font-medium">{email}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Если вы передумаете, вы всегда можете подписаться снова на нашем сайте
                    </p>
                    
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          На главную
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link to="/#subscribe">
                          <Mail className="w-4 h-4 mr-2" />
                          Подписаться снова
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Отписка от рассылки
              </h1>
              <p className="text-lg text-muted-foreground">
                Мы сожалеем, что вы решили отписаться
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Подтверждение отписки
                </CardTitle>
                <CardDescription>
                  Email: <span className="font-medium">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Автоматическая отписка в процессе */}
                {(isProcessing || isUnsubscribing) && !token && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Обрабатываем отписку...</p>
                  </div>
                )}

                {/* Ручная отписка */}
                {!token && !isProcessing && !isUnsubscribing && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        Расскажите, почему вы отписываетесь (необязательно)
                      </Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ваш отзыв поможет нам стать лучше..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Возможные причины: слишком много писем, неинтересный контент, 
                        изменились интересы, технические проблемы
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" asChild className="flex-1">
                        <Link to="/manage-subscription">
                          Изменить настройки
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleManualUnsubscribe}
                        disabled={isUnsubscribing}
                        className="flex-1"
                      >
                        {isUnsubscribing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Отписка...
                          </>
                        ) : (
                          'Подтвердить отписку'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Ошибка */}
                {unsubscribeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {unsubscribeError.message || 'Произошла ошибка при отписке. Попробуйте еще раз.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Альтернативные варианты */}
                {!unsubscribeSuccess && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-3">Может быть, стоит попробовать другое?</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Измените частоту получения писем в настройках подписки</p>
                      <p>• Выберите только интересные вам темы</p>
                      <p>• Временно приостановите подписку вместо полной отписки</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link to={`/manage-subscription?email=${encodeURIComponent(email)}`}>
                        Настроить подписку
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Unsubscribe;