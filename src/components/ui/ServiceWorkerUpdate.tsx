import { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from './button'

export const ServiceWorkerUpdate = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false

      // Слушаем сообщения от Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })

      // Проверяем наличие ожидающего Service Worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          showUpdateNotification(registration)
        }

        // Слушаем обновления
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification(registration)
              }
            })
          }
        })
      })
    }
  }, [])

  const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
    if (!registration.waiting) return

    toast.info('Доступно обновление приложения', {
      description: 'Нажмите, чтобы обновить до последней версии',
      duration: Infinity,
      action: {
        label: 'Обновить',
        onClick: () => {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
        }
      },
      cancel: {
        label: 'Позже',
        onClick: () => {
          // Закрываем toast, пользователь может обновить позже
        }
      }
    })
  }

  return null
}
