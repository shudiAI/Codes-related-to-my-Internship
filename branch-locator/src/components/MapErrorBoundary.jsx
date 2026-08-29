import { Component } from 'react';

export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="map-panel map-fallback" role="status">
          <div>
            <strong>The map could not be displayed.</strong>
            <p>Branch calculation results are still available below.</p>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
