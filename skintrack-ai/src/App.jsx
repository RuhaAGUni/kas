import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  CalendarCheck,
  Camera,
  CheckCircle,
  ChevronDown,
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
  Send,
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
const CHAT_SAFETY_DISCLAIMER =
  'Prototype only. Not medical advice. Dermatologist review required.'

const quickPrompts = {
  dermatologist: [
    'Summarize this patient',
    'Why is this patient flagged?',
    'Draft review note',
    'List safety concerns',
  ],
  patient: [
    'Explain my analysis',
    'Help me with my weekly check-in',
    'What does my severity score mean?',
    'When should I contact my dermatologist?',
  ],
}

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
  const markerTypes = ['blemish', 'redness', 'inflamed', 'comedone']
  const markers = Array.from({ length: lesionCount }, (_, index) => {
    const markerSeed = hash + index * 137
    const type = markerTypes[(markerSeed + index) % markerTypes.length]

    return {
      confidence: 68 + (markerSeed % 29),
      label: type === 'blemish' ? `blemish ${index + 1}` : type,
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

async function analyzeImageWithCanvas(imageUrl) {
  const image = await loadImageForCanvas(imageUrl)
  const maxCanvasSize = 720
  const scale = Math.min(1, maxCanvasSize / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('Canvas context unavailable')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  const { data } = context.getImageData(0, 0, width, height)
  const cells = collectRednessCells(data, width, height)
  const strongClusters = buildRednessClusters(cells).filter(
    (cluster) => cluster.strongCount > 1 || cluster.maxIntensity > 72,
  )
  const weakClusters = buildRednessClusters(cells).filter(
    (cluster) => cluster.strongCount > 0 || cluster.maxIntensity > 48,
  )
  const selectedClusters = (strongClusters.length > 0 ? strongClusters : weakClusters)
    .sort((first, second) => second.score - first.score)
    .slice(0, strongClusters.length > 0 ? 9 : 2)

  return buildCanvasAnalysisResult(selectedClusters, width, height, strongClusters.length > 0)
}

function loadImageForCanvas(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
      image.crossOrigin = 'anonymous'
    }

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image failed to load for canvas analysis'))
    image.src = imageUrl
  })
}

function collectRednessCells(data, width, height) {
  const cells = new Map()
  const step = 5
  const cellSize = Math.max(24, Math.round(Math.min(width, height) / 18))

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4
      const r = data[offset]
      const g = data[offset + 1]
      const b = data[offset + 2]
      const maxChannel = Math.max(r, g, b)
      const minChannel = Math.min(r, g, b)
      const brightness = (r + g + b) / 3
      const redScore = r - Math.max(g, b)
      const saturation = maxChannel - minChannel
      const strongCandidate =
        redScore > 35 && saturation > 30 && r > 90 && brightness > 50 && brightness < 230
      const weakCandidate =
        redScore > 18 && saturation > 20 && r > 70 && brightness > 55 && brightness < 220

      if (!strongCandidate && !weakCandidate) {
        continue
      }

      const cellX = Math.floor(x / cellSize)
      const cellY = Math.floor(y / cellSize)
      const key = `${cellX}:${cellY}`
      const intensity = redScore + saturation * 0.35
      const cell =
        cells.get(key) || {
          cellX,
          cellY,
          count: 0,
          maxIntensity: 0,
          maxX: x,
          maxY: y,
          minX: x,
          minY: y,
          strongCount: 0,
          sumIntensity: 0,
          sumX: 0,
          sumY: 0,
        }

      cell.count += 1
      cell.strongCount += strongCandidate ? 1 : 0
      cell.sumX += x
      cell.sumY += y
      cell.sumIntensity += intensity
      cell.maxIntensity = Math.max(cell.maxIntensity, intensity)
      cell.minX = Math.min(cell.minX, x)
      cell.minY = Math.min(cell.minY, y)
      cell.maxX = Math.max(cell.maxX, x)
      cell.maxY = Math.max(cell.maxY, y)
      cells.set(key, cell)
    }
  }

  return cells
}

function buildRednessClusters(cells) {
  const clusters = []
  const visited = new Set()
  const offsets = [-1, 0, 1]

  for (const [key, cell] of cells) {
    if (visited.has(key)) {
      continue
    }

    const queue = [cell]
    const clusterCells = []
    visited.add(key)

    while (queue.length > 0) {
      const current = queue.shift()
      clusterCells.push(current)

      for (const dx of offsets) {
        for (const dy of offsets) {
          if (dx === 0 && dy === 0) {
            continue
          }

          const neighborKey = `${current.cellX + dx}:${current.cellY + dy}`

          if (visited.has(neighborKey) || !cells.has(neighborKey)) {
            continue
          }

          visited.add(neighborKey)
          queue.push(cells.get(neighborKey))
        }
      }
    }

    clusters.push(mergeClusterCells(clusterCells))
  }

  return clusters
}

