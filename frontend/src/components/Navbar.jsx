import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../styles/navbar.css'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/setup', label: 'Setup' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/study-plan', label: 'Study Plan' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/deadlines', label: 'Deadlines' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [studentName, setStudentName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => {
      const setup = JSON.parse(localStorage.getItem('smartStudyPlanner_setup') || 'null')
      setStudentName(setup?.studentName || '')
    }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('ssp_setup_updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('ssp_setup_updated', sync)
    }
  }, [])

  const initials = studentName
    ? studentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="navbar__logo-icon">📚</div>
          <span>Smart Study Planner</span>
        </div>

        <div className={`navbar__nav${open ? ' open' : ''}`}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__right">
          {studentName && (
            <span className="navbar__student-name">{studentName}</span>
          )}
          <div className="navbar__avatar" title={studentName || 'No student set'}>
            {initials}
          </div>
          <button className="navbar__menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  )
}
