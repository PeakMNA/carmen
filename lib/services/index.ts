/**
 * Services - Main Export File
 * 
 * Centralized export for all services including calculations and utilities.
 * This is the main entry point for accessing calculation services throughout the application.
 */

// Re-export calculation services
export * from './calculations'

// Re-export utility services - exclude types already exported from calculations
export {
  globalCacheManager,
  type CacheStats,
  type CacheConfig,
  CacheManager,
  Cacheable
} from './utils/cache-manager'

export {
  exchangeRateConverter,
  type ExchangeRateProvider,
  type ExchangeRateData,
  type ConversionRequest,
  type ConversionResponse,
  ExchangeRateConverter
} from './utils/exchange-rate-converter'

export {
  PriceCalculator,
  type PricingTier,
  type BulkDiscountConfig,
  type PromotionalRule,
  type PromotionalConditions,
  type PromotionalDiscount,
  type PriceCalculationInput,
  type PriceCalculationResult,
  type AppliedDiscount,
  type PriceComparisonInput as UtilPriceComparisonInput,
  type PriceComparisonResult as UtilPriceComparisonResult
} from './utils/price-calculator'

// Re-export Menu Engineering module
export * from './menu-engineering-index'

// Re-export Store Operations services
export * from './store-operations'

// Type definitions for service configuration
export interface ServiceConfig {
  cache?: {
    enabled: boolean
    maxMemoryMB?: number
    defaultTtlSeconds?: number
    evictionStrategy?: 'lru' | 'lfu' | 'fifo'
  }
  exchangeRates?: {
    providers?: string[]
    defaultSource?: string
    fallbackEnabled?: boolean
    cacheHours?: number
  }
  calculations?: {
    precision?: number
    defaultCurrency?: string
    roundingMode?: 'round' | 'floor' | 'ceil'
  }
}

/**
 * Service initialization and configuration
 */
export class ServiceManager {
  private static instance: ServiceManager
  private config: ServiceConfig = {}

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager()
    }
    return ServiceManager.instance
  }

  /**
   * Initialize services with configuration
   */
  initialize(config: ServiceConfig): void {
    this.config = { ...this.config, ...config }
    console.log('[ServiceManager] Initialized with config:', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): ServiceConfig {
    return { ...this.config }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    cache: boolean
    exchangeRates: boolean
    calculations: boolean
    timestamp: Date
  }> {
    const timestamp = new Date()

    try {
      // Test cache manager
      const { globalCacheManager } = await import('./utils/cache-manager')
      globalCacheManager.set('health_check', timestamp, 1)
      const cacheHealthy = globalCacheManager.get('health_check') !== null
      globalCacheManager.delete('health_check')

      // Test exchange rate service
      const { exchangeRateConverter } = await import('./utils/exchange-rate-converter')
      const supportedCurrencies = await exchangeRateConverter.getSupportedCurrencies()
      const exchangeRatesHealthy = supportedCurrencies.value.length > 0

      // Test calculation services
      const { financialCalculations } = await import('./calculations')
      const testMoney = { amount: 100, currency: 'USD' }
      const taxResult = await financialCalculations.calculateTax({
        subtotal: testMoney,
        taxRate: 10
      })
      const calculationsHealthy = taxResult.value.taxAmount.amount === 10

      return {
        cache: cacheHealthy,
        exchangeRates: exchangeRatesHealthy,
        calculations: calculationsHealthy,
        timestamp
      }
    } catch (error) {
      console.error('[ServiceManager] Health check failed:', error)
      return {
        cache: false,
        exchangeRates: false,
        calculations: false,
        timestamp
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    try {
      const { globalCacheManager } = require('./utils/cache-manager')
      const { exchangeRateConverter } = require('./utils/exchange-rate-converter')
      
      globalCacheManager.clear()
      exchangeRateConverter.clearCache()
      
      console.log('[ServiceManager] All caches cleared')
    } catch (error) {
      console.error('[ServiceManager] Failed to clear caches:', error)
    }
  }

  /**
   * Get service statistics
   */
  async getStatistics(): Promise<{
    cache: any
    exchangeRates: any
    timestamp: Date
  }> {
    try {
      const { globalCacheManager } = await import('./utils/cache-manager')
      const { exchangeRateConverter } = await import('./utils/exchange-rate-converter')

      return {
        cache: globalCacheManager.getStats(),
        exchangeRates: exchangeRateConverter.getCacheStats(),
        timestamp: new Date()
      }
    } catch (error) {
      console.error('[ServiceManager] Failed to get statistics:', error)
      return {
        cache: null,
        exchangeRates: null,
        timestamp: new Date()
      }
    }
  }
}

// Global service manager instance
export const serviceManager = ServiceManager.getInstance()

/**
 * Initialize services with default configuration
 * Call this in your application startup
 */
export function initializeServices(config?: ServiceConfig): void {
  const defaultConfig: ServiceConfig = {
    cache: {
      enabled: true,
      maxMemoryMB: 50,
      defaultTtlSeconds: 300,
      evictionStrategy: 'lru'
    },
    exchangeRates: {
      providers: ['mock'],
      defaultSource: 'MOCK',
      fallbackEnabled: true,
      cacheHours: 1
    },
    calculations: {
      precision: 2,
      defaultCurrency: 'USD',
      roundingMode: 'round'
    }
  }

  serviceManager.initialize({ ...defaultConfig, ...config })
}