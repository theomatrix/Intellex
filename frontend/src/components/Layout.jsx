import { motion } from 'framer-motion'
import Navbar from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface grid-bg noise">
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10"
      >
        {children}
      </motion.main>
    </div>
  )
}
