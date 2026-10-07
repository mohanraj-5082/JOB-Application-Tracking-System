function LoadingState({ label = 'Loading jobs...' }) {
  return (
    <div className="table-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
