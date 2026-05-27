import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OfficerDashboard from './pages/OfficerDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/*"
            element={
              <ProtectedRoute requiredRole="officer">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
