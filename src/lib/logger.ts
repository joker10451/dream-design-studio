/**
 * Утилита для логирования с поддержкой dev/production режимов
 * В production режиме логи отключаются (кроме критичных ошибок)
 */

const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  /**
   * Логирует информацию (только в dev режиме)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Логирует предупреждения (только в dev режиме)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Логирует ошибки (всегда, но в production можно отключить через env)
   */
  error: (...args: unknown[]) => {
    // В production логируем ошибки только если явно включено
    if (isDev || import.meta.env.VITE_ENABLE_ERROR_LOGS === 'true') {
      console.error(...args);
    }
  },

  /**
   * Логирует отладочную информацию (только в dev режиме)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Логирует информацию (только в dev режиме)
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Группирует логи (только в dev режиме)
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * Закрывает группу логов (только в dev режиме)
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  }
};

// Экспортируем для удобства
export default logger;
