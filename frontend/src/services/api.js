/**
 * Smart Study Planner — API Service
 * Works in 2 modes:
 *   1. WITH backend  → saves to MongoDB (set VITE_API_URL)
 *   2. WITHOUT backend → saves to browser localStorage (works on Vercel without any server)
 */

const BASE = import.meta.env.VITE_API_URL || ''

const SETUP_KEY     = 'smartStudyPlanner_setup'
const SUBJECTS_KEY  = 'smartStudyPlanner_subjects'

const hasBackend = () => BASE && BASE.startsWith('http')

// ─── helpers ──────────────────────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(BASE + path, opts)
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

export function getLocalSetup() {
  return JSON.parse(localStorage.getItem(SETUP_KEY) || 'null')
}

// ─── Students ─────────────────────────────────────────────────────────────────
export async function saveStudent(formData) {
  if (!hasBackend()) {
    // localStorage only mode
    localStorage.setItem(SETUP_KEY, JSON.stringify(formData))
    return { success: true, student: formData, source: 'local' }
  }
  try {
    const setup   = getLocalSetup()
    const payload = { ...formData }
    if (setup?._id) payload._id = setup._id
    const { student } = await apiFetch('POST', '/students', payload)
    const merged = { ...formData, _id: student._id }
    localStorage.setItem(SETUP_KEY, JSON.stringify(merged))
    return { success: true, student: merged, source: 'api' }
  } catch {
    localStorage.setItem(SETUP_KEY, JSON.stringify(formData))
    return { success: true, student: formData, source: 'local', warning: 'Saved locally (server unreachable)' }
  }
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
export async function fetchSubjects() {
  if (!hasBackend()) {
    const subjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    return { subjects, source: 'local' }
  }
  const setup     = getLocalSetup()
  const studentId = setup?._id
  try {
    const url = studentId ? `/subjects?studentId=${studentId}` : '/subjects'
    const { subjects } = await apiFetch('GET', url)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
    return { subjects, source: 'api' }
  } catch {
    const subjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    return { subjects, source: 'local' }
  }
}

export async function addSubject(formData) {
  if (!hasBackend()) {
    const subject = {
      ...formData,
      _id: Date.now().toString(),
      id:  Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const local = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    local.push(subject)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(local))
    return { success: true, subject, source: 'local' }
  }
  const setup     = getLocalSetup()
  const studentId = setup?._id
  const payload   = { ...formData }
  if (studentId) payload.studentId = studentId
  try {
    const { subject } = await apiFetch('POST', '/subjects', payload)
    const local = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    local.push(subject)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(local))
    return { success: true, subject, source: 'api' }
  } catch {
    const subject = { ...formData, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date().toISOString() }
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    local.push(subject)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(local))
    return { success: true, subject, source: 'local' }
  }
}

export async function updateSubject(id, formData) {
  if (!hasBackend()) {
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.map(s => (s._id === id || s.id === id) ? { ...s, ...formData } : s)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, subject: formData, source: 'local' }
  }
  try {
    const { subject } = await apiFetch('PUT', `/subjects/${id}`, formData)
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.map(s => (s._id === id || s.id === id) ? { ...s, ...subject } : s)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, subject, source: 'api' }
  } catch {
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.map(s => (s._id === id || s.id === id) ? { ...s, ...formData } : s)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, subject: formData, source: 'local' }
  }
}

export async function deleteSubject(id) {
  if (!hasBackend()) {
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.filter(s => s._id !== id && s.id !== id)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, source: 'local' }
  }
  try {
    await apiFetch('DELETE', `/subjects/${id}`)
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.filter(s => s._id !== id && s.id !== id)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, source: 'api' }
  } catch {
    const local   = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    const updated = local.filter(s => s._id !== id && s.id !== id)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated))
    return { success: true, source: 'local' }
  }
}

export async function fetchPlan() {
  if (!hasBackend()) return null   // caller uses local fallback
  const setup     = getLocalSetup()
  const studentId = setup?._id
  try {
    const url = studentId ? `/plan?studentId=${studentId}` : '/plan'
    return await apiFetch('GET', url)
  } catch { return null }
}

export async function fetchDashboard() {
  if (!hasBackend()) return null
  const setup     = getLocalSetup()
  const studentId = setup?._id
  try {
    const url = studentId ? `/dashboard?studentId=${studentId}` : '/dashboard'
    return await apiFetch('GET', url)
  } catch { return null }
}
