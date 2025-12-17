/**
 * Vendor Allocation Service
 *
 * Handles vendor selection and scoring for PR auto-pricing.
 * Implements the allocation algorithm based on business priority rules:
 *
 * Priority 1: Preferred Items (product locked to specific vendor)
 * Priority 2: Preferred Vendors (vendor marked as preferred)
 * Priority 3: Best Price (lowest normalized price per base unit)
 *
 * The service uses a weighted scoring system to rank all vendors
 * and provide transparent recommendations.
 */

import {
  NormalizedVendorOption,
  VendorRecommendationReason,
  VendorScoreBreakdown,
  VendorScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  RecommendationFactor,
  Money
} from '@/lib/types'

// =============================================================================
// Service Types
// =============================================================================

export interface AllocationInput {
  /** All available vendor options (already normalized) */
  vendorOptions: NormalizedVendorOption[]

  /** Requested quantity in base unit */
  requestedQuantityInBaseUnit: number

  /** Only consider vendors meeting MOQ */
  requireMOQ?: boolean

  /** Custom scoring weights (optional) */
  scoringWeights?: Partial<VendorScoringWeights>
}

export interface AllocationResult {
  /** The recommended vendor (null if no valid options) */
  recommended: NormalizedVendorOption | null

  /** All alternatives sorted by score (best first, excludes recommended) */
  alternatives: NormalizedVendorOption[]

  /** All options including recommended, sorted by score */
  allOptions: NormalizedVendorOption[]

  /** Reason for the recommendation */
  reason: VendorRecommendationReason | null

  /** Summary statistics */
  summary: {
    totalVendors: number
    vendorsMeetingMOQ: number
    lowestPrice: Money | null
    highestPrice: Money | null
    potentialSavings: Money | null
    preferredItemVendor: string | null
    preferredVendorCount: number
  }
}

// =============================================================================
// Vendor Allocation Service
// =============================================================================

class VendorAllocationServiceImpl {
  /**
   * Allocate the best vendor based on priority rules and scoring.
   */
  allocateVendor(input: AllocationInput): AllocationResult {
    const {
      vendorOptions,
      requestedQuantityInBaseUnit,
      requireMOQ = false,
      scoringWeights
    } = input

    // Merge with default weights
    const weights: VendorScoringWeights = {
      ...DEFAULT_SCORING_WEIGHTS,
      ...scoringWeights
    }

    // Filter options if MOQ is required
    let eligibleOptions = requireMOQ
      ? vendorOptions.filter(v => v.meetsMinimumOrder)
      : vendorOptions

    // If no eligible options, return null recommendation
    if (eligibleOptions.length === 0) {
      return this.createEmptyResult(vendorOptions)
    }

    // Score all vendors
    const scoredOptions = this.scoreVendors(eligibleOptions, weights)

    // Apply priority rules to determine recommendation
    const recommended = this.applyPriorityRules(scoredOptions)

    // Build recommendation reason
    const reason = this.buildRecommendationReason(recommended, scoredOptions)

    // Sort all options by score (best first)
    const sortedOptions = scoredOptions.sort((a, b) => b.overallScore - a.overallScore)

    // Assign ranks
    sortedOptions.forEach((option, index) => {
      option.rank = index + 1
      option.isRecommended = option.vendorId === recommended?.vendorId
    })

    // Get alternatives (all except recommended)
    const alternatives = sortedOptions.filter(
      v => v.vendorId !== recommended?.vendorId
    )

    // Calculate summary statistics
    const summary = this.calculateSummary(sortedOptions)

    return {
      recommended,
      alternatives,
      allOptions: sortedOptions,
      reason,
      summary
    }
  }

  /**
   * Score all vendors using the weighted scoring system.
   */
  private scoreVendors(
    options: NormalizedVendorOption[],
    weights: VendorScoringWeights
  ): NormalizedVendorOption[] {
    // Find price range for normalization
    const prices = options.map(o => o.pricePerBaseUnit.amount)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1 // Avoid division by zero

    // Find lead time range
    const leadTimes = options.map(o => o.leadTimeDays)
    const minLeadTime = Math.min(...leadTimes)
    const maxLeadTime = Math.max(...leadTimes)
    const leadTimeRange = maxLeadTime - minLeadTime || 1

    return options.map(option => {
      const breakdown = this.calculateScoreBreakdown(
        option,
        minPrice,
        priceRange,
        minLeadTime,
        leadTimeRange,
        weights
      )

      return {
        ...option,
        overallScore: breakdown.totalScore
      }
    })
  }

