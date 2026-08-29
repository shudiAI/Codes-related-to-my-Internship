import { describe, expect, it } from 'vitest';
import { locateBranches } from './branchLocatorService';

const branchData = [
  { id: 'far', organizationId: 'org', branchName: 'Far', latitude: 25, longitude: 47 },
  { id: 'near', organizationId: 'org', branchName: 'Near', latitude: 24, longitude: 46 },
  { id: 'other-org', organizationId: 'other', branchName: 'Other', latitude: 24, longitude: 46 },
];

describe('locateBranches', () => {
  it('filters by organization, sorts by distance, and selects the nearest branch', () => {
    const result = locateBranches({ organizationId: 'org', projectLocation: { latitude: 24.01, longitude: 46.01 }, branchData });
    expect(result.allBranches.map((branch) => branch.id)).toEqual(['near', 'far']);
    expect(result.responsibleBranch.id).toBe('near');
    expect(result.otherBranches).toHaveLength(1);
  });

  it('returns a no-data result for an organization without branches', () => {
    expect(locateBranches({ organizationId: 'empty', projectLocation: { latitude: 24, longitude: 46 }, branchData }).responsibleBranch).toBeNull();
  });

  it('requires an organization', () => {
    expect(() => locateBranches({ organizationId: '', projectLocation: { latitude: 24, longitude: 46 }, branchData })).toThrow('Please select an organization.');
  });
});
