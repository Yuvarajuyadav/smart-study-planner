import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboard, getLocalSetup } from '../services/api.js'
import '../styles/dashboard.css'

const SUBJECTS_KEY  = 'smartStudyPlanner_subjects'
const COMPLETED_KEY = 'smartStudyPlanner_completed'

function getDaysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000) }
function progressColor(p) { return p >= 70 ? 'var(--success)' : p >= 40 ? 'var(--warning)' : 'var(--danger)' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource]   = useState('api')

  useEffect(() => {
    (async () => {
      setLoading(true)
      const apiData = await fetchDashboard()

      if (apiData && apiData.success) {
        setSource('api')
        setData(apiData)
      } else {
        // Local fallback
        setSource('local')
        const subjects  = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
        const setup     = getLocalSetup()
        const completed = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '{}')

        const avg = subjects.length ? Math.round(subjects.reduce((a, s) => a + (Number(s.progress) || 0), 0) / subjects.length) : 0
        const upcoming = subjects
          .filter(s => { const d = getDaysUntil(s.deadline); return d >= 0 })
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5)
          .map(s => ({ id: s._id || s.id, subject: s.subject, topic: s.topic, deadline: s.deadline, daysLeft: getDaysUntil(s.deadline) }))

        setData({
          stats: {
            totalSubjects: subjects.length,
            avgProgress: avg,
            completedSubjects: subjects.filter(s => Number(s.progress) >= 100).length,
            upcomingCount: subjects.filter(s => { const d = getDaysUntil(s.deadline); return d >= 0 && d <= 7 }).length,
            studyHoursWeek: setup ? Number(setup.studyHours) * (setup.studyDays?.length || 0) : 0,
          },
          subjectProgress: subjects.map(s => ({ id: s._id || s.id, subject: s.subject, topic: s.topic, progress: Number(s.progress) || 0, deadline: s.deadline, daysLeft: getDaysUntil(s.deadline) })),
          upcoming,
          setup,
        })
      }
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '120px', color: 'var(--text-secondary)' }}>⏳ Loading dashboard…</div>

  const { stats, subjectProgress, upcoming, setup } = data || {}
  const completedTasks = Object.values(JSON.parse(localStorage.getItem(COMPLETED_KEY) || '{}')).filter(Boolean).length

  const STAT_CARDS = [
    { icon: '📈', bg: '#EEF2FF', label: 'Overall Progress',     val: `${stats?.avgProgress ?? 0}%`,        trend: `${stats?.completedSubjects ?? 0} subject(s) at 100%` },
    { icon: '🔥', bg: '#FFF7ED', label: 'Study Streak',         val: '—',                                   trend: 'Complete tasks daily to build streak' },
    { icon: '⏱️', bg: '#ECFDF5', label: 'Hrs This Week (Est.)', val: `${stats?.studyHoursWeek ?? 0}h`,      trend: setup ? `${setup.studyHours}h/day × ${setup.studyDays?.length ?? 0} days` : 'Set up profile first' },
    { icon: '🔔', bg: '#FFF1F2', label: 'Upcoming (7 days)',    val: stats?.upcomingCount ?? 0,              trend: `${stats?.totalSubjects ?? 0} total subjects` },
  ]

  return (
    <div className="dashboard-page page-wrapper">
      <div className="container">

        <div className="dashboard-header">
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            {setup ? `Welcome back, ${setup.studentName}! Here's your progress overview.` : 'Overview of your study progress.'}
            {source === 'api'   && <span style={{ marginLeft: 8, color: 'var(--success)',  fontSize: '.78rem', fontWeight: 600 }}>● Live</span>}
            {source === 'local' && <span style={{ marginLeft: 8, color: 'var(--warning)', fontSize: '.78rem', fontWeight: 600 }}>● Offline cache</span>}
          </p>
        </div>

        <div className="stat-cards">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card__icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <div className="stat-card__val">{s.val}</div>
                <div className="stat-card__lbl">{s.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '.75rem', marginTop: 4 }}>{s.trend}</div>
              </div>
            </div>
          ))}
        </div>

        {(!subjectProgress || subjectProgress.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-card)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>No data yet</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add subjects to see your progress here.</div>
            <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Add Subjects →</button>
          </div>
        ) : (
          <div className="two-col">
            <div className="panel">
              <div className="panel__title">📊 Subject-wise Progress</div>
              {subjectProgress.map(s => (
                <div key={s.id} className="subject-progress-item">
                  <div className="subject-progress-label">
                    <span>{s.subject} — <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{s.topic}</span></span>
                    <span style={{ color: progressColor(s.progress) }}>{s.progress}%</span>
                  </div>
                  <div className="subject-progress-track">
                    <div className="subject-progress-fill" style={{ width: `${s.progress}%`, background: progressColor(s.progress) }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div className="overall-circle">
                  <div className="circle-val">{stats?.avgProgress ?? 0}%</div>
                  <div className="circle-lbl">Overall Completion</div>
                </div>
                <div className="overall-track">
                  <div className="overall-fill" style={{ width: `${stats?.avgProgress ?? 0}%` }} />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__title">🔔 Upcoming Deadlines</div>
              {upcoming?.length === 0 ? (
                <div className="no-data">No upcoming deadlines within 7 days.</div>
              ) : (
                <div className="upcoming-list">
                  {upcoming?.map(s => {
                    const color = s.daysLeft <= 1 ? 'var(--danger)' : s.daysLeft <= 3 ? 'var(--warning)' : 'var(--success)'
                    return (
                      <div key={s.id} className="upcoming-item">
                        <div className="upcoming-item__dot" style={{ background: color }} />
                        <div className="upcoming-item__subj">{s.subject}</div>
                        <div className="upcoming-item__days">{s.daysLeft === 0 ? 'Today' : s.daysLeft === 1 ? 'Tomorrow' : `${s.daysLeft} days`}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div className="panel__title" style={{ marginBottom: 12 }}>✅ Tasks Completed Today</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{completedTasks}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>tasks marked done</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
