# CLAUDE.md — WordWand（作文魔法屋）

> **這份是給下次 Claude 看的工作上下文,不是文件。**
> 維護章法見 `SELA-Starter-Kit/conventions/CLAUDE-MD-章法.md`,每次升版前複習。
> 每升一版至少更新三處:踩過的坑、版本歷程、下版候選工作。

---

## ⚠ Kit 衝突仲裁(開頭必讀)

1. **本專案經 SELA 明確指示「不套用 SELA logo」**(兒童公開產品定位)。Kit 鐵律雖規定全新專案一律套 logo,但 Kit CLAUDE.md 第 9 條「用戶說的話與指南衝突 → 以用戶為準」優先。**請勿主動補上 SELA logo / favicon 套組**,除非 SELA 主動要求。
2. **配色由 SELA 於 V0.2.1 指定為「輕爽天藍 + 粉色系」**(尼尼粉 `#FF8FB3` / 奇奇天藍 `#54B9EC` / 麥克斯薰衣草藍紫 `#8AA0F2`;主題色/背景以天藍為主漸層到淡粉),符合 colors.md「兒童類依向性自訂」。配色決策權在 SELA,不主動提案改色。
3. 完成版本前走鐵律 #0(SELA-handoff 評估)。

---

## 〇、當前狀態

- **版本:** V0.5.2
- **狀態:** 已上線並收尾(後端 Railway 運作中、前端接入正式網址、CORS 已收斂、速率限制已上)
- **一句話定位:** 給國小學生的 AI 寫作小幫手——把普通句子變成含成語/感官描寫的句子,三精靈不同語氣;英文品牌名 WordWand,中文名作文魔法屋(六種寫作練習模式)。
- **技術棧:** 前端 React 18(CDN + Babel standalone,免建置)/ 後端 Python 3.10+ FastAPI 0.115 / Claude API
- **入口點:** 前端 `docs/index.html` 的 `App()`;後端 `main.py`(repo 根目錄)的 `app`(`POST /magic`)

---

## 一、技術棧決策(為什麼這樣選)

| 選擇 | 替代品 | 選這個的理由 |
|------|--------|------------|
| 靜態前端 + 後端代理分離 | 純靜態單檔 / 純後端 SSR | API key 服務多名使用者必須藏後端,不能放前端;前端內容簡單適合零成本 GitHub Pages |
| React via CDN + Babel | Vite/CRA build | 兒童小工具規模小,免建置最省事,Git Pusher 推一份就能上 Pages |
| FastAPI(Railway,後端檔案放 repo 根目錄) | Flask / 直連 Anthropic | 既有熟悉棧;伺服器端組 prompt 可限制用途、防 key 被盜用 |
| Haiku 模型 | Sonnet | 改寫任務簡單,Haiku 便宜快速;品質不夠再換 `claude-sonnet-4-6` |

> 改技術棧 = 大版本升級。

---

## 二、業務對映表

(V0.1.0 暫無 — 前端單檔、後端單檔,業務概念與程式碼接近 1:1。若未來精靈/模式擴充到散在多檔再立表。)

---

## 三、關鍵檔案路徑

| 想改什麼 | 動哪些檔 |
|---------|---------|
| 後端網址(部署必改) | `docs/index.html` 開頭 `BACKEND_URL` |
| 精靈外觀(名稱/配色/介紹) | `docs/index.html` 的 `SPIRITS` 物件 |
| 精靈人格語氣 | `main.py` 的 `PERSONAS`(改這裡才會變語氣,前端只是顯示) |
| 六模式說明/範例/按鈕/欄位標籤 | `docs/index.html` 的 `MODES`(每模式含 title/btn/inputLabel/itemLabels/resultHint) |
| AI 任務指令 / 回傳格式(六模式) | `main.py` 的 `TASKS` / `SCHEMA_OK` |
| 兒童安全規則(範圍鎖定 + 內容把關) | `main.py` 的 `SAFETY` 常數(放 prompt 最前面,最優先) |
| ok=false 引導畫面 | `docs/index.html` 結果區「result.ok === false」分支 |
| 模型、單句長度上限 | `main.py` 的 `MODEL` / `len(text) > 200` |
| 允許的前端來源(CORS) | `main.py` 的 `ALLOWED_ORIGINS` |
| 速率限制次數/視窗 | `main.py` 的 `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` |
| 介面樣式 | `docs/index.html` 結尾的 `S` 樣式物件 |

> **契約提醒:** 前端送 `{spirit, mode, text}`;後端依 mode 回不同形狀(都含 `ok`):
> - idiom/senses → `{ok:true, upgraded, items[], cheer}`
> - gym(健身房)→ `{ok:true, items[], cheer}`(items=「可改進點+說明+怎麼改」)
> - grow(長大樹)→ `{ok:true, questions[], cheer}`(引導問題字串陣列)
> - ideas(靈感泡泡)→ `{ok:true, items[], cheer}`(items=「角度標籤+提示」,無 why)
> - outline(藏寶圖)→ `{ok:true, items[], cheer}`(items=開頭/經過/結尾 三段引導)
> - 任一不通過 → `{ok:false, redirect}`
> 前端依 `ok` 分流,再依 `upgraded` / `items` / `questions` 是否存在渲染。改欄位名兩邊要同改。

