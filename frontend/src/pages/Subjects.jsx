import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { fetchSubjects, addSubject, updateSubject, deleteSubject } from '../services/api.js'
import '../styles/subjects.css'

const emptyForm = { subject: '', topic: '', deadline: '', difficulty: '', progress: 0, estimatedHours: '' }

function SubjectModal({ subject, onSave, onClose }) {
  const [form, setForm]     = useState(subject ? { ...subject } : emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.subject.trim())                                e.subject        = 'Subject name is required.'
    if (!form.topic.trim())                                  e.topic          = 'Topic is required.'
    if (!form.deadline)                                      e.deadline       = 'Deadline is required.'
    if (!form.difficulty)                                    e.difficulty     = 'Select a difficulty.'
    if (!form.estimatedHours || Number(form.estimatedHours) < 0.5) e.estimatedHours = 'Enter at least 0.5 hours.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">

            <div className="form-group">
              <label className="form-label">Subject Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className={`form-input${errors.subject ? ' error' : ''}`} type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={e => set('subject', e.target.value)} />
              {errors.subject && <div className="form-error">⚠ {errors.subject}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Topic <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className={`form-input${errors.topic ? ' error' : ''}`} type="text" placeholder="e.g. Calculus" value={form.topic} onChange={e => set('topic', e.target.value)} />
              {errors.topic && <div className="form-error">⚠ {errors.topic}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Deadline <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className={`form-input${errors.deadline ? ' error' : ''}`} type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                {errors.deadline && <div className="form-error">⚠ {errors.deadline}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Hours <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className={`form-input${errors.estimatedHours ? ' error' : ''}`} type="number" min="0.5" step="0.5" placeholder="e.g. 8" value={form.estimatedHours} onChange={e => set('estimatedHours', e.target.value)} />
                {errors.estimatedHours && <div className="form-error">⚠ {errors.estimatedHours}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} type="button" onClick={() => set('difficulty', d)} style={{ flex: 1, padding: '10px', border: `1.5px solid ${form.difficulty === d ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '.88rem', background: form.difficulty === d ? '#EEF2FF' : 'transparent', color: form.difficulty === d ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all .2s' }}>{d}</button>
                ))}
              </div>
              {errors.difficulty && <div className="form-error" style={{ marginTop: 8 }}>⚠ {errors.difficulty}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Progress: <strong>{form.progress}%</strong></label>
              <div className="progress-input-wrapper">
                <input type="range" min="0" max="100" value={form.progress} onChange={e => set('progress', Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
                <span className="progress-val-badge">{form.progress}%</span>
              </div>
              <div style={{ marginTop: 8 }}><ProgressBar value={form.progress} showLabel={false} /></div>
            </div>

          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : subject ? 'Save Changes' : 'Add Subject'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmModal({ subject, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal__body" style={{ paddingTop: 32 }}>
          <div className="confirm-icon">🗑️</div>
          <div className="confirm-title">Delete Subject?</div>
          <div className="confirm-desc">Are you sure you want to delete <strong>{subject.subject} — {subject.topic}</strong>?<br />This action cannot be undone.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)' }} onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getDaysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000) }
function formatDate(str) { if (!str) return ''; return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
function getId(s) { return s._id || s.id }

export default function Subjects() {
  const navigate = useNavigate()
  const [subjects, setSubjects]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editSubject, setEditSubject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast]             = useState(null)
  const [source, setSource]           = useState('api')

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    (async () => {
      setLoading(true)
      const result = await fetchSubjects()
      setSubjects(result.subjects)
      setSource(result.source)
      setLoading(false)
    })()
  }, [])

  const handleSave = async (formData) => {
    if (editSubject) {
      const result = await updateSubject(getId(editSubject), formData)
      if (result.success) {
        setSubjects(prev => prev.map(s => getId(s) === getId(editSubject) ? { ...s, ...formData } : s))
        showToast('Subject updated successfully!')
      }
    } else {
      const result = await addSubject(formData)
      if (result.success) {
        setSubjects(prev => [...prev, result.subject])
        showToast('Subject added successfully!')
      }
    }
    setShowModal(false)
    setEditSubject(null)
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteSubject(getId(deleteTarget))
    if (result.success) {
      setSubjects(prev => prev.filter(s => getId(s) !== getId(deleteTarget)))
      showToast('Subject deleted.', 'error')
    }
    setDeleteTarget(null)
  }

  const openAdd  = () => { setEditSubject(null); setShowModal(true) }
  const openEdit = (s) => { setEditSubject(s); setShowModal(true) }

  return (
    <div className="subjects-page page-wrapper">
      <div className="container">

        <div className="subjects-header">
          <div>
            <h1 className="section-title">My Subjects</h1>
            <div className="subjects-count">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} added
              </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {subjects.length > 0 && <button className="btn btn-outline" onClick={() => navigate('/study-plan')}>📋 View Study Plan</button>}
            <button className="btn btn-primary" onClick={openAdd}>+ Add Subject</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>⏳ Loading subjects…</div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📚</div>
            <div className="empty-state__title">No subjects added yet</div>
            <div className="empty-state__desc">Start by adding your first subject with its topic, deadline, and difficulty level.</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Your First Subject</button>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.map(s => {
              const days = getDaysUntil(s.deadline)
              const pct  = Number(s.progress) || 0
              const progressColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'
              return (
                <div key={getId(s)} className="subject-card">
                  <div className="subject-card__header">
                    <div>
                      <div className="subject-card__name">{s.subject}</div>
                      <div className="subject-card__topic">{s.topic}</div>
                    </div>
                  </div>

                  <div className="subject-card__badges">
                    <span className={`badge badge-${s.difficulty?.toLowerCase()}`}>{s.difficulty}</span>
                    {days < 0  && <span className="badge badge-overdue">Overdue</span>}
                    {days === 0 && <span className="badge badge-tomorrow">Due Today</span>}
                    {days === 1 && <span className="badge badge-tomorrow">Due Tomorrow</span>}
                    {days > 1 && days <= 7 && <span className="badge badge-week">This Week</span>}
                  </div>

                  <div className="subject-card__meta">
                    <div className="subject-card__meta-row">
                      <span className="subject-card__meta-icon">📅</span>
                      <span>Deadline: {formatDate(s.deadline)}
                        {days >= 0
                          ? <span style={{ marginLeft: 6, color: days <= 3 ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}>({days} day{days !== 1 ? 's' : ''} left)</span>
                          : <span style={{ marginLeft: 6, color: 'var(--danger)', fontWeight: 600 }}>({Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} ago)</span>
                        }
                      </span>
                    </div>
                    <div className="subject-card__meta-row">
                      <span className="subject-card__meta-icon">⏱️</span>
                      <span>Estimated: {s.estimatedHours} hours</span>
                    </div>
                  </div>

                  <div>
                    <div className="progress-label">
                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>Progress</span>
                      <span style={{ fontSize: '.82rem', fontWeight: 700, color: progressColor }}>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor }} />
                    </div>
                  </div>

                  <div className="subject-card__actions">
                    <button className="btn-edit"   onClick={() => openEdit(s)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => setDeleteTarget(s)}>🗑️ Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal    && <SubjectModal subject={editSubject} onSave={handleSave} onClose={() => { setShowModal(false); setEditSubject(null) }} />}
      {deleteTarget && <ConfirmModal subject={deleteTarget} onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)} />}
      {toast        && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
