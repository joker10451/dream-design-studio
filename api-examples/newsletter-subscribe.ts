// Пример API роута для Next.js
// Поместите этот файл в pages/api/newsletter/subscribe.ts или app/api/newsletter/subscribe/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '@/lib/emailService';
import { validateEmail } from '@/lib/newsletterUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, preferences, source } = req.body;

    // Валидация входящих данных
    if (!email) {
      return res.status(400).json({ error: 'Email адрес обязателен' });
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Подписка через email сервис
    const result = await emailService.subscribe({ 
      email: email.toLowerCase().trim(), 
      preferences, 
      source 
    });

    // Логирование успешной подписки
    console.log('Newsletter subscription:', {
      email: email.replace(/(.{2}).*@/, '$1***@'), // Маскируем email для логов
      source,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Newsletter subscription error:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      body: req.body
    });

    // Возвращаем понятную ошибку пользователю
    const errorMessage = error.message.includes('уже подписан') 
      ? error.message 
      : 'Произошла ошибка при подписке. Попробуйте еще раз.';

    res.status(500).json({ error: errorMessage });
  }
}

// Для App Router (Next.js 13+)
export async function POST(request: Request) {
  try {
    const { email, preferences, source } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email адрес обязателен' }, { status: 400 });
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const result = await emailService.subscribe({ 
      email: email.toLowerCase().trim(), 
      preferences, 
      source 
    });

    return Response.json(result);
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    const errorMessage = error.message.includes('уже подписан') 
      ? error.message 
      : 'Произошла ошибка при подписке. Попробуйте еще раз.';

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}