---

## 四、踩過的坑(編號累積,永不重排)

> 三段式:症狀 → 原因 → 做法。V0.1.0 種子坑依技術棧從跨專案坑庫挑入。

```
P1. (種子,坑 #46)雲端部署依賴浮動版本 → 自動 rebuild 隨機破壞
   - 症狀:某天 Railway 重新部署後 API 突然壞掉,程式碼沒動
   - 原因:requirements.txt 用浮動版本,套件背景升大版(如 Starlette 0.27→0.32)
   - 做法:已用 == 精確鎖死 fastapi/starlette/uvicorn/httpx/pydantic

P2. (種子,坑 #38)雲端平台不會自動跑 schema migration / 環境設定
   - 症狀:本地能跑,雲端 500
   - 原因:Railway 不會自動帶環境變數
   - 做法:部署後務必在 Variables 設 ANTHROPIC_API_KEY,缺了後端會回 500（已內建檢查訊息）

P3. (種子,坑 #39)GitHub Pages 子路徑用絕對路徑會壞
   - 症狀:favicon / manifest 在 user.github.io/repo/ 下 404
   - 原因:用了 / 開頭的絕對路徑
   - 做法:index.html 的 favicon.svg / site.webmanifest 一律相對路徑(已做)

P4. (種子,坑 #13/SW)前端跨域呼叫第三方被擋
   - 症狀:fetch 後端被 CORS 擋
   - 原因:後端沒開 CORS
   - 做法:後端已開 CORSMiddleware;上線後把 allow_origins 收斂成自己的 Pages 網址
```

5. **(設計筆記,V0.2.0)兒童安全把關必須在後端、且 fail-safe 預設不通過**
   - 症狀:前端做的內容過濾可被使用者繞過(改 JS / 直接打 API)
   - 原因:把關放前端等於沒把關
   - 做法:`SAFETY` 放後端 prompt 最前面(最優先);模型回 `ok` 旗標;後端再保險一次——非明確 `ok===true` 一律當不通過回安全引導語(寧可錯殺、不可漏放)

**真正踩到的坑（起編 #1）：**

1. **Railway 把後端放子資料夾 → Railpack 在 repo 根目錄找不到 requirements.txt,build 失敗**
   - 症狀:Railway build 報「Railpack could not determine how to build the app」,還列出一堆支援語言
   - 原因:後端原本在 `backend/`,但 Railway 預設從 repo 根目錄分析;根目錄只有資料夾沒有 `requirements.txt`,認不出是 Python
   - 做法:兩條路擇一——(A) Railway 服務 Settings → Build → Root Directory 設 `backend`;(B) 直接把後端檔放 repo 根目錄。本專案 V0.2.2 採 (B),最省事、免設定
   - 通用性:任何 monorepo / 多資料夾 repo 部署到 Railway 都會遇到

---

## 五、煙霧測試(可貼上執行)

> 每次升版前必跑,打包成 zip 前所有指令必須全綠。

```bash
# === 後端:語法 + 可載入 ===
cd backend
python -c "import ast; ast.parse(open('main.py').read())"
python -c "from main import app; print(len(app.routes), 'routes')"

# === 後端:本地啟動(需先 export ANTHROPIC_API_KEY) ===
# uvicorn main:app --reload
# 預期:GET / 回 {"status":"ok"...};POST /magic 帶 {spirit,mode,text} 回 JSON

# === 前端:HTML 結構粗檢 ===
cd ../docs
python -c "import re,sys; s=open('index.html',encoding='utf-8').read(); print('BACKEND_URL set:', 'YOUR-APP' not in s)"
# 部署前 BACKEND_URL 必須已換成 Railway 網址(上句印 True)

# === 通用:找漏掉的 debug ===
grep -rn "console.log\|print('debug')\|TODO\|FIXME" docs backend || true
```

---

## 六、版本歷程(最近 6-10 版)

