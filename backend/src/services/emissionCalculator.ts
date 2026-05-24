import { EmissionFactor, CSVRow, Footprint } from '../types';

export class EmissionCalculator {
  private emissionFactors: EmissionFactor = {
    car_petrol: 0.192, // kgCO2/km
    bus: 0.105, // kgCO2/km
    short_flight: 0.15, // kgCO2/km
    electricity: 0.475, // kgCO2/kWh
    beef: 27, // kgCO2/kg
    generic_purchase: 0.0005 // tCO2/USD (converted to kgCO2/USD)
  };

  calculateEmission(category: string, amount: number, unit: string, meta: Record<string, any> = {}): number {
    const normalizedAmount = this.normalizeAmount(amount, unit);
    
    switch (category.toLowerCase()) {
      case 'transport':
        return this.calculateTransportEmission(normalizedAmount, meta);
      case 'energy':
        return this.calculateEnergyEmission(normalizedAmount, meta);
      case 'food':
        return this.calculateFoodEmission(normalizedAmount, meta);
      case 'purchase':
        return this.calculatePurchaseEmission(normalizedAmount, meta);
      default:
        return this.calculateGenericEmission(normalizedAmount, category);
    }
  }

  private normalizeAmount(amount: number, unit: string): number {
    const unitLower = unit.toLowerCase().trim();
    
    // Distance conversions to km
    if (unitLower === 'mi' || unitLower === 'mile' || unitLower === 'miles') {
      return amount * 1.60934;
    } else if (unitLower === 'm' || unitLower === 'meter' || unitLower === 'meters') {
      return amount / 1000; // meters to km
    }
    
    // Weight conversions to kg
    if (unitLower === 'lb' || unitLower === 'lbs' || unitLower === 'pound' || unitLower === 'pounds') {
      return amount * 0.453592;
    } else if (unitLower === 'g' || unitLower === 'gram' || unitLower === 'grams') {
      return amount / 1000; // grams to kg
    }
    
    // Energy conversions to kWh
    if (unitLower === 'mj') {
      return amount * 0.277778; // MJ to kWh
    } else if (unitLower === 'btu') {
      return amount * 0.000293071; // BTU to kWh
    }
    
    // Currency conversions to USD (simplified)
    if (unitLower === 'eur') {
      return amount * 1.1; // Approximate EUR to USD
    } else if (unitLower === 'gbp') {
      return amount * 1.25; // Approximate GBP to USD
    }
    
    return amount; // Assume already in correct unit
  }

  private calculateTransportEmission(distanceKm: number, meta: Record<string, any>): number {
    const transportType = meta.transport_type || meta.type || 'car_petrol';
    
    switch (transportType.toLowerCase()) {
      case 'car':
      case 'petrol':
      case 'gasoline':
        return distanceKm * this.emissionFactors.car_petrol;
      case 'bus':
      case 'public_transport':
        return distanceKm * this.emissionFactors.bus;
      case 'flight':
      case 'airplane':
      case 'plane':
        return distanceKm * this.emissionFactors.short_flight;
      default:
        return distanceKm * this.emissionFactors.car_petrol; // Default to car
    }
  }

  private calculateEnergyEmission(energyKwh: number, meta: Record<string, any>): number {
    // For now, assume grid electricity
    // In a real system, you might want to consider renewable energy sources
    return energyKwh * this.emissionFactors.electricity;
  }

  private calculateFoodEmission(weightKg: number, meta: Record<string, any>): number {
    const foodType = meta.food_type || meta.type || 'generic';
    
    switch (foodType.toLowerCase()) {
      case 'beef':
      case 'red_meat':
        return weightKg * this.emissionFactors.beef;
      case 'chicken':
      case 'poultry':
        return weightKg * 6.9; // kgCO2/kg
      case 'pork':
        return weightKg * 12.1; // kgCO2/kg
      case 'fish':
      case 'seafood':
        return weightKg * 3.0; // kgCO2/kg
      case 'dairy':
      case 'milk':
      case 'cheese':
        return weightKg * 3.2; // kgCO2/kg
      case 'vegetables':
      case 'vegetable':
        return weightKg * 2.0; // kgCO2/kg
      case 'fruits':
      case 'fruit':
        return weightKg * 1.1; // kgCO2/kg
      default:
        return weightKg * 4.0; // Average food emission factor
    }
  }

  private calculatePurchaseEmission(amountUsd: number, meta: Record<string, any>): number {
    // Convert from tCO2/USD to kgCO2/USD
    return amountUsd * this.emissionFactors.generic_purchase * 1000;
  }

  private calculateGenericEmission(amount: number, category: string): number {
    // Generic emission factor for unknown categories
    // This is a fallback - in practice, you'd want more specific factors
    return amount * 0.1; // Very rough estimate
  }

  parseCSVRow(row: CSVRow): Partial<Footprint> {
    const co2_kg = this.calculateEmission(
      row.category,
      row.amount,
      row.unit,
      {
        description: row.description,
        ...row
      }
    );

    return {
      category: row.category as any,
      co2_kg,
      date: new Date(row.date),
      meta: {
        original_amount: row.amount,
        original_unit: row.unit,
        description: row.description,
        ...row
      }
    };
  }

  getEmissionFactors(): EmissionFactor {
    return { ...this.emissionFactors };
  }
}
