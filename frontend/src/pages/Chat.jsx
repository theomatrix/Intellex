import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Send, Brain, User, FileText, ArrowLeft,
  Loader2, Sparkles, Info
} from 'lucide-react'
import { useChat } from '../hooks/useChat'

const SUGGESTED_QUESTIONS = [
  "What does this company do?",
  "What technologies do they use?",
  "Are they hiring engineers?",
  "What's their GitHub presence like?",
  "Summarize their strengths and weaknesses",
]

export default function Chat() {
  const { sessionId } = useParams()
  const location = useLocation()
  const openRouterKey = location.state?.openRouterKey || ''
  const aiModel = location.state?.aiModel || 'google/gemini-2.5-flash'
  const { messages, isLoading, sendMessage } = useChat(sessionId, openRouterKey, aiModel)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleSuggestion = (q) => {
    sendMessage(q)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-surface-300">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-semibold text-text-primary">AI Intelligence Chat</h1>
            <p className="text-xs text-text-muted">Answers grounded in company intelligence data</p>
          </div>
        </div>
        <Link
          to={`/report/${sessionId}`}
          className="btn-ghost text-sm flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          View Report
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 min-h-0">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask anything about this company</h2>
            <p className="text-text-secondary text-sm mb-8 max-w-md mx-auto">
              I have access to the full intelligence report. My answers are grounded in the analyzed data.
            </p>

            {/* Suggested questions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="text-sm px-4 py-2 glass hover:bg-surface-200/60 transition-colors text-text-secondary hover:text-text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/20 rounded-2xl rounded-tr-md px-4 py-3'
                  : 'glass px-5 py-4'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-text-primary text-sm">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-p:text-text-secondary prose-p:leading-relaxed prose-p:my-1.5
                    prose-strong:text-text-primary
                    prose-li:text-text-secondary prose-li:my-0.5
                    prose-code:text-accent-cyan prose-code:bg-surface-300/50 prose-code:px-1 prose-code:rounded
                    prose-headings:text-text-primary prose-headings:text-base prose-headings:mt-3 prose-headings:mb-1
                  ">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-1.5">
                      <Info className="w-3 h-3" />
                      Sources
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-300">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence */}
                {msg.confidence !== undefined && msg.confidence > 0 && (
                  <div className="mt-2 text-xs text-text-muted">
                    Confidence: {Math.round(msg.confidence * 100)}%
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-surface-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="glass px-5 py-4">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="py-4 border-t border-surface-300">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this company..."
            disabled={isLoading}
            className="input-field flex-1"
          />
          <button
            id="chat-send-button"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-text-muted mt-2 text-center">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Answers are grounded in the intelligence report. No external data is used.
        </p>
      </div>
    </div>
  )
}
