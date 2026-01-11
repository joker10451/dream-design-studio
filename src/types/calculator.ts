export interface SelectedDevice {
  deviceId: string;
  quantity: number;
  selectedMarketplace: string;
  price: number;
}

export interface Alternative {
  deviceId: string;
  reason: string;
  savings: number;
  category: string;
}

export interface MarketplacePrice {
  marketplace: string;
  price: number;
  oldPrice?: number;
  availability: boolean;
  affiliateUrl: string;
  lastUpdated: Date;
}

export interface CostCalculatorState {
  selectedDevices: SelectedDevice[];
  totalCost: number;
  alternatives: Alternative[];
  marketplaceComparison: MarketplacePrice[];
}

export interface DeviceCategory {
  id: string;
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  isRequired: boolean;
}

export interface CalculatorRecommendation {
  category: 'budget' | 'mid-range' | 'premium';
  totalCost: number;
  devices: SelectedDevice[];
  description: string;
  savings?: number;
}