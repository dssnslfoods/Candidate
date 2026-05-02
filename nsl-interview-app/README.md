# NSL Foods · Factory Manager Interview System

แอปสำหรับ HR / Plant Director ใช้สัมภาษณ์ผู้สมัครตำแหน่ง **Factory Manager
(Bakery)** ของ NSL Foods PLC เป็นการทดสอบความรู้แบบ multiple choice 20 ข้อ
รองรับการอัปโหลดคลังคำถามจากไฟล์ Excel ให้คะแนนอัตโนมัติ และ export
ผลลัพธ์เป็น Excel ได้

Stack: Vite + React 19 + TypeScript + Tailwind v4 + SheetJS + Recharts +
lucide-react. Frontend-only — ไม่มี backend, ไม่ใช้ localStorage.

---

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production bundle
npm run gen:sample   # regenerate public xlsx template from src/data/sample.json
```

ตอนเปิดครั้งแรก ระบบจะใช้ **Sample Data 20 ข้อ** ที่ติดตัวมาให้ (ดู
`src/data/sample.json`) ผู้ใช้สามารถใช้งานได้ทันทีโดยไม่ต้องอัปโหลดไฟล์
ถ้าต้องการคลังคำถามของตัวเอง สามารถดาวน์โหลดไฟล์ template ได้จาก
`/NSL_BakeryFactoryManager_Interview_QuestionBank.xlsx` (เสิร์ฟอยู่ใน `public/`)
แก้ไขแล้วอัปโหลดผ่านปุ่ม “อัปโหลด Excel”

---

## Excel Schema

ไฟล์คำถามต้องมี sheet ชื่อ `Questions` พร้อมหัวคอลัมน์ row 1 ดังนี้:

| Column | Type | Required | Note |
|---|---|---|---|
| QID | number | ✅ | unique |
| Section | string | ✅ | เช่น Food Safety, Bakery Tech, Production Mgmt, Leadership, Cost & CI |
| Question (TH) | string | ✅ | คำถาม |
| Choice A | string | ✅ |  |
| Choice B | string | ✅ |  |
| Choice C | string | ✅ |  |
| Choice D | string | ✅ |  |
| Correct | A / B / C / D | ✅ | เฉลย |
| Explanation (TH) | string | ✅ | โชว์หลังตอบ (Review Mode) |
| Difficulty | Easy / Medium / Hard | ✅ | ถ้าว่าง default = Medium |
| Weight | number | ✅ | คะแนนต่อข้อ; ถ้าว่าง default Easy=1 / Medium=2 / Hard=3 |

### Validation
- ถ้าไม่พบ sheet ชื่อ `Questions` → แสดง error ไม่ load
- ถ้าหัวคอลัมน์ไม่ครบ → แสดง row + คอลัมน์ที่ขาด
- ถ้า `Correct` ไม่ใช่ A/B/C/D → ระบุ row และข้ามคำถามนั้น
- ถ้า `Difficulty` หรือ `Weight` ขาด → ใช้ค่า default + แจ้ง warning

---

## User Flow

1. **Setup** — โหลดคำถาม (default sample หรืออัปโหลด Excel) → กรอกชื่อผู้สมัคร
   → เลือกโหมด → กดเริ่ม
2. **Interview** — ทำข้อสอบทีละข้อ ดูเฉลยตามโหมดที่เลือก
3. **Results** — ดูคะแนนรวม / breakdown ตามหมวด / ตารางทุกข้อ → export Excel

### Modes
| โหมด | ใช้กับ | พฤติกรรม |
|---|---|---|
| 🔵 **Live Mode** | สัมภาษณ์ผู้สมัคร | ไม่เฉลยจนกว่าจะจบ — ย้อนกลับไม่ได้ |
| 🟢 **Review Mode** | ฝึก/ทบทวน | เฉลย + Explanation ทันทีหลังกดยืนยัน — ย้อนกลับได้ |

---

## Scoring

```ts
totalMax    = Σ q.weight
totalScore  = Σ q.weight  เฉพาะข้อที่ a.choice === q.correct
percent     = totalScore / totalMax * 100
passed      = percent >= passThreshold      // default 70%
```

Section breakdown คำนวณ earned / max ของแต่ละหมวดเพื่อแสดงใน bar chart
(Recharts) และตารางสรุป

---

## Export Format

ไฟล์ Excel ที่ export มี 2 sheets:

- **Summary** — ข้อมูลผู้สมัคร, คะแนนรวม, Pass/Fail, breakdown ตามหมวด, timestamp
- **Detail** — ทุกข้อพร้อม Question / 4 choices / candidate answer / correct
  answer / earned / explanation

ชื่อไฟล์ default: `NSL_Interview_<ชื่อผู้สมัคร>_<finished_at>.xlsx`

---

## Project Structure

```
src/
├── App.tsx                       # 3-screen state machine
├── main.tsx
├── index.css                     # Tailwind v4 + brand palette (Berry + Gold)
├── components/
│   ├── BrandHeader.tsx
│   ├── SetupScreen.tsx
│   ├── InterviewScreen.tsx
│   ├── ResultsScreen.tsx
│   ├── QuestionCard.tsx
│   ├── ResultChart.tsx           # Recharts bar chart by section
│   └── ui/                       # hand-rolled shadcn-style primitives
│       ├── Alert.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Progress.tsx
│       ├── RadioOption.tsx
│       ├── Tabs.tsx
│       └── Toast.tsx
├── lib/
│   ├── cn.ts                     # className combiner (clsx + tw-merge)
│   ├── excel.ts                  # parseQuestionsFile + exportResults
│   ├── scoring.ts                # buildResult, groupBySection, formatDuration
│   └── types.ts
└── data/
    └── sample.json               # default 20-question seed
public/
└── NSL_BakeryFactoryManager_Interview_QuestionBank.xlsx   # downloadable template
scripts/
└── generate-sample-xlsx.mjs      # rebuild the public xlsx from sample.json
```

---

## Notes / Limitations

- **No persistence** — กดรีเฟรช state จะหายทั้งหมด (เป็น expected behavior;
  ไม่มี localStorage / sessionStorage)
- **No backend** — ไฟล์ output ดาวน์โหลดในเครื่องผู้ใช้เท่านั้น
- Responsive 320px – 1440px

---

## Brand

NSL Foods palette: **Warm Berry + Gold** บน cream background — clean,
professional, food industry. ใช้ Inter (Latin) + Sarabun (Thai) จาก Google Fonts.
