import { describe, it, expect } from 'vitest';
import type { SelectedDevice, CalculatorRecommendation } from '@/types/calculator';

describe('Calculator Types and Logic', () => {
  it('should create valid SelectedDevice object', () => {
    const device: SelectedDevice = {
      deviceId: '1',
      quantity: 2,
      selectedMarketplace: 'wildberries',
      price: 1490
    };

    expect(device.deviceId).toBe('1');
    expect(device.quantity).toBe(2);
    expect(device.selectedMarketplace).toBe('wildberries');
    expect(device.price).toBe(1490);
  });

  it('should calculate total cost correctly', () => {
    const devices: SelectedDevice[] = [
      {
        deviceId: '1',
        quantity: 2,
        selectedMarketplace: 'wildberries',
        price: 1490
      },
      {
        deviceId: '2',
        quantity: 1,
        selectedMarketplace: 'ozon',
        price: 890
      }
    ];

    const totalCost = devices.reduce(
      (sum, device) => sum + (device.price * device.quantity),
      0
    );

    expect(totalCost).toBe(3870); // (1490 * 2) + (890 * 1)
  });

  it('should create valid CalculatorRecommendation object', () => {
    const recommendation: CalculatorRecommendation = {
      category: 'budget',
      totalCost: 5000,
      devices: [],
      description: 'Базовый набор для начинающих',
      savings: 1000
    };

    expect(recommendation.category).toBe('budget');
    expect(recommendation.totalCost).toBe(5000);
    expect(recommendation.devices).toEqual([]);
    expect(recommendation.description).toBe('Базовый набор для начинающих');
    expect(recommendation.savings).toBe(1000);
  });

  it('should handle empty device list', () => {
    const devices: SelectedDevice[] = [];
    const totalCost = devices.reduce(
      (sum, device) => sum + (device.price * device.quantity),
      0
    );

    expect(totalCost).toBe(0);
  });

  it('should validate marketplace names', () => {
    const validMarketplaces = ['wildberries', 'ozon', 'yandex'];
    const device: SelectedDevice = {
      deviceId: '1',
      quantity: 1,
      selectedMarketplace: 'wildberries',
      price: 1000
    };

    expect(validMarketplaces).toContain(device.selectedMarketplace);
  });
});