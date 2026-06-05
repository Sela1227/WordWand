<div align="center">
  <h1>WordWand · 作文魔法屋</h1>
  <p>陪小朋友把普通句子變成漂亮成語的寫作小幫手</p>
  <p><strong>V0.5.2</strong></p>
</div>

---

## 簡介

**WordWand**(作文魔法屋)是一個給國小學生用的作文練習小幫手。可愛的小精靈用六種模式陪小朋友練作文:

- **成語變身術** — 普通句子改寫成含成語的版本,並解釋每個成語。
- **五感放大鏡** — 幫句子加上視覺/聽覺/嗅覺/味覺/觸覺的生動描寫。
- **句子健身房** — 指出句子可以更強的地方並教怎麼改(不代寫)。
- **魔法長大樹** — 用引導問題陪你把一句話寫成一段(不代寫)。
- **靈感泡泡** — 給一個主題詞,丟出多角度點子幫你打開思路(不代寫)。
- **作文藏寶圖** — 給作文題目,協助列開頭-經過-結尾三段大綱(不代寫)。

後四種著重「訓練作文能力」:只給引導、提示、教怎麼改,刻意不幫小朋友代寫。

三個小精靈各有不同個性:**尼尼**(溫柔引導)、**奇奇**(博學補典故)、**麥克斯**(活力滿點),切換精靈就會換一種語氣陪你寫作。

> 介面為兒童活潑風格(輕爽天藍 + 粉色系)、全程繁體中文、零 emoji。本專案經 SELA 指示**不套用 SELA 品牌 logo**,使用專屬的可愛標記。

## 兒童安全(V0.2.0)

兩道防線都在**後端**(前端可被繞過,把關一定在伺服器端):

1. **範圍鎖定** — 只幫忙改寫「想變漂亮的句子」。小朋友若拿來問知識、數學、聊天或要求做別的事,一律不回答,溫柔請他給一句句子。
2. **內容把關** — 任何不適合兒童的字句(暴力 / 性 / 成人 / 驚悚 / 自傷 / 毒品 / 髒話 / 仇恨等)一律不處理、不複述,只給溫柔引導;所有輸出限定 G 級。

由後端要求模型回傳 `ok` 旗標判定,且後端再做一次 fail-safe:格式不對或未明確通過就一律當作不通過。

另外(V0.3.0):後端 CORS 只放行自己的 GitHub Pages 來源、並對每個 IP 做每分鐘速率限制,保護 API 額度。

## 架構

```
小朋友在 GitHub Pages 網頁打字
        ↓
網頁把句子送到 Railway 後端
        ↓
後端做安全把關 → 從環境變數拿 Claude API key → 組 prompt → 呼叫 Claude
        ↓
結果(或溫柔引導)回傳網頁渲染
```

API key 只存在 Railway 伺服器(環境變數),瀏覽器與 GitHub 都看不到。

## 部署

### 後端(Railway)

1. 在 Railway 新建專案,從 GitHub repo 部署。後端檔案(`main.py` / `requirements.txt` / `Procfile`)在 **repo 根目錄**,Railway 會自動認出 Python,**不用設 Root Directory**
2. Variables 新增 `ANTHROPIC_API_KEY`=你的 Claude API key
3. Railway 依 `Procfile` 啟動;部署後取得網址(如 `https://xxx.up.railway.app`)
4. 開該網址看到 `{"status":"ok"...}` 代表後端正常

### 前端(GitHub Pages)

1. 打開 `docs/index.html`,把最上面的 `BACKEND_URL` 改成上面 Railway 的網址
2. repo Settings → Pages → Source 選「Deploy from a branch」→ 分支 `main`、資料夾 **`/docs`**
3. 等 1-2 分鐘,網站上線於 `https://<帳號>.github.io/<repo>/`

### 上線後(建議)

(V0.3.0 起已預設只放行 `https://sela1227.github.io`。若 Pages 網域不同,改 `main.py` 的 `ALLOWED_ORIGINS`。)

## 本地測試後端

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=你的key
uvicorn main:app --reload
```

## 目錄結構

```
WordWand/
├── main.py               FastAPI 後端代理(藏 key + 兒童安全把關)— Railway 從根目錄 build
├── requirements.txt      鎖版相依
├── Procfile              Railway 啟動指令
├── docs/                 GitHub Pages 前端(Pages 從 /docs 部署)
│   ├── index.html        主畫面(React via CDN,免建置)
│   ├── favicon.svg       專屬可愛標記(非 SELA logo)
│   └── site.webmanifest  PWA 設定
├── README.md             本檔
├── CLAUDE.md             給下次 Claude 的工作上下文
└── .gitignore            Git 忽略清單
```

## 版本

V0.5.2

---

> Made by **SELA** · V0.5.2
