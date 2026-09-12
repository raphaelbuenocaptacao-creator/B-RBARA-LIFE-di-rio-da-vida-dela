import { useEffect, useRef, useState } from 'react'
import { aureon, type AureonUser } from '../lib/aureon'

type GoogleCredentialResponse = { credential?: string }
type GoogleIdentity = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void
  renderButton: (element: HTMLElement, options: { theme?: string; size?: string; shape?: string; text?: string; width?: number }) => void
}
type GoogleWindow = Window & typeof globalThis & { google?: { accounts?: { id?: GoogleIdentity } } }

type Props = {
  onLogin: (user: AureonUser) => void
  onError: (message: string) => void
}

const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if ((window as GoogleWindow).google?.accounts?.id) return resolve()
    const current = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (current) {
      current.addEventListener('load', () => resolve(), { once: true })
      current.addEventListener('error', () => reject(new Error('google_script_failed')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('google_script_failed'))
    document.head.appendChild(script)
  })
}

export function GoogleSignInButton({ onLogin, onError }: Props) {
  const target = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'disabled'>('loading')

  useEffect(() => {
    let active = true

    async function setup() {
      try {
        const config = await aureon.auth.getGoogleConfig()
        if (!active) return
        if (!config.enabled || !config.client_id) {
          setState('disabled')
          return
        }
        await loadGoogleScript()
        if (!active || !target.current) return
        const identity = (window as GoogleWindow).google?.accounts?.id
        if (!identity) throw new Error('google_script_failed')
        target.current.innerHTML = ''
        identity.initialize({
          client_id: config.client_id,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async ({ credential }) => {
            if (!credential) return onError('Não foi possível validar sua conta Google.')
            try {
              const user = await aureon.auth.loginWithGoogle(credential)
              onLogin(user)
            } catch {
              onError('Esta conta Google não tem acesso ao Diário da Bárbara.')
            }
          },
        })
        identity.renderButton(target.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: Math.min(360, Math.max(260, target.current.clientWidth || 320)),
        })
        setState('ready')
      } catch {
        if (active) setState('disabled')
      }
    }

    void setup()
    return () => { active = false }
  }, [onError, onLogin])

  if (state === 'disabled') {
    return <div className="google-disabled" aria-live="polite">Recuperação com Google em configuração.</div>
  }

  return (
    <div className="google-auth-area">
      {state === 'loading' && <div className="google-loading">Preparando acesso Google…</div>}
      <div ref={target} className="google-button-host" aria-label="Continuar com Google" />
    </div>
  )
}
