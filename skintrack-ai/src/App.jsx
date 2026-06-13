import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Brain,
  CalendarCheck,
  Camera,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit3,
  HeartPulse,
  LineChart,
  Lock,
  MessageSquare,
  Pill,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
  Users,
  XCircle,
} from 'lucide-react'
import './App.css'

const weeklyMetrics = [
  { week: 'W1', severity: 72, adherence: 58, sideEffects: 18, qol: 44 },
  { week: 'W2', severity: 67, adherence: 64, sideEffects: 22, qol: 48 },
  { week: 'W3', severity: 59, adherence: 74, sideEffects: 28, qol: 56 },
  { week: 'W4', severity: 52, adherence: 81, sideEffects: 21, qol: 62 },
  { week: 'W5', severity: 46, adherence: 86, sideEffects: 16, qol: 70 },
  { week: 'W6', severity: 41, adherence: 89, sideEffects: 14, qol: 76 },
]

const reviewQueue = [
  {
    id: 'maya',
    name: 'Maya R.',
    age: 19,
    condition: 'Acne',
    priority: 'High',
    severity: 74,
    trend: '+18%',
    adherence: 52,
    qol: 39,
    lastUpload: 'Today',
    due: 'Photo regression + side effects',
    aiAction:
      'Review irritation history, consider simplifying morning regimen, and send hydration guidance.',
    flags: ['Severity rising', 'Burning reported', 'Low adherence'],
  },
  {
    id: 'jonah',
    name: 'Jonah K.',
    age: 24,
    condition: 'Acne',
    priority: 'Medium',
    severity: 58,
    trend: '-6%',
    adherence: 68,
    qol: 55,
    lastUpload: 'Yesterday',
    due: 'Missed check-in detail',
    aiAction:
      'Ask for medication timing details before changing treatment plan.',
    flags: ['Incomplete check-in'],
  },
  {
    id: 'leah',
    name: 'Leah S.',
    age: 31,
    condition: 'Acne',
    priority: 'Low',
    severity: 34,
    trend: '-14%',
    adherence: 91,
    qol: 82,
    lastUpload: '2 days ago',
    due: 'Routine progress review',
    aiAction:
      'Approve encouragement message and continue current plan until next scheduled follow-up.',
    flags: ['Improving'],
  },
]

const checkInItems = [
  { label: 'Morning cleanser', detail: 'Completed 6 of 7 days', icon: CheckCircle },
  { label: 'Topical retinoid', detail: 'Completed 5 of 7 nights', icon: Pill },
  { label: 'SPF protection', detail: 'Completed 7 of 7 days', icon: ShieldCheck },
]

const safetyPrinciples = [
  {
    icon: Stethoscope,
    title: 'Clinician in the loop',
    text: 'AI suggestions are queued for dermatologist approval, modification, or rejection before patient-facing treatment changes.',
  },
  {
    icon: AlertTriangle,
    title: 'Not a diagnosis',
    text: 'The prototype labels all model outputs as simulated decision support and avoids diagnostic claims.',
  },
  {
    icon: Lock,
    title: 'Sensitive data controls',
    text: 'Photo uploads, check-ins, and notes are framed as protected health data with access logging and consent checkpoints.',
  },
]

const cohortMetrics = [
  { label: 'Fitzpatrick I-II', accuracy: 88, reviewRate: 14 },
  { label: 'Fitzpatrick III-IV', accuracy: 86, reviewRate: 16 },
  { label: 'Fitzpatrick V-VI', accuracy: 84, reviewRate: 19 },
]

