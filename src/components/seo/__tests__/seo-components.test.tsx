import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { SEOHead } from '../SEOHead';
import { Breadcrumbs } from '../Breadcrumbs';

// Wrapper для тестов с необходимыми провайдерами
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </HelmetProvider>
);

describe('SEO Components', () => {
  afterEach(() => {
    // Очищаем document после каждого теста
    document.head.innerHTML = '';
    document.title = '';
  });

  describe('SEOHead', () => {
    it('renders basic SEO meta tags', async () => {
      render(
        <TestWrapper>
          <SEOHead
            title="Test Page"
            description="Test description"
            keywords={['test', 'seo']}
          />
        </TestWrapper>
      );

      // Ждем обновления DOM
      await waitFor(() => {
        expect(document.title).toBe('Test Page | Smart Home 2026');
      });
    });

    it('renders structured data when provided', async () => {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Organization'
      };

      render(
        <TestWrapper>
          <SEOHead
            title="Test Page"
            description="Test description"
            structuredData={structuredData}
          />
        </TestWrapper>
      );

      // Ждем появления script тега
      await waitFor(() => {
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
        expect(scriptTags.length).toBeGreaterThan(0);
      });
    });

    it('sets noindex when specified', async () => {
      render(
        <TestWrapper>
          <SEOHead
            title="Private Page"
            description="Private description"
            noIndex={true}
          />
        </TestWrapper>
      );

      // Ждем обновления мета-тегов
      await waitFor(() => {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
      });
    });
  });

  describe('Breadcrumbs', () => {
    it('renders breadcrumb navigation', () => {
      const items = [
        { name: 'Каталог', url: '/catalog' },
        { name: 'Умные розетки', url: '/catalog/sockets' }
      ];

      const { getByRole, getByText } = render(
        <TestWrapper>
          <Breadcrumbs items={items} />
        </TestWrapper>
      );

      // Проверяем наличие навигации
      expect(getByRole('navigation')).toBeInTheDocument();
      expect(getByText('Главная')).toBeInTheDocument();
      expect(getByText('Каталог')).toBeInTheDocument();
      expect(getByText('Умные розетки')).toBeInTheDocument();
    });

    it('marks last item as current page', () => {
      const items = [
        { name: 'Каталог', url: '/catalog' },
        { name: 'Умные розетки', url: '/catalog/sockets' }
      ];

      const { getByText } = render(
        <TestWrapper>
          <Breadcrumbs items={items} />
        </TestWrapper>
      );

      // Последний элемент должен иметь aria-current="page"
      const lastItem = getByText('Умные розетки');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });

    it('generates structured data for breadcrumbs', async () => {
      const items = [
        { name: 'Каталог', url: '/catalog' }
      ];

      render(
        <TestWrapper>
          <Breadcrumbs items={items} />
        </TestWrapper>
      );

      // Ждем появления structured data
      await waitFor(() => {
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
        expect(scriptTags.length).toBeGreaterThan(0);
        
        const structuredData = JSON.parse(scriptTags[0].textContent || '{}');
        expect(structuredData['@type']).toBe('BreadcrumbList');
      });
    });
  });
});