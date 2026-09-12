import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getDailyQuote } from './lib/dailyQuote'
import { calculateCompletionRate } from './lib/progress'
import { supabase } from './lib/supabase'

type PageProps = { userId: string }
type Goal = { id: string; title: string; completed: boolean }
type DiaryEntry = { id: string; title: string | null; body: string; mood: string | null; gratitude: string | null; entry_date: string; favorite: boolean }
type LongGoal = { id: string; title: string; category: string; progress_percent: number; target_date: string | null }

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
    if (!supabase) return
    const [{ data: goalRows }, { data: moodRows }] = await Promise.all([
      supabase.from('daily_goals').select('id,title,completed').eq('user_id', userId).eq('goal_date', today).order('created_at'),
      supabase.from('mood_entries').select('mood').eq('user_id', userId).eq('entry_date', today).limit(1),
    ])
    setGoals((goalRows ?? []) as Goal[])
    setMood(moodRows?.[0]?.mood ?? null)
  }

  useEffect(() => { void load() }, [userId])

  const completed = goals.filter((goal) => goal.completed).length
  const completion = calculateCompletionRate(completed, goals.length)

  async function chooseMood(value: string) {
    if (!supabase) return
    setMood(value)
    setSavingMood(true)
    await supabase.from('mood_entries').upsert({ user_id: userId, entry_date: today, mood: value }, { onConflict: 'user_id,entry_date' })
    setSavingMood(false)
  }

  async function addGoal(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !newGoal.trim()) return
    const { data } = await supabase.from('daily_goals').insert({
      user_id: userId,
      goal_date: today,
      title: newGoal.trim(),
      category: 'pessoal',
      priority: 'media',
      completed: false,
    }).select('id,title,completed').single()
    if (data) setGoals((current) => [...current, data as Goal])
    setNewGoal('')
  }

  async function toggleGoal(goal: Goal) {
    if (!supabase) return
    const next = !goal.completed
    setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, completed: next } : item))
    await supabase.from('daily_goals').update({ completed: next }).eq('id', goal.id).eq('user_id', userId)
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">{prettyDate()}</p>
          <h1>{greeting()}, Bárbara <span aria-hidden="true">💗</span></h1>
          <p className="hero-subtitle">Como você quer se sentir hoje?</p>
        </div>
        <div className="soft-orb" aria-hidden="true">B</div>
      </section>

      <section className="card quote-card">
        <span className="card-kicker">Frase do dia</span>
        <blockquote>“{getDailyQuote(new Date())}”</blockquote>
      </section>

      <section className="card">
        <div className="section-heading">
          <div><span className="card-kicker">Check-in</span><h2>Como você está hoje?</h2></div>
          {savingMood && <span className="tiny-status">Salvando…</span>}
        </div>
        <div className="mood-grid">
          {moodOptions.map(([emoji, label]) => (
            <button key={label} className={`mood-button ${mood === label ? 'selected' : ''}`} onClick={() => void chooseMood(label)}>
              <span>{emoji}</span><small>{label}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div><span className="card-kicker">Minhas metas de hoje</span><h2>{completed} de {goals.length} concluídas — {completion}%</h2></div>
          <span className="progress-badge">{completion}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
        {completion === 100 && goals.length > 0 && <div className="celebration">🎉 Você conseguiu, Bárbara! Dia concluído.</div>}
        <div className="goal-list">
          {goals.length === 0 && <p className="empty-copy">Comece pequeno. Uma meta simples já transforma o ritmo do dia.</p>}
          {goals.map((goal) => (
            <label className="goal-row" key={goal.id}>
              <input type="checkbox" checked={goal.completed} onChange={() => void toggleGoal(goal)} />
              <span className={goal.completed ? 'done' : ''}>{goal.title}</span>
            </label>
          ))}
        </div>
        <form className="inline-form" onSubmit={addGoal}>
          <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Adicionar uma meta para hoje" aria-label="Nova meta" />
          <button className="primary-button compact" type="submit">Adicionar</button>
        </form>
      </section>

      <section className="wellness-strip">
        <article><span>💧</span><div><strong>Água</strong><small>Cuide da sua hidratação.</small></div></article>
        <article><span>😴</span><div><strong>Descanso</strong><small>Seu descanso também conta.</small></div></article>
        <article><span>🌸</span><div><strong>Você</strong><small>Faça algo gentil por você hoje.</small></div></article>
      </section>
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
    if (!supabase) return
    const { data } = await supabase.from('diary_entries').select('id,title,body,mood,gratitude,entry_date,favorite').eq('user_id', userId).order('entry_date', { ascending: false }).order('created_at', { ascending: false }).limit(60)
    setEntries((data ?? []) as DiaryEntry[])
  }
  useEffect(() => { void load() }, [userId])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !body.trim()) return
    setSaving(true)
    const { data } = await supabase.from('diary_entries').insert({ user_id: userId, title: title.trim() || null, body: body.trim(), mood: mood || null, gratitude: gratitude.trim() || null, entry_date: dateKey(), favorite: false }).select('id,title,body,mood,gratitude,entry_date,favorite').single()
    if (data) setEntries((current) => [data as DiaryEntry, ...current])
    setTitle(''); setBody(''); setMood(''); setGratitude(''); setSaving(false)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) => `${entry.title ?? ''} ${entry.body} ${entry.mood ?? ''} ${entry.gratitude ?? ''}`.toLowerCase().includes(q))
  }, [entries, search])

  return (
    <div className="page-stack">
      <section className="page-title"><span className="card-kicker">Meu espaço</span><h1>Meu Diário 💗</h1><p>Escreva sem pressa. Este momento é seu.</p></section>
      <section className="card diary-paper">
        <form className="form-stack" onSubmit={save}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dê um título para hoje (opcional)" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Como foi seu dia? O que aconteceu? O que te deixou feliz ou incomodou?" required />
          <div className="two-columns">
            <select value={mood} onChange={(e) => setMood(e.target.value)} aria-label="Sentimento do dia">
              <option value="">Sentimento do dia</option>
              {moodOptions.map(([, label]) => <option key={label}>{label}</option>)}
            </select>
            <input value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="Pelo que sou grata hoje?" />
          </div>
          <div className="prompt-chips"><span>O que aprendi hoje?</span><span>O que quero fazer diferente amanhã?</span></div>
          <button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar meu dia'}</button>
        </form>
      </section>
      <section className="card">
        <div className="section-heading"><div><span className="card-kicker">Histórico</span><h2>Suas páginas</h2></div><input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no diário" /></div>
        <div className="timeline">
          {visible.length === 0 && <p className="empty-copy">Suas próximas páginas vão aparecer aqui.</p>}
          {visible.map((entry) => <article className="timeline-item" key={entry.id}><div className="timeline-dot" /><div><small>{new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString('pt-BR')}</small><h3>{entry.title || 'Um dia para lembrar'}</h3><p>{entry.body}</p>{entry.mood && <span className="soft-tag">{entry.mood}</span>}</div></article>)}
        </div>
      </section>
    </div>
  )
}

