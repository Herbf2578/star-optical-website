# 本地驗收與測試報告

日期：2026-10-30，Asia/Hong_Kong。對象為 `star-optical-next` 本地新版；沒有部署至正式網站。

## 最終結果

**Playwright 36／36 通過，0 失敗、0 跳過、0 flaky。** 最終一輪於香港時間 21:52 開始，耗時約 125 秒，使用系統 Chrome 的無介面模式，連線至正式建置的本機伺服器。

| 檢查 | 實際結果 |
| --- | --- |
| Production Build | `node node_modules/next/dist/bin/next build` 成功；六頁、404、Robots、Sitemap 正常產生 |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit` 成功，0 錯誤 |
| ESLint | `node node_modules/eslint/bin/eslint.js .` 成功，0 錯誤、0 警告；生成的瀏覽器測試報告不納入原始碼檢查 |
| 依賴相容 | `pnpm peers check` 無 peer 衝突；版本及鎖定檔已固定 |
| 六頁 SEO | 獨立 Title、Description、H1、Canonical、OG、`zh-HK`、商戶資料通過 |
| 真實資料界線 | 商戶資料沒有評分、營業時間或評論結構化資料，聯絡資料正確 |
| 六頁連結及圖片 | 所有被測內連、跨頁錨點、圖片、電話及 WhatsApp 編碼通過 |
| 響應式 | 六頁 × 320／390／768／1024／1440px，共30組，沒有橫向溢出 |
| 自動無障礙 | 六頁 × 桌面1440／手機390，共12組，Axe WCAG 2A／AA／2.1規則零違規 |
| FAQ | 六頁均可展開及關閉 |
| 手機選單 | 開啟、關閉、Escape、焦點返回及六頁導航通過 |
| 鏡架目錄 | 七類篩選結果、選取狀態及款式專屬 WhatsApp 訊息通過 |
| 查詢表單 | 必填稱呼、拒絕空白稱呼、電話驗證、同意欄位、五種服務訊息及特殊符號編碼通過 |
| 表單私隱及發送界線 | 生成訊息時沒有外部發送、POST、彈出視窗、Cookie或網站儲存寫入；修改內容後舊預覽清除 |
| 預約語意 | 只生成查詢，提示須由門市確認，沒有假的提交成功或預約成功訊息 |
| 瀏覽器錯誤 | 最終測試無 runtime 或 Console 錯誤 |
| 啟動方法 | 已實際以 Windows PowerShell 執行啟動檔並啟動本地正式建置 |

原始測試結果：[test-results.json](test-results.json)。完整互動報告：[playwright-report/index.html](playwright-report/index.html)。測試原始碼：`tests/site.spec.ts`。

## 已發現及修正的問題

首輪為23通過、13失敗。失敗來自品牌讀屏名稱、手機 WhatsApp 圖示缺少名稱、流程數字及鏡架小字對比不足，以及電話欄位的 HTML pattern 不合法。已修正對應元件、顏色及驗證，再完整重跑36項，全部通過。首輪證據保存在 `test-results-initial.json`，沒有把首輪失敗當成已通過。

TypeScript 7 與現用 ESLint TypeScript 解析器不相容，改用 TypeScript 6.0.3。ESLint 9.39.5 用於配合現有 Next.js 插件的 peer 範圍；安裝時會提示該主版本已停止支援，日後更新開發工具時需一併升級相關插件。它是開發檢查工具，不會加入瀏覽器執行套件。

## 桌面及手機截圖

[打開六頁截圖總覽](screenshots/index.html)。已在截圖前逐張捲動並等待延後載入圖片完成，並檢視12張最終全頁畫面，沒有空圖、明顯截字或溢出。

| 頁面 | 桌面1440px | 手機390px |
| --- | --- | --- |
| 首頁 | [桌面](screenshots/home-desktop.png) | [手機](screenshots/home-mobile.png) |
| 兒童近視管理 | [桌面](screenshots/children-desktop.png) | [手機](screenshots/children-mobile.png) |
| 成人配鏡 | [桌面](screenshots/adult-desktop.png) | [手機](screenshots/adult-mobile.png) |
| 明眸童心護眼計劃 | [桌面](screenshots/school-desktop.png) | [手機](screenshots/school-mobile.png) |
| 品牌鏡架 | [桌面](screenshots/frames-desktop.png) | [手機](screenshots/frames-mobile.png) |
| 聯絡我們 | [桌面](screenshots/contact-desktop.png) | [手機](screenshots/contact-mobile.png) |

## 效能及檢查範圍

另有12組本機載入測量：初始LCP約364–728ms、初始CLS為0、初始傳輸量約230–305KiB；沒有圖片失敗、請求失敗或 JavaScript 錯誤。詳見 [performance.md](performance.md) 與 [performance.json](performance.json)。該抽測完成於最後的文字對比及表單修正之前，屬同一本地網站，不代表正式環境速度。

效能測試未作CPU或網絡降速、每組只測一次，Next/Image伺服器快取可能已暖機；不是 Lighthouse 分數或實地 Core Web Vitals。自動無障礙零違規也不等於完整人工無障礙認證。實體裝置、Safari／Firefox、實際網絡及讀屏操作尚未作完整測試。

WhatsApp及地圖以連結、目標地址及訊息編碼驗證；沒有向門市發送測試訊息，也沒有實際完成預約或學校合作。聯絡資料本地一致不代表已核對門市即時營業安排。

## 預覽及部署界線

本地預覽預設保留noindex；正式域名Canonical及Sitemap只作檢視。另以 `scripts/audit-http.mjs` 檢查六頁的預覽索引隔離及安全標頭，並對13個保留的原有圖片URL作HTTP及SHA-256核對，結果保存於 `http-checks.json`。

本次沒有新增正式部署、改變DNS、推送repository或沿用原有部署憑證。正式上線須另行確認，並先核對素材使用安排、臨床文案及門市資料，依README的部署準備步驟處理。
