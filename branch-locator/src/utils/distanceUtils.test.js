import { describe, expect, it } from 'vitest';
import { calculateDistance, formatDistance } from './distanceUtils';

describe('distance utilities', () => {
  it('returns zero for the same location', () => {
    expect(calculateDistance({ latitude: 24.7, longitude: 46.6 }, { latitude: 24.7, longitude: 46.6 })).toBe(0);
  });

  it('calculates and formats a geographic distance', () => {
    const distance = calculateDistance(
      { latitude: 24.7136, longitude: 46.6753 },
      { latitude: 26.4207, longitude: 50.0888 },
    );
    expect(distance).toBeGreaterThan(380);
    expect(distance).toBeLessThan(420);
    expect(formatDistance(distance)).toMatch(/^\d+\.\d km$/);
  });
});
