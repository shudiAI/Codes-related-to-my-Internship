import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import BranchLocatorForm from '../components/BranchLocatorForm';
import BranchMap from '../components/BranchMap';
import BranchList from '../components/BranchList';
import MapErrorBoundary from '../components/MapErrorBoundary';
import ResponsibleBranchCard from '../components/ResponsibleBranchCard';
import { branches, organizations } from '../data/branches';
import { locateBranches } from '../services/branchLocatorService';
import { processCoordinates } from '../utils/coordinateUtils';

export default function BranchLocatorPage() {
  const [searchResult, setSearchResult] = useState(null);
  const [projectLocation, setProjectLocation] = useState(null);
  const [searchedOrganization, setSearchedOrganization] = useState('');

  function handleLocate(values) {
    const location = processCoordinates(values);
    const result = locateBranches({
      organizationId: values.organizationId,
      projectLocation: location,
      branchData: branches,
    });
    setProjectLocation(location);
    setSearchResult(result);
    setSearchedOrganization(values.organizationId);
  }

  const hasBranches = Boolean(searchResult?.responsibleBranch);
  const organizationName = organizations.find((item) => item.id === searchedOrganization)?.name;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" id="locator">
        <header className="page-header">
          <div>
            <span className="page-kicker">Operations / Location services</span>
            <h1>Branch Locator</h1>
            <p>Find the suggested responsible branch based on project location.</p>
          </div>
          <div className="prototype-chip"><i /> Prototype data</div>
        </header>

        <section className="locator-workspace">
          <BranchLocatorForm organizations={organizations} onLocate={handleLocate} />
          <MapErrorBoundary>
            <BranchMap projectLocation={hasBranches ? projectLocation : null} branches={hasBranches ? searchResult.allBranches : []} />
          </MapErrorBoundary>
        </section>

        {searchResult && (
          <section className="results-section" aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="step-number">02</span>
                <div>
                  <h2>Branch results</h2>
                  <p>{organizationName}</p>
                </div>
              </div>
              {hasBranches && <span className="results-ready"><i /> Results ready</span>}
            </div>

            {hasBranches ? (
              <>
                <ResponsibleBranchCard branch={searchResult.responsibleBranch} />
                <BranchList branches={searchResult.otherBranches} />
              </>
            ) : (
              <div className="no-results" role="status">
                <strong>No branch data is available for the selected organization.</strong>
                <span>Select another organization or add approved records to the local data file.</span>
              </div>
            )}

            <p className="disclaimer">
              Prototype branch results are based on sample location data. Final branch responsibility should be verified using approved organizational data.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