export function GoalsPage({ userId }: PageProps) {
  const [items, setItems] = useState<LongGoal[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Pessoal')

  async function load() {
    if (!supabase) return
    const { data } = await supabase.from('long_term_goals').select('id,title,category,progress_percent,target_date').eq('user_id', userId).order('created_at', { ascending: false })
    setItems((data ?? []) as LongGoal[])
  }
  useEffect(() => { void load() }, [userId])

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !title.trim()) return
    const { data } = await supabase.from('long_term_goals').insert({ user_id: userId, title: title.trim(), category: category.toLowerCase(), progress_percent: 0 }).select('id,title,category,progress_percent,target_date').single()
    if (data) setItems((current) => [data as LongGoal, ...current])
    setTitle('')
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
      if (!supabase) return
      const { data } = await supabase.from('wellness_checkins').select('*').eq('user_id', userId).eq('entry_date', dateKey()).maybeSingle()
      if (!data) return
      setSleep(data.sleep_hours?.toString() ?? ''); setWater(data.water_glasses?.toString() ?? ''); setEnergy(data.energy ?? 3); setMood(data.mood_score ?? 3); setStress(data.stress_score ?? 3); setExercised(Boolean(data.exercised)); setNutrition(data.nutrition ?? 'Boa')
    }
    void load()
  }, [userId])

  async function save(event: FormEvent) {
    event.preventDefault(); if (!supabase) return
    await supabase.from('wellness_checkins').upsert({ user_id: userId, entry_date: dateKey(), sleep_hours: sleep ? Number(sleep) : null, water_glasses: water ? Number(water) : null, energy, mood_score: mood, stress_score: stress, exercised, nutrition }, { onConflict: 'user_id,entry_date' })
    setSaved(true); window.setTimeout(() => setSaved(false), 2500)
  }

  const Range = ({ label, value, setter }: { label: string; value: number; setter: (value: number) => void }) => <label className="range-field"><span>{label}<strong>{value}/5</strong></span><input type="range" min="1" max="5" value={value} onChange={(e) => setter(Number(e.target.value))} /></label>

  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Bem-estar</span><h1>Como você está se cuidando?</h1><p>Um check-in simples para perceber sua rotina — sem julgamentos.</p></section><form className="card form-stack" onSubmit={save}><div className="two-columns"><label className="field"><span>😴 Sono (horas)</span><input type="number" min="0" max="24" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} /></label><label className="field"><span>💧 Água (copos)</span><input type="number" min="0" max="30" value={water} onChange={(e) => setWater(e.target.value)} /></label></div><Range label="⚡ Energia" value={energy} setter={setEnergy} /><Range label="💗 Humor" value={mood} setter={setMood} /><Range label="🌿 Estresse" value={stress} setter={setStress} /><div className="two-columns"><label className="toggle-card"><input type="checkbox" checked={exercised} onChange={(e) => setExercised(e.target.checked)} /><span>🏃 Fiz atividade hoje</span></label><label className="field"><span>🍽️ Alimentação</span><select value={nutrition} onChange={(e) => setNutrition(e.target.value)}><option>Muito boa</option><option>Boa</option><option>Poderia melhorar</option></select></label></div><button className="primary-button">{saved ? 'Salvo com carinho ✓' : 'Salvar meu check-in'}</button><small className="medical-note">Este espaço acompanha hábitos e bem-estar; não realiza diagnósticos médicos.</small></form></div>
}

