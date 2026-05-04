# 🤝 NSL Interview App — Dev Handoff

เอกสารสำหรับ continue development บน Claude Code Desktop

---

## 1. Continue from where we left off

```bash
# Clone (ถ้ายังไม่มี)
git clone <repo-url> Candidate
cd Candidate

# Switch to feature branch
git fetch origin
git checkout claude/nsl-interview-app-mGC4M
git pull

# Setup (app files now live at repo root)
npm install
npm run dev          # http://localhost:5173

# Verify everything still works
npm run build        # should be clean
```

**Latest commit on this branch**: `27ff5dd` (Move app files to repository root)
**Earlier**: `6f68247` (PWA manifest), `4d43b5e` (initial app build)

> **Note**: The app used to live in `nsl-interview-app/` subdirectory but was
> moved to repo root. Always run npm/dev commands from `Candidate/` root.

---

## 2. Current Project State

### Stack
Vite 8 + React 19 + TypeScript 6 + Tailwind v4 + SheetJS + Recharts +
lucide-react + sharp (PNG generation)

### Architecture
- **Frontend-only**, no backend, no localStorage/sessionStorage (refresh = lost)
- 3-screen state machine in `src/App.tsx`: Setup → Interview → Results
- Hand-rolled shadcn-style UI primitives in `src/components/ui/`
- Pure scoring/excel logic in `src/lib/` (easy to unit-test)

### What's done
- ✅ Excel upload (SheetJS) + 2-sheet export (Summary + Detail)
- ✅ Sample seed of 20 questions (Food Safety, Bakery Tech, Production Mgmt, Leadership, Cost & CI)
- ✅ Live Mode (locked-forward) and Review Mode (instant explanation)
- ✅ Section breakdown bar chart (Recharts)
- ✅ Brand styling (Berry + Gold), responsive 320–1440px
- ✅ PWA manifest + apple-touch-icon, iOS safe-area, Add-to-Home-Screen ready

### What's NOT done — see [`ROADMAP.md`](./ROADMAP.md) for full spec of 15 features

---

## 3. Where to make changes (file map cheatsheet)

| Concern | File |
|---|---|
| New question schema field | `src/lib/types.ts` + `src/lib/excel.ts` (parser+exporter) + `src/data/sample.json` + `scripts/generate-sample-xlsx.mjs` |
| New scoring rule | `src/lib/scoring.ts` |
| Setup screen UI | `src/components/SetupScreen.tsx` |
| Question display | `src/components/QuestionCard.tsx` |
| Interview controls/timer | `src/components/InterviewScreen.tsx` |
| Results / chart | `src/components/ResultsScreen.tsx` + `src/components/ResultChart.tsx` |
| Brand color / font | `src/index.css` (Tailwind v4 `@theme` block) |
| New UI primitive | `src/components/ui/` (mirror existing pattern: forwardRef + cn util) |
| State machine | `src/App.tsx` |

### Conventions
- Comments in **English**; UI text in **Thai**
- No `<form>` tags — use `onClick` / `onChange`
- Use `cn()` from `@/lib/cn` for className composition
- Path alias `@/*` → `src/*`
- Named exports preferred; default export only for `App`

---

## 4. Suggested implementation order (from ROADMAP.md)

If you want to pick them off in priority order, here's the recommended sequence
(each block can ship independently):

### Sprint 1 — Foundation (~3 days)
1. Question + Choice Shuffling (RM-01)
2. Section-Balanced Question Pool (RM-02)
3. Time Limit (RM-03)

### Sprint 2 — Daily-driver UX (~5 days)
4. Interviewer Notes Field (RM-04)
5. Print / PDF Export (RM-05)
6. Multi-Candidate Session Roster (RM-06)
7. In-App Question Bank Editor (RM-07)

### Sprint 3 — Strategic (~7 days)
8. Behavioral / Open-Ended Question Type (RM-08)
9. Role Templates (RM-09)
10. Anti-Cheat Modes (RM-10)

### Sprint 4 — Platform (~5 days)
11. Service Worker / Offline PWA (RM-11)
12. IndexedDB Auto-Save (RM-12)
13. Cohort Analytics (RM-13)
14. Image Support (RM-14)
15. Result Sharing Link (RM-15)

---

## 5. How to brief Claude Code Desktop

After cloning, you can paste this in your Claude Code Desktop session:

> Read `HANDOFF.md` and `ROADMAP.md`. Implement features RM-01, RM-02, RM-03
> following the specs in ROADMAP. Each feature is self-contained — commit
> separately with the RM-XX prefix in the commit message. Run `npm run build`
> after each feature to confirm no TypeScript errors.

Replace `RM-01, RM-02, RM-03` with whichever features you want next.

---

## 6. Acceptance gates (apply to every feature)

- ✅ `npm run build` passes (no TS errors, no console warnings during dev)
- ✅ Responsive 320px–1440px (test in DevTools mobile view)
- ✅ No use of localStorage / sessionStorage (use IndexedDB only with explicit user opt-in for RM-12)
- ✅ All UI text in Thai; all comments in English
- ✅ Existing Tier 1 and earlier features still work (regression check)
