import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPlan, getLocalSetup } from '../services/api.js'
import '../styles/studyplan.css'

const COMPLETED_KEY = 'smartStudyPlanner_completed'
const SUBJECTS_KEY  = 'smartStudyPlanner_subjects'
const SETUP_KEY     = 'smartStudyPlanner_setup'

// ── local priority fallback (used when API is offline) ──────────────────────
function calcPriority(subject) {
  const daysLeft    = Math.ceil((new Date(subject.deadline) - new Date()) / 86400000)
  const deadlineScore = daysLeft <= 0 ? 100 : daysLeft <= 3 ? 80 : daysLeft <= 7 ? 60 : daysLeft <= 14 ? 40 : 20
  const diffScore   = subject.difficulty === 'Hard' ? 50 : subject.difficulty === 'Medium' ? 30 : 10
  const progressScore = 100 - (Number(subject.progress) || 0)
  return deadlineScore + diffScore + progressScore
}

function getPriorityLabel(score) {
  if (score >= 150) return 'Critical'
  if (score >= 120) return 'High'
  if (score >= 90)  return 'Medium'
  return 'Low'
}

function buildTimesLocal(preferredTime, count) {
  const bases = { morning: 6, afternoon: 13, evening: 18, night: 21 }
  const start = (bases[preferredTime] || 18) * 60
  const times = []
  let cur = start
  for (let i = 0; i < count; i++) {
    const fmt = (min) => { const hh = Math.floor(min / 60) % 24; const mm = min % 60; const p = hh >= 12 ? 'PM' : 'AM'; return `${hh % 12 || 12}:${String(mm).padStart(2,'0')} ${p}` }
    times.push(`${fmt(cur)} – ${fmt(cur + 60)}`)
    cur += 75
  }
  return times
}
// ────────────────────────────────────────────────────────────────────────────

export default function StudyPlan() {
  const navigate = useNavigate()
  const [tasks, setTasks]           = useState([])
  const [completed, setCompleted]   = useState({})
  const [setup, setSetup]           = useState(null)
  const [hasSubjects, setHasSubjects] = useState(true)
  const [loading, setLoading]       = useState(true)
  const [source, setSource]         = useState('api')

  useEffect(() => {
    const savedCompleted = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '{}')
    setCompleted(savedCompleted)
    ;(async () => {
      setLoading(true)
      const apiData = await fetchPlan()

      if (apiData && apiData.tasks) {
        setSetup(getLocalSetup())
        if (apiData.tasks.length === 0) { setHasSubjects(false) } else {
          setTasks(apiData.tasks)
          setHasSubjects(true)
        }
      } else {
        // offline fallback
        const localSetup    = JSON.parse(localStorage.getItem(SETUP_KEY) || 'null')
        const localSubjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
        setSetup(localSetup)
        if (localSubjects.length === 0) { setHasSubjects(false) } else {
          const sorted = [...localSubjects].sort((a, b) => calcPriority(b) - calcPriority(a))
          const times  = buildTimesLocal(localSetup?.preferredTime || 'evening', sorted.length)
          setTasks(sorted.map((sub, i) => {
            const score = calcPriority(sub)
            return { id: sub._id || sub.id, subject: sub.subject, topic: sub.topic, time: times[i], duration: '60 min', priority: getPriorityLabel(score), progress: sub.progress }
          }))
          setHasSubjects(true)
        }
      }
      setLoading(false)
    })()
  }, [])

  const toggleComplete = (id) => {
    const updated = { ...completed, [id]: !completed[id] }
    setCompleted(updated)
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(updated))
  }

  const completedCount  = tasks.filter(t => completed[t.id]).length
  const completionPct   = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  const today           = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const badgeClass = (p) => p === 'Critical' || p === 'High' ? 'badge-hard' : p === 'Medium' ? 'badge-medium' : 'badge-low'

  return (
    <div className="studyplan-page page-wrapper">
      <div className="container">

        <div className="studyplan-header">
          <div>
            <h1 className="section-title">Today's Study Plan</h1>
            <div className="studyplan-date">📅 {today}
              </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/subjects')}>← Edit Subjects</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '72px', color: 'var(--text-secondary)' }}>⏳ Generating your plan…</div>
        ) : !hasSubjects ? (
          <div className="no-plan">
            <div className="no-plan__icon">📚</div>
            <div className="no-plan__title">No subjects added yet</div>
            <div className="no-plan__desc">Add subjects first to generate your study plan.</div>
            <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Add Subjects →</button>
          </div>
        ) : (
          <>
            <div className="plan-meta-bar">
              {[['📋', '#EEF2FF', tasks.length,       'Total Tasks'],
                ['✅', '#ECFDF5', completedCount,      'Completed'],
                ['⏱️', '#FFF7ED', `${tasks.length}h`, 'Study Time'],
                ['📈', '#F0FDF4', `${completionPct}%`,'Today Done'],
              ].map(([icon, bg, val, lbl], i) => (
                <div key={i} className="plan-meta-card">
                  <div className="plan-meta-card__icon" style={{ background: bg }}>{icon}</div>
                  <div><div className="plan-meta-card__val">{val}</div><div className="plan-meta-card__lbl">{lbl}</div></div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '.9rem', fontWeight: 600 }}>
                <span>Today's Progress</span>
                <span style={{ color: 'var(--success)' }}>{completedCount}/{tasks.length} tasks done</span>
              </div>
              <div className="plan-progress-bar"><div className="plan-progress-fill" style={{ width: `${completionPct}%` }} /></div>
            </div>

            <div className="task-list">
              {tasks.map((t, i) => (
                <div key={t.id} className={`task-card${completed[t.id] ? ' done' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="task-card__time">
                    <div className="task-card__time-val">{t.time?.split(' – ')[0]}<br />– {t.time?.split(' – ')[1]}</div>
                    <div className="task-card__time-dur">{t.duration}</div>
                  </div>
                  <div>
                    <div className="task-card__subject">{t.subject}</div>
                    <div className="task-card__topic">{t.topic}</div>
                    <div className="task-card__badges">
                      <span className={`badge ${badgeClass(t.priority)}`}>⚡ {t.priority} Priority</span>
                    </div>
                  </div>
                  <div className="task-card__actions">
                    <button className={`task-check${completed[t.id] ? ' checked' : ''}`} onClick={() => toggleComplete(t.id)} title={completed[t.id] ? 'Mark incomplete' : 'Mark complete'}>
                      {completed[t.id] ? '✓' : ''}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {setup?.preferredTime && (
              <div style={{ marginTop: 24, padding: '14px 20px', background: '#EEF2FF', borderRadius: 'var(--radius)', fontSize: '.85rem', color: 'var(--primary)' }}>
                ℹ️ Plan generated based on <strong>{setup.studyHours} hours/day</strong> — preferred <strong>{setup.preferredTime}</strong> study time.
                {source === 'api' ? ' Sorted server-side by deadline, difficulty & progress.' : ' Using local offline data.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
