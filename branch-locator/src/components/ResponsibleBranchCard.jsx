import { formatDistance } from '../utils/distanceUtils';
import { LocationIcon } from './icons';

export default function ResponsibleBranchCard({ branch }) {
  return (
    <article className="responsible-card">
      <div className="result-icon"><LocationIcon size={23} /></div>
      <div className="responsible-content">
        <div className="result-label-row">
          <span className="result-label">Suggested Responsible Branch</span>
          <span className="recommendation-badge">Nearest match</span>
        </div>
        <h3>{branch.branchName}</h3>
        <p>{branch.city}</p>
      </div>
      <div className="distance-block">
        <span>Distance from project</span>
        <strong>{formatDistance(branch.distance)}</strong>
      </div>
    </article>
  );
}
