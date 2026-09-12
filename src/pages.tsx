import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getDailyQuote } from './lib/dailyQuote'
import { calculateCompletionRate } from './lib/progress'
import { aureon } from './lib/aureon'

type PageProps = { userId: string }
type GoalData = { title: string; completed: boolean; goal_date: string; category: string; priority: string; time?: string | null; recurrence?: string | null; note?: string | null }
type Goal = GoalData & { id: string }
type DiaryData = { title: string | null; body: string; mood: string | null; gratitude: string | null; entry_date: string; favorite: boolean }
type DiaryEntry = DiaryData & { id: string }
type LongGoalData = { title: string; category: string; progress_percent: number; target_date: string | null; reason?: string | null; notes?: string | null }
type LongGoal = LongGoalData & { id: string }
type MoodData = { entry_date: string; mood: string }
type WellnessData = { entry_date: string; sleep_hours: number | null; water_glasses: number | null; energy: number; mood_score: number; stress_score: number; exercised: boolean; nutrition: string }
type RoutineData = { routine_key: string; entry_date: string; period: 'morning' | 'night'; item: string; completed: boolean }

const moodOptions = [
  ['😍', 'Incrível'],
  ['😊', 'Bem'],
  ['😐', 'Normal'],
  ['😔', 'Triste'],
  ['😩', 'Cansada'],
  ['😡', 'Estressada'],
] as const

const beautyTips = [
  { key: 'skin-hydration', category: 'Skincare', title: 'Antes de pensar na maquiagem, cuide da hidratação da pele.' },
  { key: 'accessories', category: 'Looks', title: 'Um look simples pode ganhar outra aparência com acessórios bem escolhidos.' },
  { key: 'hair-care', category: 'Cabelo', title: 'Reserve um momento da semana para hidratar o cabelo sem pressa.' },
  { key: 'self-care', category: 'Autocuidado', title: 'Autocuidado também é respeitar seus limites e descansar quando precisa.' },
]

const morningRoutine = ['Beber água', 'Skincare', 'Arrumar o cabelo', 'Café da manhã', 'Ver minhas metas', 'Escolher meu foco do dia']
const nightRoutine = ['Skincare', 'Organizar amanhã', 'Registrar meu dia', 'Agradecer por algo', 'Diminuir o celular', 'Dormir no horário planejado']

function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function prettyDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function TodayPage({ userId }: PageProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [savingMood, setSavingMood] = useState(false)
  const today = dateKey()

  async function load() {
    const [goalRows, moodRows] = await Promise.all([
      aureon.data.list<GoalData>('daily_goals'),
      aureon.data.list<MoodData>('mood_entries'),
    ])
    setGoals(goalRows.filter((row) => row.goal_date === today) as Goal[])
    setMood(moodRows.find((row) => row.entry_date === today)?.mood ?? null)
  }

  useEffect(() => { void load() }, [userId])

  const completed = goals.filter((goal) => goal.completed).length
  const completion = calculateCompletionRate(completed, goals.length)

  async function chooseMood(value: string) {
    setMood(value); setSavingMood(true)
    try {
      await aureon.data.upsertByField<MoodData>('mood_entries', 'entry_date', today, { entry_date: today, mood: value })
    } finally {
      setSavingMood(false)
    }
  }

  async function addGoal(event: FormEvent) {
    event.preventDefault()
    if (!newGoal.trim()) return
    const row = await aureon.data.create<GoalData>('daily_goals', {
      goal_date: today,
      title: newGoal.trim(),
      category: 'pessoal',
      priority: 'media',
      completed: false,
      time: null,
      recurrence: null,
      note: null,
    })
    setGoals((current) => [...current, row as Goal])
    setNewGoal('')
  }

  async function toggleGoal(goal: Goal) {
    const next = !goal.completed
    setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, completed: next } : item))
    const { id, ...data } = goal
    await aureon.data.update<GoalData>('daily_goals', id, { ...data, completed: next })
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div><p className="eyebrow">{prettyDate()}</p><h1>{greeting()}, Bárbara <span aria-hidden="true">💗</span></h1><p className="hero-subtitle">Como você quer se sentir hoje?</p></div>
        <div className="soft-orb" aria-hidden="true">B</div>
      </section>
      <section className="card quote-card"><span className="card-kicker">Frase do dia</span><blockquote>“{getDailyQuote(new Date())}”</blockquote></section>
      <section className="card">
        <div className="section-heading"><div><span className="card-kicker">Check-in</span><h2>Como você está hoje?</h2></div>{savingMood && <span className="tiny-status">Salvando…</span>}</div>
        <div className="mood-grid">{moodOptions.map(([emoji, label]) => <button key={label} className={`mood-button ${mood === label ? 'selected' : ''}`} onClick={() => void chooseMood(label)}><span>{emoji}</span><small>{label}</small></button>)}</div>
      </section>
      <section className="card">
        <div className="section-heading"><div><span className="card-kicker">Minhas metas de hoje</span><h2>{completed} de {goals.length} concluídas — {completion}%</h2></div><span className="progress-badge">{completion}%</span></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
        {completion === 100 && goals.length > 0 && <div className="celebration">🎉 Você conseguiu, Bárbara! Dia concluído.</div>}
        <div className="goal-list">{goals.length === 0 && <p className="empty-copy">Comece pequeno. Uma meta simples já transforma o ritmo do dia.</p>}{goals.map((goal) => <label className="goal-row" key={goal.id}><input type="checkbox" checked={goal.completed} onChange={() => void toggleGoal(goal)} /><span className={goal.completed ? 'done' : ''}>{goal.title}</span></label>)}</div>
        <form className="inline-form" onSubmit={addGoal}><input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Adicionar uma meta para hoje" aria-label="Nova meta" /><button className="primary-button compact" type="submit">Adicionar</button></form>
      </section>
      <section className="wellness-strip"><article><span>💧</span><div><strong>Água</strong><small>Cuide da sua hidratação.</small></div></article><article><span>😴</span><div><strong>Descanso</strong><small>Seu descanso também conta.</small></div></article><article><span>🌸</span><div><strong>Você</strong><small>Faça algo gentil por você hoje.</small></div></article></section>
    </div>
  )
}

