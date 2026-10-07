import { ArrowLeft, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-page__icon" aria-hidden="true">
        <CircleHelp size={28} />
      </div>
      <p className="eyebrow">404 error</p>
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link className="primary-button" to="/">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to dashboard
      </Link>
    </main>
  )
}

export default NotFoundPage