  /**
   * Calculate the score breakdown for a single vendor.
   */
  private calculateScoreBreakdown(
    option: NormalizedVendorOption,
    minPrice: number,
    priceRange: number,
    minLeadTime: number,
    leadTimeRange: number,
    weights: VendorScoringWeights
  ): VendorScoreBreakdown {
    // Preferred Item Score: 100 if preferred item, 0 otherwise
    const preferredItemScore = option.isPreferredItem ? 100 : 0

    // Preferred Vendor Score: 100 if preferred vendor, 0 otherwise
    const preferredVendorScore = option.isPreferredVendor ? 100 : 0

    // Price Score: 100 for lowest price, scaled down for higher prices
    // Lower price = higher score
    const priceDeviation = option.pricePerBaseUnit.amount - minPrice
    const priceScore = priceRange > 0
      ? 100 * (1 - priceDeviation / priceRange)
      : 100

    // Rating Score: Rating (1-5) × 20 = 0-100
    const ratingScore = (option.rating / 5) * 100

    // Lead Time Score: 100 for shortest lead time, scaled down
    const leadTimeDeviation = option.leadTimeDays - minLeadTime
    const leadTimeScore = leadTimeRange > 0
      ? 100 * (1 - leadTimeDeviation / leadTimeRange)
      : 100

    // Calculate total score with weights
    const totalScore =
      preferredItemScore * weights.preferredItem +
      preferredVendorScore * weights.preferredVendor +
      priceScore * weights.price +
      ratingScore * weights.rating +
      leadTimeScore * weights.leadTime

    return {
      preferredItemScore: preferredItemScore * weights.preferredItem,
      preferredVendorScore: preferredVendorScore * weights.preferredVendor,
      priceScore: priceScore * weights.price,
      ratingScore: ratingScore * weights.rating,
      leadTimeScore: leadTimeScore * weights.leadTime,
      totalScore
    }
  }