export function DiaryPage({ userId }: PageProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const rows = await aureon.data.list<DiaryData>('diary_entries')
    setEntries((rows as DiaryEntry[]).sort((a, b) => b.entry_date.localeCompare(a.entry_date)))
  }
  useEffect(() => { void load() }, [userId])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    try {
      const row = await aureon.data.create<DiaryData>('diary_entries', { title: title.trim() || null, body: body.trim(), mood: mood || null, gratitude: gratitude.trim() || null, entry_date: dateKey(), favorite: false })
      setEntries((current) => [row as DiaryEntry, ...current])
      setTitle(''); setBody(''); setMood(''); setGratitude('')
    } finally {
      setSaving(false)
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) => `${entry.title ?? ''} ${entry.body} ${entry.mood ?? ''} ${entry.gratitude ?? ''}`.toLowerCase().includes(q))
  }, [entries, search])

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Meu espaço</span><h1>Meu Diário 💗</h1><p>Escreva sem pressa. Este momento é seu.</p></section><section className="card diary-paper"><form className="form-stack" onSubmit={save}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dê um título para hoje (opcional)" /><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Como foi seu dia? O que aconteceu? O que te deixou feliz ou incomodou?" required /><div className="two-columns"><select value={mood} onChange={(e) => setMood(e.target.value)} aria-label="Sentimento do dia"><option value="">Sentimento do dia</option>{moodOptions.map(([, label]) => <option key={label}>{label}</option>)}</select><input value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="Pelo que sou grata hoje?" /></div><div className="prompt-chips"><span>O que aprendi hoje?</span><span>O que quero fazer diferente amanhã?</span></div><button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar meu dia'}</button></form></section><section className="card"><div className="section-heading"><div><span className="card-kicker">Histórico</span><h2>Suas páginas</h2></div><input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no diário" /></div><div className="timeline">{visible.length === 0 && <p className="empty-copy">Suas próximas páginas vão aparecer aqui.</p>}{visible.map((entry) => <article className="timeline-item" key={entry.id}><div className="timeline-dot" /><div><small>{new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString('pt-BR')}</small><h3>{entry.title || 'Um dia para lembrar'}</h3><p>{entry.body}</p>{entry.mood && <span className="soft-tag">{entry.mood}</span>}</div></article>)}</div></section></div>
}

export function GoalsPage({ userId }: PageProps) {
  const [items, setItems] = useState<LongGoal[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Pessoal')

  async function load() {
    const rows = await aureon.data.list<LongGoalData>('long_term_goals')
    setItems(rows as LongGoal[])
  }
  useEffect(() => { void load() }, [userId])

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    const row = await aureon.data.create<LongGoalData>('long_term_goals', { title: title.trim(), category: category.toLowerCase(), progress_percent: 0, target_date: null, reason: null, notes: null })
    setItems((current) => [row as LongGoal, ...current]); setTitle('')
  }

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Planos e sonhos</span><h1>Minhas Metas</h1><p>Transforme objetivos grandes em passos que cabem na sua rotina.</p></section><section className="card"><form className="inline-form wrap" onSubmit={add}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Qual objetivo você quer alcançar?" /><select value={category} onChange={(e) => setCategory(e.target.value)}><option>Pessoal</option><option>Financeiro</option><option>Profissional</option><option>Beleza</option><option>Saúde</option><option>Estudos</option><option>Sonhos</option></select><button className="primary-button compact">Criar objetivo</button></form></section><section className="goal-cards">{items.length === 0 && <div className="card empty-copy">Seu primeiro grande objetivo pode começar hoje.</div>}{items.map((item) => <article className="card goal-card" key={item.id}><div className="goal-icon">✦</div><div><span className="soft-tag">{item.category}</span><h3>{item.title}</h3><div className="progress-track"><div className="progress-fill" style={{ width: `${item.progress_percent}%` }} /></div><small>{item.progress_percent}% concluído</small></div></article>)}</section></div>
}

