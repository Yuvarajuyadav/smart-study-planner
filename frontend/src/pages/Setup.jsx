import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveStudent, getLocalSetup } from '../services/api.js'
import '../styles/setup.css'

const TIMES = [
  { value: 'morning',   label: 'Morning',   icon: '🌅', sub: '6 AM – 12 PM' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', sub: '12 PM – 5 PM' },
  { value: 'evening',   label: 'Evening',   icon: '🌇', sub: '5 PM – 9 PM' },
  { value: 'night',     label: 'Night',     icon: '🌙', sub: '9 PM – 12 AM' },
]
const DAYS      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const empty = { studentName: '', numSubjects: '', studyHours: '', preferredTime: '', studyDays: [] }

export default function Setup() {
  const navigate = useNavigate()
  const [form, setForm]       = useState(empty)
  const [errors, setErrors]   = useState({})
  const [existing, setExisting] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [serverMsg, setServerMsg] = useState('')

  useEffect(() => {
    const saved = getLocalSetup()
    if (saved) { setForm(saved); setExisting(true) }
  }, [])

  const validate = () => {
    const e = {}
    if (!form.studentName.trim())                            e.studentName  = 'Student name is required.'
    if (!form.numSubjects || Number(form.numSubjects) < 1)   e.numSubjects  = 'Enter at least 1 subject.'
    if (!form.studyHours  || Number(form.studyHours)  < 0.5) e.studyHours   = 'Enter at least 0.5 hours per day.'
    if (Number(form.studyHours) > 24)                        e.studyHours   = 'Cannot exceed 24 hours per day.'
    if (!form.preferredTime)                                 e.preferredTime = 'Select a preferred study time.'
    if (form.studyDays.length === 0)                         e.studyDays    = 'Select at least one study day.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setServerMsg('')
    const result = await saveStudent(form)
    setSaving(false)

    if (result.warning) setServerMsg('⚠️ ' + result.warning)
    window.dispatchEvent(new Event('ssp_setup_updated'))
    navigate('/subjects')
  }

  const toggleDay = (day) => {
    setForm(f => ({ ...f, studyDays: f.studyDays.includes(day) ? f.studyDays.filter(d => d !== day) : [...f.studyDays, day] }))
    setErrors(e => ({ ...e, studyDays: '' }))
  }

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  return (
    <div className="setup-page page-wrapper">
      <div className="setup-container">
        <div className="setup-header">
          <div className="setup-header__step">Step 1 of 2 — Student Setup</div>
          <h1 className="section-title">Let's Set Up Your Profile</h1>
          <p className="section-subtitle">Tell us about yourself so we can build a personalised study plan.</p>
        </div>

        {existing && <div className="setup-existing-info">ℹ️ You already have a saved profile. You can update it below.</div>}
        {serverMsg && <div className="setup-existing-info" style={{ background: '#FFF7ED', borderColor: '#FED7AA', color: '#C2410C' }}>{serverMsg}</div>}

        <form className="setup-card" onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label className="form-label">Student Name <span>*</span></label>
            <input className={`form-input${errors.studentName ? ' error' : ''}`} type="text" placeholder="e.g. Yuvaraj" value={form.studentName} onChange={e => set('studentName', e.target.value)} />
            {errors.studentName && <div className="form-error">⚠ {errors.studentName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Number of Subjects <span>*</span></label>
            <input className={`form-input${errors.numSubjects ? ' error' : ''}`} type="number" min="1" max="20" placeholder="e.g. 5" value={form.numSubjects} onChange={e => set('numSubjects', e.target.value)} />
            {errors.numSubjects && <div className="form-error">⚠ {errors.numSubjects}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Available Study Hours Per Day <span>*</span></label>
            <input className={`form-input${errors.studyHours ? ' error' : ''}`} type="number" min="0.5" max="24" step="0.5" placeholder="e.g. 3" value={form.studyHours} onChange={e => set('studyHours', e.target.value)} />
            {errors.studyHours && <div className="form-error">⚠ {errors.studyHours}</div>}
            <div className="form-helper">Minimum 0.5 hours, maximum 24 hours.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Study Time <span>*</span></label>
            <div className="time-options">
              {TIMES.map(t => (
                <div key={t.value} className="time-option">
                  <input type="radio" id={`time-${t.value}`} name="preferredTime" value={t.value} checked={form.preferredTime === t.value} onChange={() => set('preferredTime', t.value)} />
                  <label htmlFor={`time-${t.value}`}>
                    <span className="time-option__icon">{t.icon}</span>
                    <span>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{t.label}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{t.sub}</div>
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {errors.preferredTime && <div className="form-error" style={{ marginTop: 8 }}>⚠ {errors.preferredTime}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Study Days Per Week <span>*</span></label>
            <div className="days-options">
              {DAYS.map((d, i) => (
                <div key={d} className="day-option">
                  <input type="checkbox" id={`day-${d}`} checked={form.studyDays.includes(DAYS_FULL[i])} onChange={() => toggleDay(DAYS_FULL[i])} />
                  <label htmlFor={`day-${d}`}>{d}</label>
                </div>
              ))}
            </div>
            {errors.studyDays && <div className="form-error" style={{ marginTop: 8 }}>⚠ {errors.studyDays}</div>}
            <div className="form-helper">{form.studyDays.length} day{form.studyDays.length !== 1 ? 's' : ''} selected</div>
          </div>

          <div className="form-submit-area">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving…' : 'Continue → Add Subjects'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
