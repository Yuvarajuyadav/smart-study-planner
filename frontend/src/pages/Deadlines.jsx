import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSubjects } from '../services/api.js'
import '../styles/deadlines.css'

const FILTERS = ['All', 'Overdue', 'Due Tomorrow', 'This Week', 'Upcoming']

function getStatus(deadline) {
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (days < 0)   return { label: 'Overdue',      color: '#EF4444', cls: 'badge-overdue',  days }
  if (days === 0) return { label: 'Due Today',     color: '#EF4444', cls: 'badge-overdue',  days }
  if (days === 1) return { label: 'Due Tomorrow',  color: '#F97316', cls: 'badge-tomorrow', days }
  if (days <= 7)  return { label: 'This Week',     color: '#F59E0B', cls: 'badge-week',     days }
  return              { label: 'Upcoming',        color: '#22C55E', cls: 'badge-done',     days }
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Deadlines() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)
  const [source, setSource]     = useState('api')

  useEffect(() => {
    (async () => {
      setLoading(true)
      const result = await fetchSubjects()
      const sorted = [...result.subjects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      setSubjects(sorted)
      setSource(result.source)
      setLoading(false)
    })()
  }, [])

  const getId = (s) => s._id || s.id

  const matchFilter = (s) => {
    const st = getStatus(s.deadline)
    if (filter === 'All')          return true
    if (filter === 'Overdue')      return st.days < 0
    if (filter === 'Due Tomorrow') return st.days === 0 || st.days === 1
    if (filter === 'This Week')    return st.days >= 0 && st.days <= 7
    if (filter === 'Upcoming')     return st.days > 7
    return true
  }

  const filtered = subjects.filter(matchFilter)
  const overdue  = subjects.filter(s => getStatus(s.deadline).days < 0).length
  const thisWeek = subjects.filter(s => { const d = getStatus(s.deadline).days; return d >= 0 && d <= 7 }).length

  return (
    <div className="deadlines-page page-wrapper">
      <div className="container">

        <div className="deadlines-header">
          <div>
            <h1 className="section-title">Deadlines &amp; Reminders</h1>
            <p className="section-subtitle">
              {overdue > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ {overdue} overdue · </span>}
              {thisWeek} deadline{thisWeek !== 1 ? 's' : ''} this week
              </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/subjects')}>+ Add Subjects</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>⏳ Loading deadlines…</div>
        ) : subjects.length === 0 ? (
          <div className="no-deadlines">
            <div className="no-deadlines__icon">🔔</div>
            <div className="no-deadlines__title">No deadlines yet</div>
            <div className="no-deadlines__desc">Add subjects with deadlines to track them here.</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/subjects')}>Add Subjects →</button>
          </div>
        ) : (
          <>
            <div className="deadlines-filters">
              {FILTERS.map(f => {
                const count = subjects.filter(s => {
                  const st = getStatus(s.deadline)
                  if (f === 'All')          return true
                  if (f === 'Overdue')      return st.days < 0
                  if (f === 'Due Tomorrow') return st.days === 0 || st.days === 1
                  if (f === 'This Week')    return st.days >= 0 && st.days <= 7
                  if (f === 'Upcoming')     return st.days > 7
                  return true
                }).length
                return (
                  <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                    {f}{f !== 'All' && <span style={{ marginLeft: 6, fontWeight: 700 }}>({count})</span>}
                  </button>
                )
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="no-deadlines">
                <div className="no-deadlines__icon">🎉</div>
                <div className="no-deadlines__title">No items in "{filter}"</div>
                <div className="no-deadlines__desc">Great! Nothing to worry about here.</div>
              </div>
            ) : (
              <div className="deadlines-list">
                {filtered.map((s, i) => {
                  const st = getStatus(s.deadline)
                  return (
                    <div key={getId(s)} className="deadline-card" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="deadline-card__bar" style={{ background: st.color }} />
                      <div>
                        <div className="deadline-card__subject">{s.subject}</div>
                        <div className="deadline-card__topic">{s.topic}</div>
                        <div className="deadline-card__date">
                          📅 {formatDate(s.deadline)} ·&nbsp;
                          <span className={`badge badge-${s.difficulty?.toLowerCase()}`} style={{ fontSize: '.7rem' }}>{s.difficulty}</span>
                        </div>
                      </div>
                      <div className="deadline-card__days">
                        <div className="deadline-card__days-num" style={{ color: st.color }}>{st.days < 0 ? Math.abs(st.days) : st.days}</div>
                        <div className="deadline-card__days-lbl">{st.days < 0 ? 'days ago' : st.days === 0 ? 'today' : 'days left'}</div>
                      </div>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
