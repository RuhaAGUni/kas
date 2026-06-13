import { useEffect, useState } from 'react'
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
  Eye,
  EyeOff,
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

const SAFETY_DISCLAIMER =
  'Prototype only. Not a medical diagnosis. Dermatologist review required.'

const demoAcneModules = import.meta.glob(
  '/public/demo-acne/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const demoAcneSamples = Object.keys(demoAcneModules)
  .sort((first, second) => first.localeCompare(second))
  .map((path, index) => {
    const fileName = path.split('/').pop()

    return {
      id: `demo-acne-${index}`,
      name: fileName,
      source: 'sample',
      src: `/demo-acne/${fileName}`,
    }
  })

const weeklyMetrics = [
  { week: 'W1', severity: 72, adherence: 58, sideEffects: 18, qol: 44 },
  { week: 'W2', severity: 67, adherence: 64, sideEffects: 22, qol: 48 },
  { week: 'W3', severity: 59, adherence: 74, sideEffects: 28, qol: 56 },
  { week: 'W4', severity: 52, adherence: 81, sideEffects: 21, qol: 62 },
  { week: 'W5', severity: 46, adherence: 86, sideEffects: 16, qol: 70 },
  { week: 'W6', severity: 41, adherence: 89, sideEffects: 14, qol: 76 },
]

const baselineReviewQueue = [
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

function analyzeSkinImage(imageNameOrUrl) {
  const seed = String(imageNameOrUrl || 'skintrack-demo-image').toLowerCase()
  const hash = Array.from(seed).reduce(
    (total, character, index) =>
      (total + character.charCodeAt(0) * (index + 17)) % 100000,
    0,
  )
  const severityScore = hash % 101
  const severityLevel =
    severityScore >= 67 ? 'severe' : severityScore >= 34 ? 'moderate' : 'mild'
  const confidence = 72 + (hash % 25)
  const lesionCount =
    severityLevel === 'severe'
      ? 6 + (hash % 4)
      : severityLevel === 'moderate'
        ? 4 + (hash % 3)
        : 2 + (hash % 3)
  const markerTypes = ['lesion', 'redness', 'inflamed', 'comedone']
  const markers = Array.from({ length: lesionCount }, (_, index) => {
    const markerSeed = hash + index * 137
    const type = markerTypes[(markerSeed + index) % markerTypes.length]

    return {
      confidence: 68 + (markerSeed % 29),
      label: type === 'lesion' ? `lesion ${index + 1}` : type,
      size: 9 + (markerSeed % 13),
      type,
      x: 22 + (markerSeed % 57),
      y: 18 + ((markerSeed * 7) % 62),
    }
  })
  const detectedIndicators = [
    severityScore > 22 || hash % 2 === 0 ? 'redness' : null,
    severityScore > 48 || hash % 5 === 0 ? 'inflamed lesions' : null,
    severityScore > 30 || hash % 3 === 0 ? 'comedones' : null,
    severityScore > 70 || hash % 11 === 0 ? 'scarring risk' : null,
  ].filter(Boolean)
  const suggestedNextStep =
    severityLevel === 'severe'
      ? 'Prioritize dermatologist review, compare against prior photos, and discuss escalation options if clinically appropriate.'
      : severityLevel === 'moderate'
        ? 'Ask the dermatologist to review adherence, irritation, and whether the current plan needs adjustment.'
        : 'Continue weekly tracking and send supportive adherence coaching for dermatologist approval.'

  return {
    confidence,
    detectedIndicators,
    lesionCount,
    markers,
    safetyDisclaimer: SAFETY_DISCLAIMER,
    severityLevel,
    severityScore,
    suggestedNextStep,
  }
}

function App() {
  const [activeSection, setActiveSection] = useState('check-in')
  const [qualityScore, setQualityScore] = useState(7)
  const [selectedPatientId, setSelectedPatientId] = useState('patient-upload')
  const [actionStatus, setActionStatus] = useState({})
  const [selectedImage, setSelectedImage] = useState(() => demoAcneSamples[0] || null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showOverlay, setShowOverlay] = useState(true)

  useEffect(() => {
    if (selectedImage?.source !== 'upload') {
      return undefined
    }

    return () => URL.revokeObjectURL(selectedImage.src)
  }, [selectedImage])

  const currentSeverity = analysisResult?.severityScore ?? weeklyMetrics.at(-1).severity
  const displayMetrics = weeklyMetrics.map((metric, index) =>
    index === weeklyMetrics.length - 1
      ? {
          ...metric,
          severity: currentSeverity,
        }
      : metric,
  )
  const latestWeek = displayMetrics.at(-1)
  const previousWeek = displayMetrics.at(-2)
  const severityDelta = latestWeek.severity - previousWeek.severity
  const severityTrend =
    severityDelta <= 0
      ? `${Math.abs(severityDelta)} pts better vs W5`
      : `${severityDelta} pts higher vs W5`
  const analysisPriority =
    analysisResult?.severityLevel === 'severe'
      ? 'High'
      : analysisResult?.severityLevel === 'mild'
        ? 'Low'
        : 'Medium'
  const patientUploadReview = {
    id: 'patient-upload',
    name: 'Demo Patient',
    age: 22,
    condition: 'Acne',
    priority: analysisPriority,
    severity: currentSeverity,
    trend: severityDelta <= 0 ? `${severityDelta}%` : `+${severityDelta}%`,
    adherence: latestWeek.adherence,
    qol: latestWeek.qol,
    lastUpload: selectedImage ? 'Selected now' : 'Awaiting image',
    due: analysisResult
      ? `${analysisResult.severityLevel} simulated acne analysis · ${analysisResult.lesionCount} marked regions`
      : 'Needs photo analysis',
    aiAction:
      analysisResult?.suggestedNextStep ||
      'Select or upload a face image, run the simulated AI analysis, then route results for dermatologist review.',
    flags: analysisResult
      ? [
          `${analysisResult.lesionCount} simulated markers`,
          ...analysisResult.detectedIndicators,
        ]
      : ['Awaiting simulated analysis'],
    imageName: selectedImage?.name,
    uploadedImage: selectedImage?.src,
    analysis: analysisResult,
  }
  const reviewQueue = [patientUploadReview, ...baselineReviewQueue]
  const selectedPatient =
    reviewQueue.find((patient) => patient.id === selectedPatientId) ||
    reviewQueue[0]

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAction = (patientId, action) => {
    setActionStatus((current) => ({ ...current, [patientId]: action }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedImage({
      id: `upload-${file.name}`,
      name: file.name,
      source: 'upload',
      src: URL.createObjectURL(file),
    })
    setAnalysisResult(null)
    setSelectedPatientId('patient-upload')
  }

  const handleSampleSelect = (sample) => {
    setSelectedImage(sample)
    setAnalysisResult(null)
    setSelectedPatientId('patient-upload')
  }

  const handleRunAnalysis = () => {
    if (!selectedImage) {
      return
    }

    setAnalysisResult(analyzeSkinImage(selectedImage.name || selectedImage.src))
    setShowOverlay(true)
    setSelectedPatientId('patient-upload')
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
          <span>{SAFETY_DISCLAIMER}</span>
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
            <div className="prototype-banner">
              <AlertTriangle size={18} />
              <span>{SAFETY_DISCLAIMER}</span>
            </div>
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
              <div className="face-preview" aria-label="Selected face image preview">
                {selectedImage ? (
                  <img src={selectedImage.src} alt={`${selectedImage.name} preview`} />
                ) : (
                  <>
                    <Camera size={42} />
                    <div className="scan-ring one"></div>
                    <div className="scan-ring two"></div>
                  </>
                )}
              </div>
              <div className="upload-meta">
                <strong>
                  {selectedImage ? selectedImage.name : 'Awaiting patient photo'}
                </strong>
                <span>
                  {analysisResult
                    ? `Simulated severity: ${analysisResult.severityScore}/100`
                    : 'Run simulated AI analysis after selecting an image'}
                </span>
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

            <div className="image-workflow">
              <div className="upload-dropzone">
                <UploadCloud size={28} />
                <div>
                  <strong>Upload this week&apos;s face image</strong>
                  <span>Choose a JPG, PNG, or WebP from your computer</span>
                </div>
                <label className="file-button" htmlFor="skin-image-upload">
                  Choose file
                  <input
                    accept="image/*"
                    id="skin-image-upload"
                    onChange={handleImageUpload}
                    type="file"
                  />
                </label>
              </div>

              <div className="image-analysis-card">
                {selectedImage ? (
                  <>
                    <div className="analysis-image-toolbar">
                      <span className="status-pill">
                        {selectedImage.source === 'upload'
                          ? 'Uploaded image'
                          : 'Demo sample selected'}
                      </span>
                      <button
                        className="overlay-toggle"
                        disabled={!analysisResult}
                        onClick={() => setShowOverlay((current) => !current)}
                        type="button"
                      >
                        {showOverlay ? <Eye size={16} /> : <EyeOff size={16} />}
                        AI Overlay
                      </button>
                    </div>
                    <div className="analysis-image-frame">
                      <img src={selectedImage.src} alt={`${selectedImage.name} selected`} />
                      {analysisResult && showOverlay && (
                        <MarkerOverlay markers={analysisResult.markers} />
                      )}
                    </div>
                    <div className="analysis-image-meta">
                      <strong>{selectedImage.name}</strong>
                      <p>{SAFETY_DISCLAIMER}</p>
                    </div>
                  </>
                ) : (
                  <div className="empty-preview">
                    <Camera size={28} />
                    <strong>No image selected</strong>
                    <span>Upload a face image or choose a sample below.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="sample-gallery-block">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Sample gallery</p>
                  <h2>Images from /demo-acne</h2>
                </div>
                <Camera size={22} />
              </div>
              {demoAcneSamples.length > 0 ? (
                <div className="sample-gallery">
                  {demoAcneSamples.map((sample) => (
                    <button
                      className={
                        selectedImage?.id === sample.id
                          ? 'sample-tile selected'
                          : 'sample-tile'
                      }
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      type="button"
                    >
                      <img src={sample.src} alt={`${sample.name} acne sample`} />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="gallery-empty">
                  <AlertTriangle size={20} />
                  <span>
                    No sample files were found in public/demo-acne in this
                    workspace. Upload still works, and gallery samples will
                    appear here when images are added.
                  </span>
                </div>
              )}
            </div>

            <div className="analysis-control">
              <div>
                <p className="eyebrow">Prototype-only AI</p>
                <strong>Generate simulated acne analysis</strong>
                <span>
                  Deterministic results are based on the image filename or
                  selected sample path for repeatable demos.
                </span>
              </div>
              <button
                className="primary-action"
                disabled={!selectedImage}
                onClick={handleRunAnalysis}
                type="button"
              >
                <Brain size={18} />
                Run AI Analysis
              </button>
            </div>

            {analysisResult && (
              <AnalysisResults result={analysisResult} selectedImage={selectedImage} />
            )}

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
            {analysisResult && (
              <ScoreBar
                label="Confidence"
                tone="success"
                value={analysisResult.confidence}
              />
            )}
            <div className="ai-note">
              <Sparkles size={18} />
              <p>
                {analysisResult
                  ? `Simulated prototype-only analysis classifies this image as ${analysisResult.severityLevel} acne severity. ${SAFETY_DISCLAIMER}`
                  : `Simulated AI sees improvement, stable irritation, and strong medication adherence. ${SAFETY_DISCLAIMER}`}
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
            trend={analysisResult ? 'Updated from simulated image analysis' : severityTrend}
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
              {displayMetrics.map((metric) => (
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
                  <strong>
                    {metric.week}
                    {metric.week === 'W6' && analysisResult ? ' AI' : ''}
                  </strong>
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
            <span className="status-pill alert">{reviewQueue.length} open reviews</span>
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
                {patient.uploadedImage ? (
                  <img
                    className="patient-thumbnail"
                    src={patient.uploadedImage}
                    alt={`${patient.name} uploaded acne review`}
                  />
                ) : (
                  <div className="patient-avatar">{patient.name.charAt(0)}</div>
                )}
                <div>
                  <strong>{patient.name}</strong>
                  <span>
                    {patient.condition} · age {patient.age} · {patient.lastUpload}
                  </span>
                  {patient.imageName && <span>{patient.imageName}</span>}
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

            {selectedPatient.uploadedImage && (
              <div className="clinician-image-review">
                <div className="clinician-image-frame">
                  <img
                    src={selectedPatient.uploadedImage}
                    alt={`${selectedPatient.name} selected face review`}
                  />
                  {selectedPatient.analysis && showOverlay && (
                    <MarkerOverlay markers={selectedPatient.analysis.markers} compact />
                  )}
                </div>
                <div>
                  <span className="status-pill alert">Dermatologist review required</span>
                  <strong>{selectedPatient.imageName}</strong>
                  <p>{SAFETY_DISCLAIMER}</p>
                </div>
              </div>
            )}

            <div className="review-stats">
              <ScoreBar label="Severity" tone="danger" value={selectedPatient.severity} />
              <ScoreBar label="Adherence" tone="warning" value={selectedPatient.adherence} />
              <ScoreBar label="Quality of life" tone="success" value={selectedPatient.qol} />
              {selectedPatient.analysis && (
                <ScoreBar
                  label="Confidence"
                  tone="success"
                  value={selectedPatient.analysis.confidence}
                />
              )}
            </div>

            <div className="flags">
              {selectedPatient.flags.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
            </div>

            {selectedPatient.analysis && (
              <div className="analysis-compact">
                <strong>
                  Simulated level: {selectedPatient.analysis.severityLevel}
                </strong>
                <p>
                  {selectedPatient.analysis.lesionCount} prototype marker
                  regions were generated. Detected indicators are simulated:{' '}
                  {selectedPatient.analysis.detectedIndicators.join(', ') || 'none'}.
                </p>
              </div>
            )}

            <div className="recommendation">
              <div className="recommendation-icon">
                <Brain size={22} />
              </div>
              <div>
                <strong>
                  Suggested action requiring dermatologist approval
                </strong>
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
                {SAFETY_DISCLAIMER} All AI severity scores, image checks, and
                recommendations in this demo are simulated for product
                storytelling.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MarkerOverlay({ compact = false, markers }) {
  return (
    <div className={compact ? 'marker-overlay compact' : 'marker-overlay'}>
      {markers.map((marker, index) => (
        <div
          className={`acne-marker ${marker.type}`}
          key={`${marker.type}-${index}`}
          style={{
            height: `${marker.size}%`,
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            width: `${marker.size}%`,
          }}
          title={`${marker.label} · simulated confidence ${marker.confidence}%`}
        >
          <span>{marker.label}</span>
        </div>
      ))}
    </div>
  )
}

function AnalysisResults({ result, selectedImage }) {
  return (
    <div className="analysis-results">
      <div className="analysis-result-header">
        <div>
          <p className="eyebrow">Simulated result</p>
          <h3>Prototype-only acne analysis</h3>
          <span>{selectedImage?.name}</span>
        </div>
        <div className="analysis-badges">
          <span className="status-pill alert">Dermatologist review required</span>
          <div className={`severity-badge ${result.severityLevel}`}>
            {result.severityLevel}
          </div>
        </div>
      </div>

      <div className="analysis-score-grid">
        <div className="analysis-score-card">
          <span>Acne severity score</span>
          <strong>{result.severityScore}/100</strong>
        </div>
        <div className="analysis-score-card">
          <span>Confidence score</span>
          <strong>{result.confidence}%</strong>
        </div>
        <div className="analysis-score-card">
          <span>Marked regions</span>
          <strong>{result.lesionCount}</strong>
        </div>
      </div>

      <div className="indicator-grid">
        {['redness', 'inflamed lesions', 'comedones', 'scarring risk'].map((indicator) => (
          <div
            className={
              result.detectedIndicators.includes(indicator)
                ? 'indicator-chip detected'
                : 'indicator-chip'
            }
            key={indicator}
          >
            <CheckCircle size={16} />
            <span>{indicator}</span>
            <strong>
              {result.detectedIndicators.includes(indicator)
                ? 'simulated'
                : 'not prominent'}
            </strong>
          </div>
        ))}
      </div>

      <div className="next-step-card">
        <Brain size={20} />
        <div>
          <strong>Suggested next step</strong>
          <p>{result.suggestedNextStep}</p>
        </div>
      </div>

      <div className="analysis-disclaimer">
        <AlertTriangle size={18} />
        <span>{result.safetyDisclaimer}</span>
      </div>
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
