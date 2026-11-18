import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </WorkspaceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)