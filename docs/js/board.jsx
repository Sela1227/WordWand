/* ====================================================================
   board：寫作計畫板(靈感池/三段點子/請精靈幫這段/接著想/復原/總覽)、MicButton、本機暫存
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

const BOARD_SECTIONS = ["開頭", "經過", "結尾"];
const BOARD_HELPERS = ["ideas", "grow", "senses", "gym", "idiom"];
const BOARD_LS_PREFIX = "wordwand_board_v2_";
const boardKey = (stage) => BOARD_LS_PREFIX + stage;
function boardHasAnyContent() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(BOARD_LS_PREFIX)) continue;
      const d = JSON.parse(localStorage.getItem(k) || "{}");
      if ((d.topic || "").trim()) return true;
      if (d.sections && Object.values(d.sections).some((arr) => Array.isArray(arr) && arr.length)) return true;
    }
  } catch (_) {}
  return false;
}
function clearAllBoards() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(BOARD_LS_PREFIX)) keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (_) {}
}

function boardResultLines(r) {
  const out = [];
  if (!r) return out;
  if (r.upgraded) out.push(r.upgraded);
  if (Array.isArray(r.items)) r.items.forEach((it) => { if (it && it.word) out.push(it.why ? (it.word + "：" + it.meaning + "（" + it.why + "）") : (it.word + "：" + it.meaning)); });
  if (Array.isArray(r.questions)) r.questions.forEach((q) => out.push(q));
  return out;
}

function MicButton({ value, setValue, pal }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  if (!SpeechRecCtor) return null;
  function toggle() {
    if (listening) { try { recRef.current && recRef.current.stop(); } catch (_) {} return; }
    const rec = new SpeechRecCtor();
    rec.lang = "zh-TW"; rec.interimResults = true; rec.continuous = false;
    const base = value ? value + " " : "";
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => { let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; setValue(base + s); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); } catch (_) { setListening(false); }
  }
  return (
    <button onClick={toggle} title="用說的" style={{ border: "2px solid " + pal.accent, background: listening ? pal.accent : pal.surface, color: listening ? pal.onAccent : pal.deep, borderRadius: 12, padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0, animation: listening ? "pulse 1.2s ease-in-out infinite" : "none" }}>
      <MicIcon color={listening ? pal.onAccent : pal.deep} />
    </button>
  );
}

function SectionBlock({ sec, items, onAdd, onDel, pal, stage, spiritKey, theme, isMid, topic }) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [hmode, setHmode] = useState("ideas");
  const [hinput, setHinput] = useState("");
  const [hloading, setHloading] = useState(false);
  const [hres, setHres] = useState(null);
  const [herr, setHerr] = useState("");
  const name = (k) => isMid ? (MODES[k].titleFormal || MODES[k].title) : MODES[k].title;

  async function run() {
    const t = hinput.trim();
    if (!t) { setHerr("先在上面輸入要幫忙的題目或句子喔！"); return; }
    if (t.length > MAX_CHARS) { setHerr(lenMsg(t.length)); return; }
    setHloading(true); setHres(null); setHerr("");
    const context = `題目:${(topic || "").trim() || "(未填)"};段落:${sec};這段已有點子:${items.length ? items.join("、") : "(無)"}`;
    const r = await apiPost("/magic", { spirit: spiritKey, mode: hmode, stage, theme, text: t, context });
    if (!r.ok) setHerr(r.message);
    else if (r.data.ok === false) setHerr(r.data.redirect || "換個題目或句子再試試看！");
    else setHres(r.data);
    setHloading(false);
  }

  const box = { background: pal.surface, border: "2px solid " + pal.border, borderRadius: 18, padding: 14, marginBottom: 14 };
  const chip = (on) => ({ border: "2px solid " + (on ? pal.accent : pal.border), background: on ? pal.accent : pal.surface, color: on ? pal.onAccent : pal.muted, borderRadius: 999, padding: "6px 12px", fontFamily: baseFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer" });
  const miniInput = { flex: 1, minWidth: 0, border: "2px solid " + pal.border, borderRadius: 12, padding: "9px 11px", fontFamily: baseFont, fontSize: 16, color: pal.deep, background: pal.surface };

  return (
    <div style={box}>
      <div style={{ fontWeight: 900, fontSize: 16, color: pal.deep, marginBottom: 8 }}>{sec}</div>
      {items.length === 0 && <div style={{ fontSize: 13, color: pal.muted, marginBottom: 8 }}>還沒有點子。在下面加,或請精靈幫你想。</div>}
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: pal.soft, borderRadius: 12, padding: "8px 10px", marginBottom: 6 }}>
          <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.6, color: pal.deep }}>{it}</span>
          <button onClick={() => { setOpen(true); setHmode("grow"); setHinput(it); setHres(null); setHerr(""); }} title="讓精靈接著這一條繼續引導你" style={{ border: "2px solid " + pal.accent, background: "transparent", color: pal.deep, borderRadius: 999, padding: "3px 10px", fontFamily: baseFont, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>✦ 接著想</button>
          <button onClick={() => onDel(i)} title="刪除" style={{ border: "none", background: "transparent", color: pal.muted, cursor: "pointer", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onAdd(draft); setDraft(""); } }} placeholder="加一個點子…" style={miniInput} />
        <MicButton value={draft} setValue={setDraft} pal={pal} />
        <button onClick={() => { onAdd(draft); setDraft(""); }} style={{ border: "none", background: pal.accent, color: pal.onAccent, borderRadius: 12, padding: "9px 15px", fontFamily: baseFont, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>＋</button>
      </div>
      <button onClick={() => setOpen((o) => !o)} style={{ marginTop: 10, border: "2px dashed " + pal.border, background: "transparent", color: pal.deep, borderRadius: 12, padding: "8px 12px", fontFamily: baseFont, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>{open ? "收起精靈幫手" : "✦ 請精靈幫這段"}</button>
      {open && (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: pal.soft }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.muted, marginBottom: 6 }}>選一種魔法:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {BOARD_HELPERS.map((k) => (<button key={k} onClick={() => setHmode(k)} style={chip(hmode === k)}>{name(k)}</button>))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={hinput} onChange={(e) => setHinput(e.target.value)} placeholder="要幫忙的題目或句子…" style={miniInput} />
            <MicButton value={hinput} setValue={setHinput} pal={pal} />
            <button onClick={run} disabled={hloading} style={{ border: "none", background: pal.accent, color: pal.onAccent, borderRadius: 12, padding: "9px 15px", fontFamily: baseFont, fontWeight: 800, cursor: "pointer", opacity: hloading ? 0.6 : 1, whiteSpace: "nowrap" }}>{hloading ? "…" : "試試看"}</button>
          </div>
          {herr && <div style={{ marginTop: 8, fontSize: 13, color: pal.deep, fontWeight: 700 }}>{herr}</div>}
          {hres && boardResultLines(hres).map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: pal.surface, borderRadius: 12, padding: "8px 10px", marginTop: 6 }}>
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: pal.deep }}>{line}</span>
              <button onClick={() => onAdd(line)} style={{ border: "2px solid " + pal.accent, background: "transparent", color: pal.deep, borderRadius: 999, padding: "3px 10px", fontFamily: baseFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}>＋加入</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Board({ pal, stage, spiritKey, theme, isMid }) {
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState({ "開頭": [], "經過": [], "結尾": [] });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const [pool, setPool] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolErr, setPoolErr] = useState("");
  const [view, setView] = useState("edit");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(boardKey(stage));
      if (raw) { const d = JSON.parse(raw); setTopic(d.topic || ""); setSections({ "開頭": (d.sections && d.sections["開頭"]) || [], "經過": (d.sections && d.sections["經過"]) || [], "結尾": (d.sections && d.sections["結尾"]) || [] }); }
      else { setTopic(""); setSections({ "開頭": [], "經過": [], "結尾": [] }); }
    } catch (_) {}
    setPool([]); setView("edit");
    setLoaded(true);
  }, [stage]);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(boardKey(stage), JSON.stringify({ topic, sections })); } catch (_) {} }, [topic, sections, loaded, stage]);

  const add = (sec, txt) => { txt = (txt || "").trim(); if (!txt) return; setSections((s) => ({ ...s, [sec]: [...s[sec], txt] })); };
  const [undo, setUndo] = useState(null);   // {sec, i, item}（審核 四-3:刪除可復原）
  const undoTimer = useRef(null);
  const del = (sec, i) => {
    const item = sections[sec][i];
    setSections((s) => ({ ...s, [sec]: s[sec].filter((_, j) => j !== i) }));
    setUndo({ sec, i, item });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 7000);
  };
  const undoDelete = () => {
    if (!undo) return;
    setSections((s) => { const arr = [...s[undo.sec]]; arr.splice(Math.min(undo.i, arr.length), 0, undo.item); return { ...s, [undo.sec]: arr }; });
    setUndo(null); if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  async function genPool() {
    const t = topic.trim();
    if (!t) { setPoolErr("先填上面的題目，再來想靈感喔！"); return; }
    if (t.length > MAX_CHARS) { setPoolErr(lenMsg(t.length)); return; }
    setPoolLoading(true); setPoolErr("");
    const context = pool.length ? `已給過的泡泡（這一批角度要全部換新）:${pool.join("｜")}` : "";
    const r = await apiPost("/magic", { spirit: spiritKey, mode: "ideas", stage, theme, text: t, context });
    if (!r.ok) setPoolErr(r.message);
    else if (r.data.ok === false) setPoolErr(r.data.redirect || "換個題目再試試看！");
    else setPool(boardResultLines(r.data));
    setPoolLoading(false);
  }
  function addFromPool(sec, idx) { add(sec, pool[idx]); setPool((p) => p.filter((_, j) => j !== idx)); }

  const totalIdeas = BOARD_SECTIONS.reduce((n, sec) => n + (sections[sec] || []).length, 0);
  const steps = [
    { label: "訂題目", done: !!topic.trim() },
    { label: "想靈感", done: totalIdeas > 0 },
    { label: "分段整理", done: BOARD_SECTIONS.every((sec) => (sections[sec] || []).length > 0) },
    { label: "照著寫文章", done: false },
  ];

  function stopSpeak() { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); setSpeaking(false); }
  function speakOverview() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) { stopSpeak(); return; }
    const parts = ["題目:" + (topic || "還沒填")];
    BOARD_SECTIONS.forEach((sec) => { const its = sections[sec] || []; parts.push(sec + ":" + (its.length ? its.join("。") : "還沒有點子")); });
    const u = new SpeechSynthesisUtterance(parts.join("。"));
    const v = chooseZhVoice(); if (v) { u.voice = v; u.lang = v.lang || "zh-TW"; } else { u.lang = "zh-TW"; }
    u.rate = 0.95; u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel(); setSpeaking(true); window.speechSynthesis.speak(u);
  }

  function clearAll() {
    if (window.confirm("確定要清空整份計畫嗎?清掉就回不來囉!")) {
      setTopic(""); setSections({ "開頭": [], "經過": [], "結尾": [] });
      setMsg("已清空,可以重新開始!"); setTimeout(() => setMsg(""), 2000);
    }
  }
  function copyAll() {
    const lines = ["題目:" + (topic || "(還沒填)")];
    BOARD_SECTIONS.forEach((sec) => { lines.push(""); lines.push("【" + sec + "】"); (sections[sec] || []).forEach((it) => lines.push("・" + it)); });
    const txt = lines.join("\n");
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
      else { const t = document.createElement("textarea"); t.value = txt; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
      setMsg("已複製整份計畫!貼到哪裡都可以照著寫。");
    } catch (_) { setMsg("複製失敗,手動選取一下也可以!"); }
    setTimeout(() => setMsg(""), 2500);
  }

  const topInput = { flex: 1, minWidth: 0, border: "2px solid " + pal.border, borderRadius: 14, padding: "12px 14px", fontFamily: baseFont, fontSize: 17, fontWeight: 700, color: pal.deep, background: pal.surface };

  const btnPrimary = { flex: 1, minWidth: 150, border: "none", background: pal.accent, color: pal.onAccent, borderRadius: 14, padding: "12px", fontFamily: baseFont, fontWeight: 800, fontSize: 15, cursor: "pointer" };
  const btnOutline = { border: "2px solid " + pal.accent, background: pal.surface, color: pal.deep, borderRadius: 14, padding: "12px 16px", fontFamily: baseFont, fontWeight: 700, fontSize: 14, cursor: "pointer" };
  const btnMuted = { border: "2px solid " + pal.border, background: pal.surface, color: pal.muted, borderRadius: 14, padding: "12px 16px", fontFamily: baseFont, fontWeight: 700, fontSize: 14, cursor: "pointer" };

  if (view === "overview") return (
    <div>
      <div style={{ background: pal.soft, borderRadius: 18, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: pal.deep, marginBottom: 8 }}>整篇總覽・你走到哪一步了</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {steps.map((st, i) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: 12.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: st.done ? pal.accent : pal.surface, color: st.done ? pal.onAccent : pal.muted, border: "2px solid " + (st.done ? pal.accent : pal.border) }}>{st.done ? "✓ " : ""}{st.label}</span>
              {i < steps.length - 1 && <span style={{ color: pal.muted, fontWeight: 900 }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.muted, margin: "0 4px 2px" }}>題目</div>
      <div style={{ fontSize: 21, fontWeight: 900, color: pal.deep, padding: "4px 4px 14px" }}>{topic || "(還沒填題目)"}</div>

      {BOARD_SECTIONS.map((sec, idx) => (
        <React.Fragment key={sec}>
          <div style={{ background: pal.surface, border: "2px solid " + pal.border, borderRadius: 18, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: pal.accent, color: pal.onAccent, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{idx + 1}</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: pal.deep }}>{sec}</div>
            </div>
            {(sections[sec] || []).length ? (sections[sec].map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 14.5, lineHeight: 1.7, color: pal.deep }}><span style={{ color: pal.accent, fontWeight: 900 }}>・</span><span>{it}</span></div>
            ))) : (<div style={{ fontSize: 13, color: pal.muted }}>這段還沒有點子,回去加一些吧。</div>)}
          </div>
          {idx < BOARD_SECTIONS.length - 1 && <div style={{ textAlign: "center", color: pal.muted, fontWeight: 900, fontSize: 18, padding: "4px 0" }}>↓</div>}
        </React.Fragment>
      ))}

      <div style={{ marginTop: 14, background: pal.soft, borderRadius: 14, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.7, color: pal.deep, fontWeight: 700 }}>
        照著 開頭 → 經過 → 結尾 的順序,把每一段的點子寫成完整的句子,你的文章就完成了!
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <button onClick={() => { stopSpeak(); setView("edit"); }} style={btnOutline}>← 回去修改</button>
        <button onClick={copyAll} style={btnPrimary}>複製整篇大綱</button>
        {(typeof window !== "undefined" && window.speechSynthesis) && (
          <button onClick={speakOverview} style={{ ...btnOutline, background: speaking ? pal.accent : pal.surface, color: speaking ? pal.onAccent : pal.deep, animation: speaking ? "pulse 1.2s ease-in-out infinite" : "none" }}>{speaking ? "停止" : "念給你聽"}</button>
        )}
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: pal.deep }}>{msg}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ background: pal.soft, borderRadius: 18, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: pal.deep, marginBottom: 4 }}>我的寫作計畫板</div>
        <div style={{ fontSize: 13, color: pal.muted, lineHeight: 1.6 }}>① 訂題目 → ② 想點子 → ③ 排進開頭/經過/結尾。卡住時再用「請精靈幫這段」或「✦ 接著想」。這份計畫會暫存在目前這個瀏覽器，重要內容完成後記得複製保存。</div>
      </div>
      <div style={{ marginBottom: 6, fontSize: 13.5, fontWeight: 700, color: pal.deep }}>① 訂題目</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例如:我的假日生活" style={topInput} />
        <MicButton value={topic} setValue={setTopic} pal={pal} />
      </div>

      <div style={{ background: pal.surface, border: "2px dashed " + pal.accent, borderRadius: 18, padding: 14, margin: "14px 0" }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: pal.deep, marginBottom: 4 }}>② 想點子・先用題目吹靈感泡泡</div>
        <div style={{ fontSize: 13, color: pal.muted, lineHeight: 1.6, marginBottom: 10 }}>填好題目,先請精靈吹出一堆點子;再把每個點子分到適合的段落。</div>
        <button onClick={genPool} disabled={poolLoading} style={{ border: "none", background: pal.accent, color: pal.onAccent, borderRadius: 12, padding: "10px 16px", fontFamily: baseFont, fontWeight: 800, fontSize: 14.5, cursor: "pointer", opacity: poolLoading ? 0.6 : 1 }}>{poolLoading ? "想點子中…" : (pool.length ? "再想一批" : "用題目想靈感泡泡")}</button>
        {poolErr && <div style={{ marginTop: 8, fontSize: 13, color: pal.deep, fontWeight: 700 }}>{poolErr}</div>}
        {pool.map((b, i) => (
          <div key={i} style={{ background: pal.soft, borderRadius: 12, padding: "10px 12px", marginTop: 8 }}>
            <div style={{ fontSize: 14.5, lineHeight: 1.6, color: pal.deep, marginBottom: 8 }}>{b}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: pal.muted, fontWeight: 700 }}>分到:</span>
              {BOARD_SECTIONS.map((sec) => (
                <button key={sec} onClick={() => addFromPool(sec, i)} style={{ border: "2px solid " + pal.accent, background: "transparent", color: pal.deep, borderRadius: 999, padding: "4px 12px", fontFamily: baseFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{sec}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight: 900, fontSize: 15, color: pal.deep, margin: "4px 2px 8px" }}>③ 排進段落・把點子放到該去的地方</div>
      {BOARD_SECTIONS.map((sec) => (
        <SectionBlock key={sec} sec={sec} items={sections[sec]} onAdd={(t) => add(sec, t)} onDel={(i) => del(sec, i)} pal={pal} stage={stage} spiritKey={spiritKey} theme={theme} isMid={isMid} topic={topic} />
      ))}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <button onClick={() => setView("overview")} style={btnPrimary}>看整篇總覽</button>
        <button onClick={copyAll} style={btnOutline}>複製整份計畫</button>
        <button onClick={clearAll} style={btnMuted}>清空</button>
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: pal.deep }}>{msg}</div>}
      {undo && (
        <div style={{ position: "sticky", bottom: 12, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: pal.deep, color: pal.surface, borderRadius: 14, padding: "10px 14px", boxShadow: "0 8px 22px rgba(0,0,0,0.18)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>已刪除一個點子</span>
          <button onClick={undoDelete} style={{ border: "2px solid " + pal.surface, background: "transparent", color: pal.surface, borderRadius: 999, padding: "4px 14px", fontFamily: baseFont, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>復原</button>
        </div>
      )}
    </div>
  );
}

