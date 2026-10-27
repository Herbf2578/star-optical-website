# 明星眼鏡網站

以北角明星眼鏡的兒童近視管理及驗眼預約為主要目標，提供首頁、兒童服務、成人配鏡、學校合作及門市資料五個頁面。

本分支根據 2026-10-27 的公開網站內容及品牌資料建立可維護的靜態網站。原有 `main` 只有 README；這不是從目前 Vercel 部署取回的原始應用程式，亦尚未確認與正式 Vercel 專案的連接。不要把分支或 PR 完成視作正式網站已更新。

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

原有 Logo／門市照片／favicon 根路徑保留；其他舊海報網址未納入此次發布內容，正式遷移前應核對是否有外部引用並處理。首頁保留部分既有分段錨點。原站未列來源的評分及客戶見證沒有沿用。

## 發布條件與量度

`vercel.json` 宣告靜態輸出及尾斜線網址，不含任何帳戶、專案 ID、憑證或新域名設定。正式發布前需核對原 Vercel 專案、網域、部署來源、完整舊 URL 清單及回復版本，先驗證預覽，再發布。

WhatsApp 連結只開啟預填查詢，不自動發送訊息；點擊不代表已確認預約。這個版本未加入分析工具、虛構追蹤 ID 或健康資料收集。Search Console 驗證／提交、商家檔案、營業時間及專業資料仍需接入相應來源後完成。SEO 與 AI 搜尋引用需要部署後觀察，不能由本地測試推定成效。
