/* ====================================================================
   gate：入口門檻頁(國小直接進／中學通行碼→選國中高中)
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

/* ---------- 入口門檻頁 ---------- */
function Gate({ onEnter }) {
  const [step, setStep] = useState("choose");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div style={G.root}>
      <div className="ww-gate-inner" style={G.inner}>
        <div style={G.brand}>WordWand</div>
        <div style={G.title}>作文魔法屋</div>
        <div style={G.sub}>請先選擇身分</div>
        {step==="choose" && (
          <div className="ww-gate-choose">
            <button style={G.cardES} onClick={()=>onEnter("es","es","cute")}>
              <span style={G.cardBig}>國小</span>
              <span style={G.cardSmall}>可愛精靈陪你練作文</span>
            </button>
            <button style={G.cardMID} onClick={()=>{setStep("pw");setErr("");}}>
              <span style={G.cardBig}>中學</span>
              <span style={G.cardSmall}>國中・高中,可自由換風格</span>
            </button>
          </div>
        )}
        {step==="pw" && (<>
          <div style={G.label}>請輸入中學通行碼</div>
          <input type="password" value={pw} inputMode="numeric"
            onChange={(e)=>setPw(e.target.value)} style={G.input} placeholder="• • • •" />
          {err && <div style={G.err}>{err}</div>}
          <button style={G.primary} onClick={()=>{ if(pw===MID_PASSWORD){setStep("stage");setErr("");} else {setErr("通行碼不對喔!再試一次。");} }}>確認</button>
          <button style={G.ghost} onClick={()=>{setStep("choose");setPw("");setErr("");}}>返回</button>
        </>)}
        {step==="stage" && (<>
          <div style={G.label}>選擇年級</div>
          <button style={G.primary} onClick={()=>onEnter("mid","jh","nordic")}>國中</button>
          <button style={G.primary} onClick={()=>onEnter("mid","sh","nordic")}>高中</button>
          <button style={G.ghost} onClick={()=>{setStep("choose");setPw("");}}>返回</button>
        </>)}
        <div style={G.foot}>WordWand · 作文魔法屋 · {VERSION}</div>
      </div>
    </div>
  );
}

