/* ====================================================================
   lookup：查字小幫手(StrokeBox 田字格筆順、LookupPanel)
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

/* 查字小幫手（審核 P2-1:做成第二層工具,不加第一層分頁）。
   StrokeBox:田字格大字;若 HanziWriter 與字資料可用則播筆順動畫,否則退回純大字。 */
function StrokeBox({ char, pal }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    const el = ref.current; if (!el) return;
    el.innerHTML = "";
    if (typeof window === "undefined" || !window.HanziWriter) { setFailed(true); return; }
    try {
      const w = window.HanziWriter.create(el, char, {
        width: 180, height: 180, padding: 10, showOutline: true,
        strokeColor: pal.accent, outlineColor: "#D9CBD6", radicalColor: pal.deep,
        strokeAnimationSpeed: 1, delayBetweenStrokes: 180,
        onLoadCharDataError: () => setFailed(true),
      });
      w.animateCharacter();
      el._writer = w;
    } catch (_) { setFailed(true); }
  }, [char]);
  const grid = { width: 180, height: 180, border: "2px solid " + pal.border, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    background: `linear-gradient(to right, transparent calc(50% - 1px), ${pal.border} calc(50% - 1px), ${pal.border} calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom, transparent calc(50% - 1px), ${pal.border} calc(50% - 1px), ${pal.border} calc(50% + 1px), transparent calc(50% + 1px)), ${pal.surface}` };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={grid}>
        {failed ? <span style={{ fontSize: 124, fontWeight: 700, color: pal.deep, lineHeight: 1 }}>{char}</span> : <div ref={ref} />}
      </div>
      {!failed && <button onClick={() => { const w = ref.current && ref.current._writer; if (w) w.animateCharacter(); }} style={{ border: "2px solid " + pal.accent, background: "transparent", color: pal.deep, borderRadius: 999, padding: "5px 14px", fontFamily: baseFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>再看一次筆順</button>}
    </div>
  );
}

function LookupPanel({ pal, stage, onClose }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);
  async function go() {
    const t = q.trim();
    if (!t) { setErr("輸入一個字，或像「發揮的揮」這樣告訴我。"); return; }
    setLoading(true); setErr(""); setRes(null);
    const r = await apiPost("/lookup", { query: t, stage });
    if (!r.ok) setErr(r.message);
    else if (r.data.error) setErr(r.data.error);
    else setRes(r.data);
    setLoading(false);
  }
  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis || !res) return;
    const u = new SpeechSynthesisUtterance(`${res.char}。${(res.words && res.words[0]) || ""}。${res.meaning}`);
    const v = chooseZhVoice(); if (v) { u.voice = v; u.lang = v.lang || "zh-TW"; } else { u.lang = "zh-TW"; }
    u.rate = 0.9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }
  const input = { flex: 1, minWidth: 0, border: "2px solid " + pal.border, borderRadius: 12, padding: "9px 11px", fontFamily: baseFont, fontSize: 16, color: pal.deep, background: pal.surface };
  return (
    <div style={{ background: pal.surface, border: "2px solid " + pal.accent, borderRadius: 18, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: pal.deep }}>查字小幫手</div>
        <button onClick={onClose} title="關閉" style={{ border: "none", background: "transparent", color: pal.muted, cursor: "pointer", fontSize: 18, fontWeight: 900, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ fontSize: 13, color: pal.muted, lineHeight: 1.6, marginBottom: 10 }}>想知道某個字怎麼寫？輸入那個字，或像「發揮的揮」這樣告訴我，會出現讀音和大大的寫法。</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go(); }} placeholder="例如：發揮的揮" style={input} />
        <MicButton value={q} setValue={setQ} pal={pal} />
        <button onClick={go} disabled={loading} style={{ border: "none", background: pal.accent, color: pal.onAccent, borderRadius: 12, padding: "9px 16px", fontFamily: baseFont, fontWeight: 800, cursor: "pointer", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>{loading ? "查…" : "查"}</button>
      </div>
      {err && <div style={{ marginTop: 8, fontSize: 13, color: pal.deep, fontWeight: 700 }}>{err}</div>}
      {res && (
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          <StrokeBox char={res.char} pal={pal} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: pal.deep }}>{res.zhuyin}</span>
              <span style={{ fontSize: 15, color: pal.muted, fontWeight: 700 }}>{res.pinyin}</span>
            </div>
            <div style={{ fontSize: 13.5, color: pal.muted, fontWeight: 700, marginTop: 4 }}>部首：{res.radical}　筆畫：{res.strokes}</div>
            <div style={{ fontSize: 15, color: pal.deep, lineHeight: 1.7, marginTop: 8 }}>{res.meaning}</div>
            {Array.isArray(res.words) && res.words.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {res.words.map((w, i) => (<span key={i} style={{ background: pal.soft, color: pal.deep, borderRadius: 999, padding: "4px 12px", fontSize: 13.5, fontWeight: 700 }}>{w}</span>))}
              </div>
            )}
            {(typeof window !== "undefined" && window.speechSynthesis) && (
              <button onClick={speak} style={{ marginTop: 10, border: "2px solid " + pal.accent, background: "transparent", color: pal.deep, borderRadius: 999, padding: "5px 14px", fontFamily: baseFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>念給你聽</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

