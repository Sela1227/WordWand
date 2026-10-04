/* ====================================================================
   core：版本/後端網址/通行碼/字數規則/共用請求(apiPost)/精靈與主題與模式設定/語音選擇
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */


const { useState, useRef, useEffect } = React;

const VERSION = "V1.2.0";

/* ★ 你的 Railway 後端網址 */
const BACKEND_URL = "https://wordwand-production-2a37.up.railway.app";
const SpeechRecCtor = (typeof window !== "undefined") && (window.SpeechRecognition || window.webkitSpeechRecognition);

/* 共用輸入規則與請求（審核 P1-1 / P2-2 / P2-4）：
   - MAX_CHARS 與後端一致（200）
   - apiPost 回 {ok:true,data} 或 {ok:false,message}；訊息依狀態碼區分、可採取行動 */
const MAX_CHARS = 200;
function lenMsg(n) {
  if (n > MAX_CHARS) return `超過 ${MAX_CHARS} 字了（目前 ${n} 字），刪到 ${MAX_CHARS} 字內再送出喔！`;
  if (n > MAX_CHARS - 20) return `快到上限了（${n} / ${MAX_CHARS}）`;
  return "";
}
async function apiPost(path, body) {
  if (BACKEND_URL.includes("YOUR-APP")) return { ok: false, message: "還沒設定後端網址喔！" };
  let res;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch (_) {
    return { ok: false, message: "連不上小精靈。檢查一下網路，再試一次！" };
  }
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (res.ok) return { ok: true, data };
  const detail = data && typeof data.detail === "string" ? data.detail : "";
  if (res.status === 429) return { ok: false, message: detail || "太多人同時在用，請等大約一分鐘再試！" };
  if (res.status === 400) return { ok: false, message: detail || "輸入有點問題，檢查一下再送出！" };
  return { ok: false, message: detail ? `小精靈暫時休息中：${detail}` : "小精靈暫時休息中，等一下再試一次！" };
}
/* ★ 中學通行碼(前端簡易鎖,非資安防線;真正保護在後端紅線)。改這裡即可。 */
const MID_PASSWORD = "1234";

const baseFont = "'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'PingFang TC', system-ui, 'Microsoft JhengHei', 'Noto Sans CJK TC', 'Segoe UI', sans-serif";

const SPIRITS = {
  nini: { name:"尼尼", tag:"溫柔引導", color:"#FF8FB3", soft:"#FFE4EE", deep:"#C84B77",
    intro:"我會溫柔地聽你說。寫錯也沒關係,我們一起慢慢找出好玩、漂亮的句子!" },
  kiki: { name:"奇奇", tag:"博學小老師", color:"#54B9EC", soft:"#DCF1FC", deep:"#1E7BB0",
    intro:"我知道很多語文的小知識!把句子交給我,我會幫你想得更清楚。" },
  max:  { name:"麥克斯", tag:"活力滿點", color:"#8AA0F2", soft:"#E7ECFF", deep:"#4756B5",
    intro:"我超有活力!我們一起把普通的句子,變成超棒的作品吧!" },
};

/* 精靈「顯示皮膚」:個性(溫柔/博學/活力)不變,名字與語氣隨風格切換。後端 spirit 代碼仍是 nini/kiki/max。 */
const SPIRIT_SKINS = {
  cute: {
    nini:{ name:"尼尼", tag:"溫柔引導", intro:"我會溫柔地聽你說。寫錯也沒關係,我們一起慢慢找出好玩、漂亮的句子!" },
    kiki:{ name:"奇奇", tag:"博學小老師", intro:"我知道很多語文的小知識!把句子交給我,我會幫你想得更清楚。" },
    max: { name:"麥克斯", tag:"活力滿點", intro:"我超有活力!我們一起把普通的句子,變成超棒的作品吧!" },
  },
  nordic: {
    nini:{ name:"諾雅", tag:"沉穩陪伴", intro:"慢慢來。把想法交給我,我陪你一句一句把它理清楚。" },
    kiki:{ name:"艾文", tag:"條理思考", intro:"我擅長把雜亂的想法整理成清楚的結構,一起把它組織起來吧。" },
    max: { name:"芬恩", tag:"俐落推進", intro:"先把想到的寫下來,我幫你把它打磨得更精準、更有力。" },
  },
  scifi: {
    nini:{ name:"露娜", tag:"輔助核心", intro:"系統就緒。輸入你的想法,我會協助你逐步生成更好的表達。" },
    kiki:{ name:"賽法", tag:"分析模組", intro:"啟動分析。我會拆解你的句子結構,標出可以優化的節點。" },
    max: { name:"澤洛", tag:"加速引擎", intro:"引擎全開。我們快速迭代,把草稿推進到下一個版本。" },
  },
};

