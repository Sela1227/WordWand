/* ====================================================================
   tool：主工具畫面(頂欄/精靈/主要計畫板按鈕/小幫手分頁/輸入與結果/語音/拍照/複製/朗讀)
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

/* ---------- 主工具 ---------- */
function Tool({ audience, stage, setStage, theme, setTheme, onExit }) {
  const [spiritKey, setSpiritKey] = useState("nini");
  const [mode, setMode] = useState("board");
  const [showLookup, setShowLookup] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [inputMsg, setInputMsg] = useState("");
  const [listening, setListening] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const isMid = audience === "mid";
  const variant = isMid ? theme : "cute";
  const pal = resolvePalette(variant, spiritKey);
  const S = makeStyles(pal);
  const cfg = MODES[mode];
  const spirit = SPIRITS[spiritKey];
  const skin = SPIRIT_SKINS[variant] || SPIRIT_SKINS.cute;
  const spiritInfo = skin[spiritKey];
  const modeName = (m) => isMid ? (m.titleFormal || m.title) : m.title;

  const visibleModes = Object.values(MODES).filter((m) => !m.stages || m.stages.includes(stage));
  const helperModes = visibleModes.filter((m) => m.key !== "board").sort((a, b) => (a.key === "idiom" ? 1 : 0) - (b.key === "idiom" ? 1 : 0));

  const SR = (typeof window !== "undefined") && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const voiceSupported = !!SR;

  function stopSpeak() { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); setSpeaking(false); }
  function resetOutputs() { setResult(null); setError(""); stopSpeak(); setCopyMsg(""); setInputMsg(""); }

  function changeStage(st) {
    setStage(st); resetOutputs();
    const ok = MODES[mode] && (!MODES[mode].stages || MODES[mode].stages.includes(st));
    if (!ok) setMode(Object.values(MODES).filter((m)=>!m.stages||m.stages.includes(st))[0].key);
  }

  function toggleVoice() {
    if (!voiceSupported) return;
    if (listening) { try { recognitionRef.current && recognitionRef.current.stop(); } catch(_){} return; }
    const rec = new SR();
    rec.lang = "zh-TW"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    const startText = text || "";
    rec.onstart = () => { setListening(true); setInputMsg("聆聽中…說說看你的句子"); };
    rec.onresult = (e) => { let s=""; for (let i=0;i<e.results.length;i++) s+=e.results[i][0].transcript; setText(startText + s); };
    rec.onerror = (e) => { setListening(false); setInputMsg(e.error==="not-allowed"||e.error==="service-not-allowed" ? "要先允許使用麥克風喔!" : "沒聽清楚,再說一次或直接打字吧!"); };
    rec.onend = () => { setListening(false); setInputMsg((m)=> m==="聆聽中…說說看你的句子" ? "" : m); };
    recognitionRef.current = rec;
    try { rec.start(); } catch(_) { setListening(false); }
  }
  function pickPhoto() { fileInputRef.current && fileInputRef.current.click(); }
  function fileToBase64(file) { return new Promise((res, rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(",")[1]); r.onerror=()=>rej(new Error("read")); r.readAsDataURL(file); }); }
  async function onPhoto(e) {
    const file = e.target.files && e.target.files[0]; e.target.value="";
    if (!file) return;
    if (file.size > 6*1024*1024) { setInputMsg("照片太大了,換一張小一點的吧!"); return; }
    if (BACKEND_URL.includes("YOUR-APP")) { setError("還沒設定後端網址喔!"); return; }
    setPhotoLoading(true); setInputMsg("讀照片中…");
    try {
      const b64 = await fileToBase64(file);
      const r = await apiPost("/read-image", { image_base64:b64, media_type:file.type||"image/jpeg" });
      if (!r.ok) { setInputMsg(r.message); return; }
      const t = (r.data && r.data.text || "").trim();
      if (!t) { setInputMsg("看不太清楚。靠近一點、避免反光、一次拍一小段再試！"); return; }
      setText(t);
      if (t.length > MAX_CHARS) setInputMsg(`照片讀到比較長的內容（${t.length} 字）。請留下想練習的一小段（${MAX_CHARS} 字內）再送出。`);
      else setInputMsg("讀好了！看看對不對，可以改一改再送出。");
    } catch(_) { setInputMsg("照片讀取失敗，再試一次或直接打字吧！"); }
    finally { setPhotoLoading(false); }
  }

  async function castMagic() {
    const input = text.trim();
    if (!input || loading) return;
    if (input.length > MAX_CHARS) { setError(lenMsg(input.length)); return; }
    setLoading(true); setResult(null); setError(""); stopSpeak(); setCopyMsg("");
    const r = await apiPost("/magic", { spirit:spiritKey, mode, stage, theme:variant, text:input });
    if (r.ok) setResult(r.data); else setError(r.message);
    setLoading(false);
  }

  function buildExportText(r) {
    const lines = [];
    if (r.upgraded) lines.push(r.upgraded);
    if (Array.isArray(r.items)) r.items.forEach((it)=>{ let l="・"+it.word+"："+it.meaning; if(it.why) l+="（"+((cfg.itemLabels&&cfg.itemLabels.why)||"提示")+"："+it.why+"）"; lines.push(l); });
    if (Array.isArray(r.questions)) r.questions.forEach((q,i)=>lines.push((i+1)+". "+q));
    return lines.join("\n");
  }
  function buildSpeechText(r) {
    const p=[]; if(r.upgraded)p.push(r.upgraded);
    if(Array.isArray(r.items))r.items.forEach((it)=>p.push(it.word+"。"+it.meaning+(it.why?"。"+it.why:"")));
    if(Array.isArray(r.questions))r.questions.forEach((q)=>p.push(q));
    return p.join("。");
  }
  async function copyResult() {
    if(!result) return; const txt=buildExportText(result);
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(txt); }
      else { const ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
      setCopyMsg("已複製!貼到哪裡都可以給老師看");
    } catch(_) { setCopyMsg("複製失敗,手動選取一下也可以喔!"); }
    setTimeout(()=>setCopyMsg(""), 2500);
  }
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.onvoiceschanged = warm;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch(_){} };
  }, []);

  function toggleSpeak() {
    if(typeof window==="undefined"||!window.speechSynthesis||!result) return;
    if(speaking){ stopSpeak(); return; }
    const u=new SpeechSynthesisUtterance(buildSpeechText(result));
    const v=chooseZhVoice();
    if(v){ u.voice=v; u.lang=v.lang||"zh-TW"; } else { u.lang="zh-TW"; }
    u.rate=0.95;
    u.onend=()=>setSpeaking(false); u.onerror=()=>setSpeaking(false);
    window.speechSynthesis.cancel(); setSpeaking(true); window.speechSynthesis.speak(u);
  }

  return (
    <div style={S.root}>
      <div className="ww-shell" style={S.shell}>
        <div style={S.topBar}>
          <button style={S.exitBtn} onClick={()=>{
            stopSpeak();
            if (boardHasAnyContent()) {
              const keep = window.confirm("這台裝置上還留著一份寫作計畫。\n\n按「確定」= 保留給下次使用\n按「取消」= 清除後再換身分（下一位使用者不會看到）");
              if (!keep) clearAllBoards();
            }
            onExit();
          }}>← 換身分</button>
          {isMid && (
            <div style={S.switcher}>
              <span style={S.switcherLabel}>年級</span>
              {MID_STAGES.map((st)=>{ const on=st.key===stage; return (
                <button key={st.key} onClick={()=>changeStage(st.key)} style={{...S.miniBtn, borderColor:on?pal.accent:pal.border, background:on?pal.accent:pal.surface, color:on?pal.onAccent:pal.muted}}>{st.label}</button>
              );})}
            </div>
          )}
          <button onClick={()=>setShowLookup(v=>!v)} style={{ marginLeft:"auto", border:"2px solid "+pal.accent, background: showLookup?pal.accent:pal.surface, color: showLookup?pal.onAccent:pal.deep, borderRadius:999, padding:"5px 14px", fontFamily:baseFont, fontWeight:800, fontSize:13, cursor:"pointer" }}>{showLookup?"關閉查字":"查字"}</button>
        </div>
        {isMid && (
          <div style={S.switcher}>
            <span style={S.switcherLabel}>風格</span>
            {MID_THEME_LIST.map((t)=>{ const on=t.key===theme; return (
              <button key={t.key} onClick={()=>{setTheme(t.key);}} style={{...S.miniBtn, borderColor:on?pal.accent:pal.border, background:on?pal.accent:pal.surface, color:on?pal.onAccent:pal.muted}}>{t.label}</button>
            );})}
          </div>
        )}

        {showLookup && <LookupPanel pal={pal} stage={stage} onClose={()=>setShowLookup(false)} />}

        <div style={S.switchRow}>
          <span style={S.switcherLabel}>精靈</span>
          {Object.entries(SPIRITS).map(([k,s])=>{ const on=k===spiritKey; return (
            <button key={k} onClick={()=>setSpiritKey(k)} style={{...S.spiritChip, borderColor:on?pal.accent:pal.border, background:on?pal.soft:pal.surface, color:on?pal.deep:pal.muted}}>
              <Spirit variant={variant} type={k} color={pal.cute ? s.color : pal.accent} pal={pal} size={26} animate={false} />{skin[k].name}
            </button>
          );})}
        </div>

        <button onClick={()=>{setMode("board");resetOutputs();}}
          style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2, border:"2px solid "+pal.accent, borderRadius:18, padding:"13px 18px", fontFamily:baseFont, cursor:"pointer", marginBottom:14, background: mode==="board"?pal.accent:pal.surface, color: mode==="board"?pal.onAccent:pal.deep, boxShadow: mode==="board"?pal.shadow:"none" }}>
          <span style={{fontWeight:900, fontSize:18}}>寫作計畫板</span>
          <span style={{fontSize:12.5, fontWeight:600, opacity:0.88}}>從這裡開始・規劃整篇文章</span>
        </button>

        <div style={{fontSize:12.5, fontWeight:700, color:pal.muted, margin:"0 4px 8px"}}>寫作小幫手(需要時再點)</div>
        <div className="ww-tabs" style={S.tabs}>
          {helperModes.map((m)=>{ const on=m.key===mode; return (
            <button key={m.key} onClick={()=>{setMode(m.key);resetOutputs();}} style={{...S.tab, background:on?pal.surface:"transparent", color:on?pal.deep:pal.muted, boxShadow:on?pal.shadow:"none"}}>{modeName(m)}</button>
          );})}
        </div>

        {mode==="board" ? (<Board pal={pal} stage={stage} spiritKey={spiritKey} theme={variant} isMid={isMid} />) : (<div className="ww-body">
        <div className="ww-col-left">
        <div style={{...S.heroCard, background:pal.soft}}>
          {pal.cute && (<><Sparkle top={14} left={"18%"} size={14} delay={0} /><Sparkle top={30} left={"82%"} size={18} delay={0.7} /><Sparkle top={86} left={"8%"} size={12} delay={1.3} /></>)}
          <div style={S.heroRow}>
            <Spirit variant={variant} type={spiritKey} color={pal.accent} pal={pal} size={78} />
            <div style={{flex:1, minWidth:0}}>
              <div style={{...S.pill, background:pal.accent, color:pal.onAccent}}>你的寫作小教練</div>
              <div style={{...S.heroName, color:pal.deep}}>{spiritInfo.tag}的【{spiritInfo.name}】</div>
            </div>
          </div>
          <div style={{...S.heroQuote, color:pal.deep}}>「{spiritInfo.intro}」</div>
        </div>

        <div style={S.blurbCard}>
          <div style={{...S.blurbTitle, color:pal.deep}}>{modeName(cfg)}</div>
          <div style={S.blurbText}>{cfg.blurb}</div>
        </div>

        <div style={S.inputLabel}>{cfg.inputLabel || "輸入你想練習的句子:"}</div>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder={cfg.placeholder} rows={3} style={S.textarea} />
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", margin:"4px 4px 0", fontSize:12.5, fontWeight:700}}>
          <span style={{color: text.length>MAX_CHARS ? "#D9534F" : pal.muted}}>{lenMsg(text.length)}</span>
          <span style={{color: text.length>MAX_CHARS ? "#D9534F" : pal.muted}}>{text.length} / {MAX_CHARS}</span>
        </div>

        {mode==="argue" && ISSUE_TOPICS[stage] && (
          <div style={{marginTop:10}}>
            <div style={{...S.switcherLabel, margin:"0 2px 6px"}}>議題類別(點一個來腦力激盪):</div>
            <div style={S.exampleRow}>
              {ISSUE_TOPICS[stage].map((topic,i)=>(
                <button key={i} style={S.exChip} onClick={()=>{setText(topic);}}>{topic}</button>
              ))}
            </div>
          </div>
        )}

        <div style={S.toolRow}>
          {voiceSupported && (
            <button onClick={toggleVoice} style={{...S.toolBtn, borderColor:pal.accent, background:listening?pal.accent:pal.surface, color:listening?pal.onAccent:pal.deep, animation:listening?"pulse 1.2s ease-in-out infinite":"none"}}>
              <MicIcon color={listening?pal.onAccent:pal.deep} />{listening?"停止":"用說的"}
            </button>
          )}
          <button onClick={pickPhoto} disabled={photoLoading} style={{...S.toolBtn, borderColor:pal.accent, background:pal.surface, color:pal.deep, opacity:photoLoading?0.6:1}}>
            <CamIcon color={pal.deep} />{photoLoading?"讀照片中…":"拍照輸入"}
          </button>
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={onPhoto} style={{display:"none"}} />
        </div>
        {inputMsg && <div style={{...S.inputMsg, color:pal.deep}}>{inputMsg}</div>}

        <div style={S.exampleRow}>
          {cfg.examples.map((ex,i)=>(<button key={i} style={S.exChip} onClick={()=>setText(ex)}>{ex.length>12?ex.slice(0,12)+"…":ex}</button>))}
        </div>

        <button onClick={castMagic} disabled={loading||!text.trim()||text.length>MAX_CHARS} style={{...S.castBtn, background:pal.accent, color:pal.onAccent, opacity:(loading||!text.trim()||text.length>MAX_CHARS)?0.55:1, cursor:(loading||!text.trim()||text.length>MAX_CHARS)?"default":"pointer"}}>
          {loading ? "施展魔法中…" : (cfg.btn || "變身!")}
        </button>
        </div>

        <div className="ww-col-right">
        {!loading && !error && !result && (
          <div className="ww-rightholder" style={{flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:12,border:"2px dashed "+pal.border,borderRadius:24,padding:"44px 20px",color:pal.muted,minHeight:240}}>
            <Spirit variant={variant} type={spiritKey} color={pal.accent} pal={pal} size={60} animate={false} />
            <div style={{fontWeight:700,fontSize:14.5,lineHeight:1.6}}>寫好後按下按鈕,<br/>小精靈的回應會出現在這裡</div>
          </div>
        )}

        {loading && (
          <div style={S.loadingBox}>
            <Spirit variant={variant} type={spiritKey} color={pal.accent} pal={pal} size={56} />
            <div style={S.dots}><span style={{...S.dot, background:pal.accent}} /><span style={{...S.dot, background:pal.accent, animationDelay:"0.2s"}} /><span style={{...S.dot, background:pal.accent, animationDelay:"0.4s"}} /></div>
          </div>
        )}

        {error && <div style={S.errorBox}>{error}</div>}

        {result && !loading && result.ok === false && (
          <div style={S.resultWrap}>
            <div style={{...S.cheerCard, background:pal.soft, color:pal.deep}}>
              <Spirit variant={variant} type={spiritKey} color={pal.accent} pal={pal} size={44} animate={false} />
              <span>{result.redirect || "我們在作文魔法屋只幫你做寫作練習喔!請給我一個適合的題目或句子吧!"}</span>
            </div>
          </div>
        )}

        {result && !loading && result.ok !== false && (
          <div style={S.resultWrap}>
            {result.upgraded && (
              <div style={{...S.resultTop, borderColor:pal.accent}}>
                <div style={{...S.resultTag, color:pal.deep}}>完成</div>
                <div style={S.upgraded}>{result.upgraded}</div>
              </div>
            )}
            {!result.upgraded && cfg.resultHint && (<div style={{...S.hintLine, color:pal.deep}}>{cfg.resultHint}</div>)}
            {Array.isArray(result.items) && result.items.map((it,i)=>(
              <div key={i} style={{...S.idiomCard, animationDelay:`${i*0.08}s`}}>
                <div style={{...S.idiomWord, background:pal.soft, color:pal.deep}}>{it.word}</div>
                <div style={S.idiomBody}>
                  <div><b style={{color:pal.deep}}>{(cfg.itemLabels&&cfg.itemLabels.meaning)||"說明"}:</b>{it.meaning}</div>
                  {it.why && <div style={{marginTop:4}}><b style={{color:pal.deep}}>{(cfg.itemLabels&&cfg.itemLabels.why)||"提示"}:</b>{it.why}</div>}
                </div>
              </div>
            ))}
            {Array.isArray(result.questions) && result.questions.map((q,i)=>(
              <div key={i} style={{...S.qCard, animationDelay:`${i*0.08}s`}}>
                <div style={{...S.qNum, background:pal.soft, color:pal.deep}}>{i+1}</div>
                <div style={S.qText}>{q}</div>
              </div>
            ))}
            {result.cheer && (
              <div style={{...S.cheerCard, background:pal.soft, color:pal.deep}}>
                <Spirit variant={variant} type={spiritKey} color={pal.accent} pal={pal} size={44} animate={false} />
                <span>{result.cheer}</span>
              </div>
            )}
            <div style={S.resultActions}>
              <button onClick={copyResult} style={{...S.toolBtn, borderColor:pal.accent, background:pal.surface, color:pal.deep}}><CopyIcon color={pal.deep} />複製給老師看</button>
              {(typeof window!=="undefined" && window.speechSynthesis) && (
                <button onClick={toggleSpeak} style={{...S.toolBtn, borderColor:pal.accent, background:speaking?pal.accent:pal.surface, color:speaking?pal.onAccent:pal.deep, animation:speaking?"pulse 1.2s ease-in-out infinite":"none"}}><SpeakIcon color={speaking?pal.onAccent:pal.deep} />{speaking?"停止":"念給你聽"}</button>
              )}
            </div>
            {copyMsg && <div style={{...S.inputMsg, color:pal.deep}}>{copyMsg}</div>}
          </div>
        )}
        </div>
        </div>)}

        <div style={S.foot}>WordWand　·　作文魔法屋　·　{VERSION}</div>
      </div>
    </div>
  );
}

