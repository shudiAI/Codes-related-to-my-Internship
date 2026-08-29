import { useState } from 'react';
import { COORDINATE_SYSTEMS } from '../utils/coordinateUtils';
import { SearchIcon } from './icons';

const initialValues = {
  organizationId: '',
  coordinateSystem: COORDINATE_SYSTEMS.DECIMAL_DEGREES,
  x: '',
  y: '',
  utmZone: '38',
  hemisphere: 'north',
};

export default function BranchLocatorForm({ organizations, onLocate }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const isUtm = values.coordinateSystem === COORDINATE_SYSTEMS.UTM;

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.organizationId) nextErrors.organizationId = 'Select an organization to continue.';
    if (values.x.trim() === '' || !Number.isFinite(Number(values.x))) {
      nextErrors.x = isUtm ? 'Enter a valid easting.' : 'Enter a valid longitude.';
    }
    if (values.y.trim() === '' || !Number.isFinite(Number(values.y))) {
      nextErrors.y = isUtm ? 'Enter a valid northing.' : 'Enter a valid latitude.';
    }
    if (isUtm && (!Number.isInteger(Number(values.utmZone)) || Number(values.utmZone) < 1 || Number(values.utmZone) > 60)) {
      nextErrors.utmZone = 'UTM zone must be a whole number from 1 to 60.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    try {
      onLocate(values);
    } catch (error) {
      setErrors({ form: error.message || 'Please enter valid project coordinates.' });
    }
  }

  return (
    <form className="locator-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <span className="step-number">01</span>
        <div>
          <h2>Project details</h2>
          <p>Choose an authority and enter the project location.</p>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="organizationId">Organization</label>
        <select id="organizationId" name="organizationId" value={values.organizationId} onChange={updateValue} aria-invalid={Boolean(errors.organizationId)}>
          <option value="">Select organization...</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>
        {errors.organizationId && <span className="field-error">{errors.organizationId}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="coordinateSystem">Coordinate system</label>
        <select id="coordinateSystem" name="coordinateSystem" value={values.coordinateSystem} onChange={updateValue}>
          <option value={COORDINATE_SYSTEMS.DECIMAL_DEGREES}>Decimal Degrees (WGS 84)</option>
          <option value={COORDINATE_SYSTEMS.UTM}>UTM (WGS 84)</option>
        </select>
        <span className="field-hint">{isUtm ? 'Enter easting and northing in meters.' : 'X is longitude; Y is latitude.'}</span>
      </div>

      <div className="coordinate-fields">
        <div className="form-field">
          <label htmlFor="x">Project X Coordinate</label>
          <input id="x" name="x" inputMode="decimal" placeholder={isUtm ? 'e.g. 668184' : 'e.g. 46.6753'} value={values.x} onChange={updateValue} aria-invalid={Boolean(errors.x)} />
          {errors.x && <span className="field-error">{errors.x}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="y">Project Y Coordinate</label>
          <input id="y" name="y" inputMode="decimal" placeholder={isUtm ? 'e.g. 2734420' : 'e.g. 24.7136'} value={values.y} onChange={updateValue} aria-invalid={Boolean(errors.y)} />
          {errors.y && <span className="field-error">{errors.y}</span>}
        </div>
      </div>

      {isUtm && (
        <div className="coordinate-fields utm-options">
          <div className="form-field">
            <label htmlFor="utmZone">UTM Zone</label>
            <input id="utmZone" name="utmZone" inputMode="numeric" value={values.utmZone} onChange={updateValue} aria-invalid={Boolean(errors.utmZone)} />
            {errors.utmZone && <span className="field-error">{errors.utmZone}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="hemisphere">Hemisphere</label>
            <select id="hemisphere" name="hemisphere" value={values.hemisphere} onChange={updateValue}>
              <option value="north">Northern</option>
              <option value="south">Southern</option>
            </select>
          </div>
        </div>
      )}

      {errors.form && <div className="form-error" role="alert">{errors.form}</div>}

      <button className="primary-button" type="submit">
        <SearchIcon />
        Locate branch
      </button>

      <p className="privacy-note">Coordinates are processed locally in your browser.</p>
    </form>
  );
}
