import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import BranchLocatorForm from './BranchLocatorForm';

const organizations = [{ id: 'org', name: 'Example Organization' }];

it('shows inline validation errors for an empty search', () => {
  render(<BranchLocatorForm organizations={organizations} onLocate={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /locate branch/i }));
  expect(screen.getByText('Select an organization to continue.')).toBeInTheDocument();
  expect(screen.getByText('Enter a valid longitude.')).toBeInTheDocument();
  expect(screen.getByText('Enter a valid latitude.')).toBeInTheDocument();
});

it('reveals UTM settings and submits valid coordinate values', () => {
  const onLocate = vi.fn();
  render(<BranchLocatorForm organizations={organizations} onLocate={onLocate} />);

  fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'org' } });
  fireEvent.change(screen.getByLabelText('Coordinate system'), { target: { value: 'utm' } });
  expect(screen.getByLabelText('UTM Zone')).toBeInTheDocument();
  expect(screen.getByLabelText('Hemisphere')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Project X Coordinate'), { target: { value: '668184' } });
  fireEvent.change(screen.getByLabelText('Project Y Coordinate'), { target: { value: '2734420' } });
  fireEvent.click(screen.getByRole('button', { name: /locate branch/i }));

  expect(onLocate).toHaveBeenCalledWith(expect.objectContaining({
    organizationId: 'org',
    coordinateSystem: 'utm',
    utmZone: '38',
    hemisphere: 'north',
  }));
});
