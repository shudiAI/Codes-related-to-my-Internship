import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div data-testid="tiles" />,
  useMap: () => ({ fitBounds: vi.fn() }),
}));

import BranchMap from './BranchMap';

it('renders distinct project and branch marker content', () => {
  render(
    <BranchMap
      projectLocation={{ latitude: 24.7, longitude: 46.6 }}
      branches={[
        { id: 'a', branchName: 'Central Branch', city: 'Riyadh', latitude: 24.8, longitude: 46.7, distance: 12.34 },
        { id: 'b', branchName: 'Eastern Branch', city: 'Dammam', latitude: 26.4, longitude: 50.1, distance: 400 },
      ]}
    />,
  );
  expect(screen.getAllByTestId('marker')).toHaveLength(3);
  expect(screen.getByText('Project Location')).toBeInTheDocument();
  expect(screen.getByText('Central Branch')).toBeInTheDocument();
  expect(screen.getByText('Eastern Branch')).toBeInTheDocument();
});
