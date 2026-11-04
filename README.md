# STAR OPTICAL 明星眼鏡｜六頁商業網站

這是明星眼鏡的六頁新版網站，使用真正的 React 網頁、文字、按鈕及表單重建六張設計參考圖。主要語言為香港繁體中文，重點是兒童驗眼查詢、成人配鏡及學校合作。

最新的2026-10-31商業評估整合版，已按「網站商業評估」第二輪建議調整三類顧客入口、真實門市展示、WhatsApp步驟、方案查詢及品牌表單脈絡。評估來源與採用情況見 [商業評估整合報告](docs/business-review-20261031/implementation.md)。聯絡頁現在會按白名單服務／品牌參數產生表單，仍沒有儲存或寄出查詢資料。

2026-10-31已按用戶意見補充六頁圖片：加入15張原創照片式示意素材，兒童方案及流程、成人服務及生活情境、學校活動、首頁服務、鏡架目錄及聯絡頁均有更多圖片。正式網站截圖見 [桌面與手機截圖](docs/screenshots-live-20261104/index.html)，本輪改動與驗證見 [圖片加強版報告](docs/image-revision-20261031.md)。原有2026-10-30測試紀錄仍保留。

2026-11-04 用戶已授權正式部署。發布沿用原有 Vercel `star-optical / website-2`，以最新 `origin/main 18f874b` 建立獨立發布分支；原 `star-optical-website` 的未提交追蹤工作保留。發布及回復狀態以 [本次發布紀錄](docs/release-20261104.md) 為準。

## 最簡單的開啟方法（Windows）

1. 打開本資料夾，雙擊 **「啟動網站.cmd」**。
2. 保持開啟的視窗不要關閉。首次啟動可能需要下載依賴及建立網站，請等候視窗顯示預覽網址。
3. 自行打開 Chrome、Edge 或其他瀏覽器，輸入 **http://localhost:3000**。
4. 使用完畢，在啟動視窗按 **Ctrl + C** 停止網站。關閉啟動視窗也會停止預覽。

啟動檔會尋找已安裝的 Node.js，或這部電腦已有的 Codex 內附 Node.js。若找不到，請先安裝 Node.js 22 或以上版本。缺少依賴時會嘗試安裝，因此首次啟動需要網絡；已有正式建置時會直接啟動，沒有建置時才建立網站。

啟動檔不會自動開啟瀏覽器，也不會強制關閉佔用連接埠的其他程式。如果顯示 3000 已被使用，先關閉先前的網站預覽視窗，或請協作者協助改用另一個連接埠。

## 六個頁面

| 頁面 | 本地網址 |
| --- | --- |
| 首頁 | http://localhost:3000/ |
| 兒童近視管理 | http://localhost:3000/children-eye-care/ |
| 成人配鏡 | http://localhost:3000/adult-eyewear/ |
| 明眸童心護眼計劃 | http://localhost:3000/school-vision-screening/ |
| 品牌鏡架 | http://localhost:3000/frames/ |
| 聯絡我們 | http://localhost:3000/contact/ |

本地網址只在本機預覽伺服器運行時可用。正式網址為 https://www.staropticalhk.com/，六頁新版已於2026-11-04取代舊站，詳見本次發布紀錄。四個原有服務／聯絡路徑已保留，品牌鏡架頁另用 `/frames/`。

## 已建立的功能

- 六頁共用頁首、導覽、頁尾、按鈕、服務卡片、FAQ 及品牌配色。
- 手機導覽選單、手機底部查詢入口，以及按裝置寬度重新排列的內容。
- 兒童三類近視管理方案比較、成人配鏡介紹、學校合作準備事項、可篩選的示意鏡架目錄及門市資料。
- 各服務獨立預填 WhatsApp 訊息、電話連結及 Google Maps 查詢連結。
- 聯絡頁表單驗證、訊息預覽及「透過 WhatsApp 發送查詢」入口。
- 獨立頁面標題、說明、Canonical、Open Graph、語意標題、商戶及麵包屑結構化資料、Sitemap 與 Robots。
- Next/Image 圖片處理、鍵盤焦點樣式、表單標籤、跳至主要內容及基本安全回應標頭。

正式發布、實測與回復步驟請看 [發布紀錄](docs/release-20261104.md) 及 [正式網站截圖](docs/screenshots-live-20261104/index.html)。早期本機測試見 [測試報告](docs/test-report.md)。本 README 不把功能存在等同於已通過測試，也不聲稱已達到特定性能分數、搜尋排名或 Core Web Vitals 指標。

## WhatsApp 查詢如何運作

一般按鈕會開啟 WhatsApp 預填訊息，訪客需自行按「發送」。聯絡表單則先把內容整理成可檢查的訊息，再由訪客選擇開啟 WhatsApp。

網站沒有聯絡表單後端，也不把表單資料寫入資料庫或網站儲存空間；目前頁面的輸入只用來產生訊息。開啟 WhatsApp 後，相關內容會交由 WhatsApp 處理。請勿填寫兒童姓名、身份證明或詳細健康紀錄。

**發出查詢不代表預約成功。** 所有預約日期、時間、服務內容及學校合作，均須由門市確認。

## 修改公司資料或網站內容

