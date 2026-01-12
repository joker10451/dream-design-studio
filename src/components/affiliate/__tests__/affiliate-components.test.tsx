import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AffiliateButton } from '../AffiliateButton';
import { AffiliateDisclosure } from '../AffiliateDisclosure';
import { useAffiliateTracking } from '../AffiliateTracker';
import { AffiliateLink } from '@/data/products';

// Test wrapper with Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock the tracking hook
vi.mock('../AffiliateTracker', () => ({
  useAffiliateTracking: vi.fn(() => ({
    trackClick: vi.fn(),
    trackConversion: vi.fn(),
    getClickStats: vi.fn(() => ({ total: 0, byMarketplace: {}, bySource: {} })),
    getConversionStats: vi.fn(() => ({ total: 0, totalAmount: 0, byMarketplace: {} }))
  })),
  AffiliateTracker: ({ children }: { children: React.ReactNode }) => children
}));

// Mock analytics hook
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackConversion: vi.fn(),
    trackAffiliateClick: vi.fn()
  }))
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('Affiliate Components', () => {
  const mockAffiliateLink: AffiliateLink = {
    id: 'test-link-1',
    marketplace: 'wildberries',
    url: 'https://wildberries.ru/test?partner=smarthome2026',
    price: 1500,
    isAvailable: true,
    lastUpdated: new Date(),
    trackingParams: { partner: 'smarthome2026', source: 'test' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AffiliateButton', () => {
    it('renders affiliate button with correct marketplace name', () => {
      render(
        <TestWrapper>
          <AffiliateButton link={mockAffiliateLink} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Купить на Wildberries/i)).toBeInTheDocument();
      expect(screen.getByText(/1 500₽/i)).toBeInTheDocument();
    });

    it('handles click and opens affiliate link', () => {
      const mockTrackClick = vi.fn();
      (useAffiliateTracking as any).mockReturnValue({
        trackClick: mockTrackClick,
        trackConversion: vi.fn(),
        getClickStats: vi.fn(),
        getConversionStats: vi.fn()
      });

      render(
        <TestWrapper>
          <AffiliateButton link={mockAffiliateLink} />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockTrackClick).toHaveBeenCalledWith(mockAffiliateLink, 'button_click', mockAffiliateLink.id);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        mockAffiliateLink.url,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('renders compact variant correctly', () => {
      render(
        <TestWrapper>
          <AffiliateButton 
            link={mockAffiliateLink} 
            variant="compact" 
            showPrice={true}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Wildberries')).toBeInTheDocument();
      expect(screen.getByText(/1 500₽/i)).toBeInTheDocument();
    });

    it('renders minimal variant correctly', () => {
      render(
        <TestWrapper>
          <AffiliateButton 
            link={mockAffiliateLink} 
            variant="minimal"
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Wildberries')).toBeInTheDocument();
      expect(screen.queryByText(/1 500₽/i)).not.toBeInTheDocument();
    });

    it('disables button when link is not available', () => {
      const unavailableLink = { ...mockAffiliateLink, isAvailable: false };
      
      render(
        <TestWrapper>
          <AffiliateButton link={unavailableLink} />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('calls custom onClick handler when provided', () => {
      const mockOnClick = vi.fn();
      
      render(
        <TestWrapper>
          <AffiliateButton 
            link={mockAffiliateLink} 
            onClick={mockOnClick}
          />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledWith(mockAffiliateLink);
    });
  });

  describe('AffiliateDisclosure', () => {
    it('renders default alert disclosure', () => {
      render(<AffiliateDisclosure />);
      
      expect(screen.getByText(/Мы получаем комиссию с покупок по партнерским ссылкам/i)).toBeInTheDocument();
    });

    it('renders inline disclosure', () => {
      render(<AffiliateDisclosure variant="inline" />);
      
      expect(screen.getByText(/Мы получаем комиссию с покупок по партнерским ссылкам/i)).toBeInTheDocument();
    });

    it('renders card disclosure with details', () => {
      render(<AffiliateDisclosure variant="card" showDetails={true} />);
      
      expect(screen.getByText(/Партнерские ссылки/i)).toBeInTheDocument();
      expect(screen.getByText(/Это не влияет на цену для вас и помогает развивать проект/i)).toBeInTheDocument();
    });

    it('renders footer disclosure with links', () => {
      render(<AffiliateDisclosure variant="footer" />);
      
      expect(screen.getByText(/Политика партнерских программ/i)).toBeInTheDocument();
      expect(screen.getByText(/Политика конфиденциальности/i)).toBeInTheDocument();
    });
  });

  describe('Marketplace Recognition', () => {
    it('recognizes different marketplaces correctly', () => {
      const ozonLink = { ...mockAffiliateLink, marketplace: 'ozon' };
      const yandexLink = { ...mockAffiliateLink, marketplace: 'yandex' };

      const { rerender } = render(
        <TestWrapper>
          <AffiliateButton link={ozonLink} />
        </TestWrapper>
      );
      expect(screen.getByText(/OZON/i)).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <AffiliateButton link={yandexLink} />
        </TestWrapper>
      );
      expect(screen.getByText(/Яндекс.Маркет/i)).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('formats prices correctly with Russian locale', () => {
      const expensiveLink = { ...mockAffiliateLink, price: 123456 };
      
      render(
        <TestWrapper>
          <AffiliateButton link={expensiveLink} showPrice={true} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/123 456₽/i)).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    it('tracks clicks with correct parameters', () => {
      const mockTrackClick = vi.fn();
      (useAffiliateTracking as any).mockReturnValue({
        trackClick: mockTrackClick,
        trackConversion: vi.fn(),
        getClickStats: vi.fn(),
        getConversionStats: vi.fn()
      });

      render(
        <TestWrapper>
          <AffiliateButton link={mockAffiliateLink} />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockTrackClick).toHaveBeenCalledWith(mockAffiliateLink, 'button_click', mockAffiliateLink.id);
    });

    it('handles analytics errors gracefully', () => {
      const mockTrackClick = vi.fn(() => {
        throw new Error('Analytics error');
      });
      
      (useAffiliateTracking as any).mockReturnValue({
        trackClick: mockTrackClick,
        trackConversion: vi.fn(),
        getClickStats: vi.fn(),
        getConversionStats: vi.fn()
      });

      render(
        <TestWrapper>
          <AffiliateButton link={mockAffiliateLink} />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      
      // Should not throw error
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });
});