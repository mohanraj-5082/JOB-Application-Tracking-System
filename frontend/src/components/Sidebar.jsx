import { BriefcaseBusiness, LayoutDashboard, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><BriefcaseBusiness size={19} strokeWidth={2.4} /></div>
          <span className="brand-name">Job Tracker</span>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon"><BriefcaseBusiness size={17} /></div>
          <div>
            <p className="sidebar-footer-title">Stay organized</p>
            <p className="sidebar-footer-copy">Keep your next opportunity in view.</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
