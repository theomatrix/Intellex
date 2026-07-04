import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, FileText, File, MessageSquare, ChevronRight,
  Loader2, AlertCircle, ArrowLeft, Send
} from 'lucide-react'
import { getReport, downloadReportPdf, sendToDiscord } from '../lib/api'

export default function Report() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Try to use reportData from navigation state if available, otherwise null to trigger fetch
  const initialReport = location.state?.reportData || null
  const openRouterKey = location.state?.openRouterKey || ''
  const aiModel = location.state?.aiModel || 'google/gemini-2.5-flash'
  
  const [report, setReport] = useState(initialReport)
  const [loading, setLoading] = useState(!initialReport)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [activeSection, setActiveSection] = useState('summary')

  // Discord Modal State
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [discordForm, setDiscordForm] = useState({
    discord_bot_token: '',
    discord_channel_id: '',
    applicant_name: '',
    applicant_email: ''
  })
  const [discordLoading, setDiscordLoading] = useState(false)
  const [discordError, setDiscordError] = useState('')
  const [discordSuccess, setDiscordSuccess] = useState(false)

  useEffect(() => {
    if (!report) {
      loadReport()
    }
  }, [sessionId, report])

  const loadReport = async () => {
    try {
      const data = await getReport(sessionId)
      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadReportPdf(sessionId)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDiscordSubmit = async (e) => {
    e.preventDefault()
    setDiscordLoading(true)
    setDiscordError('')
    setDiscordSuccess(false)
    
    try {
      await sendToDiscord({
        session_id: sessionId,
        company_name: report?.company_name || 'Unknown Company',
        website: report?.website || 'N/A',
        ...discordForm
      })
      setDiscordSuccess(true)
      setTimeout(() => setShowDiscordModal(false), 2000)
    } catch (err) {
      setDiscordError(err.message || 'Failed to send to Discord')
    } finally {
      setDiscordLoading(false)
    }
  }

  const sections = [
    { id: 'summary', title: 'Executive Summary' },
    { id: 'details', title: 'Company Details' },
    { id: 'products', title: 'Products & Services' },
    { id: 'pain_points', title: 'Pain Points' },
    { id: 'competitors', title: 'Competitors' },
    { id: 'sources', title: 'Sources' },
  ]

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center glass p-8 max-w-md">
          <AlertCircle className="w-8 h-8 text-accent-rose mx-auto mb-4" />
          <p className="text-accent-rose mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-200/50'
                  }`}
                >
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  <span className="truncate">{section.title}</span>
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="mt-8 space-y-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <File className="w-4 h-4" />}
                Download PDF
              </button>
              <button
                onClick={() => setShowDiscordModal(true)}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Send to Discord
              </button>
              <Link
                to={`/chat/${sessionId}`}
                state={{ openRouterKey, aiModel }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with AI
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Report Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile actions */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => setShowDiscordModal(true)}
              className="btn-secondary text-sm shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Discord
            </button>
            <Link
              to={`/chat/${sessionId}`}
              state={{ openRouterKey }}
              className="btn-primary text-sm shrink-0 flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-6 sm:p-10 space-y-12"
          >
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">{report?.company_name || 'Company Report'}</h1>
              {report?.website && (
                <a href={report.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {report.website}
                </a>
              )}
            </div>

            {/* Summary */}
            <section id="summary" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Executive Summary</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{report?.summary}</p>
            </section>

            {/* Details */}
            <section id="details" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Company Details</h2>
              <ul className="space-y-2 text-text-secondary">
                {report?.phone && <li><strong className="text-text-primary">Phone:</strong> {report.phone}</li>}
                {report?.address && <li><strong className="text-text-primary">Address:</strong> {report.address}</li>}
              </ul>
            </section>

            {/* Products */}
            <section id="products" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Products & Services</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {report?.products?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Pain Points */}
            <section id="pain_points" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Potential Pain Points</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {report?.pain_points?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Competitors */}
            <section id="competitors" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Competitors</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {report?.competitors?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Sources */}
            <section id="sources" className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b border-surface-300">Sources</h2>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                {report?.sources?.map((item, i) => (
                  <li key={i}>
                    {item.startsWith('http') ? (
                      <a href={item} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item}</a>
                    ) : item}
                  </li>
                ))}
              </ul>
            </section>
          </motion.div>
        </main>
      </div>

      {/* Discord Integration Modal */}
      <AnimatePresence>
        {showDiscordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-200 p-6 rounded-xl border border-surface-300 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Send Report to Discord</h2>
              <form onSubmit={handleDiscordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Bot Token</label>
                  <input
                    type="password"
                    required
                    value={discordForm.discord_bot_token}
                    onChange={e => setDiscordForm(prev => ({ ...prev, discord_bot_token: e.target.value }))}
                    className="input-field"
                    placeholder="Discord Bot Token"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Channel ID</label>
                  <input
                    type="text"
                    required
                    value={discordForm.discord_channel_id}
                    onChange={e => setDiscordForm(prev => ({ ...prev, discord_channel_id: e.target.value }))}
                    className="input-field"
                    placeholder="Discord Channel ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Applicant Name</label>
                  <input
                    type="text"
                    required
                    value={discordForm.applicant_name}
                    onChange={e => setDiscordForm(prev => ({ ...prev, applicant_name: e.target.value }))}
                    className="input-field"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Applicant Email</label>
                  <input
                    type="email"
                    required
                    value={discordForm.applicant_email}
                    onChange={e => setDiscordForm(prev => ({ ...prev, applicant_email: e.target.value }))}
                    className="input-field"
                    placeholder="Your Email"
                  />
                </div>

                {discordError && <p className="text-accent-rose text-sm">{discordError}</p>}
                {discordSuccess && <p className="text-accent-emerald text-sm">Successfully sent to Discord!</p>}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDiscordModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={discordLoading}
                    className="btn-primary"
                  >
                    {discordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
