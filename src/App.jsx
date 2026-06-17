import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Workflow from './pages/Workflow'
import Calendar from './pages/Calendar'
import Ideas from './pages/Ideas'

export default function App() {
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
