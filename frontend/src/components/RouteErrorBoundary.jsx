import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Component } from 'react'

class RouteErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="route-fallback" role="alert">
          <div className="route-fallback__icon" aria-hidden="true">
            <AlertTriangle size={24} />
          </div>
          <p className="eyebrow">Something went wrong</p>
          <h1>We couldn&apos;t load this page.</h1>
          <p>Please reload the application and try again.</p>
          <button className="primary-button" type="button" onClick={this.handleReload}>
            <RefreshCw size={16} aria-hidden="true" />
            Reload application
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default RouteErrorBoundary
