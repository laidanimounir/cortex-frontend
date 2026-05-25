import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
