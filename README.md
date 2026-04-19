# Grok Imagine Studio

AI 圖片與影片生成平台 — Powered by Grok Imagine API

## 🚀 功能

- **文字生圖** — 輸入文字描述，AI 即刻生成高品質圖片
- **圖片編輯** — 上傳圖片並描述修改需求，AI 重新風格化
- **文字生影片** — 用文字描述場景，生成動態影片
- **圖片轉影片** — 上傳靜態圖片，AI 賦予動態生命
- **後台管理** — 用戶管理、生成記錄、系統設定、儀表板
- **配額系統** — 每日生成配額，用完自動重置
- **認證系統** — JWT + NextAuth，管理員/用戶角色分離

## 🛠 技術棧

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| UI | Tailwind CSS + 自建元件 |
| 資料庫 | PostgreSQL (Prisma ORM) |
| 認證 | NextAuth.js (Credentials) |
| 部署 | Vercel |

## 📦 本地開發

### 1. 複製專案

```bash
cd grok-imagine-studio
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env` 填入實際值：

```env
# Grok Imagine API
GROK_API_URL=https://transition-ecology-dragon-educated.trycloudflare.com
GROK_API_KEY=你的API金鑰

# 資料庫（本地 PostgreSQL 或 Vercel Postgres）
DATABASE_URL="postgresql://user:password@localhost:5432/grok_studio?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=隨機生成一個密鑰

# 管理員種子資料
ADMIN_EMAIL=admin@grokstudio.com
ADMIN_PASSWORD=changeme123
```

### 4. 初始化資料庫

```bash
# 推送 Schema 到資料庫
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 建立管理員帳號與預設設定
npx tsx prisma/seed.ts
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

## 🚀 部署到 Vercel

### 方式一：Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 設定環境變數
vercel env add DATABASE_URL
vercel env add GROK_API_URL
vercel env add GROK_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 重新部署（套用環境變數）
vercel --prod
```

### 方式二：Vercel Dashboard

1. 前往 [vercel.com](https://vercel.com) 並登入
2. 點擊 **Add New Project**
3. 匯入你的 Git 儲存庫
4. 設定以下環境變數：

| 變數名稱 | 說明 |
|----------|------|
| `DATABASE_URL` | Vercel Postgres 連線字串 |
| `GROK_API_URL` | Grok API 基礎 URL |
| `GROK_API_KEY` | Grok API 金鑰 |
| `NEXTAUTH_SECRET` | NextAuth 密鑰（用 `openssl rand -base64 32` 生成） |
| `NEXTAUTH_URL` | 你的 Vercel 域名（如 `https://your-app.vercel.app`） |

5. 點擊 **Deploy**
6. 部署完成後，執行 seed：

```bash
# 在 Vercel 的 Storage 面板建立 Postgres 資料庫
# 然後在本地執行：
npx prisma db push
npx tsx prisma/seed.ts
```

### 建立 Vercel Postgres

1. 在 Vercel Dashboard → **Storage** → **Create Database**
2. 選擇 **Postgres**
3. 建立後會自動設定 `DATABASE_URL` 環境變數
4. 在本地執行 `npx prisma db push` 同步 Schema

## 📁 專案結構

```
grok-imagine-studio/
├── prisma/
│   ├── schema.prisma          # 資料庫 Schema
│   └── seed.ts                # 種子資料（管理員+設定）
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根佈局
│   │   ├── page.tsx           # 首頁
│   │   ├── globals.css        # 全域樣式
│   │   ├── login/             # 登入頁
│   │   ├── register/          # 註冊頁
│   │   ├── (app)/             # 需登入的頁面群組
│   │   │   ├── layout.tsx     # 含 Navbar 的佈局
│   │   │   ├── generate/      # 文字生圖
│   │   │   ├── edit/          # 圖片編輯
│   │   │   ├── video/         # 影片生成
│   │   │   ├── gallery/       # 畫廊
│   │   │   └── admin/         # 後台管理
│   │   │       ├── page.tsx   # 儀表板
│   │   │       ├── users/     # 用戶管理
│   │   │       ├── generations/ # 生成記錄
│   │   │       └── settings/  # 系統設定
│   │   └── api/
│   │       ├── auth/          # NextAuth + 註冊
│   │       ├── generate/      # 生成 API（圖片/影片）
│   │       ├── gallery/       # 畫廊 API
│   │       └── admin/         # 後台 API
│   ├── components/
│   │   ├── layout/            # Navbar
│   │   ├── providers/         # AuthProvider
│   │   └── ui/                # UI 元件
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client
│   │   ├── auth.ts            # NextAuth 設定
│   │   ├── grok-api.ts        # Grok API 封裝
│   │   └── utils.ts           # 工具函式
│   ├── types/                 # TypeScript 型別
│   └── middleware.ts          # 路由保護
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

## 🔑 預設管理員帳號

- **Email**: `admin@grokstudio.com`
- **Password**: `changeme123`

⚠️ 請在首次登入後立即修改密碼！

## 📝 API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/auth/register` | POST | 用戶註冊 |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 認證 |
| `/api/generate/image` | POST | 文字生圖 |
| `/api/generate/image-edit` | POST | 圖片編輯 |
| `/api/generate/video` | POST | 影片生成 |
| `/api/generate/[id]` | GET | 查詢生成狀態 |
| `/api/gallery` | GET/DELETE | 畫廊 CRUD |
| `/api/admin/dashboard` | GET | 儀表板統計 |
| `/api/admin/users` | GET/PATCH/DELETE | 用戶管理 |
| `/api/admin/generations` | GET/DELETE | 生成記錄管理 |
| `/api/admin/settings` | GET/PATCH | 系統設定 |

## 📄 License

MIT
