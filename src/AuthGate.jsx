import { useEffect, useState } from 'react'
import App from './App.jsx'
import Login from './Login.jsx'
import { supabase } from './supabase.js'

function AuthGate() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  if (session === undefined) {
    return <main className="login-screen"><p className="public-message">Loading…</p></main>
  }

  if (!session) return <Login />
  return <App user={session.user} />
}

export default AuthGate
