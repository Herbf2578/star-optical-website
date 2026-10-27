# 明星眼鏡網站

以北角明星眼鏡的兒童近視管理及驗眼預約為主要目標，提供首頁、兒童服務、成人配鏡、學校合作及門市資料五個頁面。

本網站根據 2026-10-27 的公開網站內容及品牌資料重建，原有 repository 的 `main` 只有 README。新版已於 2026-10-27 香港時間 22:41 前發布至 https://www.staropticalhk.com/ ，Vercel 專案為 `star-optical/website-2`。

本次使用已登入的 Vercel CLI，先建立待發布 production deployment，驗證後再 promote。發布版本為 `6dff6634c347026d5702e74fb440387314f82f3a`，部署 ID 為 `dpl_CyHJnA4KcoTuD3ocWCgKSEQrwG2j`。五頁、metadata、robots、sitemap、圖片、聯絡連結及 HTTP 行為的 138 項正式網址檢查全部通過；這不代表已取得搜尋排名或 AI 引用。

## 本地使用

需要 Node.js 22 或以上，沒有第三方執行依賴。

```sh
node --test
node scripts/build.mjs --preview
node scripts/serve.mjs
```

預覽網址為 `http://127.0.0.1:4180/`。可設定 `STAR_PREVIEW_PORT` 改變本地埠。伺服器只監聽本機，所有回應都有 `X-Robots-Tag: noindex, follow`；它只供檢查，正式託管請直接使用建置後的靜態檔案。

## 建置與索引

```sh
node scripts/build.mjs --production
```

輸出至 `dist/`。預設建置是預覽模式；Vercel 的 `VERCEL_ENV=production` 或明確的 `--production` 才產生正式可索引版本。`--preview` 優先保留預覽模式。

正式建置包含每頁獨立 title、description、canonical、Open Graph、LocalBusiness / WebSite / WebPage JSON-LD，內頁另有 BreadcrumbList。XML sitemap 只列出實際產生的五個正式路徑。預覽含 noindex，並不列 sitemap URLs。沒有加入未確認的營業時間、評分、資格或成立年份。

## 檔案

- `src/home.html`：首頁主要內容。
- `src/pages.json`：四個內頁的文字、FAQ 及查詢行動。
- `src/site.json`：共用公開名稱、地址、電話與正式網址。
- `src/style.css`：桌面及手機版樣式。
- `src/assets/`：沿用原站的 Logo、門市照片及原 favicon。
- `src/content-sources.txt`：內容來源與確認界線。
- `scripts/build.mjs`：生成完整可讀 HTML，不需要前端 JavaScript 才能顯示內容或展開 FAQ。
- `test/site.test.mjs`：檢查 metadata、結構化資料、全站連結、素材、預覽索引隔離及 HTTP 行為。

原有 Logo／門市照片／favicon，以及 11 個獨立圖片根路徑均保留原檔，避免既有圖片連結失效；舊海報不加入新版頁面。首頁保留既有分段錨點。原站未列來源的評分及客戶見證沒有沿用。

## 發布條件與量度

`vercel.json` 宣告靜態輸出及尾斜線網址；`.vercelignore` 排除本地建置、測試輸出及環境檔案。`.vercel/` 與 `.env*` 不加入 Git。

現有 `staropticalhk.com` 保留 308 轉址至 `www.staropticalhk.com`，沒有更改 DNS。發布前應核對連結的團隊／專案，執行測試及 `vercel deploy --dry --json`，再使用 `vercel deploy --prod --skip-domain` 建立待發布版本，驗證後執行 `vercel promote <deployment-url>`。

本次發布前的回復部署為 `dpl_4QQ8TLFnQxCbBL9Nd6Z61w97v7mE`（`website-2-qi4bbodig-star-optical.vercel.app`）。如需回復，先確認該部署仍可用，再使用 `vercel rollback <deployment-url> --scope star-optical`；Vercel 的部署保留政策可能令歷史版本過期。

GitHub 自動部署尚未接通：Vercel 的 GitHub 身份為 `pandastaroptical-debug`，repository 屬於 `Herbf2578`；連接嘗試回覆缺少 repository write/admin 權限。目前正式網站使用 CLI 發布，沒有改變任何 GitHub 帳戶或 repository 權限。

WhatsApp 連結只開啟預填查詢，不自動發送訊息；點擊不代表已確認預約。這個版本未加入分析工具、虛構追蹤 ID 或健康資料收集。Search Console 驗證／提交、商家檔案、營業時間及專業資料仍需接入相應來源後完成。SEO 與 AI 搜尋引用需要部署後觀察，不能由本地測試推定成效。