/* 中學三主題 + 國小固定可愛。cute 的 accent 來自精靈;北歐/科幻用主題色。 */
const THEMES = {
  cute:   { bg:"radial-gradient(120% 120% at 50% 0%, #E6F5FF 0%, #F1FAFF 38%, #FFEFF6 100%)",
            surface:"#FFFFFF", text:"#3A2E3F", muted:"#9A8FA0", border:"#F0E4EE",
            tabsBg:"rgba(255,255,255,0.5)", onAccent:"#FFFFFF", shadow:"0 10px 28px rgba(180,120,160,0.16)",
            accent:"#54B9EC", soft:"#DCF1FC", deep:"#1E7BB0", cute:true },
  nordic: { bg:"linear-gradient(180deg,#F4F7F9 0%,#E9EFF2 100%)",
            surface:"#FFFFFF", text:"#2E3A44", muted:"#8A98A4", border:"#E2E8EC",
            tabsBg:"#FFFFFF", onAccent:"#FFFFFF", shadow:"0 8px 22px rgba(90,120,140,0.12)",
            accent:"#5C8AA6", soft:"#E7EEF2", deep:"#39647F", cute:false },
  scifi:  { bg:"radial-gradient(120% 120% at 50% 0%, #16203E 0%, #0C1022 72%)",
            surface:"#171E38", text:"#E7ECFF", muted:"#8E97C0", border:"#2C3760",
            tabsBg:"rgba(255,255,255,0.06)", onAccent:"#08121F", shadow:"0 10px 28px rgba(0,0,0,0.45)",
            accent:"#37E0D2", soft:"#1E2746", deep:"#8BF6EE", cute:false },
};
const MID_THEME_LIST = [
  { key:"cute", label:"可愛" }, { key:"nordic", label:"北歐極簡" }, { key:"scifi", label:"科幻" },
];