function mergeClusterCells(clusterCells) {
  const cluster = clusterCells.reduce(
    (merged, cell) => ({
      count: merged.count + cell.count,
      maxIntensity: Math.max(merged.maxIntensity, cell.maxIntensity),
      maxX: Math.max(merged.maxX, cell.maxX),
      maxY: Math.max(merged.maxY, cell.maxY),
      minX: Math.min(merged.minX, cell.minX),
      minY: Math.min(merged.minY, cell.minY),
      strongCount: merged.strongCount + cell.strongCount,
      sumIntensity: merged.sumIntensity + cell.sumIntensity,
      sumX: merged.sumX + cell.sumX,
      sumY: merged.sumY + cell.sumY,
    }),
    {
      count: 0,
      maxIntensity: 0,
      maxX: 0,
      maxY: 0,
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      strongCount: 0,
      sumIntensity: 0,
      sumX: 0,
      sumY: 0,
    },
  )

  return {
    ...cluster,
    score: cluster.count * 0.75 + cluster.maxIntensity + cluster.strongCount * 1.8,
  }
}

function buildCanvasAnalysisResult(clusters, width, height, hasStrongClusters) {
  if (clusters.length === 0) {
    return {
      confidence: 38,
      detectedIndicators: [],
      lesionCount: 0,
      markers: [],
      safetyDisclaimer: SAFETY_DISCLAIMER,
      severityLevel: 'mild',
      severityScore: 12,
      suggestedNextStep:
        'No strong red clusters were found. Continue weekly tracking and ask the dermatologist to review if symptoms persist.',
    }
  }

  const markers = clusters.map((cluster, index) => {
    const averageIntensity = cluster.sumIntensity / cluster.count
    const clusterWidth = ((cluster.maxX - cluster.minX) / width) * 100
    const clusterHeight = ((cluster.maxY - cluster.minY) / height) * 100
    const size = clamp(Math.max(clusterWidth, clusterHeight) + 6, 7, 22)
    const type = getMarkerType(cluster, averageIntensity)

    return {
      confidence: clamp(
        Math.round(
          (hasStrongClusters ? 44 : 30) +
            averageIntensity * 0.38 +
            Math.min(18, cluster.count * 0.9) +
            cluster.strongCount * 0.7,
        ),
        hasStrongClusters ? 58 : 34,
        hasStrongClusters ? 96 : 58,
      ),
      intensity: Math.round(averageIntensity),
      label: type,
      size,
      type,
      x: clamp((cluster.sumX / cluster.count / width) * 100, 4, 96),
      y: clamp((cluster.sumY / cluster.count / height) * 100, 4, 96),
      sortIndex: index,
    }
  })
  const intensities = markers.map((marker) => marker.intensity)
  const averageIntensity = intensities.reduce((total, value) => total + value, 0) / markers.length
  const averageSize = markers.reduce((total, marker) => total + marker.size, 0) / markers.length
  const spread = getMarkerSpread(markers)
  const severityScore = clamp(
    Math.round(markers.length * 8 + averageIntensity * 0.42 + averageSize * 1.35 + spread * 0.16),
    hasStrongClusters ? 24 : 8,
    hasStrongClusters ? 100 : 34,
  )
  const severityLevel =
    severityScore >= 67 ? 'severe' : severityScore >= 34 ? 'moderate' : 'mild'
  const confidence = Math.round(
    markers.reduce((total, marker) => total + marker.confidence, 0) / markers.length,
  )
  const detectedIndicators = getDetectedIndicators(markers, severityScore, averageIntensity)
  const suggestedNextStep =
    severityLevel === 'severe'
      ? 'Canvas heuristics found multiple intense red clusters. Prioritize dermatologist review before any treatment change.'
      : severityLevel === 'moderate'
        ? 'Canvas heuristics found localized redness. Dermatologist should review adherence, irritation, and recent treatment response.'
        : 'Canvas heuristics found limited redness. Continue weekly tracking and route the result for dermatologist review.'

  return {
    confidence,
    detectedIndicators,
    lesionCount: markers.length,
    markers,
    safetyDisclaimer: SAFETY_DISCLAIMER,
    severityLevel,
    severityScore,
    suggestedNextStep,
  }
}

