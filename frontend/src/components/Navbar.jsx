import { Link, useLocation } from 'react-router-dom'
import { Brain, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 glass border-b border-white/[0.04]"
    >
      <div className="section flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 text-accent-cyan absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            Intell<span className="text-gradient">ex</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <Link to="/" className="btn-ghost text-sm">
              New Search
            </Link>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