function App() {
  const [activeSection, setActiveSection] = useState('check-in')
  const [qualityScore, setQualityScore] = useState(7)
  const [selectedPatientId, setSelectedPatientId] = useState('maya')
  const [actionStatus, setActionStatus] = useState({})

  const selectedPatient =
    reviewQueue.find((patient) => patient.id === selectedPatientId) ||
    reviewQueue[0]
  const latestWeek = weeklyMetrics[weeklyMetrics.length - 1]

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAction = (patientId, action) => {
    setActionStatus((current) => ({ ...current, [patientId]: action }))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="SkinTrack AI navigation">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <span>SkinTrack</span>
            <strong>AI</strong>
          </div>
        </div>

        <nav className="nav-list">
          {[
            { id: 'check-in', label: 'Weekly check-in', icon: ClipboardCheck },
            { id: 'progress', label: 'Progress', icon: LineChart },
            { id: 'clinician', label: 'Derm dashboard', icon: Stethoscope },
            { id: 'safety', label: 'Fairness & safety', icon: Scale },
          ].map((item) => {
            const Icon = item.icon

            return (
              <button
                className={activeSection === item.id ? 'nav-item active' : 'nav-item'}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Prototype mode</p>
          <strong>Simulated AI outputs</strong>
          <span>
            Built for Product Track demo use only. Dermatologists approve every
            suggested action.
          </span>
        </div>
      </aside>

      <main className="workspace">
        <section className="hero-section" id="check-in">
          <div className="hero-copy">
            <p className="eyebrow">Healthcare Product Track Hackathon</p>
            <h1>AI-assisted dermatology monitoring for acne care.</h1>
            <p>
              SkinTrack AI helps patients upload weekly face photos, complete
              treatment check-ins, and gives dermatologists a prioritized review
              workflow with safety guardrails.
            </p>
            <div className="hero-actions">
              <button className="primary-action" type="button">
                Start weekly check-in <ChevronRight size={18} />
              </button>
              <button className="secondary-action" type="button">
                <MessageSquare size={18} /> View clinician queue
              </button>
            </div>
          </div>

          <div className="upload-panel">
            <div className="phone-frame">
              <div className="phone-header">
                <span>Week 6 upload</span>
                <CheckCircle size={18} />
              </div>
              <div className="face-preview" aria-label="Simulated face photo upload">
                <Camera size={42} />
                <div className="scan-ring one"></div>
                <div className="scan-ring two"></div>
              </div>
              <div className="upload-meta">
                <strong>Front + left + right photos received</strong>
                <span>Lighting quality: good · Blur risk: low</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-grid checkin-grid">
          <div className="card wide-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Patient workflow</p>
                <h2>Weekly treatment check-in</h2>
              </div>
              <span className="status-pill success">Ready to submit</span>
            </div>

            <div className="upload-dropzone">
              <UploadCloud size={28} />
              <div>
                <strong>Upload this week&apos;s face photos</strong>
                <span>Front, left profile, right profile · JPG or PNG</span>
              </div>
              <button type="button">Choose files</button>
            </div>

            <div className="checkin-list">
              {checkInItems.map((item) => {
                const Icon = item.icon

                return (
                  <div className="checkin-item" key={item.label}>
                    <div className="checkin-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <span className="status-dot"></span>
                  </div>
                )
              })}
            </div>

            <label className="slider-card" htmlFor="qol-score">
              <div>
                <strong>Quality-of-life score</strong>
                <span>How much did your skin affect confidence this week?</span>
              </div>
              <div className="slider-value">{qualityScore}/10</div>
              <input
                id="qol-score"
                max="10"
                min="1"
                onChange={(event) => setQualityScore(event.target.value)}
                type="range"
                value={qualityScore}
              />
            </label>
          </div>

          <div className="card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">AI summary</p>
                <h2>Week 6 signals</h2>
              </div>
              <Brain size={24} />
            </div>
            <ScoreBar label="Severity" tone="warning" value={latestWeek.severity} />
            <ScoreBar label="Adherence" tone="success" value={latestWeek.adherence} />
            <ScoreBar label="Side effects" tone="danger" value={latestWeek.sideEffects} />
            <div className="ai-note">
              <Sparkles size={18} />
              <p>
                Simulated AI sees improvement, stable irritation, and strong
                medication adherence. No urgent escalation detected.
              </p>
            </div>
          </div>
        </section>

        <section className="section-grid" id="progress">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Patient dashboard</p>
              <h2>Progress over time</h2>
            </div>
            <span className="status-pill">Acne MVP · Week 6</span>
          </div>

          <MetricCard
            icon={Activity}
            label="Severity trend"
            trend="31 pts better"
            value={`${latestWeek.severity}/100`}
          />
          <MetricCard
            icon={CalendarCheck}
            label="Adherence"
            trend="+31% since week 1"
            value={`${latestWeek.adherence}%`}
          />
          <MetricCard
            icon={HeartPulse}
            label="Quality of life"
            trend="+32 pts"
            value={`${latestWeek.qol}/100`}
          />

          <div className="card chart-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Simple div chart</p>
                <h2>Severity, adherence, and quality-of-life</h2>
              </div>
              <LineChart size={24} />
            </div>
            <div className="bar-chart" aria-label="Six week progress chart">
              {weeklyMetrics.map((metric) => (
                <div className="week-column" key={metric.week}>
                  <div className="bar-stack">
                    <span
                      className="bar severity"
                      style={{ height: `${metric.severity}%` }}
                      title={`Severity ${metric.severity}`}
                    ></span>
                    <span
                      className="bar adherence"
                      style={{ height: `${metric.adherence}%` }}
                      title={`Adherence ${metric.adherence}`}
                    ></span>
                    <span
                      className="bar qol"
                      style={{ height: `${metric.qol}%` }}
                      title={`Quality of life ${metric.qol}`}
                    ></span>
                  </div>
                  <strong>{metric.week}</strong>
                </div>
              ))}
            </div>
            <div className="legend">
              <span><i className="legend-dot severity"></i>Severity</span>
              <span><i className="legend-dot adherence"></i>Adherence</span>
              <span><i className="legend-dot qol"></i>Quality of life</span>
            </div>
          </div>
        </section>

        <section className="section-grid clinician-grid" id="clinician">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Dermatologist dashboard</p>
              <h2>Patients who need review</h2>
            </div>
            <span className="status-pill alert">3 open reviews</span>
          </div>

          <div className="card patient-queue">
            {reviewQueue.map((patient) => (
              <button
                className={
                  selectedPatientId === patient.id
                    ? 'patient-row selected'
                    : 'patient-row'
                }
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                type="button"
              >
                <div className="patient-avatar">{patient.name.charAt(0)}</div>
                <div>
                  <strong>{patient.name}</strong>
                  <span>
                    {patient.condition} · age {patient.age} · {patient.lastUpload}
                  </span>
                </div>
                <span className={`priority ${patient.priority.toLowerCase()}`}>
                  {patient.priority}
                </span>
              </button>
            ))}
          </div>

          <div className="card review-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">AI-assisted review</p>
                <h2>{selectedPatient.name}</h2>
              </div>
              <Users size={24} />
            </div>

            <div className="review-stats">
              <ScoreBar label="Severity" tone="danger" value={selectedPatient.severity} />
              <ScoreBar label="Adherence" tone="warning" value={selectedPatient.adherence} />
              <ScoreBar label="Quality of life" tone="success" value={selectedPatient.qol} />
            </div>

            <div className="flags">
              {selectedPatient.flags.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
            </div>

            <div className="recommendation">
              <div className="recommendation-icon">
                <Brain size={22} />
              </div>
              <div>
                <strong>Suggested action requiring dermatologist approval</strong>
                <p>{selectedPatient.aiAction}</p>
              </div>
            </div>

            <div className="action-bar">
              <button
                className="approve"
                onClick={() => handleAction(selectedPatient.id, 'Approved')}
                type="button"
              >
                <CheckCircle size={17} /> Approve
              </button>
              <button
                className="modify"
                onClick={() => handleAction(selectedPatient.id, 'Modified')}
                type="button"
              >
                <Edit3 size={17} /> Modify
              </button>
              <button
                className="reject"
                onClick={() => handleAction(selectedPatient.id, 'Rejected')}
                type="button"
              >
                <XCircle size={17} /> Reject
              </button>
            </div>

            <div className="decision-note">
              <Clock size={16} />
              <span>
                Current decision:{' '}
                <strong>{actionStatus[selectedPatient.id] || 'Pending clinician review'}</strong>
              </span>
            </div>
          </div>
        </section>

        <section className="section-grid safety-grid" id="safety">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Responsible AI</p>
              <h2>Fairness and safety controls</h2>
            </div>
            <span className="status-pill success">Human approval required</span>
          </div>

          {safetyPrinciples.map((principle) => {
            const Icon = principle.icon

            return (
              <div className="card principle-card" key={principle.title}>
                <Icon size={24} />
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            )
          })}

          <div className="card fairness-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Monitoring by skin tone group</p>
                <h2>Fairness snapshot</h2>
              </div>
              <Scale size={24} />
            </div>
            {cohortMetrics.map((cohort) => (
              <div className="cohort-row" key={cohort.label}>
                <div>
                  <strong>{cohort.label}</strong>
                  <span>{cohort.reviewRate}% dermatologist review rate</span>
                </div>
                <div className="cohort-meter">
                  <span style={{ width: `${cohort.accuracy}%` }}></span>
                </div>
                <strong>{cohort.accuracy}%</strong>
              </div>
            ))}
          </div>

          <div className="card disclaimer-card">
            <AlertTriangle size={24} />
            <div>
              <h3>Prototype disclaimer</h3>
              <p>
                SkinTrack AI is not a real medical diagnosis tool. All AI
                severity scores, image checks, and recommendations in this demo
                are simulated for product storytelling.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MetricCard({ icon: Icon, label, trend, value }) {
  return (
    <div className="card metric-card">
      <div className="metric-icon">
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{trend}</p>
    </div>
  )
}

function ScoreBar({ label, tone, value }) {
  return (
    <div className="score-row">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="score-track">
        <span className={`score-fill ${tone}`} style={{ width: `${value}%` }}></span>
      </div>
    </div>
  )
}

export default App
