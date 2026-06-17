import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Workflow from './pages/Workflow'
import Calendar from './pages/Calendar'
import Ideas from './pages/Ideas'
import useStore from './store/useStore'

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">⚡</div>
        <p className="font-display text-2xl font-bold text-coral-400">CreatorFlow</p>
        <p className="text-gray-400 font-semibold mt-2 text-sm">Loading your content...</p>
      </div>
    </div>
  )
}

export default function App() {
  const init = useStore((s) => s.init)
  const loading = useStore((s) => s.loading)

  useEffect(() => {
    init()
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/ideas" element={<Ideas />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