export function BeautyPage({ userId }: PageProps) {
  const tip = beautyTips[new Date().getDate() % beautyTips.length]
  const [saved, setSaved] = useState(false)
  async function favorite() {
    if (!supabase) return
    await supabase.from('beauty_favorites').upsert({ user_id: userId, tip_key: tip.key, title: tip.title, category: tip.category }, { onConflict: 'user_id,tip_key' })
    setSaved(true)
  }
  const morning = ['Beber água', 'Skincare', 'Arrumar o cabelo', 'Café da manhã', 'Ver minhas metas', 'Escolher meu foco do dia']
  const night = ['Skincare', 'Organizar amanhã', 'Registrar meu dia', 'Agradecer por algo', 'Diminuir o celular', 'Dormir no horário planejado']
  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Meu Momento</span><h1>Beleza & Autocuidado 💄</h1><p>Cuidar do visual também pode ser uma forma de cuidar de você.</p></section><section className="card feature-tip"><span className="card-kicker">Dica de hoje ✨ · {tip.category}</span><h2>{tip.title}</h2><button className="secondary-button" onClick={() => void favorite()}>{saved ? 'Salvo nos favoritos ♥' : 'Salvar dica'}</button></section><section className="two-columns routines"><article className="card"><span className="card-kicker">☀️ Minha manhã</span><h2>Começar bem</h2>{morning.map((item) => <label className="goal-row routine-row" key={item}><input type="checkbox" /><span>{item}</span></label>)}</article><article className="card"><span className="card-kicker">🌙 Minha noite</span><h2>Desacelerar</h2>{night.map((item) => <label className="goal-row routine-row" key={item}><input type="checkbox" /><span>{item}</span></label>)}</article></section><section className="category-grid">{['💇‍♀️ Cabelo','💄 Maquiagem','👗 Looks','✨ Skincare','💅 Unhas','🌸 Autocuidado'].map((item) => <div className="category-card" key={item}>{item}</div>)}</section></div>
}

