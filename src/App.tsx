import { FormEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { BeautyPage, DiaryPage, EvolutionPage, GoalsPage, HealthPage, ProfilePage, TodayPage } from './pages'

const navigation = [
  ['/', '⌂', 'Hoje'],
  ['/metas', '◎', 'Metas'],
  ['/diario', '✎', 'Diário'],
  ['/saude', '♡', 'Saúde'],
  ['/beleza', '✦', 'Beleza'],
  ['/evolucao', '↗', 'Evolução'],
  ['/barbara', '◌', 'Bárbara'],
] as const

function SetupScreen() {
  return (
    <main className="auth-page">
      <section className="auth-card setup-card">
        <div className="brand-mark">BL</div>
        <span className="card-kicker">BÁRBARA LIFE</span>
        <h1>Seu espaço, seu tempo, sua história.</h1>
        <p>O aplicativo já está preparado para um Supabase privado. Falta apenas conectar o projeto exclusivo da Bárbara.</p>
        <div className="setup-code">
          <code>VITE_SUPABASE_URL</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
        </div>
        <small>Nenhuma chave secreta deve ser colocada no frontend.</small>
      </section>
    </main>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setLoading(true); setError(''); setMessage('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) setError('Não foi possível entrar. Confira seu e-mail e sua senha.')
    setLoading(false)
  }

  async function resetPassword() {
    if (!supabase || !email.trim()) {
      setError('Digite seu e-mail primeiro para receber o link de recuperação.')
      return
    }
    setLoading(true); setError(''); setMessage('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin })
    if (resetError) setError('Não foi possível enviar o link agora.')
    else setMessage('Pronto. Verifique seu e-mail para redefinir a senha.')
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">B</div>
        <span className="card-kicker">BÁRBARA LIFE</span>
        <h1>Bem-vinda ao seu espaço.</h1>
        <p>Seu tempo, sua rotina, sua história — guardados com carinho.</p>
        <form className="form-stack" onSubmit={signIn}>
          <label className="field"><span>E-mail</span><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="field"><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <div className="form-message error">{error}</div>}
          {message && <div className="form-message success">{message}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          <button className="text-button" type="button" onClick={() => void resetPassword()} disabled={loading}>Esqueci minha senha</button>
        </form>
        <small className="private-note">🔒 Acesso privado. Não existe cadastro público.</small>
      </section>
    </main>
  )
}

function LoadingScreen() {
  return <main className="loading-page"><div className="loading-mark">B</div><p>Preparando seu espaço…</p></main>
}

function AppShell({ session }: { session: Session }) {
  const userId = session.user.id
  const email = session.user.email ?? ''
  async function logout() { await supabase?.auth.signOut() }

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="mini-brand"><span>B</span><div><strong>Bárbara Life</strong><small>Seu espaço pessoal</small></div></div>
        <div className="topbar-heart" aria-hidden="true">♥</div>
      </header>
      <main className="content-area">
        <Routes>
          <Route path="/" element={<TodayPage userId={userId} />} />
          <Route path="/metas" element={<GoalsPage userId={userId} />} />
          <Route path="/diario" element={<DiaryPage userId={userId} />} />
          <Route path="/saude" element={<HealthPage userId={userId} />} />
          <Route path="/beleza" element={<BeautyPage userId={userId} />} />
          <Route path="/evolucao" element={<EvolutionPage userId={userId} />} />
          <Route path="/barbara" element={<ProfilePage email={email} onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <nav className="bottom-nav" aria-label="Menu principal">
        {navigation.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>{icon}</span><small>{label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false) }
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession); setLoading(false)
    })
    return () => { mounted = false; data.subscription.unsubscribe() }
  }, [])

  if (!isSupabaseConfigured) return <SetupScreen />
  if (loading) return <LoadingScreen />
  if (!session) return <LoginScreen />
  return <AppShell session={session} />
}
