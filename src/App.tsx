import { FormEvent, useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { aureon, BARBARA_EMAIL, type AureonUser } from './lib/aureon'
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

function LoginScreen({ onLogin }: { onLogin: (user: AureonUser) => void }) {
  const [email, setEmail] = useState(BARBARA_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setLoading(true); setError(''); setMessage('')
    try {
      const user = await aureon.auth.login(email, password)
      onLogin(user)
    } catch {
      setError('Não foi possível entrar. Confira seu e-mail e sua senha.')
    } finally {
      setLoading(false)
    }
  }

  async function requestReset() {
    if (!email.trim()) {
      setError('Digite seu e-mail primeiro para receber o código de recuperação.')
      return
    }
    setLoading(true); setError(''); setMessage('')
    try {
      await aureon.auth.requestPasswordReset(email)
      setResetMode(true)
      setMessage('Se o e-mail estiver autorizado, o código de recuperação será enviado para ele.')
    } catch {
      setError('Não foi possível solicitar a recuperação agora.')
    } finally {
      setLoading(false)
    }
  }

  async function completeReset(event: FormEvent) {
    event.preventDefault()
    if (newPassword.length < 10) {
      setError('A nova senha precisa ter pelo menos 10 caracteres.')
      return
    }
    setLoading(true); setError(''); setMessage('')
    try {
      await aureon.auth.resetPassword(email, resetToken, newPassword)
      setResetMode(false); setResetToken(''); setNewPassword(''); setPassword('')
      setMessage('Senha redefinida. Agora entre com a nova senha.')
    } catch {
      setError('Código inválido ou expirado. Solicite um novo código.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">B</div>
        <span className="card-kicker">BÁRBARA LIFE</span>
        <h1>Bem-vinda ao seu espaço.</h1>
        <p>Seu tempo, sua rotina, sua história — guardados com carinho.</p>
        {!resetMode ? (
          <form className="form-stack" onSubmit={signIn}>
            <label className="field"><span>E-mail</span><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="field"><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            {error && <div className="form-message error">{error}</div>}
            {message && <div className="form-message success">{message}</div>}
            <button className="primary-button" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
            <button className="text-button" type="button" onClick={() => void requestReset()} disabled={loading}>Esqueci minha senha</button>
          </form>
        ) : (
          <form className="form-stack" onSubmit={completeReset}>
            <label className="field"><span>Código recebido</span><input value={resetToken} onChange={(e) => setResetToken(e.target.value)} required /></label>
            <label className="field"><span>Nova senha</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={10} required /></label>
            {error && <div className="form-message error">{error}</div>}
            {message && <div className="form-message success">{message}</div>}
            <button className="primary-button" disabled={loading}>{loading ? 'Salvando…' : 'Redefinir minha senha'}</button>
            <button className="text-button" type="button" onClick={() => setResetMode(false)}>Voltar ao login</button>
          </form>
        )}
        <small className="private-note">🔒 Acesso privado. Não existe cadastro público.</small>
      </section>
    </main>
  )
}

function LoadingScreen() {
  return <main className="loading-page"><div className="loading-mark">B</div><p>Preparando seu espaço…</p></main>
}

function AppShell({ user, onLogout }: { user: AureonUser; onLogout: () => Promise<void> }) {
  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="mini-brand"><span>B</span><div><strong>Bárbara Life</strong><small>Seu espaço pessoal</small></div></div>
        <div className="topbar-heart" aria-hidden="true">♥</div>
      </header>
      <main className="content-area">
        <Routes>
          <Route path="/" element={<TodayPage userId={user.id} />} />
          <Route path="/metas" element={<GoalsPage userId={user.id} />} />
          <Route path="/diario" element={<DiaryPage userId={user.id} />} />
          <Route path="/saude" element={<HealthPage userId={user.id} />} />
          <Route path="/beleza" element={<BeautyPage userId={user.id} />} />
          <Route path="/evolucao" element={<EvolutionPage userId={user.id} />} />
          <Route path="/barbara" element={<ProfilePage email={user.email} onLogout={onLogout} />} />
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
  const [user, setUser] = useState<AureonUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    void aureon.auth.restore().then((restored) => {
      if (mounted) { setUser(restored); setLoading(false) }
    })
    return () => { mounted = false }
  }, [])

  async function logout() {
    await aureon.auth.logout()
    setUser(null)
  }

  if (loading) return <LoadingScreen />
  if (!user) return <LoginScreen onLogin={setUser} />
  return <AppShell user={user} onLogout={logout} />
}