const MODES = {
  board: { key:"board", title:"寫作計畫板", titleFormal:"寫作計畫板" },
  ideas: { key:"ideas", title:"靈感泡泡", titleFormal:"靈感發想", btn:"給我點子!", inputLabel:"輸入一個主題詞:",
    blurb:"不知道要寫什麼嗎?給一個主題,小精靈會從不同角度幫你打開思路!",
    placeholder:"我的學校", itemLabels:{meaning:"想想看"},
    resultHint:"這些點子,挑你喜歡的寫進去:",
    examples:["下雨天","我的好朋友","我最喜歡的食物"] },
  outline:{ key:"outline", title:"作文藏寶圖", titleFormal:"大綱規劃", btn:"畫大綱!", inputLabel:"輸入你的作文題目:",
    blurb:"拿到題目不知道怎麼開始嗎?把題目給小精靈,它會幫你規劃開頭、經過、結尾各寫什麼!",
    placeholder:"快樂的一天", itemLabels:{meaning:"可以寫什麼"},
    resultHint:"照著這份大綱,一段一段自己寫:",
    examples:["我最難忘的一天","我的家人","一次失敗的經驗"] },
  gym:   { key:"gym", title:"句子健身房", titleFormal:"句子優化", btn:"幫我看看!", inputLabel:"輸入你想練習的句子:",
    blurb:"把你寫的句子放進來,小精靈會告訴你哪裡可以更好、還有怎麼改,讓你自己越寫越棒!",
    placeholder:"天氣很好,我們出去玩。", itemLabels:{meaning:"說明",why:"怎麼改"},
    resultHint:"幫你看看可以更好的地方:",
    examples:["我今天去公園玩,很開心。","那隻狗很大很大。","我吃了飯然後去睡覺。"] },
  grow:  { key:"grow", title:"魔法長大樹", titleFormal:"段落擴寫", btn:"讓它長大!", inputLabel:"輸入一句話,讓它變長:",
    blurb:"只寫了一句話,不知道怎麼變多嗎?小精靈會問你幾個問題,跟著想一想,一句話就會變成一段!",
    placeholder:"我吃了一個冰淇淋。",
    resultHint:"跟著這幾個問題想一想,再自己寫寫看:",
    examples:["今天我去了動物園。","昨天下雨了。","我有一個好朋友。"] },
  idiom: { key:"idiom", title:"成語變身術", titleFormal:"成語潤飾", btn:"變身!", inputLabel:"輸入你想練習的句子:",
    blurb:"常常寫「很生氣」、「很漂亮」嗎?把句子放進來,小精靈會幫你找出好用的成語!",
    placeholder:"他跑得很快很快。", itemLabels:{meaning:"意思",why:"為什麼適合"},
    examples:["我今天考了一百分,心裡非常高興。","弟弟把房間弄得很亂。","今天的夕陽真的好漂亮。"] },
  senses:{ key:"senses", title:"五感放大鏡", titleFormal:"感官描寫", btn:"放大五感!", inputLabel:"輸入你想練習的句子:",
    blurb:"好的描寫會用到眼睛、耳朵、鼻子、嘴巴和皮膚。小精靈會用五官問你幾個問題,跟著想,再自己把畫面寫進去!",
    placeholder:"我打開了窗戶。", itemLabels:{meaning:"想想看"},
    resultHint:"用這些感官想想看,再自己加進你的句子:",
    examples:["我走進了廚房。","外面開始下雨了。","媽媽煮了一鍋湯。"] },
  argue: { key:"argue", title:"議論小教練", titleFormal:"議論練習", btn:"想論點!", inputLabel:"輸入議題或你的看法:",
    blurb:"寫議論文時,給小教練一個議題,它會陪你想幾個論點和舉例方向,記得也想想反方,論述更周全!",
    placeholder:"AI 對中學生的影響", itemLabels:{meaning:"怎麼說理"},
    resultHint:"挑你認同的論點;『反方』那一條,想想你會怎麼回應:",
    stages:["jh","sh"],
    examples:["手機該不該帶到學校","網路購物的好與壞","該不該保留紙本書"] },
};

/* 議題類別:耐久、適合思辨的方向(非即時新聞)。愈高年級愈抽象。 */
const ISSUE_TOPICS = {
  jh: ["社群媒體的影響","環保與生活","校園手機規範","網路霸凌","AI 與學習","運動與健康","網路購物的利弊"],
  sh: ["科技與隱私","永續發展","世代價值差異","媒體識讀","人與 AI 的關係","自由與規範","成功的定義"],
};
const MID_STAGES = [ { key:"jh", label:"國中" }, { key:"sh", label:"高中" } ];


/* ---------- 語音合成：挑台灣中文語音 ---------- */
function chooseZhVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const vs = window.speechSynthesis.getVoices() || [];
  // 1) 明確的台灣中文語音(lang=zh-TW 或名稱含臺灣/台灣/國語)
  const tw = vs.filter((v) => /zh[-_]?TW/i.test(v.lang || "") || /(臺灣|台灣|Taiwan|國語)/i.test(v.name || ""));
  // 2) 已知好聽的台灣語音名稱優先
  const prefer = ["美佳", "美嘉", "Meijia", "雅婷", "Yating", "漢漢", "Hanhan", "國語（臺灣）", "國語(臺灣)", "Google 國語"];
  for (const n of prefer) { const hit = tw.find((v) => (v.name || "").includes(n)); if (hit) return hit; }
  if (tw[0]) return tw[0];
  // 3) 退而求其次:香港中文 → 任何中文(至少別亂念)
  return vs.find((v) => /zh[-_]?HK/i.test(v.lang || "")) || vs.find((v) => /^zh/i.test(v.lang || "")) || null;
}

