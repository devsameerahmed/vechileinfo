import { useEffect, useState } from 'react'
import App from './App.jsx'
import Login from './Login.jsx'
import PublicCertificate from './PublicCertificate.jsx'
import { supabase } from './supabase.js'

function AuthGate() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    }).catch(() => {
      if (active) setSession(null)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const publicRecordMatch = window.location.pathname.match(/^\/certificate\/([a-f0-9]+)\/?$/i)

  if (publicRecordMatch) {
    return <PublicCertificate publicKey={publicRecordMatch[1]} user={session?.user} />
  }

  if (session === undefined) {
    return <main className="login-screen"><p className="public-message">Loading…</p></main>
  }

  if (!session) return <Login />
  return <App user={session.user} />
}

export default AuthGate
