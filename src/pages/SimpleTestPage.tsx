import React from 'react'

export const SimpleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Простая тестовая страница</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Эта страница проверяет, что базовое приложение работает без аутентификации.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ React работает</h2>
            <p>Если вы видите эту страницу, React рендерится корректно.</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ Tailwind CSS работает</h2>
            <p>Стили применяются правильно.</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ Роутинг работает</h2>
            <p>Вы попали на эту страницу через роутер.</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Тестовые ссылки:</h3>
            <div className="space-x-4">
              <a href="/" className="text-blue-600 hover:underline">Главная</a>
              <a href="/auth-test" className="text-blue-600 hover:underline">Тест аутентификации</a>
              <a href="/supabase-auth-test" className="text-blue-600 hover:underline">Тест Supabase</a>
              <a href="/auth/login" className="text-blue-600 hover:underline">Логин</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}