import { calculateDistance } from '../utils/distanceUtils';

export function locateBranches({ organizationId, projectLocation, branchData }) {
  if (!organizationId) {
    throw new Error('Please select an organization.');
  }

  const organizationBranches = branchData.filter(
    (branch) => branch.organizationId === organizationId,
  );

  if (organizationBranches.length === 0) {
    return { responsibleBranch: null, otherBranches: [], allBranches: [] };
  }

  const allBranches = organizationBranches
    .map((branch) => ({
      ...branch,
      distance: calculateDistance(projectLocation, branch),
    }))
    .sort((a, b) => a.distance - b.distance);

  return {
    responsibleBranch: allBranches[0],
    otherBranches: allBranches.slice(1),
    allBranches,
  };
}
