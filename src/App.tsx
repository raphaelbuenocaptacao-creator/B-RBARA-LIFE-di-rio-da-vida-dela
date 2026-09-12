import { FormEvent, useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleSignInButton } from './components/GoogleSignInButton'
import { aureon, BARBARA_EMAIL, type AureonUser } from './lib/aureon'
import { loadDiaryPinRecord, restoreTheme, verifyDiaryPin } from './lib/profile'
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
  const [loading, setLoading] = useState(false)

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await aureon.auth.login(email, password)
      onLogin(user)
    } catch {
      setError('Não foi possível entrar. Confira seu e-mail e sua senha.')
    } finally {
      setLoading(false)
    }
  }

  const googleError = useCallback((message: string) => setError(message), [])

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
          <button className="primary-button" disabled={loading}>{loading ? 'Entrando…' : 'Entrar com senha'}</button>
        </form>
        <div className="auth-divider"><span>ou</span></div>
        <GoogleSignInButton onLogin={onLogin} onError={googleError} />
        <p className="google-recovery-copy">Esqueceu a senha? Use sua conta Google autorizada para voltar ao seu espaço.</p>
        <small className="private-note">🔒 Acesso privado. Não existe cadastro público.</small>
      </section>
    </main>
  )
}

function LoadingScreen() {
  return <main className="loading-page"><div className="loading-mark">B</div><p>Preparando seu espaço…</p></main>
}

function DiaryGate({ userId }: { userId: string }) {
  const [record] = useState(() => loadDiaryPinRecord())
  const [unlocked, setUnlocked] = useState(() => !record)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function unlock(event: FormEvent) {
    event.preventDefault()
    if (!record) return setUnlocked(true)
    setChecking(true); setError('')
    try {
      if (await verifyDiaryPin(pin, record)) {
        setUnlocked(true)
        setPin('')
      } else {
        setError('PIN incorreto.')
      }
    } finally {
      setChecking(false)
    }
  }

  if (unlocked) return <DiaryPage userId={userId} />

  return (
    <div className="page-stack diary-lock-page">
      <section className="card diary-lock-card">
        <div className="lock-orb">🔒</div>
        <span className="card-kicker">Meu Diário</span>
        <h1>Um espaço só seu.</h1>
        <p>Digite seu PIN para abrir suas páginas.</p>
        <form className="form-stack" onSubmit={unlock}>
          <label className="field"><span>PIN do Diário</span><input type="password" inputMode="numeric" pattern="[0-9]*" minLength={4} maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus required /></label>
          {error && <div className="form-message error">{error}</div>}
          <button className="primary-button" disabled={checking}>{checking ? 'Verificando…' : 'Abrir meu Diário'}</button>
        </form>
      </section>
    </div>
  )
}

function AppShell({ user, onLogout, onPasswordChanged }: { user: AureonUser; onLogout: () => Promise<void>; onPasswordChanged: () => void }) {
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
          <Route path="/diario" element={<DiaryGate userId={user.id} />} />
          <Route path="/saude" element={<HealthPage userId={user.id} />} />
          <Route path="/beleza" element={<BeautyPage userId={user.id} />} />
          <Route path="/evolucao" element={<EvolutionPage userId={user.id} />} />
          <Route path="/barbara" element={<ProfilePage userId={user.id} email={user.email} onLogout={onLogout} onPasswordChanged={onPasswordChanged} />} />
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

  useEffect(() => { restoreTheme() }, [])

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
  return <AppShell user={user} onLogout={logout} onPasswordChanged={() => setUser(null)} />
}
