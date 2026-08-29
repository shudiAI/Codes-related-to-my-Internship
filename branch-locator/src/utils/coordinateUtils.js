import proj4 from 'proj4';

export const COORDINATE_SYSTEMS = {
  DECIMAL_DEGREES: 'decimal-degrees',
  UTM: 'utm',
};

function requiredNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function processCoordinates({ coordinateSystem, x, y, utmZone, hemisphere = 'north' }) {
  const xNumber = requiredNumber(x);
  const yNumber = requiredNumber(y);

  if (xNumber === null || yNumber === null) {
    throw new Error('Please enter valid project coordinates.');
  }

  if (coordinateSystem === COORDINATE_SYSTEMS.DECIMAL_DEGREES) {
    if (xNumber < -180 || xNumber > 180 || yNumber < -90 || yNumber > 90) {
      throw new Error('Please enter valid project coordinates.');
    }
    return { latitude: yNumber, longitude: xNumber };
  }

  if (coordinateSystem === COORDINATE_SYSTEMS.UTM) {
    const zone = requiredNumber(utmZone);
    if (
      zone === null || !Number.isInteger(zone) || zone < 1 || zone > 60 ||
      xNumber < 100000 || xNumber > 900000 || yNumber < 0 || yNumber > 10000000 ||
      !['north', 'south'].includes(hemisphere)
    ) {
      throw new Error('Please enter valid UTM coordinates, zone, and hemisphere.');
    }

    const utmDefinition = `+proj=utm +zone=${zone} ${hemisphere === 'south' ? '+south' : ''} +datum=WGS84 +units=m +no_defs`;
    const [longitude, latitude] = proj4(utmDefinition, 'EPSG:4326', [xNumber, yNumber]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Please enter valid project coordinates.');
    }

    return { latitude, longitude };
  }

  throw new Error('Please select a supported coordinate system.');
}
