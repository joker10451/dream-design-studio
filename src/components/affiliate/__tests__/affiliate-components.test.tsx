import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AffiliateButton } from '../AffiliateButton';
import { AffiliateDisclosure } from '../AffiliateDisclosure';
import { useAffiliateTracking } from '../AffiliateTracker';
import { AffiliateLink } from '@/data/products';

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
      render(<AffiliateButton link={mockAffiliateLink} />);
      
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

      render(<AffiliateButton link={mockAffiliateLink} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockTrackClick).toHaveBeenCalledWith(mockAffiliateLink);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        mockAffiliateLink.url,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('renders compact variant correctly', () => {
      render(
        <AffiliateButton 
          link={mockAffiliateLink} 
          variant="compact" 
          showPrice={true}
        />
      );
      
      expect(screen.getByText('Wildberries')).toBeInTheDocument();
      expect(screen.getByText(/1 500₽/i)).toBeInTheDocument();
    });

    it('renders minimal variant correctly', () => {
      render(
        <AffiliateButton 
          link={mockAffiliateLink} 
          variant="minimal"
        />
      );
      
      expect(screen.getByText('Wildberries')).toBeInTheDocument();
      expect(screen.queryByText(/1 500₽/i)).not.toBeInTheDocument();
    });

    it('disables button when link is not available', () => {
      const unavailableLink = { ...mockAffiliateLink, isAvailable: false };
      
      render(<AffiliateButton link={unavailableLink} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('calls custom onClick handler when provided', () => {
      const mockOnClick = vi.fn();
      
      render(
        <AffiliateButton 
          link={mockAffiliateLink} 
          onClick={mockOnClick}
        />
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

      const { rerender } = render(<AffiliateButton link={ozonLink} />);
      expect(screen.getByText(/OZON/i)).toBeInTheDocument();

      rerender(<AffiliateButton link={yandexLink} />);
      expect(screen.getByText(/Яндекс.Маркет/i)).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('formats prices correctly with Russian locale', () => {
      const expensiveLink = { ...mockAffiliateLink, price: 123456 };
      
      render(<AffiliateButton link={expensiveLink} showPrice={true} />);
      
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

      render(<AffiliateButton link={mockAffiliateLink} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockTrackClick).toHaveBeenCalledWith(mockAffiliateLink);
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

      render(<AffiliateButton link={mockAffiliateLink} />);
      
      const button = screen.getByRole('button');
      
      // Should not throw error
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });
});