# 🚀 Deploy to Firebase Hosting

ขั้นตอน deploy NSL Interview App ขึ้น Firebase Hosting (static site, frontend-only)

---

## One-time setup

### 1. สร้าง Firebase project

1. ไปที่ <https://console.firebase.google.com>
2. **Add project** → ตั้งชื่อ เช่น `nsl-interview-app` → Continue
3. ปิด Google Analytics ก็ได้ (ไม่จำเป็นสำหรับแอปนี้)
4. หลังสร้างเสร็จ จด **Project ID** ไว้ (แสดงใต้ชื่อ project ใน console)
5. ใน sidebar เลือก **Build → Hosting** → กด **Get started** → next ผ่านได้เลย
   (เราใส่ `firebase.json` ใน repo แล้ว)

### 2. ใส่ Project ID ใน `.firebaserc`

แก้ไฟล์ `.firebaserc` ที่ repo root:

```jsonc
{
  "projects": {
    "default": "nsl-interview-app-12345"  // ← Project ID ที่จดมา
  }
}
```

### 3. ติดตั้ง Firebase CLI (ครั้งเดียว) + login

ไม่ต้องติดตั้ง global ก็ได้ — ใช้ `npx` ผ่าน npm scripts ที่ผมเตรียมไว้แล้ว
แต่ login ต้องทำครั้งแรก:

```bash
npx firebase-tools login
```

จะเปิด browser ให้ login ด้วย Google account ที่มีสิทธิ์ใน project

### 4. Verify

```bash
npx firebase-tools projects:list   # ควรเห็น project ID ของคุณ
```

---

## Deploy

### Production deploy

```bash
npm run deploy
```

scripts จะรัน:
1. `npm run build` → produce `dist/`
2. `firebase deploy --only hosting` → upload `dist/`

หลัง deploy เสร็จ จะแสดง URL เช่น:
```
Hosting URL: https://nsl-interview-app-12345.web.app
```

### Preview deploy (ก่อน push prod)

```bash
npm run deploy:preview
```

จะ deploy ขึ้น preview channel `preview` (URL หมดอายุ 7 วัน) — ใช้สำหรับให้
ทีม HR ลองก่อน merge เข้า main

URL จะเป็น:
```
https://nsl-interview-app-12345--preview-xxxx.web.app
```

---

## Custom Domain (optional)

1. Firebase Console → Hosting → **Add custom domain**
2. ใส่ domain เช่น `interview.nslfoods.com`
3. Firebase แสดง DNS records (A หรือ TXT) ให้
4. ไป DNS provider ของ NSL → ใส่ records ตามที่ Firebase แสดง
5. รอ verification (~1 ชม.) → SSL cert auto provision

---

## Cache Policy ที่ตั้งไว้แล้ว (ใน `firebase.json`)

| Path | Cache-Control |
|---|---|
| `/index.html` | `no-cache` (ผู้ใช้ได้ version ใหม่ทันที) |
| `/assets/**` | `public, max-age=31536000, immutable` (Vite hash filenames) |
| `/manifest.webmanifest` | `public, max-age=3600` |
| `*.png`, `*.svg`, `*.webp`, fonts | `public, max-age=86400` |
| `*.xlsx` | `public, max-age=3600` |
| SPA fallback | `**` → `/index.html` (rewrite, ไม่ใช่ redirect) |

---

## Auto-deploy on push (optional GitHub Actions)

ถ้าต้องการให้ deploy อัตโนมัติเมื่อ merge เข้า `main`:

### 1. Generate service account

```bash
npx firebase-tools init hosting:github
```

จะถามชื่อ repo → สร้าง workflow file ที่ `.github/workflows/firebase-hosting-merge.yml`
และ setup `FIREBASE_SERVICE_ACCOUNT_*` secret ให้อัตโนมัติ

### 2. Commit + push

ทุก PR merge เข้า main → auto-deploy ขึ้น production
ทุก PR ใหม่ → auto-deploy ขึ้น preview channel + bot post URL ใน PR comment

---

## Troubleshooting

### `Error: HTTP Error: 403, The caller does not have permission`
- คุณ login Google account คนละตัวกับเจ้าของ project → `npx firebase-tools logout` แล้ว login ใหม่
- หรือเจ้าของ project ยังไม่ invite คุณเป็น Editor

### `Error: Specified public directory 'dist' does not exist`
- ลืม build → รัน `npm run build` ก่อน หรือใช้ `npm run deploy` (auto build)

### หน้าเปล่า / 404 หลัง deploy
- เปิด DevTools → Network → ดูว่า assets โหลดได้ไหม
- ตรวจ `firebase.json` ที่ rewrites `**` → `/index.html` ยังอยู่
- บางทีต้อง hard refresh (Cmd+Shift+R) เพราะ index.html cache เก่า

### Excel download ไม่ทำงาน
- เป็น client-side อยู่แล้ว ไม่เกี่ยวกับ hosting — ตรวจ browser console

---

## Checklist ก่อน production deploy ครั้งแรก

- [ ] `npm run build` clean (no TS errors)
- [ ] `npm run dev` ทดสอบ Live + Review mode + Excel upload + export
- [ ] อัปเดต `.firebaserc` ด้วย project ID จริง (ไม่ใช่ placeholder)
- [ ] ทดสอบบน iPhone ผ่าน LAN URL (`npm run dev` + Network URL)
- [ ] `npm run deploy:preview` → test preview URL
- [ ] OK แล้ว → `npm run deploy` ขึ้น production