function getMarkerType(cluster, averageIntensity) {
  if (cluster.count <= 3 && averageIntensity < 58) {
    return 'comedone'
  }

  if (averageIntensity > 78 || cluster.strongCount > 9) {
    return 'inflamed'
  }

  if (averageIntensity > 56 || cluster.strongCount > 2) {
    return 'redness'
  }

  return 'blemish'
}

function getMarkerSpread(markers) {
  if (markers.length < 2) {
    return 0
  }

  const xs = markers.map((marker) => marker.x)
  const ys = markers.map((marker) => marker.y)

  return Math.max(...xs) - Math.min(...xs) + (Math.max(...ys) - Math.min(...ys))
}

function getDetectedIndicators(markers, severityScore, averageIntensity) {
  return [
    markers.some((marker) => ['redness', 'inflamed'].includes(marker.type))
      ? 'redness'
      : null,
    markers.some(
      (marker) =>
        marker.type === 'inflamed' || (marker.size > 14 && marker.intensity > 68),
    )
      ? 'inflamed lesions'
      : null,
    markers.some((marker) => marker.type === 'comedone') ? 'comedones' : null,
    severityScore > 72 && averageIntensity > 76 ? 'scarring risk' : null,
  ].filter(Boolean)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function createAssistantResponse(mode, prompt, context) {
  const normalizedPrompt = prompt.toLowerCase()

  if (mentionsUrgentSymptoms(normalizedPrompt)) {
    return withChatSafety(
      'You mentioned symptoms that could need urgent attention, such as severe pain, swelling, allergic reaction, or rapidly worsening symptoms. Please seek professional medical help urgently or contact local emergency services if symptoms feel serious.',
    )
  }

  if (mentionsMedicationChanges(normalizedPrompt)) {
    return withChatSafety(
      'I cannot recommend medication changes or treatment instructions. Only a dermatologist can approve, modify, or reject treatment changes after reviewing your case.',
    )
  }

  if (mode === 'dermatologist') {
    return createDermatologistResponse(normalizedPrompt, context)
  }

  return createPatientResponse(normalizedPrompt, context)
}

function createPatientResponse(prompt, context) {
  if (prompt.includes('check-in') || prompt.includes('weekly')) {
    return withChatSafety(
      `For this week's check-in, confirm: treatment adherence (${context.adherence}%), side effects (${context.sideEffects}/100), quality-of-life impact (${context.qol}/100), perceived skin changes, and whether the uploaded image looks better, worse, or about the same. I can help explain terms, but I cannot recommend medication changes.`,
    )
  }

  if (prompt.includes('severity score') || prompt.includes('mean')) {
    return withChatSafety(
      `Your current simulated severity score is ${context.severity}/100, labeled ${context.severityLevel}. In this prototype, lower scores suggest fewer or less intense marked regions, while higher scores suggest more or stronger redness/inflammation markers. It is not a diagnosis.`,
    )
  }

  if (prompt.includes('contact') || prompt.includes('dermatologist') || prompt.includes('worse')) {
    return withChatSafety(
      'Contact a dermatologist if symptoms are rapidly worsening, side effects feel severe, swelling or allergic-reaction symptoms appear, or your treatment is difficult to tolerate. For urgent symptoms, seek professional medical help promptly.',
    )
  }

  if (prompt.includes('analysis') || prompt.includes('redness') || prompt.includes('inflamed')) {
    return withChatSafety(
      `The simulated analysis found ${context.markerCount} marked region(s), with indicators: ${context.indicators}. "Redness" means the canvas heuristic found red/pink clusters. "Inflamed lesions" means larger or more intense red clusters. A dermatologist must review before any action.`,
    )
  }

  return withChatSafety(
    `I can help explain your simulated SkinTrack results, guide your weekly check-in, or clarify terms like severity score, adherence, redness, inflamed lesions, and dermatologist review. Current simulated severity is ${context.severity}/100 with adherence at ${context.adherence}%.`,
  )
}

function createDermatologistResponse(prompt, context) {
  if (prompt.includes('summarize')) {
    return withChatSafety(
      `Case summary: ${context.patientName} has simulated acne severity ${context.severity}/100 (${context.severityLevel}), adherence ${context.adherence}%, side effects ${context.sideEffects}/100, QoL ${context.qol}/100, and trend: ${context.severityTrend}. Image analysis shows ${context.markerCount} marker(s), indicators: ${context.indicators}. Review status: ${context.reviewStatus}.`,
    )
  }

  if (prompt.includes('flagged') || prompt.includes('priority')) {
    return withChatSafety(
      `This patient may need review because severity is ${context.severity}/100, side effects are ${context.sideEffects}/100, adherence is ${context.adherence}%, and the queue priority is ${context.priority}. Consider asking about irritation, dryness, treatment consistency, and whether symptoms changed quickly. Dermatologist approval is required for any plan changes.`,
    )
  }

  if (prompt.includes('draft') || prompt.includes('note')) {
    return withChatSafety(
      `Draft review note: Reviewed simulated SkinTrack upload and check-in. Severity ${context.severity}/100 (${context.severityLevel}); adherence ${context.adherence}%; side effects ${context.sideEffects}/100; QoL ${context.qol}/100; visual indicators: ${context.indicators}. Suggested review focus: irritation, dryness, adherence barriers, and comparison with prior photos. No treatment change auto-approved.`,
    )
  }

  if (prompt.includes('safety') || prompt.includes('concern')) {
    return withChatSafety(
      `Safety concerns to review: severe or rapidly worsening symptoms, allergic-reaction symptoms, swelling, high irritation/dryness, low adherence, image-quality limitations, and bias/fairness limitations in simulated image scoring. AI output should be treated as decision support only.`,
    )
  }

  return withChatSafety(
    `Dermatologist Copilot can summarize the case, explain flags, draft a review note, or list safety concerns. Current case: severity ${context.severity}/100, adherence ${context.adherence}%, side effects ${context.sideEffects}/100, QoL ${context.qol}/100, review status ${context.reviewStatus}.`,
  )
}

function mentionsMedicationChanges(prompt) {
  return [
    'change medication',
    'change my medication',
    'switch medication',
    'stop medication',
    'stop using',
    'increase dose',
    'decrease dose',
    'dosage',
    'prescribe',
    'retinoid amount',
    'antibiotic',
    'accutane',
    'isotretinoin',
  ].some((phrase) => prompt.includes(phrase))
}

function mentionsUrgentSymptoms(prompt) {
  return [
    'severe pain',
    'swelling',
    'allergic reaction',
    'trouble breathing',
    'difficulty breathing',
    'rapidly worsening',
    'getting worse fast',
    'face swelling',
    'hives',
    'throat',
    'emergency',
  ].some((phrase) => prompt.includes(phrase))
}

function withChatSafety(message) {
  return `${message}\n\n${CHAT_SAFETY_DISCLAIMER}`
}

function App() {
  const [activeSection, setActiveSection] = useState('check-in')
  const [qualityScore, setQualityScore] = useState(7)
  const [selectedPatientId, setSelectedPatientId] = useState('patient-upload')
  const [actionStatus, setActionStatus] = useState({})
  const [selectedImage, setSelectedImage] = useState(() => demoAcneSamples[0] || null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [assistantMode, setAssistantMode] = useState('patient')
  const [chatInput, setChatInput] = useState('')
  const [isAssistantBubbleVisible, setIsAssistantBubbleVisible] = useState(true)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `Hi, I’m SkinTrack Assistant. I can help with weekly check-ins or dermatologist review summaries.\n\n${CHAT_SAFETY_DISCLAIMER}`,
    },
  ])

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
  const assistantContext = {
    adherence: latestWeek.adherence,
    indicators: analysisResult?.detectedIndicators.join(', ') || 'none detected yet',
    markerCount: analysisResult?.lesionCount ?? 0,
    patientName: selectedPatient.name,
    priority: selectedPatient.priority,
    qol: latestWeek.qol,
    reviewStatus: actionStatus[selectedPatient.id] || 'Pending dermatologist review',
    severity: latestWeek.severity,
    severityLevel: analysisResult?.severityLevel || 'not analyzed yet',
    severityTrend,
    sideEffects: latestWeek.sideEffects,
  }

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleOpenAssistant = () => {
    handleNavClick('assistant')
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
    setIsAnalyzing(false)
    setSelectedPatientId('patient-upload')
  }

  const handleSampleSelect = (sample) => {
    setSelectedImage(sample)
    setAnalysisResult(null)
    setIsAnalyzing(false)
    setSelectedPatientId('patient-upload')
  }

  const handleRunAnalysis = async () => {
    if (!selectedImage) {
      return
    }

    setIsAnalyzing(true)

    try {
      const canvasResult = await analyzeImageWithCanvas(selectedImage.src)
      setAnalysisResult(canvasResult)
    } catch {
      setAnalysisResult(analyzeSkinImage(selectedImage.name || selectedImage.src))
    } finally {
      setShowOverlay(true)
      setSelectedPatientId('patient-upload')
      setIsAnalyzing(false)
    }
  }

  const handleSendChatMessage = (messageText = chatInput) => {
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage) {
      return
    }

    const assistantReply = createAssistantResponse(
      assistantMode,
      trimmedMessage,
      assistantContext,
    )

    setChatMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedMessage },
      { role: 'assistant', text: assistantReply },
    ])
    setChatInput('')
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
            { id: 'assistant', label: 'AI Assistant', icon: Bot },
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
              <button
                aria-expanded={isGalleryOpen}
                className="sample-gallery-header"
                onClick={() => setIsGalleryOpen((current) => !current)}
                type="button"
              >
                <div>
                  <h2>Sample Gallery</h2>
                  <span>Images from /demo-acne</span>
                </div>
                {isGalleryOpen ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
              </button>
              {isGalleryOpen && (
                demoAcneSamples.length > 0 ? (
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
                )
              )}
            </div>

            <div className="analysis-control">
              <div>
                <p className="eyebrow">Prototype-only AI</p>
                <strong>Generate simulated acne analysis</strong>
                <span>
                  Browser-side canvas heuristics inspect red/pink pixel clusters
                  for repeatable prototype markers.
                </span>
              </div>
              <button
                className="primary-action"
                disabled={!selectedImage || isAnalyzing}
                onClick={handleRunAnalysis}
                type="button"
              >
                <Brain size={18} />
                {isAnalyzing ? 'Analyzing image...' : 'Run AI Analysis'}
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

        <section className="section-grid assistant-grid" id="assistant">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Simulated chatbot</p>
              <h2>AI Assistant</h2>
            </div>
            <span className="status-pill alert">{CHAT_SAFETY_DISCLAIMER}</span>
          </div>

          <div className="card assistant-card">
            <div className="assistant-panel-header">
              <div className="assistant-title">
                <div className="assistant-avatar">
                  <Bot size={22} />
                </div>
                <div>
                  <strong>SkinTrack Assistant</strong>
                  <span>
                    Simulated support for patients and dermatologist review workflows
                  </span>
                </div>
              </div>

              <div className="mode-switch" aria-label="Assistant mode switch">
                <button
                  className={assistantMode === 'patient' ? 'active' : ''}
                  onClick={() => setAssistantMode('patient')}
                  type="button"
                >
                  Patient Assistant
                </button>
                <button
                  className={assistantMode === 'dermatologist' ? 'active' : ''}
                  onClick={() => setAssistantMode('dermatologist')}
                  type="button"
                >
                  Dermatologist Copilot
                </button>
              </div>
            </div>

            <div className="assistant-context-grid">
              <div>
                <span>Latest severity</span>
                <strong>{latestWeek.severity}/100</strong>
              </div>
              <div>
                <span>Adherence</span>
                <strong>{latestWeek.adherence}%</strong>
              </div>
              <div>
                <span>Side effects</span>
                <strong>{latestWeek.sideEffects}/100</strong>
              </div>
              <div>
                <span>QoL score</span>
                <strong>{latestWeek.qol}/100</strong>
              </div>
            </div>

            <div className="quick-prompts">
              {quickPrompts[assistantMode].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendChatMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chat-window" aria-label="SkinTrack Assistant conversation">
              {chatMessages.map((message, index) => (
                <div
                  className={`chat-message ${message.role}`}
                  key={`${message.role}-${index}`}
                >
                  <div className="chat-bubble">
                    {message.text.split('\n').map((line, lineIndex) => (
                      <p key={`${line}-${lineIndex}`}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <form
              className="chat-input-row"
              onSubmit={(event) => {
                event.preventDefault()
                handleSendChatMessage()
              }}
            >
              <input
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={
                  assistantMode === 'patient'
                    ? 'Ask about your check-in or simulated analysis...'
                    : 'Ask for a case summary or review priorities...'
                }
                type="text"
                value={chatInput}
              />
              <button type="submit">
                <Send size={18} />
                Send
              </button>
            </form>
          </div>

          <div className="card assistant-guardrail-card">
            <MessageSquare size={24} />
            <h3>Chatbot guardrails</h3>
            <p>
              The assistant can explain simulated analysis, summarize review
              signals, and draft discussion prompts. It refuses medication-change
              instructions and routes urgent symptoms to professional medical
              help.
            </p>
            <div className="guardrail-list">
              <span>No diagnosis</span>
              <span>No medication changes</span>
              <span>Dermatologist approval required</span>
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

      <div className="floating-assistant-widget">
        {isAssistantBubbleVisible && (
          <div
            aria-label="Open SkinTrack AI Assistant"
            className="floating-assistant-bubble"
            onClick={handleOpenAssistant}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleOpenAssistant()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="bubble-text-desktop">Questions about your weekly check-in?</span>
            <span className="bubble-text-mobile">Ask Assistant</span>
            <button
              aria-label="Hide assistant help text"
              className="bubble-close"
              onClick={(event) => {
                event.stopPropagation()
                setIsAssistantBubbleVisible(false)
              }}
              type="button"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  setIsAssistantBubbleVisible(false)
                }
              }}
            >
              <XCircle size={16} />
            </button>
          </div>
        )}
        <button
          aria-label="Open SkinTrack AI Assistant"
          className="floating-assistant-button"
          onClick={handleOpenAssistant}
          type="button"
        >
          <Bot size={28} />
          <Sparkles size={15} className="floating-sparkle" />
        </button>
      </div>
    </div>
  )
}

function MarkerOverlay({ compact = false, markers }) {
  return (
    <div className={compact ? 'marker-overlay compact' : 'marker-overlay'}>
      <div className="heatmap-layer">
        {markers.map((marker, index) => (
          <span
            className={`heatmap-spot ${marker.type}`}
            key={`heat-${marker.type}-${index}`}
            style={{
              height: `${marker.size * 2.4}%`,
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              width: `${marker.size * 2.4}%`,
            }}
          ></span>
        ))}
      </div>
      {markers.map((marker, index) => (
        <div
          className={`acne-marker ${marker.type}`}
          key={`${marker.type}-${index}`}
          style={{
            height: `${marker.size}%`,
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            width: `${marker.size * 1.55}%`,
          }}
          title={`${marker.label} · simulated confidence ${marker.confidence}%`}
        >
          <span>
            {marker.label} {marker.confidence}%
          </span>
        </div>
      ))}
    </div>
  )
}

function AnalysisResults({ result, selectedImage }) {
  const markerSummary = getMarkerSummary(result)

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
          <span>Average confidence</span>
          <strong>{result.confidence}%</strong>
        </div>
        <div className="analysis-score-card">
          <span>Marked regions</span>
          <strong>{result.lesionCount}</strong>
        </div>
      </div>

      <div className="overlay-summary-panel">
        <div>
          <span>Total detected regions</span>
          <strong>{result.lesionCount}</strong>
        </div>
        <div>
          <span>Average marker confidence</span>
          <strong>{markerSummary.averageConfidence}%</strong>
        </div>
        <div>
          <span>Most common indicator</span>
          <strong>{markerSummary.mostCommonIndicator}</strong>
        </div>
        <div className="summary-wide">
          <span>Severity explanation</span>
          <strong>{markerSummary.severityExplanation}</strong>
        </div>
      </div>

      <div className="overlay-note">
        <AlertTriangle size={18} />
        <span>
          AI Overlay is simulated for prototype demonstration. The heatmap,
          bounding boxes, and confidence labels are not generated by a real ML
          model.
        </span>
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

function getMarkerSummary(result) {
  if (result.markers.length === 0) {
    return {
      averageConfidence: result.confidence,
      mostCommonIndicator: 'none detected',
      severityExplanation: 'Low-confidence canvas result with no strong red clusters detected.',
    }
  }

  const averageConfidence = Math.round(
    result.markers.reduce((total, marker) => total + marker.confidence, 0) /
      result.markers.length,
  )
  const markerCounts = result.markers.reduce((counts, marker) => {
    const label = marker.type === 'blemish' ? 'blemishes' : marker.type
    counts[label] = (counts[label] || 0) + 1
    return counts
  }, {})
  const [mostCommonIndicator] = Object.entries(markerCounts).sort(
    (first, second) => second[1] - first[1],
  )[0]
  const severityExplanation =
    result.severityLevel === 'severe'
      ? 'Higher simulated score from multiple high-confidence marked regions.'
      : result.severityLevel === 'moderate'
        ? 'Mid-range simulated score from several marked regions and visible indicators.'
        : 'Lower simulated score with fewer marked regions and limited indicator spread.'

  return {
    averageConfidence,
    mostCommonIndicator,
    severityExplanation,
  }
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
