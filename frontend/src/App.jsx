import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import Report from './pages/Report'
import Chat from './pages/Chat'

function App() {
  return (
    <Router>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report/:sessionId" element={<Report />} />
            <Route path="/chat/:sessionId" element={<Chat />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  )
}

export default App
