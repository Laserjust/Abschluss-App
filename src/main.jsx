import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import './styles/mobile.css'

import { AuthProvider } from './context/AuthContext'
import { FeatureProvider } from './context/FeatureContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeatureProvider>
          <App />
        </FeatureProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)