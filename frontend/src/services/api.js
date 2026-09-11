/**
 * Smart Study Planner — API Service
 * Uses VITE_API_URL env variable — localhost in dev, Render URL in production.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SETUP_KEY    = 'smartStudyPlanner_setup'
const SUBJECTS_KEY = 'smartStudyPlanner_subjects'

async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(BASE + path, opts)
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

export async function isServerAlive() {
  try {
    const r = await fetch(BASE + '/health', { signal: AbortSignal.timeout(3000) })
    return r.ok
  } catch { return false }
}

export async function saveStudent(formData) {
  const setup   = JSON.parse(localStorage.getItem(SETUP_KEY) || 'null')
  const payload = { ...formData }
  if (setup?._id) payload._id = setup._id
  try {
    const { student } = await apiFetch('POST', '/students', payload)
    const merged = { ...formData, _id: student._id }
    localStorage.setItem(SETUP_KEY, JSON.stringify(merged))
    return { success: true, student: merged, source: 'api' }
  } catch {
    const local = { ...formData }
    localStorage.setItem(SETUP_KEY, JSON.stringify(local))
    return { success: true, student: local, source: 'local', warning: 'Saved locally (server unreachable)' }
  }
}

export function getLocalSetup() {
  return JSON.parse(localStorage.getItem(SETUP_KEY) || 'null')
}

export async function fetchSubjects() {
  const setup = getLocalSetup()
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
  const setup = getLocalSetup()
  const studentId = setup?._id
  const payload = { ...formData }
  if (studentId) payload.studentId = studentId
  try {
    const { subject } = await apiFetch('POST', '/subjects', payload)
    const local = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    local.push(subject)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(local))
    return { success: true, subject, source: 'api' }
  } catch {
    const subject = { ...formData, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date().toISOString() }
    const local = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '[]')
    local.push(subject)
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(local))
    return { success: true, subject, source: 'local' }
  }
}

export async function updateSubject(id, formData) {
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
  const setup = getLocalSetup()
  const studentId = setup?._id
  try {
    const url = studentId ? `/plan?studentId=${studentId}` : '/plan'
    return await apiFetch('GET', url)
  } catch { return null }
}

export async function fetchDashboard() {
  const setup = getLocalSetup()
  const studentId = setup?._id
  try {
    const url = studentId ? `/dashboard?studentId=${studentId}` : '/dashboard'
    return await apiFetch('GET', url)
  } catch { return null }
}
