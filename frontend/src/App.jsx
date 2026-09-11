import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Setup from './pages/Setup.jsx'
import Subjects from './pages/Subjects.jsx'
import StudyPlan from './pages/StudyPlan.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Deadlines from './pages/Deadlines.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deadlines" element={<Deadlines />} />
      </Routes>
    </BrowserRouter>
  )
}
