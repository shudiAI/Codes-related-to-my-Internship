import { describe, expect, it } from 'vitest';
import { COORDINATE_SYSTEMS, processCoordinates } from './coordinateUtils';

describe('processCoordinates', () => {
  it('maps decimal degree X to longitude and Y to latitude', () => {
    expect(processCoordinates({ coordinateSystem: COORDINATE_SYSTEMS.DECIMAL_DEGREES, x: '46.6753', y: '24.7136' }))
      .toEqual({ longitude: 46.6753, latitude: 24.7136 });
  });

  it('converts valid northern UTM coordinates to WGS84', () => {
    const point = processCoordinates({ coordinateSystem: COORDINATE_SYSTEMS.UTM, x: '668184', y: '2734420', utmZone: '38', hemisphere: 'north' });
    expect(point.longitude).toBeGreaterThan(46);
    expect(point.longitude).toBeLessThan(47);
    expect(point.latitude).toBeGreaterThan(24);
    expect(point.latitude).toBeLessThan(25);
  });

  it.each([
    { coordinateSystem: COORDINATE_SYSTEMS.DECIMAL_DEGREES, x: '', y: '24' },
    { coordinateSystem: COORDINATE_SYSTEMS.DECIMAL_DEGREES, x: '181', y: '24' },
    { coordinateSystem: COORDINATE_SYSTEMS.DECIMAL_DEGREES, x: '46', y: '-91' },
    { coordinateSystem: COORDINATE_SYSTEMS.UTM, x: '12', y: '2734420', utmZone: '38' },
    { coordinateSystem: COORDINATE_SYSTEMS.UTM, x: '668184', y: '2734420', utmZone: '61' },
  ])('rejects invalid coordinate input', (input) => {
    expect(() => processCoordinates(input)).toThrow();
  });
});
