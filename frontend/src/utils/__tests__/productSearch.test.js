import { describe, it, expect } from 'vitest';
import { getMatchingProducts } from '../productSearch.js';

const products = [
  { id: 'p1', name: 'Ponni Boiled Rice', category: 'Rice & Grains', unit: '10 kg' },
  { id: 'p2', name: 'Toor Dal', category: 'Dals & Pulses', unit: '1 kg' },
  { id: 'p3', name: 'Sambar Powder', category: 'Spices & Masalas', unit: '200 g' },
];

describe('getMatchingProducts', () => {
  it('matches products by name, category, or unit', () => {
    expect(getMatchingProducts(products, 'dal')).toEqual([products[1]]);
    expect(getMatchingProducts(products, 'rice')).toEqual([products[0]]);
    expect(getMatchingProducts(products, '200')).toEqual([products[2]]);
  });

  it('returns an empty array for empty or unmatched queries', () => {
    expect(getMatchingProducts(products, '')).toEqual([]);
    expect(getMatchingProducts(products, 'xyz')).toEqual([]);
  });
});
