import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color:      '#fff',
            border:     '1px solid rgba(108,99,255,0.3)',
            fontSize:   '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#6C63FF', secondary: '#1A1A2E' },
          },
          error: {
            iconTheme: { primary: '#FF6584', secondary: '#1A1A2E' },
            style: { border: '1px solid rgba(255,101,132,0.3)' },
          },
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>,
)