export function HealthPage({ userId }: PageProps) {
  const [sleep, setSleep] = useState('')
  const [water, setWater] = useState('')
  const [energy, setEnergy] = useState(3)
  const [mood, setMood] = useState(3)
  const [stress, setStress] = useState(3)
  const [exercised, setExercised] = useState(false)
  const [nutrition, setNutrition] = useState('Boa')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const rows = await aureon.data.list<WellnessData>('wellness_checkins')
      const data = rows.find((row) => row.entry_date === dateKey())
      if (!data) return
      setSleep(data.sleep_hours?.toString() ?? ''); setWater(data.water_glasses?.toString() ?? ''); setEnergy(data.energy ?? 3); setMood(data.mood_score ?? 3); setStress(data.stress_score ?? 3); setExercised(Boolean(data.exercised)); setNutrition(data.nutrition ?? 'Boa')
    }
    void load()
  }, [userId])

  async function save(event: FormEvent) {
    event.preventDefault()
    const today = dateKey()
    await aureon.data.upsertByField<WellnessData>('wellness_checkins', 'entry_date', today, { entry_date: today, sleep_hours: sleep ? Number(sleep) : null, water_glasses: water ? Number(water) : null, energy, mood_score: mood, stress_score: stress, exercised, nutrition })
    setSaved(true); window.setTimeout(() => setSaved(false), 2500)
  }

  const Range = ({ label, value, setter }: { label: string; value: number; setter: (value: number) => void }) => <label className="range-field"><span>{label}<strong>{value}/5</strong></span><input type="range" min="1" max="5" value={value} onChange={(e) => setter(Number(e.target.value))} /></label>

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Bem-estar</span><h1>Como você está se cuidando?</h1><p>Um check-in simples para perceber sua rotina — sem julgamentos.</p></section><form className="card form-stack" onSubmit={save}><div className="two-columns"><label className="field"><span>😴 Sono (horas)</span><input type="number" min="0" max="24" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} /></label><label className="field"><span>💧 Água (copos)</span><input type="number" min="0" max="30" value={water} onChange={(e) => setWater(e.target.value)} /></label></div><Range label="⚡ Energia" value={energy} setter={setEnergy} /><Range label="💗 Humor" value={mood} setter={setMood} /><Range label="🌿 Estresse" value={stress} setter={setStress} /><div className="two-columns"><label className="toggle-card"><input type="checkbox" checked={exercised} onChange={(e) => setExercised(e.target.checked)} /><span>🏃 Fiz atividade hoje</span></label><label className="field"><span>🍽️ Alimentação</span><select value={nutrition} onChange={(e) => setNutrition(e.target.value)}><option>Muito boa</option><option>Boa</option><option>Poderia melhorar</option></select></label></div><button className="primary-button">{saved ? 'Salvo com carinho ✓' : 'Salvar meu check-in'}</button><small className="medical-note">Este espaço acompanha hábitos e bem-estar; não realiza diagnósticos médicos.</small></form></div>
}

