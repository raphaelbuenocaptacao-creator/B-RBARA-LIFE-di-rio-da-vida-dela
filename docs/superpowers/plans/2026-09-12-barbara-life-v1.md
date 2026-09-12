# BÁRBARA LIFE v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um PWA privado, feminino e responsivo para Bárbara registrar diário, metas, humor, bem-estar, autocuidado, beleza e evolução com Supabase e RLS.

**Architecture:** React + Vite + TypeScript no frontend, Supabase Auth/Postgres/Storage para persistência e segurança. A aplicação usa uma shell mobile-first com rotas protegidas e módulos isolados por domínio. PWA com manifest e service worker sem cachear tokens ou respostas privadas.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Supabase JS, Vitest, Testing Library, CSS modular/global leve, PWA manual.

**Spec:** `docs/superpowers/specs/2026-09-12-barbara-life-design.md`

## Global Constraints
- Sem cadastro público.
- Login por e-mail e senha via Supabase Auth.
- RLS em todas as tabelas pessoais com `auth.uid() = user_id`.
- Nunca expor `service_role` no frontend.
- Mobile-first e visual rosa/rosé premium, sem aparência infantil.
- Saúde é apenas acompanhamento de hábitos, sem diagnóstico médico.
- Dados privados e fotos ficam em recursos privados do Supabase.
- PWA não deve cachear tokens, senhas ou respostas privadas.

---

### Task 1: Foundation, tests and design shell

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces `App` root and shared visual shell.

- [ ] Write failing smoke test for Bárbara Life shell.
- [ ] Run test and verify RED.
- [ ] Implement minimal shell with React Router.
- [ ] Run tests and verify GREEN.
- [ ] Commit.

### Task 2: Supabase client and private authentication

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/auth/AuthProvider.tsx`
- Create: `src/auth/ProtectedRoute.tsx`
- Create: `src/pages/LoginPage.tsx`
- Test: `src/auth/ProtectedRoute.test.tsx`
- Create: `.env.example`

**Interfaces:**
- Produces `useAuth()` with `user`, `loading`, `signIn`, `signOut`, `resetPassword`.

- [ ] Write failing auth route test.
- [ ] Run and verify RED.
- [ ] Implement Supabase client/auth provider/protected route.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 3: Today dashboard and daily mood/goals

**Files:**
- Create: `src/pages/TodayPage.tsx`
- Create: `src/components/MoodPicker.tsx`
- Create: `src/components/DailyGoalsCard.tsx`
- Create: `src/lib/dailyQuote.ts`
- Test: `src/lib/dailyQuote.test.ts`

**Interfaces:**
- Produces deterministic `getDailyQuote(date: Date): string`.

- [ ] Write failing deterministic quote test.
- [ ] Run and verify RED.
- [ ] Implement dashboard and quote helper.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 4: Diary experience

**Files:**
- Create: `src/pages/DiaryPage.tsx`
- Create: `src/components/DiaryEditor.tsx`
- Create: `src/services/diary.ts`
- Test: `src/services/diary.test.ts`

**Interfaces:**
- Produces `DiaryEntryInput` and `saveDiaryEntry()` using authenticated user id.

- [ ] Write failing validation/service test.
- [ ] Run and verify RED.
- [ ] Implement diary editor/service.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 5: Goals, wellness and self-care modules

**Files:**
- Create: `src/pages/GoalsPage.tsx`
- Create: `src/pages/HealthPage.tsx`
- Create: `src/pages/BeautyPage.tsx`
- Create: `src/services/goals.ts`
- Create: `src/services/wellness.ts`
- Test: `src/services/goals.test.ts`
- Test: `src/services/wellness.test.ts`

**Interfaces:**
- Produces goal and wellness persistence helpers.

- [ ] Write failing goal/wellness behavior tests.
- [ ] Run and verify RED.
- [ ] Implement modules.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 6: Evolution and weekly summary

**Files:**
- Create: `src/pages/EvolutionPage.tsx`
- Create: `src/lib/progress.ts`
- Test: `src/lib/progress.test.ts`

**Interfaces:**
- Produces `calculateCompletionRate(completed,total)`.

- [ ] Write failing calculation tests including total zero.
- [ ] Run and verify RED.
- [ ] Implement evolution UI/calculations.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 7: Profile, navigation and logout

**Files:**
- Create: `src/pages/ProfilePage.tsx`
- Create: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/BottomNav.test.tsx`

**Interfaces:**
- Produces final route map for Hoje, Metas, Diário, Saúde, Beleza, Evolução, Bárbara.

- [ ] Write failing nav test.
- [ ] Run and verify RED.
- [ ] Implement navigation/profile/logout.
- [ ] Run and verify GREEN.
- [ ] Commit.

### Task 8: Supabase schema, RLS and private storage

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/README.md`

**Interfaces:**
- Produces tables: profiles, daily_goals, long_term_goals, goal_steps, diary_entries, mood_entries, wellness_checkins, beauty_favorites, selfcare_routines, routine_items, achievements, reminders.

- [ ] Define tables with `user_id uuid not null` references.
- [ ] Enable RLS on all exposed tables.
- [ ] Add select/insert/update/delete policies scoped to `(select auth.uid()) = user_id`.
- [ ] Document private storage bucket and per-user path rule.
- [ ] Commit.

### Task 9: PWA and offline shell

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `public/offline.html`
- Modify: `index.html`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces installable app shell and safe offline fallback.

- [ ] Add manifest metadata.
- [ ] Add service worker caching only static app shell assets.
- [ ] Register service worker.
- [ ] Verify private API/auth requests are never runtime-cached.
- [ ] Commit.

### Task 10: Final verification

**Files:**
- Modify as needed from failures.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Verify no service role/secret literals exist in source.
- [ ] Verify routes and mobile layout.
- [ ] Open PR from `feat/barbara-life-v1` to `main`.
