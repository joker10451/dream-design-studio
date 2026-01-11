import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Newsletter, 
  NewsletterSubscriptionRequest, 
  NewsletterSubscriptionResponse,
  NewsletterUnsubscribeRequest,
  NewsletterPreferences 
} from '@/types/newsletter';
import { 
  validateEmail, 
  normalizeEmail, 
  logSubscriptionEvent
} from '@/lib/newsletterUtils';
import { emailService } from '@/lib/emailService';

export function useNewsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Мутация для подписки
  const subscribeMutation = useMutation({
    mutationFn: (request: NewsletterSubscriptionRequest) => emailService.subscribe(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });

  // Мутация для отписки
  const unsubscribeMutation = useMutation({
    mutationFn: (request: NewsletterUnsubscribeRequest) => emailService.unsubscribe(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });

  // Мутация для обновления настроек
  const updatePreferencesMutation = useMutation({
    mutationFn: ({ email, preferences }: { email: string; preferences: NewsletterPreferences }) =>
      emailService.updatePreferences(email, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });

  // Функция подписки с валидацией
  const subscribe = useCallback(async (request: NewsletterSubscriptionRequest) => {
    setIsSubmitting(true);
    try {
      const validation = validateEmail(request.email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const normalizedRequest = {
        ...request,
        email: normalizeEmail(request.email)
      };

      const result = await subscribeMutation.mutateAsync(normalizedRequest);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [subscribeMutation]);

  // Функция отписки
  const unsubscribe = useCallback(async (request: NewsletterUnsubscribeRequest) => {
    if (!request.email) {
      throw new Error('Email адрес обязателен');
    }

    const normalizedRequest = {
      ...request,
      email: normalizeEmail(request.email)
    };

    return await unsubscribeMutation.mutateAsync(normalizedRequest);
  }, [unsubscribeMutation]);

  // Функция обновления настроек
  const updatePreferences = useCallback(async (email: string, preferences: NewsletterPreferences) => {
    const normalizedEmail = normalizeEmail(email);
    return await updatePreferencesMutation.mutateAsync({ email: normalizedEmail, preferences });
  }, [updatePreferencesMutation]);

  // Функция получения подписки
  const getSubscription = useCallback((email: string) => {
    const normalizedEmail = normalizeEmail(email);
    // Возвращаем объект с хуком useQuery, а не вызываем хук внутри callback
    return {
      queryKey: ['newsletter', normalizedEmail],
      queryFn: () => mockNewsletterAPI.getSubscription(normalizedEmail),
      enabled: !!email,
    };
  }, []);

  return {
    // Функции
    subscribe,
    unsubscribe,
    updatePreferences,
    getSubscription,
    
    // Состояния
    isSubmitting: isSubmitting || subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    
    // Ошибки
    subscribeError: subscribeMutation.error,
    unsubscribeError: unsubscribeMutation.error,
    updatePreferencesError: updatePreferencesMutation.error,
    
    // Успешные результаты
    subscribeSuccess: subscribeMutation.isSuccess,
    unsubscribeSuccess: unsubscribeMutation.isSuccess,
    updatePreferencesSuccess: updatePreferencesMutation.isSuccess,
    
    // Данные
    subscribeData: subscribeMutation.data,
    unsubscribeData: unsubscribeMutation.data,
    updatePreferencesData: updatePreferencesMutation.data,
    
    // Сброс состояний
    resetSubscribe: subscribeMutation.reset,
    resetUnsubscribe: unsubscribeMutation.reset,
    resetUpdatePreferences: updatePreferencesMutation.reset,
  };
}

// Хук для проверки статуса подписки
export function useSubscriptionStatus(email?: string) {
  const normalizedEmail = email ? normalizeEmail(email) : undefined;
  
  return useQuery({
    queryKey: ['newsletter', normalizedEmail],
    queryFn: () => normalizedEmail ? emailService.getSubscription(normalizedEmail) : null,
    enabled: !!normalizedEmail,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Хук для валидации email в реальном времени
export function useEmailValidation() {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  const validateCurrentEmail = useCallback((emailToValidate: string) => {
    const result = validateEmail(emailToValidate);
    setValidation(result);
    return result;
  }, []);

  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    if (newEmail.trim()) {
      validateCurrentEmail(newEmail);
    } else {
      setValidation({ isValid: true });
    }
  }, [validateCurrentEmail]);

  return {
    email,
    validation,
    setEmail: handleEmailChange,
    validateEmail: validateCurrentEmail,
    isValid: validation.isValid,
    error: validation.error
  };
}