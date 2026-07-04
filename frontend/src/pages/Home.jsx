import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Search, Globe, Shield, Code, Zap,
  TrendingUp, FileText, MessageSquare, ArrowRight,
  Sparkles, Building2, Cpu
} from 'lucide-react'
import { startAnalysis } from '../lib/api'

const features = [
  { icon: Globe, title: 'Website Intelligence', desc: 'Deep-crawl analysis of products, services, and tech stack' },
  { icon: Code, title: 'GitHub Analysis', desc: 'Open-source footprint, languages, and developer ecosystem' },
  { icon: TrendingUp, title: 'Hiring Trends', desc: 'Job listings, tech requirements, and growth signals' },
  { icon: Shield, title: 'Infrastructure Scan', desc: 'DNS, SSL, WHOIS, CDN, and security posture' },
  { icon: FileText, title: 'Professional Report', desc: '14-section intelligence report with SWOT analysis' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions grounded in company intelligence data' },
]

export default function Home() {
  const [companyName, setCompanyName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [aiModel, setAiModel] = useState('openrouter/free')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Starting...')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!companyName && !companyUrl) {
      setError('Please enter a company name or website URL')
      return
    }
    if (!openRouterKey) {
      setError('Please provide an OpenRouter API Key')
      return
    }

    let loadingInterval;
    setIsLoading(true)
    setError('')
    const loadingMessages = [
      'Connecting to services...',
      'Searching company data...',
      'Crawling website...',
      'Analyzing data with AI...',
      'Generating final report...',
      'Almost there, please wait...'
    ];
    let msgIndex = 0;
    setLoadingText(loadingMessages[msgIndex]);
    loadingInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[msgIndex]);
    }, 5000);

    try {
      const result = await startAnalysis({
        company_name: companyName,
        company_url: companyUrl,
        openrouter_api_key: openRouterKey,
        model: aiModel
      })
      clearInterval(loadingInterval);
      navigate(`/report/${result.session_id}`, { state: { openRouterKey, aiModel, reportData: result.report_data } })
    } catch (err) {
      clearInterval(loadingInterval);
      setError(err.message || 'Failed to start analysis')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-1/3 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="section relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm text-text-secondary">AI-Powered Company Intelligence</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-balance">
              Understand any company{' '}
              <span className="text-gradient">in minutes</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 text-balance">
              Intellex autonomously researches companies from public sources,
              generates professional intelligence reports, and lets you chat with an AI grounded in the data.
            </p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass p-4 rounded-2xl gradient-border space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      id="company-name-input"
                      type="text"
                      placeholder="Company name (e.g., Stripe)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input-field pl-12 bg-surface-200/30 border-transparent w-full"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      id="company-url-input"
                      type="text"
                      placeholder="Website URL (optional)"
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      className="input-field pl-12 bg-surface-200/30 border-transparent w-full"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="password"
                      placeholder="OpenRouter API Key (sk-or-v1-...)"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      className="input-field pl-12 bg-surface-200/30 border-transparent w-full"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="input-field bg-surface-200/30 border-transparent w-full appearance-none px-4 text-text-secondary"
                    >
                      <option value="openrouter/free">Auto Free Router (Free)</option>
                      <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                      <option value="google/gemma-4-31b-it:free">Gemma 4 31B (Free)</option>
                      <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Paid)</option>
                      <option value="google/gemini-3.5-flash">Gemini 3.5 Flash (Paid)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    id="analyze-button"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="btn-primary flex items-center justify-center gap-2 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Cpu className="w-5 h-5 animate-spin" />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Analyze Company</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-accent-rose text-sm mt-3 text-center"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>

            {/* Quick suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              <span className="text-sm text-text-muted">Try:</span>
              {['Stripe', 'Vercel', 'Supabase', 'Linear'].map((name) => (
                <button
                  key={name}
                  onClick={() => { setCompanyName(name); setCompanyUrl('') }}
                  className="text-sm px-3 py-1 rounded-full bg-surface-200/50 text-text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  {name}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Intelligence from <span className="text-gradient">11 specialized agents</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Our agents work in parallel to build a comprehensive intelligence profile in minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass p-6 group hover:bg-surface-200/40 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="section pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl font-bold mb-8">How it works</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {[
              { icon: Search, label: 'Search', sub: 'Enter company name' },
              { icon: Zap, label: 'Analyze', sub: '11 agents in parallel' },
              { icon: FileText, label: 'Report', sub: '14-section report' },
              { icon: MessageSquare, label: 'Chat', sub: 'AI-grounded answers' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-sm mb-2">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-sm">{step.label}</span>
                  <span className="text-xs text-text-muted">{step.sub}</span>
                </div>
                {i < 3 && (
                  <ArrowRight className="w-5 h-5 text-text-muted hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
