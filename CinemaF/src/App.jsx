import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Menu } from './components/Menu'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductPage } from './pages/ProductPage'
import { MerchandisePage } from './pages/MerchandisePage'
import { ComboPage } from './pages/ComboPage'
import { RemainsPage } from './pages/RemainsPage'
import { ReceiptPage } from './pages/ReceiptPage'
import { ReportPage } from './pages/ReportPage'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Menu />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/products" element={ 
              <ProtectedRoute>
                <ProductPage/>   
              </ProtectedRoute>     } />
            <Route path="/merchandise" element={
              <ProtectedRoute>
                <MerchandisePage />
              </ProtectedRoute>
            } />
            <Route path="/combos" element={
              <ProtectedRoute>
                <ComboPage />
              </ProtectedRoute>
            } />
            <Route path="/remains" element={
              <ProtectedRoute>
                <RemainsPage />
              </ProtectedRoute>
            } />
            <Route path="/receipts" element={
              <ProtectedRoute>
                <ReceiptPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App