import { formatDistance } from '../utils/distanceUtils';

export default function BranchList({ branches }) {
  return (
    <section className="other-branches">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Sorted by straight-line distance</span>
          <h3>Other branches</h3>
        </div>
        <span className="branch-count">{branches.length} {branches.length === 1 ? 'branch' : 'branches'}</span>
      </div>
      {branches.length > 0 ? (
        <ol className="branch-list">
          {branches.map((branch, index) => (
            <li key={branch.id}>
              <span className="list-rank">{String(index + 2).padStart(2, '0')}</span>
              <div className="branch-summary">
                <strong>{branch.branchName}</strong>
                <span>{branch.city}</span>
              </div>
              <strong className="branch-distance">{formatDistance(branch.distance)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-list">No alternative branches are available for this organization.</p>
      )}
    </section>
  );
}
