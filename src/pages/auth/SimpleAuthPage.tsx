import React from 'react'

export const SimpleAuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Простая страница входа</h1>
          <p className="text-muted-foreground">Тестовая версия без сложных зависимостей</p>
        </div>
        
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded-md"
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Войти
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Тестовый аккаунт: admin@test.com / Admin123!</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline">← Вернуться на главную</a>
        </div>
      </div>
    </div>
  )
}