| 想修改甚麼 | 檔案位置 |
| --- | --- |
| 品牌名稱、公司名稱、地址、電話、WhatsApp、預填訊息 | `src/lib/site.ts` |
| 共用 SEO 設定 | `src/lib/seo.ts` |
| 六頁內容及各頁 SEO 標題、說明 | `src/app/` 內相應的 `page.tsx` |
| 色彩、字體、間距、響應式版面 | `src/app/globals.css`、`src/app/service-pages.css` |
| 共用頁首、頁尾、按鈕、FAQ 等 | `src/components/` |
| 照片及示意圖片 | `public/images/` |
| 六張原始視覺參考 | `design-reference/` |
| 瀏覽器功能測試 | `tests/site.spec.ts`、`playwright.config.ts` |

這個版本使用 Next.js 16.4.3、React 19.3.1、TypeScript 6.0.3、Tailwind CSS 4、Lucide Icons、ESLint 與 Playwright。TypeScript 採用 6.0.3，是因目前使用的 ESLint TypeScript 解析工具不支援 TypeScript 7；依賴解析記錄在 `pnpm-lock.yaml`。

日後新增服務頁面時，可重用現有元件，並同步更新 `src/lib/site.ts` 的導覽、Sitemap、內部連結、頁面 Metadata 及測試。

## 給協作者的啟動與檢查指令

在本資料夾開啟終端機。首次安裝使用專案指定的 pnpm 11.25.0：

```powershell
pnpm install --frozen-lockfile
```

以下指令直接使用已安裝的工具，毋須另行全域安裝 Next.js、TypeScript、ESLint 或 Playwright：

```powershell
# 開發預覽：修改檔案後可即時更新
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1

# 檢查程式格式及常見問題
node node_modules/eslint/bin/eslint.js .

# 檢查 TypeScript
node node_modules/typescript/bin/tsc --noEmit

# 建立正式執行版本；這一步不會部署
node node_modules/next/dist/bin/next build

# 啟動已建立的版本
node node_modules/next/dist/bin/next start --hostname 127.0.0.1

# 執行瀏覽器測試；需已有可用的 Playwright Chromium
node node_modules/@playwright/test/cli.js test
```

開發預覽、正式執行及瀏覽器測試的伺服器不要同時佔用同一個連接埠。需要更新正式預覽時，先停止伺服器，再執行 `build`，最後重新啟動；啟動檔看到既有建置時不會自動重建修改後的內容。

若 Playwright 缺少瀏覽器，可由協作者執行 `node node_modules/@playwright/test/cli.js install chromium`。測試設定及環境限制以 [測試報告](docs/test-report.md) 為準。

## 目前仍需商家確認的資料

- 最新營業時間及假期安排；網站現時請訪客到訪前聯絡確認。
- 視光人員姓名、專業資格及註冊資料；未有可靠資料前不展示。
- 實際檢查項目、收費、覆診頻次、產品型號、價格、供應及交貨安排。
- 學校合作的檢查內容、時長、場地、費用、通知、同意及資料處理分工。
- 原有第三方品牌／活動照片在新版公開網站的使用安排，以及醫療相關內容的專業核對。

網站沒有自行加入客戶見證、星級、學校數量、療效百分比、成立年份、產品價格、現貨承諾或品牌代理授權。AI 圖片只作示意，人物不是本店真實員工或顧客，鏡架不是實際庫存。

## 正式部署與本地預覽

這是 App Router 的 Next.js 專案，應使用支援目前 Next.js 與 Node.js 的執行環境。預設圖片經 Next/Image 處理，正式環境須提供相應的圖片最佳化能力；不要直接把原始碼或 `.next` 當一般靜態 HTML 資料夾上傳。

目前預設為預覽模式：頁面 Robots、HTTP `X-Robots-Tag` 及 `robots.txt` 均阻止索引。Canonical 和 Sitemap 保留正式網域及六個目標路徑，方便檢查；這不代表新版已發布或已提交搜尋引擎。

只有在用戶明確批准正式發布、並完成內容和素材核對後，才於正式建置環境設定 **`SITE_INDEXABLE=true`**，然後重新建置。預覽部署不要設定此旗標。正式發布前需再核對 HTML、HTTP 標頭、Robots、Sitemap、Canonical、圖片及所有查詢入口。

正式目標已核對為原有 Vercel `star-optical / website-2`（`prj_9D8z1Cq5h0T1RDvuabcLJemzrsrR`）。`vercel.json` 明確指定 Next.js，覆蓋舊靜態網站的建置方式。正式環境的 `SITE_INDEXABLE=true` 同時用於建置及執行；本地 `star-optical-next` 預覽維持 false，正式模式驗證在獨立發布副本／3001埠進行。不要把正式建置的 `.next` 複製到本地預覽資料夾。

後續更新請先保存原始碼及鎖定檔，以 `vercel deploy --prod --skip-domain --scope star-optical` 建立待發布版本，驗證後才 `vercel promote <已驗證部署網址> --scope star-optical`。保留原網域、舊頁路徑、index.html永久轉址及20個舊圖片／favicon網址。需要回復時，先核對發布紀錄的上一正式部署仍可用，再以原專案的 promote／rollback 回復，毋須更改 DNS。

相關記錄：[設計對照](docs/design-review.md)、[內容與圖片來源](docs/content-sources.md)、[AI 圖片提示詞](docs/image-prompts.json)、[測試報告](docs/test-report.md)。
