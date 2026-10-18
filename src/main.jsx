import React from 'react'
import { createRoot } from 'react-dom/client'
import AuthGate from './AuthGate.jsx'
import PublicCertificate from './PublicCertificate.jsx'
import './styles.css'

const publicKey = window.location.pathname.match(/^\/c\/([^/]+)\/?$/)?.[1]

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {publicKey ? <PublicCertificate publicKey={decodeURIComponent(publicKey)} /> : <AuthGate />}
  </React.StrictMode>,
)