export function BeautyPage({ userId }: PageProps) {
  const tip = beautyTips[new Date().getDate() % beautyTips.length]
  const [saved, setSaved] = useState(false)
  const [routineState, setRoutineState] = useState<Record<string, boolean>>({})
  const today = dateKey()

  useEffect(() => {
    async function load() {
      const rows = await aureon.data.list<RoutineData>('routine_items')
      const state: Record<string, boolean> = {}
      rows.filter((row) => row.entry_date === today).forEach((row) => { state[`${row.period}:${row.item}`] = Boolean(row.completed) })
      setRoutineState(state)
    }
    void load()
  }, [userId, today])

  async function favorite() {
    await aureon.data.upsertByField('beauty_favorites', 'tip_key', tip.key, { tip_key: tip.key, title: tip.title, category: tip.category, saved_at: new Date().toISOString() })
    setSaved(true)
  }

  async function toggleRoutine(period: 'morning' | 'night', item: string) {
    const stateKey = `${period}:${item}`
    const next = !routineState[stateKey]
    setRoutineState((current) => ({ ...current, [stateKey]: next }))
    const routineKey = `${today}|${period}|${item}`
    await aureon.data.upsertByField<RoutineData>('routine_items', 'routine_key', routineKey, { routine_key: routineKey, entry_date: today, period, item, completed: next })
  }

  const routine = (period: 'morning' | 'night', items: string[]) => items.map((item) => <label className="goal-row routine-row" key={item}><input type="checkbox" checked={Boolean(routineState[`${period}:${item}`])} onChange={() => void toggleRoutine(period, item)} /><span>{item}</span></label>)

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Meu Momento</span><h1>Beleza & Autocuidado 💄</h1><p>Cuidar do visual também pode ser uma forma de cuidar de você.</p></section><section className="card feature-tip"><span className="card-kicker">Dica de hoje ✨ · {tip.category}</span><h2>{tip.title}</h2><button className="secondary-button" onClick={() => void favorite()}>{saved ? 'Salvo nos favoritos ♥' : 'Salvar dica'}</button></section><section className="two-columns routines"><article className="card"><span className="card-kicker">☀️ Minha manhã</span><h2>Começar bem</h2>{routine('morning', morningRoutine)}</article><article className="card"><span className="card-kicker">🌙 Minha noite</span><h2>Desacelerar</h2>{routine('night', nightRoutine)}</article></section><section className="category-grid">{['💇‍♀️ Cabelo','💄 Maquiagem','👗 Looks','✨ Skincare','💅 Unhas','🌸 Autocuidado'].map((item) => <div className="category-card" key={item}>{item}</div>)}</section></div>
}

export function EvolutionPage({ userId }: PageProps) {
  const [diaryCount, setDiaryCount] = useState(0)
  const [goals, setGoals] = useState<Goal[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const start = useMemo(() => { const d = new Date(); d.setDate(1); return dateKey(d) }, [])

  useEffect(() => {
    async function load() {
      const [diaryRows, goalRows, moodRows] = await Promise.all([
        aureon.data.list<DiaryData>('diary_entries'),
        aureon.data.list<GoalData>('daily_goals'),
        aureon.data.list<MoodData>('mood_entries'),
      ])
      setDiaryCount(diaryRows.filter((row) => row.entry_date >= start).length)
      setGoals(goalRows.filter((row) => row.goal_date >= start) as Goal[])
      setMoods(moodRows.filter((row) => row.entry_date >= start).map((row) => row.mood))
    }
    void load()
  }, [userId, start])

  const completed = goals.filter((goal) => goal.completed).length
  const rate = calculateCompletionRate(completed, goals.length)
  const dominant = moods.length ? [...moods].sort((a, b) => moods.filter((v) => v === b).length - moods.filter((v) => v === a).length)[0] : '—'

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Minha evolução</span><h1>Olhe o caminho que você está construindo</h1><p>Pequenas constâncias viram grandes mudanças quando você consegue enxergá-las.</p></section><section className="stats-grid"><article className="stat-card"><strong>{diaryCount}</strong><span>páginas escritas este mês</span></article><article className="stat-card"><strong>{rate}%</strong><span>das metas concluídas</span></article><article className="stat-card"><strong>{dominant}</strong><span>humor predominante</span></article></section><section className="card"><span className="card-kicker">Minha semana 💗</span><h2>Olhe tudo o que você conseguiu fazer por você esta semana.</h2><div className="report-lines"><div><span>Metas concluídas</span><strong>{rate}%</strong></div><div><span>Dias registrando o diário</span><strong>{diaryCount}</strong></div><div><span>Humor predominante</span><strong>{dominant}</strong></div></div></section><section className="card"><span className="card-kicker">Conquistas</span><div className="achievement-grid"><div>🌸<strong>Primeira página</strong><small>{diaryCount > 0 ? 'Conquistado' : 'Continue escrevendo'}</small></div><div>🎯<strong>Focada</strong><small>{rate === 100 && goals.length ? 'Conquistado' : 'Em progresso'}</small></div><div>💗<strong>Consistência</strong><small>Um dia de cada vez</small></div></div></section></div>
}

export function ProfilePage({ email, onLogout }: { email: string; onLogout: () => Promise<void> }) {
  return <div className="page-stack"><section className="profile-hero"><div className="avatar">B</div><div><span className="card-kicker">Bárbara Life</span><h1>Bárbara</h1><p>{email}</p></div></section><section className="card"><h2>Este é o seu espaço.</h2><p className="muted">Seus registros ficam ligados à sua conta e isolados no projeto BÁRBARA LIFE.</p><div className="privacy-list"><div>🔒 <span>Diário privado</span></div><div>💗 <span>Dados só da sua conta</span></div><div>☁️ <span>Sincronização pelo AUREON Base</span></div></div></section><button className="secondary-button danger" onClick={() => void onLogout()}>Sair da conta</button></div>
}
