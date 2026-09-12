/**
 * Smart Study Planner — Storage Service (localStorage only)
 * No backend, no database, no server needed.
 * All data is saved directly in the browser's localStorage.
 */

const SETUP_KEY     = 'smartStudyPlanner_setup'
const SUBJECTS_KEY  = 'smartStudyPlanner_subjects'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Setup / Student ──────────────────────────────────────────────────────────
export function getLocalSetup() {
  return getLS(SETUP_KEY, null)
}

export async function saveStudent(formData) {
  setLS(SETUP_KEY, formData)
  return { success: true, student: formData, source: 'local' }
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
export async function fetchSubjects() {
  const subjects = getLS(SUBJECTS_KEY, [])
  return { subjects, source: 'local' }
}

export async function addSubject(formData) {
  const subject = {
    ...formData,
    _id:       Date.now().toString(),
    id:        Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  const subjects = getLS(SUBJECTS_KEY, [])
  subjects.push(subject)
  setLS(SUBJECTS_KEY, subjects)
  return { success: true, subject, source: 'local' }
}

export async function updateSubject(id, formData) {
  const subjects = getLS(SUBJECTS_KEY, [])
  const updated  = subjects.map(s =>
    (s._id === id || s.id === id) ? { ...s, ...formData, updatedAt: new Date().toISOString() } : s
  )
  setLS(SUBJECTS_KEY, updated)
  return { success: true, subject: formData, source: 'local' }
}

export async function deleteSubject(id) {
  const subjects = getLS(SUBJECTS_KEY, [])
  const updated  = subjects.filter(s => s._id !== id && s.id !== id)
  setLS(SUBJECTS_KEY, updated)
  return { success: true, source: 'local' }
}

// ─── Plan (computed locally) ───────────────────────────────────────────────────
export async function fetchPlan() {
  return null  // StudyPlan.jsx uses its own local algorithm
}

// ─── Dashboard (computed locally) ────────────────────────────────────────────
export async function fetchDashboard() {
  return null  // Dashboard.jsx uses its own local calculation
}
