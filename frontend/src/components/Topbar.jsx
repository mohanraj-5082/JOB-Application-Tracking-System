import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <button className="icon-button menu-button" aria-label="Open navigation" onClick={onMenuClick}>
        <Menu size={21} />
      </button>
      <div className="topbar-context">
        <span className="topbar-eyebrow">Workspace</span>
        <span className="topbar-title">Career overview</span>
      </div>
      <div className="topbar-actions">
        <span className="topbar-email">{user?.email}</span>
        <button className="icon-button" type="button" aria-label="Sign out" onClick={logout}><LogOut size={18} /></button>
        <div className="avatar" role="img" aria-label="User profile">{user?.email?.slice(0, 2).toUpperCase() || 'JS'}</div>
      </div>
    </header>
  )
}

export default Topbar
