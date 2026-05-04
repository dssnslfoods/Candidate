# 📋 Feature Roadmap — NSL Interview App

15 features จาก workflow analysis เรียงตาม ROI

> Each `RM-XX` block is self-contained. Implement, test, commit with the `RM-XX:`
> prefix, push. No order dependency unless explicitly noted.

---

## Tier 1 — Quick Wins

### RM-01 · Question + Choice Shuffling 🔀

**Why**: Anti-memorization across batch interviews — สัมภาษณ์ 5 คนติดกัน คุยกันไม่ได้ว่า "ข้อ 3 ตอบ B"

**Spec**:
- Setup screen → 2 toggles: `Shuffle Questions`, `Shuffle Choices` (default both ON in Live Mode, OFF in Review Mode)
- Shuffling happens **once at start** of session (deterministic per session, not per render)
- Choice shuffle: A/B/C/D in question stay in same DOM order, but the underlying value mapping changes per question
- The `Correct` answer logic still works because we map the displayed letter back to the original choice key when scoring
- Excel export must show **both** the shuffled letter the candidate picked AND the original correct letter — add a `Shuffle Map` column

**Files**:
- `src/lib/types.ts` — add `displayOrder?: Choice[]` to `Question` (per-session derived) and `shuffled: boolean` flag to session
- `src/lib/shuffle.ts` (new) — `shuffleQuestions(qs, seed)`, `shuffleChoices(q, seed)`, deterministic with optional seed for reproducibility
- `src/components/SetupScreen.tsx` — add toggles
- `src/components/QuestionCard.tsx` — render choices in `displayOrder` if present
- `src/components/InterviewScreen.tsx` — apply shuffle once on start
- `src/lib/excel.ts` — export the mapping in Detail sheet

**Acceptance**:
- Toggle ON → questions/choices in different order each interview
- Scoring still correct
- Excel export traceable (interviewer can verify which display letter = which original)

---

### RM-02 · Section-Balanced Question Pool 📚

**Why**: 1 คลังคำถาม 80 ข้อ → ทุกผู้สมัครได้ข้อสอบ "เทียบเท่า" (4 ข้อ/section) แต่ไม่ใช่ข้อสอบ "เดียวกัน"

**Spec**:
- Setup screen: input "จำนวนข้อในแต่ละการสัมภาษณ์" (default 20), checkbox "Balance across sections"
- If balanced ON: divide N evenly across sections (round-robin if uneven), randomly pick within each section
- If balanced OFF: random pick N from full pool
- Show **preview** of section distribution (e.g., "Food Safety: 4, Bakery Tech: 4, ...")
- If pool < N requested: warning toast + pick all available

**Files**:
- `src/lib/pool.ts` (new) — `pickBalanced(qs, n)`, `pickRandom(qs, n)`
- `src/components/SetupScreen.tsx` — UI controls + preview
- `src/data/sample.json` — bump to ≥40 questions to make demo meaningful (8/section × 5 sections)

**Acceptance**:
- 80-question bank, pick 20 balanced → 4 per section
- Different selection each session
- Setup preview matches actual interview

---

### RM-03 · Time Limit (Total + Per-Question) ⏱️

**Why**: Real interview standards have time pressure; current count-up doesn't enforce anything