| 版本 | 重點 |
|------|------|
| V0.1.0 | 初版:三精靈、成語/五官兩模式、GitHub Pages + Railway 雙端架構、不套 SELA logo |
| V0.2.0 | 取英文品牌名 WordWand;加兒童安全把關(範圍鎖定只做作文 + 內容把關 G 級,後端 ok 旗標 + fail-safe) |
| V0.2.1 | 配色微調:SELA 指定改為輕爽天藍 + 粉色系(尼尼粉 / 奇奇天藍 / 麥克斯薰衣草藍紫),背景天藍漸層、theme-color/favicon 同步 |
| V0.2.2 | 部署結構修正:後端三檔從 backend/ 移到 repo 根目錄(解 Railway 子目錄 build 失敗,坑 #1);前端維持 docs/ |
| V0.2.3 | 後端部署成功(Railway),前端 BACKEND_URL 接入正式網址 wordwand-production-2a37.up.railway.app |
| V0.3.0 | 安全收尾:CORS 收斂到 https://sela1227.github.io、加每 IP 速率限制(20 次/分,記憶體版) |
| V0.3.1 | 手機優化:消除點擊延遲/灰色高亮、補瀏海+底部安全區、點按回饋、放大範例小卡觸控範圍、防橫向溢出 |
| V0.4.0 | 加兩個訓練作文能力的模式:句子健身房(指弱點+教怎麼改,不代寫)、句子長大屋(引導問題擴寫,不代寫);分頁改 2x2;結果渲染支援 items/questions 不同形狀 |
| V0.5.0 | 更名作文魔法屋;模式名稱全面變化;新增靈感泡泡、作文藏寶圖;item 欄位標籤/按鈕/輸入提示各模式自訂 |
| V0.5.1 | 分頁依作文流程重排(靈感→大綱→健身房→長大樹→成語→五感,代寫類放後)、預設開靈感泡泡;修正每個模式 placeholder 與第一顆範例重覆 |
| V0.5.2 | 「句子長大樹」改名「魔法長大樹」(原本與句子健身房都以『句子』開頭,略重覆) |

---

## 七、下版候選工作(按優先序)

> 設計原則(訓練作文能力):優先做「教學/鷹架型」功能(引導、提示、講原因),少做「代寫型」功能,否則只是給答案、訓練不到能力,也可能變成代寫工具。句子健身房/長大屋(V0.4.0)是此原則的落地。

1. **結果加「複製給老師看」按鈕** — 第 1 名:六模式都產文字,小朋友/老師最常見下一步是複製出去,CP 值最高。
2. **修辭魔法** — 教譬喻/擬人/排比,把白句加上一個比喻並解釋(再進階一階的表達力)。
3. **成語寶庫(集點)** — 把學過的成語收集成冊,localStorage 存,練動機。
4. 把精靈人格、六模式 TASKS/SCHEMA、SAFETY 抽成 `config.json`,改規則不用動程式(模式變多後維護成本上升,值得做)。
5. 速率限制未來升跨 replica 版。
6. 模式變多,考慮把分頁改成可橫向滑動或分組,避免 2x3 佔太高。

---

## 八、升版必讀(如有)

### V0.5.0 模式擴充(維護重點)

- 現有六模式:idiom / senses / gym / grow / ideas / outline。**新增模式要同步改三處**:後端 `TASKS` + `SCHEMA_OK`、前端 `MODES`。漏一處就會壞(後端少了 → 400 參數錯誤;前端少了 → tab 不出現)。
- item 欄位標籤已改成 `MODES[mode].itemLabels` 驅動,不再寫死「意思/為什麼適合」。新模式若用 items,記得設 itemLabels。
- 回傳形狀有三種(upgraded / items / questions),前端依欄位是否存在渲染;新模式挑一種沿用即可。

### V0.3.0 安全收尾(注意事項)

- CORS 預設只放行 `https://sela1227.github.io`(在 `ALLOWED_ORIGINS`)。換 Pages 網域要同步改,否則前端會被擋。
- 速率限制是『記憶體版』,**只在單一 replica 內有效**。Railway 若加開多台 replica,每台各算各的;真要嚴格全域限流再換外部儲存(Redis)或 slowapi。
- 本地測試前端時,來源要是 `http://localhost:8000` / `127.0.0.1:8000` 才不被 CORS 擋(已放行)。

### V0.2.2 結構變更

- 後端三檔(`main.py` / `requirements.txt` / `Procfile`)已從 `backend/` 移到 **repo 根目錄**,讓 Railway 免設 Root Directory 即可 build。Start command 仍是 `uvicorn main:app --host 0.0.0.0 --port $PORT`(根目錄起點,寫 `main:app` 即可)。
- 前端維持在 `docs/`(GitHub Pages 從 /docs 部署),兩者互不影響。

### V0.2.0 升版指引(契約變更)

- 後端回傳格式新增 `ok` 旗標:`{ok:true,...}` 或 `{ok:false,redirect}`。**前端必須依 `ok` 分流**,不能假設一定有 `upgraded`。
- 安全規則集中在 `backend/main.py` 的 `SAFETY`,放 prompt 最前面。**未來改 prompt 結構時,SAFETY 必須維持在最前、最優先**,不可被任務描述稀釋。
- 後端 fail-safe:非明確 `ok===true` 一律當不通過。改回傳邏輯時不要拿掉這層保險。

---

## 九、一句話總結

V0.5.1:分頁依作文流程重排(靈感→大綱→健身房→魔法長大樹→成語→五感,代寫類擺最後)、預設開『靈感泡泡』;並把『句子長大樹』改名『魔法長大樹』避免與『句子健身房』開頭重覆。六模式架構不變。下版第一優先是結果加『複製給老師看』按鈕。
