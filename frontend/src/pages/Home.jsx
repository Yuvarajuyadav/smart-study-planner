import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

const FEATURES = [
  { icon: '🧠', bg: '#EEF2FF', title: 'Smart Planning', desc: 'Automatically generate daily study timetables based on your deadlines, difficulty, and available hours.' },
  { icon: '🎯', bg: '#ECFDF5', title: 'Priority-Based Study', desc: 'Our algorithm prioritizes subjects with closer deadlines, higher difficulty, and lower progress.' },
  { icon: '📊', bg: '#FFF7ED', title: 'Progress Tracking', desc: 'Visualize your progress per subject, track completed topics, and monitor study hours.' },
  { icon: '🔔', bg: '#FFF1F2', title: 'Deadline Reminders', desc: 'Never miss a submission. Get a clear view of overdue, upcoming, and completed deadlines.' },
]

const STEPS = [
  { n: '01', title: 'Set Up Your Profile', desc: 'Enter your name, study hours, preferred time, and study days.' },
  { n: '02', title: 'Add Subjects', desc: 'Add subjects with topics, deadlines, difficulty, and estimated hours.' },
  { n: '03', title: 'Generate Your Plan', desc: 'The app builds a prioritized daily timetable automatically.' },
  { n: '04', title: 'Track Progress', desc: 'Mark tasks complete and watch your progress grow on the dashboard.' },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="home page-wrapper" style={{ paddingTop: 'var(--navbar-h)' }}>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero__eyebrow">🎓 Built for Students</div>
          <h1 className="hero__title">Study Smarter.<br /><span>Achieve More.</span></h1>
          <p className="hero__subtitle">
            Plan your study time, prioritize important subjects, track your progress,
            and never miss an academic deadline.
          </p>
          <div className="hero__actions">
            <button className="btn btn-primary" onClick={() => navigate('/setup')}>
              🚀 Get Started
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="hero__dashboard">
            <div className="hero__db-bar">
              <div className="hero__db-dot" style={{ background: '#EF4444' }} />
              <div className="hero__db-dot" style={{ background: '#F59E0B' }} />
              <div className="hero__db-dot" style={{ background: '#22C55E' }} />
            </div>
            <div className="hero__db-grid">
              <div className="hero__db-stat">
                <div className="hero__db-stat-val">75%</div>
                <div className="hero__db-stat-lbl">Overall Progress</div>
              </div>
              <div className="hero__db-stat">
                <div className="hero__db-stat-val">12</div>
                <div className="hero__db-stat-lbl">Day Streak 🔥</div>
              </div>
              <div className="hero__db-stat">
                <div className="hero__db-stat-val">42h</div>
                <div className="hero__db-stat-lbl">Hours This Week</div>
              </div>
            </div>
            <div className="hero__db-tasks">
              {[
                { sub: 'Mathematics — Calculus', time: '6:00 – 7:00 PM', color: '#EF4444', priority: 'High', bg: '#FEE2E2', textColor: '#B91C1C' },
                { sub: 'Digital Electronics — Flip Flops', time: '7:15 – 8:00 PM', color: '#F59E0B', priority: 'Medium', bg: '#FEF9C3', textColor: '#92400E' },
                { sub: 'Python — OOP', time: '8:15 – 9:00 PM', color: '#4F46E5', priority: 'High', bg: '#FEE2E2', textColor: '#B91C1C' },
              ].map((t, i) => (
                <div key={i} className="hero__db-task">
                  <div className="hero__db-task-dot" style={{ background: t.color }} />
                  <div className="hero__db-task-info">
                    <div className="hero__db-task-name">{t.sub}</div>
                    <div className="hero__db-task-time">{t.time}</div>
                  </div>
                  <div className="hero__db-task-badge" style={{ background: t.bg, color: t.textColor }}>{t.priority}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title" style={{ textAlign: 'center' }}>Everything You Need</h2>
            <p className="section-subtitle" style={{ textAlign: 'center' }}>Powerful tools designed for student productivity</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-grid">
            {[['1000+', 'Students Using'], ['6', 'Smart Features'], ['100%', 'Free to Use'], ['24/7', 'Available']].map(([v, l], i) => (
              <div key={i}>
                <div className="stat-val">{v}</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Start planning in 4 simple steps</p>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Study Smarter?</h2>
            <p>Join thousands of students who plan better, study smarter, and achieve more.</p>
            <button className="btn btn-white" onClick={() => navigate('/setup')}>
              🚀 Start Now — It's Free
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