**Spec**:
- Setup: `Total time limit (minutes)` default `30`, `0 = no limit`. `Per-question limit (seconds)` default `0` (none)
- Interview screen: switch from count-up to **count-down** when limit set; turn red < 5 min
- Per-question countdown if set: show small ring/bar above question; timeout → auto-submit blank for that question, advance
- Total timeout → finish interview immediately (jump to Results)
- Timer state must survive within session (don't restart on re-render)

**Files**:
- `src/lib/types.ts` — add `totalLimitMs?: number`, `perQuestionLimitMs?: number` to session config
- `src/components/InterviewScreen.tsx` — refactor timer logic; use `useReducer` for tick state to avoid stale closures
- `src/components/QuestionCard.tsx` — optional ring countdown

**Acceptance**:
- 30-min total → countdown shown; auto-finish at 0
- 90-sec per Q → ring depletes; expires → blank answer + next
- Time limits visible in result Excel summary

---

### RM-04 · Interviewer Notes Field 📝

**Why**: MCQ score doesn't capture soft skills; HR wants to note "ลังเลก่อนตอบ", "ขยายความได้ดี"

**Spec**:
- Per-question: collapsible `<details>` "หมายเหตุผู้สัมภาษณ์" with `<textarea>`
- Visible in BOTH Live and Review mode
- Persist within session state
- Results screen: dedicated section "Observations" listing notes by QID
- Excel export: new sheet `Notes` with QID + Section + Note text + new sheet `Overall` with overall observation field added on Results screen ("สรุปภาพรวม")

**Files**:
- `src/lib/types.ts` — `Answer.note?: string`, `ResultSummary.overallNote?: string`
- `src/components/QuestionCard.tsx` — notes UI
- `src/components/ResultsScreen.tsx` — notes summary + overall textarea
- `src/lib/excel.ts` — Notes + Overall sheets

**Acceptance**:
- Notes saved per question, no UI lag while typing
- Export shows all notes in dedicated sheet

---

### RM-05 · Print / PDF Export 🖨️

**Why**: Plant Director wants printable result for candidate file / signature

**Spec**:
- Add `@media print` styles: hide buttons, hide nav, fit A4 portrait, force chart to print colors
- Button "พิมพ์ / Save as PDF" → triggers `window.print()`
- Print layout: 1-page header (NSL logo + candidate + score), 1-page section breakdown + table

**Files**:
- `src/index.css` — `@media print` rules
- `src/components/ResultsScreen.tsx` — print button + print-specific classNames

**Acceptance**:
- Cmd+P shows clean B&W-friendly layout
- Recharts visible in print
- Fits 2 A4 pages max for typical 20Q result

---

## Tier 2 — Daily-driver UX

### RM-06 · Multi-Candidate Session Roster 👥

**Why**: Plant Director สัมภาษณ์ 5-10 คน/วัน — ไม่ควรต้อง refresh ทิ้งทุกครั้ง

**Spec**:
- New top-level state: `Session[]` = list of completed `ResultSummary`
- After ResultsScreen, "เริ่มผู้สมัครคนใหม่" button → keeps existing roster, returns to Setup with same question bank
- New screen: **Roster** — table of all today's candidates with score, %, pass/fail, time, click row → view that candidate's results
- "Compare" button on Roster → side-by-side view of top 3 (or selected)
- "Export All to Excel" → 1 file with sheet per candidate + 1 comparison sheet (rank by total %)
- Still **no persistence** — refresh clears roster (but warn before refresh via `beforeunload`)

**Files**:
- `src/App.tsx` — add `roster` state, new `Screen` value `'roster'`
- `src/components/RosterScreen.tsx` (new)
- `src/components/CompareView.tsx` (new) — side-by-side table
- `src/lib/excel.ts` — `exportRoster(sessions)`

**Acceptance**:
- Run 3 candidates in a row → all visible in roster
- Compare view shows ranking, sectional strengths
- Refresh prompts "ข้อมูลผู้สมัครจะหาย" warning

---

### RM-07 · In-App Question Bank Editor ✏️

**Why**: ปัจจุบันแก้คำถามต้อง Excel round-trip — UI editor เร็วกว่ามาก

**Spec**:
- New screen / modal "จัดการคลังคำถาม" accessible from Setup
- Table view: QID, Section, Question (TH), Difficulty, Weight, Correct, [Edit] [Delete]
- Edit row → modal form with all fields including 4 choices
- Add new question button
- Drag to reorder (use `@dnd-kit` or simple up/down arrows)
- Filter by section, search by text
- "Download Excel" + "Upload Excel" stay as before — editor is alternative path
- Change → updates in-memory pool only (no persistence)

**Files**:
- `src/components/QuestionBankEditor.tsx` (new)
- `src/components/ui/Dialog.tsx` (new) — basic modal primitive
- `src/components/ui/Textarea.tsx` (new)
- `src/lib/validation.ts` (new) — `validateQuestion(q): string[]` for inline form errors

**Acceptance**:
- Add 1 question via editor → appears in next interview
- Validation: empty fields blocked, Correct must be A/B/C/D
- Download Excel reflects edits

---

## Tier 3 — Strategic

### RM-08 · Behavioral / Open-Ended Question Type 💬

**Why**: Factory Manager ต้องวัด leadership/judgment; MCQ อย่างเดียวไม่พอ

**Spec**:
- Add `type: 'mcq' | 'open'` to `Question` (default `mcq` for backward compat)
- Open question: shows textarea for candidate response + rubric input for interviewer (1-5 stars)
- Scoring for open: `weight × (rubric / 5)` instead of all-or-nothing
- Excel export: open Q row shows candidate text + rubric score
- Sample data: add 2-3 open questions for demo (e.g., "เล่าสถานการณ์ที่คุณนำทีมแก้ไข quality crisis")

**Files**:
- `src/lib/types.ts` — discriminated union `MCQQuestion | OpenQuestion`
- `src/lib/excel.ts` — handle new type in parse + export (new optional cols `Type`, `Rubric Max`)
- `src/components/QuestionCard.tsx` — switch on type
- `src/lib/scoring.ts` — handle weighted rubric scoring

**Acceptance**:
- Mix MCQ + Open in same bank works
- Backward compat: old Excel files (no Type column) still load as MCQ
- Open Q without rubric input = 0 score, blocks confirm

---

### RM-09 · Role Templates 🎯

**Why**: NSL has multiple roles; current hardcoded "Factory Manager (Bakery)" doesn't generalize

**Spec**:
- New `src/data/roles/` folder with one JSON per role: `factory-manager-bakery.json`, `factory-manager-frozen.json`, `production-supervisor.json`, `qc-manager.json`
- Each contains: position name, default sections, default weights, default pass threshold, optional starter question pool reference
- Setup screen: dropdown "เทมเพลตตำแหน่ง" loads template settings
- Custom role still possible via free-text + Excel upload

**Files**:
- `src/data/roles/*.json` (4-5 files)
- `src/lib/roles.ts` — `loadRole(id)`, `listRoles()`
- `src/components/SetupScreen.tsx` — dropdown + auto-fill behavior

**Acceptance**:
- Switch role → Setup auto-fills position, threshold, recommended sections
- Selecting role doesn't override user-uploaded Excel pool

---

### RM-10 · Anti-Cheat Modes 🛡️

**Why**: Live Mode quality bumps for remote / unsupervised interviews

**Spec** (3 sub-features, each toggleable in Setup under "ความเข้มงวด"):
- **Tab focus monitor**: count `visibilitychange` blur events; show in result with "Tab switches: N"
- **Fullscreen lock**: enter fullscreen on Interview start; exit fullscreen → modal warning, count exit events
- **Watermark**: faint diagonal `repeating-linear-gradient` with candidate name across interview screen

All 3 OFF by default; recommended ON for Live Mode

**Files**:
- `src/lib/antiCheat.ts` (new) — hooks for each behavior
- `src/components/InterviewScreen.tsx` — wire hooks, render watermark overlay
- `src/lib/types.ts` — `antiCheat: { tabMonitor, fullscreen, watermark }` settings
- `src/components/ResultsScreen.tsx` — surface tab-switch + fullscreen-exit counts

**Acceptance**:
- Switch tabs → count increments
- Esc fullscreen → warning shown
- Watermark visible but doesn't block interaction
- Counts in Excel Summary sheet

---

## Tier 4 — Platform

### RM-11 · Service Worker / Offline PWA

**Why**: Manifest พร้อมแล้วแต่ไม่มี SW → "Add to Home Screen" ไม่ได้ offline จริง

**Spec**:
- Add `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Cache strategy: precache app shell + sample.json + icons; CDN fonts → `staleWhileRevalidate`
- Show small "Update available — Refresh" banner when new SW activates
- Test: airplane mode → app still loads from Home Screen

**Files**:
- `vite.config.ts` — add VitePWA plugin
- `package.json` — add dep
- `src/components/UpdatePrompt.tsx` (new)
- `src/main.tsx` — register update handler

**Acceptance**:
- Build → SW + workbox files in `dist/`
- Open from Home Screen offline → app shell loads

---

### RM-12 · IndexedDB Auto-Save (opt-in) 💾

**Why**: "Refresh = หาย" annoys users; opt-in IndexedDB preserves state without violating original "no localStorage" rule

**Spec**:
- Setup: checkbox "บันทึก draft ลงเครื่องนี้" (default OFF, with explanation)
- If ON: auto-save session every 5s + on every answer confirm to IndexedDB (use `idb` package)
- On app load: if existing draft found → "พบการสัมภาษณ์ที่ค้างอยู่ — กลับไปทำต่อ?" prompt
- "Clear all drafts" button in Setup
- IndexedDB store name `nsl-interview-drafts`, key = sessionId
- Drafts auto-purge after 30 days

**Files**:
- `package.json` — add `idb`
- `src/lib/storage.ts` (new) — IDB wrapper
- `src/App.tsx` — wire load-on-mount + save-on-change
- `src/components/SetupScreen.tsx` — opt-in checkbox + recovery prompt

**Acceptance**:
- Opt-in + start interview + refresh mid-way → prompted to resume
- Opt-out → no IDB writes (verifiable via DevTools Application tab)

---

### RM-13 · Cohort Analytics Dashboard 📊

**Why**: Beyond per-candidate, see hiring market trends — most-missed questions, weak section across pool

**Spec** (depends on RM-06 roster + RM-12 IDB persistence):
- New screen accessible from Roster: "Analytics"
- Charts:
  - Avg % score across all candidates today
  - Most-missed questions (bar, top 10 by error rate)
  - Section pass rate (donut)
  - Score distribution histogram
- Filter by date range (if RM-12 ON, multi-day data)
- Export "Cohort Summary" Excel: all candidates + question-level stats

**Files**:
- `src/components/AnalyticsScreen.tsx` (new)
- `src/lib/analytics.ts` (new) — pure aggregation functions
- `src/components/ResultChart.tsx` — extend with new chart types

**Acceptance**:
- 5+ candidates → meaningful chart data
- Most-missed surface obvious quality issues in question bank

---

### RM-14 · Image / Diagram Support in Questions 🖼️

**Why**: Bakery is hands-on — defect photos / line layouts >> text

**Spec**:
- Schema: optional `imageUrl?: string` per question. Excel-friendly = base64 data URL OR external URL
- Editor (RM-07) supports image upload → converts to base64 (max 200KB compressed via `browser-image-compression`)
- QuestionCard: render image above question text with `aspect-video` / `max-h-64`
- Excel export keeps image references; consider separate `images/` folder zipped with xlsx in v2

**Files**:
- `package.json` — `browser-image-compression`
- `src/lib/types.ts` — `imageUrl` field
- `src/components/QuestionCard.tsx` — image display
- `src/components/QuestionBankEditor.tsx` — image upload field
- `src/lib/excel.ts` — handle image column

**Acceptance**:
- Question with image renders properly on mobile + desktop
- Image survives Excel round-trip (upload → edit → re-export → re-import)

---

### RM-15 · Result Sharing Link (read-only) 🔗

**Why**: Plant Director wants to forward result to GM without exporting+attaching Excel

**Spec**:
- New "🔗 Copy share link" on ResultsScreen
- Encode `ResultSummary` → JSON → `lz-string` compress → base64 → URL fragment (`#share=...`)
- App reads fragment on mount → if present, jumps to read-only Results view (no editing, no re-take)
- Limits: warn if URL > 8000 chars (some systems truncate); fall back to "ใช้ Export Excel แทน" if too large
- Fragment-based = no server, no logging — privacy-preserving

**Files**:
- `package.json` — `lz-string`
- `src/lib/share.ts` (new) — `encode/decode`, length check
- `src/App.tsx` — detect `#share=` on mount → show read-only ResultsScreen
- `src/components/ResultsScreen.tsx` — copy-link button + `readOnly` prop

**Acceptance**:
- Copy link → paste in incognito → opens to identical results
- 50-question result still fits in URL
- Read-only mode: no Export button on shared link (or it works but no other actions)

---

## 📦 Dependencies summary (when adding all 15)

```jsonc
// runtime
"@dnd-kit/core": "^6"               // RM-07 reorder (optional, can use buttons)
"browser-image-compression": "^2"   // RM-14
"idb": "^8"                         // RM-12
"lz-string": "^1"                   // RM-15

// dev / build
"vite-plugin-pwa": "^0.21"          // RM-11
"workbox-window": "^7"              // RM-11 (transitive ok)
```

---

## 🧪 Per-feature testing checklist (copy-paste into PR description)

```
- [ ] npm run build clean (no TS/ESLint errors)
- [ ] Tested in Chrome desktop 1440px
- [ ] Tested in mobile DevTools 375px (iPhone)
- [ ] No localStorage/sessionStorage writes (only IDB if RM-12)
- [ ] All UI text in Thai
- [ ] All comments in English
- [ ] Backward compat: old Excel uploads still parse
- [ ] Existing features (RM-01 through RM-NN previously merged) still work
- [ ] Excel export round-trip works (export → re-import as bank)
```