export function EvolutionPage({ userId }: PageProps) {
  const [diaryCount, setDiaryCount] = useState(0)
  const [goals, setGoals] = useState<Goal[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const start = useMemo(() => { const d = new Date(); d.setDate(1); return dateKey(d) }, [])
  useEffect(() => {
    async function load() {
      if (!supabase) return
      const [{ count }, { data: goalRows }, { data: moodRows }] = await Promise.all([
        supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('entry_date', start),
        supabase.from('daily_goals').select('id,title,completed').eq('user_id', userId).gte('goal_date', start),
        supabase.from('mood_entries').select('mood').eq('user_id', userId).gte('entry_date', start),
      ])
      setDiaryCount(count ?? 0); setGoals((goalRows ?? []) as Goal[]); setMoods((moodRows ?? []).map((row) => row.mood))
    }
    void load()
  }, [userId, start])
  const completed = goals.filter((goal) => goal.completed).length
  const rate = calculateCompletionRate(completed, goals.length)
  const dominant = moods.length ? moods.sort((a, b) => moods.filter((v) => v === b).length - moods.filter((v) => v === a).length)[0] : '—'
  return <div className="page-stack"><section className="page-title"><span className="card-kicker">Minha evolução</span><h1>Olhe o caminho que você está construindo</h1><p>Pequenas constâncias viram grandes mudanças quando você consegue enxergá-las.</p></section><section className="stats-grid"><article className="stat-card"><strong>{diaryCount}</strong><span>páginas escritas este mês</span></article><article className="stat-card"><strong>{rate}%</strong><span>das metas concluídas</span></article><article className="stat-card"><strong>{dominant}</strong><span>humor predominante</span></article></section><section className="card"><span className="card-kicker">Minha semana 💗</span><h2>Olhe tudo o que você conseguiu fazer por você esta semana.</h2><div className="report-lines"><div><span>Metas concluídas</span><strong>{rate}%</strong></div><div><span>Dias registrando o diário</span><strong>{diaryCount}</strong></div><div><span>Humor predominante</span><strong>{dominant}</strong></div></div></section><section className="card"><span className="card-kicker">Conquistas</span><div className="achievement-grid"><div>🌸<strong>Primeira página</strong><small>{diaryCount > 0 ? 'Conquistado' : 'Continue escrevendo'}</small></div><div>🎯<strong>Focada</strong><small>{rate === 100 && goals.length ? 'Conquistado' : 'Em progresso'}</small></div><div>💗<strong>Consistência</strong><small>Um dia de cada vez</small></div></div></section></div>
}

export function ProfilePage({ email, onLogout }: { email: string; onLogout: () => Promise<void> }) {
  return <div className="page-stack"><section className="profile-hero"><div className="avatar">B</div><div><span className="card-kicker">Bárbara Life</span><h1>Bárbara</h1><p>{email}</p></div></section><section className="card"><h2>Este é o seu espaço.</h2><p className="muted">Seus registros ficam ligados à sua conta e protegidos pelas regras de acesso do banco.</p><div className="privacy-list"><div>🔒 <span>Diário privado</span></div><div>💗 <span>Dados só da sua conta</span></div><div>☁️ <span>Sincronização pelo Supabase</span></div></div></section><button className="secondary-button danger" onClick={() => void onLogout()}>Sair da conta</button></div>
}
