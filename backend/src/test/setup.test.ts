import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EmissionCalculator } from '../services/emissionCalculator';

describe('Emission Calculator', () => {
  const calculator = new EmissionCalculator();

  it('should calculate car transport emissions correctly', () => {
    const emission = calculator.calculateEmission('transport', 100, 'km', { transport_type: 'car' });
    assert.ok(Math.abs(emission - 19.2) < 0.1); // 100 km * 0.192 kgCO2/km
  });

  it('should calculate electricity emissions correctly', () => {
    const emission = calculator.calculateEmission('energy', 50, 'kWh');
    assert.ok(Math.abs(emission - 23.75) < 0.1); // 50 kWh * 0.475 kgCO2/kWh
  });

  it('should calculate beef food emissions correctly', () => {
    const emission = calculator.calculateEmission('food', 2, 'kg', { food_type: 'beef' });
    assert.ok(Math.abs(emission - 54) < 0.1); // 2 kg * 27 kgCO2/kg
  });

  it('should handle unit conversions', () => {
    const emissionKm = calculator.calculateEmission('transport', 100, 'km', { transport_type: 'car' });
    const emissionMiles = calculator.calculateEmission('transport', 62.137, 'miles', { transport_type: 'car' });
    assert.ok(Math.abs(emissionKm - emissionMiles) < 0.1);
  });
});

describe('CSV Parser', () => {
  it('should parse CSV row correctly', () => {
    const calculator = new EmissionCalculator();
    const csvRow = {
      category: 'transport',
      amount: 100,
      unit: 'km',
      date: '2024-01-15',
      description: 'Commute to work',
      transport_type: 'car'
    };

    const footprint = calculator.parseCSVRow(csvRow);
    assert.equal(footprint.category, 'transport');
    assert.ok(footprint.co2_kg && Math.abs(footprint.co2_kg - 19.2) < 0.1);
    assert.deepEqual(footprint.date, new Date('2024-01-15'));
    assert.equal(footprint.meta?.description, 'Commute to work');
  });
});
