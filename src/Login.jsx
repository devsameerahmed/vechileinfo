import { useState } from 'react'
import { supabase } from './supabase.js'

const fieldLabel = 'flex flex-col gap-1.5 text-xs font-semibold text-[#56645c]'
const fieldInput = 'h-[42px] w-full rounded-[5px] border border-[#e4e9e3] bg-white px-2.5 text-sm font-normal text-[#4c5a53] placeholder:text-[#b2bab4]'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function signIn(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? 'Incorrect email or password.' : signInError.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#20312e] px-4 py-6">
      <section className="w-full max-w-[400px] rounded-xl bg-white px-7 pt-8 pb-[26px] shadow-[0_24px_70px_#0d171466]">
        <div className="mb-[22px] flex flex-col gap-0.5">
          <span className="font-display text-[15px] leading-none font-extrabold tracking-[2.1px] text-[#24312f]">HERITAGE</span>
          <span className="text-[8px] leading-[1.6] tracking-[2.1px] text-[#a9b4ae]">MOTOR COMPANY</span>
        </div>
        <h1 className="mt-0 font-display text-[26px] leading-[1.25] font-semibold tracking-[-0.8px] text-[#263430]">Sign in</h1>
        <p className="mt-1.5 text-[13px] text-[#7d8a84]">Administrator access for the vehicle collection.</p>
        <form className="mt-[22px] grid gap-3.5" onSubmit={signIn}>
          <label className={fieldLabel}>
            <span>Email</span>
            <input className={fieldInput} type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="james.davis@heritagemotors.com" />
          </label>
          <label className={fieldLabel}>
            <span>Password</span>
            <input className={fieldInput} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
          </label>
          {error && <p className="text-xs text-[#a35248]" role="alert">{error}</p>}
          <button
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md border border-[#293a35] bg-[#293a35] px-3.5 text-[13px] font-semibold text-white shadow-[0_2px_4px_#1c342c1c] transition duration-[180ms] hover:-translate-y-px hover:border-[#3c514a] hover:bg-[#3c514a] disabled:cursor-progress disabled:opacity-70"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
