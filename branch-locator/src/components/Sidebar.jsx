import { BuildingIcon, CompassIcon } from './icons';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><CompassIcon size={25} /></div>
        <div>
          <strong>BranchPoint</strong>
          <span>Location Services</span>
        </div>
      </div>

      <nav className="primary-nav" aria-label="Main navigation">
        <p className="nav-label">Workspace</p>
        <a className="nav-item active" href="#locator" aria-current="page">
          <BuildingIcon />
          <span>Branch Locator</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot" />
        <div>
          <strong>Prototype environment</strong>
          <span>Local calculations only</span>
        </div>
      </div>
    </aside>
  );
}