  /**
   * Apply priority rules to determine the recommended vendor.
   *
   * Priority Order:
   * 1. Preferred Item relationship
   * 2. Preferred Vendor status
   * 3. Best overall score (which heavily weighs price)
   */
  private applyPriorityRules(
    options: NormalizedVendorOption[]
  ): NormalizedVendorOption | null {
    if (options.length === 0) return null

    // Priority 1: Check for preferred item relationships
    const preferredItemVendors = options.filter(o => o.isPreferredItem)
    if (preferredItemVendors.length > 0) {
      // If multiple preferred items, take the one with best score
      return preferredItemVendors.reduce((best, current) =>
        current.overallScore > best.overallScore ? current : best
      )
    }

    // Priority 2: Check for preferred vendors (among those meeting MOQ)
    const preferredVendors = options.filter(
      o => o.isPreferredVendor && o.meetsMinimumOrder
    )
    if (preferredVendors.length > 0) {
      // Among preferred vendors, take the one with best score
      return preferredVendors.reduce((best, current) =>
        current.overallScore > best.overallScore ? current : best
      )
    }

    // Priority 3: Best overall score (which considers price, rating, lead time)
    // Filter to those meeting MOQ first if any do
    const moqCompliant = options.filter(o => o.meetsMinimumOrder)
    const candidatePool = moqCompliant.length > 0 ? moqCompliant : options

    return candidatePool.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    )
  }

  /**
   * Build a human-readable recommendation reason.
   */
  private buildRecommendationReason(
    recommended: NormalizedVendorOption | null,
    allOptions: NormalizedVendorOption[]
  ): VendorRecommendationReason | null {
    if (!recommended) return null

    let primaryFactor: RecommendationFactor
    let explanation: string
    const details: VendorRecommendationReason['details'] = {}

    if (recommended.isPreferredItem) {
      primaryFactor = 'preferred_item'
      explanation = `${recommended.vendorName} is the designated supplier for this product`
      details.preferredRelationship = 'Preferred Item Contract'
    } else if (recommended.isPreferredVendor) {
      primaryFactor = 'preferred_vendor'
      explanation = `${recommended.vendorName} is a preferred vendor with competitive pricing`
      details.preferredRelationship = 'Preferred Vendor'

      // Calculate savings vs non-preferred best price
      const nonPreferred = allOptions.filter(o => !o.isPreferredVendor)
      if (nonPreferred.length > 0) {
        const bestNonPreferred = nonPreferred.reduce((a, b) =>
          a.pricePerBaseUnit.amount < b.pricePerBaseUnit.amount ? a : b
        )
        const priceDiff = recommended.pricePerBaseUnit.amount - bestNonPreferred.pricePerBaseUnit.amount
        if (priceDiff > 0) {
          explanation += ` (${((priceDiff / bestNonPreferred.pricePerBaseUnit.amount) * 100).toFixed(1)}% premium over lowest)`
        }
      }
    } else {
      primaryFactor = 'best_price'
      explanation = `${recommended.vendorName} offers the best price`

      // Calculate savings vs second best
      const sortedByPrice = [...allOptions].sort(
        (a, b) => a.pricePerBaseUnit.amount - b.pricePerBaseUnit.amount
      )
      if (sortedByPrice.length > 1 && sortedByPrice[0].vendorId === recommended.vendorId) {
        const secondBest = sortedByPrice[1]
        const savings = secondBest.pricePerBaseUnit.amount - recommended.pricePerBaseUnit.amount
        const savingsPercent = (savings / secondBest.pricePerBaseUnit.amount) * 100

        details.savingsAmount = {
          amount: savings,
          currency: recommended.pricePerBaseUnit.currency
        }
        details.savingsPercentage = savingsPercent

        explanation += ` (${savingsPercent.toFixed(1)}% cheaper than next option)`
      }
    }

    return {
      primaryFactor,
      explanation,
      details
    }
  }

  /**
   * Calculate summary statistics for the allocation result.
   */
  private calculateSummary(options: NormalizedVendorOption[]): AllocationResult['summary'] {
    if (options.length === 0) {
      return {
        totalVendors: 0,
        vendorsMeetingMOQ: 0,
        lowestPrice: null,
        highestPrice: null,
        potentialSavings: null,
        preferredItemVendor: null,
        preferredVendorCount: 0
      }
    }

    const prices = options.map(o => o.pricePerBaseUnit)
    const sortedPrices = [...prices].sort((a, b) => a.amount - b.amount)
    const lowestPrice = sortedPrices[0]
    const highestPrice = sortedPrices[sortedPrices.length - 1]

    const potentialSavings: Money | null = sortedPrices.length > 1
      ? {
          amount: highestPrice.amount - lowestPrice.amount,
          currency: lowestPrice.currency
        }
      : null

    const preferredItemOption = options.find(o => o.isPreferredItem)

    return {
      totalVendors: options.length,
      vendorsMeetingMOQ: options.filter(o => o.meetsMinimumOrder).length,
      lowestPrice,
      highestPrice,
      potentialSavings,
      preferredItemVendor: preferredItemOption?.vendorName || null,
      preferredVendorCount: options.filter(o => o.isPreferredVendor).length
    }
  }

  /**
   * Create an empty result when no vendors are eligible.
   */
  private createEmptyResult(
    allOptions: NormalizedVendorOption[]
  ): AllocationResult {
    return {
      recommended: null,
      alternatives: [],
      allOptions,
      reason: null,
      summary: {
        totalVendors: allOptions.length,
        vendorsMeetingMOQ: allOptions.filter(o => o.meetsMinimumOrder).length,
        lowestPrice: null,
        highestPrice: null,
        potentialSavings: null,
        preferredItemVendor: null,
        preferredVendorCount: 0
      }
    }
  }

  /**
   * Re-rank vendors when user changes quantity.
   * This recalculates MOQ status and updates rankings.
   */
  reRankForQuantity(
    options: NormalizedVendorOption[],
    newQuantityInBaseUnit: number,
    weights?: Partial<VendorScoringWeights>
  ): AllocationResult {
    // Update MOQ status for each option
    const updatedOptions = options.map(option => ({
      ...option,
      meetsMinimumOrder: newQuantityInBaseUnit >= option.moqInBaseUnit,
      moqGap: Math.max(0, option.moqInBaseUnit - newQuantityInBaseUnit)
    }))

    // Re-allocate with updated options
    return this.allocateVendor({
      vendorOptions: updatedOptions,
      requestedQuantityInBaseUnit: newQuantityInBaseUnit,
      requireMOQ: false, // Show all options but prioritize MOQ-compliant
      scoringWeights: weights
    })
  }

  /**
   * Get vendor options sorted by a specific criterion.
   */
  sortVendorsBy(
    options: NormalizedVendorOption[],
    criterion: 'price' | 'score' | 'rating' | 'leadTime' | 'moq'
  ): NormalizedVendorOption[] {
    const sorted = [...options]

    switch (criterion) {
      case 'price':
        return sorted.sort((a, b) =>
          a.pricePerBaseUnit.amount - b.pricePerBaseUnit.amount
        )
      case 'score':
        return sorted.sort((a, b) => b.overallScore - a.overallScore)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'leadTime':
        return sorted.sort((a, b) => a.leadTimeDays - b.leadTimeDays)
      case 'moq':
        return sorted.sort((a, b) => a.moqInBaseUnit - b.moqInBaseUnit)
      default:
        return sorted
    }
  }

  /**
   * Filter vendor options by various criteria.
   */
  filterVendors(
    options: NormalizedVendorOption[],
    filters: {
      meetsMOQ?: boolean
      isPreferred?: boolean
      minRating?: number
      maxLeadTime?: number
      maxPrice?: number
    }
  ): NormalizedVendorOption[] {
    return options.filter(option => {
      if (filters.meetsMOQ !== undefined && option.meetsMinimumOrder !== filters.meetsMOQ) {
        return false
      }
      if (filters.isPreferred && !option.isPreferredVendor && !option.isPreferredItem) {
        return false
      }
      if (filters.minRating !== undefined && option.rating < filters.minRating) {
        return false
      }
      if (filters.maxLeadTime !== undefined && option.leadTimeDays > filters.maxLeadTime) {
        return false
      }
      if (filters.maxPrice !== undefined && option.pricePerBaseUnit.amount > filters.maxPrice) {
        return false
      }
      return true
    })
  }

  /**
   * Compare two vendors and explain the differences.
   */
  compareVendors(
    vendor1: NormalizedVendorOption,
    vendor2: NormalizedVendorOption
  ): {
    priceDifference: Money
    priceDifferencePercent: number
    cheaperVendor: 'vendor1' | 'vendor2' | 'equal'
    betterRating: 'vendor1' | 'vendor2' | 'equal'
    fasterDelivery: 'vendor1' | 'vendor2' | 'equal'
    higherScore: 'vendor1' | 'vendor2' | 'equal'
  } {
    const priceDiff = vendor1.pricePerBaseUnit.amount - vendor2.pricePerBaseUnit.amount
    const avgPrice = (vendor1.pricePerBaseUnit.amount + vendor2.pricePerBaseUnit.amount) / 2

    return {
      priceDifference: {
        amount: Math.abs(priceDiff),
        currency: vendor1.pricePerBaseUnit.currency
      },
      priceDifferencePercent: avgPrice > 0 ? (Math.abs(priceDiff) / avgPrice) * 100 : 0,
      cheaperVendor: priceDiff < 0 ? 'vendor1' : priceDiff > 0 ? 'vendor2' : 'equal',
      betterRating: vendor1.rating > vendor2.rating ? 'vendor1' :
                    vendor1.rating < vendor2.rating ? 'vendor2' : 'equal',
      fasterDelivery: vendor1.leadTimeDays < vendor2.leadTimeDays ? 'vendor1' :
                      vendor1.leadTimeDays > vendor2.leadTimeDays ? 'vendor2' : 'equal',
      higherScore: vendor1.overallScore > vendor2.overallScore ? 'vendor1' :
                   vendor1.overallScore < vendor2.overallScore ? 'vendor2' : 'equal'
    }
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const VendorAllocationService = new VendorAllocationServiceImpl()

export default VendorAllocationService
