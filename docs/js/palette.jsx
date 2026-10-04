/* ====================================================================
   palette：主題配色解析(resolvePalette)、主題化樣式(makeStyles)、門檻頁靜態樣式(G)
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

function resolvePalette(theme, spiritKey) {
  const t = THEMES[theme] || THEMES.cute;
  if (t.cute) {
    const sp = SPIRITS[spiritKey];
    return { ...t, accent:sp.color, soft:sp.soft, deep:sp.deep };
  }
  return t;
}

/* ---------- 主題化樣式 ---------- */
function makeStyles(pal) { return {
  root:{ fontFamily:baseFont, background:pal.bg, color:pal.text, minHeight:"100vh", padding:"calc(14px + env(safe-area-inset-top)) calc(12px + env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) calc(12px + env(safe-area-inset-left))", boxSizing:"border-box" },
  shell:{ maxWidth:460, margin:"0 auto" },
  topBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10, flexWrap:"wrap" },
  exitBtn:{ border:"none", background:"transparent", color:pal.muted, fontFamily:baseFont, fontWeight:700, fontSize:13.5, cursor:"pointer", padding:"4px 2px" },
  switcher:{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:10 },
  switcherLabel:{ fontSize:12.5, color:pal.muted, fontWeight:700 },
  miniBtn:{ border:"2px solid", borderRadius:999, padding:"6px 14px", fontFamily:baseFont, fontWeight:700, fontSize:13.5, cursor:"pointer", transition:"all .15s" },
  tabs:{ display:"flex", flexWrap:"wrap", gap:6, background:pal.tabsBg, padding:5, borderRadius:18, marginBottom:16 },
  tab:{ flex:"1 1 calc(50% - 3px)", border:"none", borderRadius:14, padding:"11px 8px", fontFamily:baseFont, fontWeight:700, fontSize:15, cursor:"pointer", transition:"all .2s" },
  heroCard:{ position:"relative", borderRadius:28, padding:"20px 18px", overflow:"hidden", boxShadow:pal.shadow },
  heroRow:{ display:"flex", gap:12, alignItems:"center" },
  pill:{ display:"inline-block", fontWeight:700, fontSize:12, padding:"4px 12px", borderRadius:999, marginBottom:6 },
  heroName:{ fontWeight:900, fontSize:20, lineHeight:1.3 },
  heroQuote:{ marginTop:14, fontSize:14.5, lineHeight:1.7, fontWeight:500, opacity:0.92 },
  switchRow:{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", margin:"16px 2px" },
  spiritChip:{ display:"inline-flex", alignItems:"center", gap:6, border:"2.5px solid", borderRadius:999, padding:"6px 14px 6px 8px", fontFamily:baseFont, fontWeight:700, fontSize:14, cursor:"pointer", transition:"all .18s" },
  blurbCard:{ background:pal.surface, borderRadius:22, padding:"16px 18px", boxShadow:pal.shadow },
  blurbTitle:{ fontWeight:900, fontSize:17, marginBottom:8 },
  blurbText:{ fontSize:14, lineHeight:1.7, color:pal.muted },
  inputLabel:{ margin:"18px 4px 8px", fontSize:14, fontWeight:700, color:pal.muted },
  textarea:{ width:"100%", boxSizing:"border-box", border:"2.5px solid "+pal.border, borderRadius:18, padding:"14px 16px", fontFamily:baseFont, fontSize:16, lineHeight:1.6, resize:"vertical", outline:"none", background:pal.surface, color:pal.text },
  toolRow:{ display:"flex", gap:8, flexWrap:"wrap", margin:"10px 2px 0" },
  toolBtn:{ display:"inline-flex", alignItems:"center", gap:6, border:"2px solid", borderRadius:999, padding:"9px 16px", fontFamily:baseFont, fontWeight:700, fontSize:14, cursor:"pointer", transition:"all .15s" },
  inputMsg:{ margin:"8px 4px 0", fontSize:13.5, fontWeight:700, lineHeight:1.5 },
  exampleRow:{ display:"flex", gap:8, flexWrap:"wrap", margin:"10px 2px 0" },
  exChip:{ border:"2px dashed "+pal.border, background:pal.surface, borderRadius:999, padding:"9px 14px", fontFamily:baseFont, fontSize:13, color:pal.muted, cursor:"pointer" },
  castBtn:{ width:"100%", marginTop:16, border:"none", borderRadius:20, padding:"16px", fontFamily:baseFont, fontWeight:900, fontSize:18, letterSpacing:2, boxShadow:pal.shadow },
  loadingBox:{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"22px 0 6px" },
  dots:{ display:"flex", gap:8 },
  dot:{ width:11, height:11, borderRadius:999, display:"inline-block", animation:"dotjump 1s ease-in-out infinite" },
  errorBox:{ marginTop:16, background:pal.soft, border:"2px solid "+pal.accent, borderRadius:16, padding:"14px 16px", color:pal.deep, fontSize:14, lineHeight:1.6, textAlign:"center", fontWeight:600 },
  resultWrap:{ marginTop:18 },
  resultTop:{ background:pal.surface, borderRadius:22, padding:"16px 18px", border:"2.5px solid", boxShadow:pal.shadow, animation:"rise .4s ease both" },
  resultTag:{ fontWeight:900, fontSize:13, letterSpacing:1, marginBottom:6 },
  upgraded:{ fontSize:18, lineHeight:1.8, fontWeight:700, color:pal.text },
  hintLine:{ fontWeight:800, fontSize:15, margin:"2px 4px 4px", lineHeight:1.5 },
  idiomCard:{ display:"flex", gap:12, background:pal.surface, borderRadius:18, padding:"14px 16px", marginTop:12, boxShadow:pal.shadow, animation:"rise .4s ease both" },
  idiomWord:{ flexShrink:0, alignSelf:"flex-start", fontWeight:900, fontSize:16, padding:"8px 12px", borderRadius:14, minWidth:56, textAlign:"center" },
  idiomBody:{ fontSize:14, lineHeight:1.7, color:pal.text },
  qCard:{ display:"flex", gap:12, alignItems:"flex-start", background:pal.surface, borderRadius:18, padding:"14px 16px", marginTop:12, boxShadow:pal.shadow, animation:"rise .4s ease both" },
  qNum:{ flexShrink:0, width:30, height:30, borderRadius:999, fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" },
  qText:{ fontSize:15.5, lineHeight:1.7, color:pal.text, paddingTop:3 },
  cheerCard:{ display:"flex", alignItems:"center", gap:10, borderRadius:20, padding:"14px 16px", marginTop:14, fontSize:15, fontWeight:700, lineHeight:1.6, animation:"rise .4s ease both" },
  resultActions:{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 },
  foot:{ textAlign:"center", marginTop:22, fontSize:12, color:pal.muted, fontWeight:600, letterSpacing:1 },
}; }


/* ---------- 門檻頁靜態樣式 ---------- */
const G = {
  root:{ fontFamily:baseFont, minHeight:"100vh", background:"radial-gradient(120% 120% at 50% 0%, #E6F5FF 0%, #F1FAFF 40%, #FFEFF6 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", boxSizing:"border-box" },
  inner:{ width:"100%", maxWidth:380, textAlign:"center" },
  brand:{ fontWeight:900, fontSize:18, color:"#54B9EC", letterSpacing:1 },
  title:{ fontWeight:900, fontSize:30, color:"#3A2E3F", marginTop:4 },
  sub:{ fontSize:15, color:"#9A8FA0", fontWeight:600, margin:"10px 0 22px" },
  cardES:{ width:"100%", border:"none", borderRadius:24, padding:"22px", marginBottom:14, background:"linear-gradient(135deg,#FFE4EE,#DCF1FC)", color:"#C84B77", cursor:"pointer", display:"flex", flexDirection:"column", gap:4, boxShadow:"0 10px 24px rgba(180,120,160,0.18)" },
  cardMID:{ width:"100%", border:"none", borderRadius:24, padding:"22px", background:"linear-gradient(135deg,#E7EEF2,#D7E3EA)", color:"#39647F", cursor:"pointer", display:"flex", flexDirection:"column", gap:4, boxShadow:"0 10px 24px rgba(90,120,140,0.18)" },
  cardBig:{ fontWeight:900, fontSize:24 },
  cardSmall:{ fontSize:13.5, fontWeight:600, opacity:0.85 },
  label:{ fontSize:15, fontWeight:700, color:"#3A2E3F", margin:"6px 0 12px" },
  input:{ width:"100%", boxSizing:"border-box", border:"2.5px solid #D7E3EA", borderRadius:16, padding:"14px 16px", fontFamily:baseFont, fontSize:20, textAlign:"center", letterSpacing:6, outline:"none", color:"#3A2E3F" },
  err:{ color:"#C0392B", fontSize:13.5, fontWeight:700, marginTop:10 },
  primary:{ width:"100%", border:"none", borderRadius:18, padding:"15px", marginTop:12, background:"#5C8AA6", color:"#fff", fontFamily:baseFont, fontWeight:900, fontSize:17, letterSpacing:1, cursor:"pointer" },
  ghost:{ width:"100%", border:"none", background:"transparent", color:"#9A8FA0", fontFamily:baseFont, fontWeight:700, fontSize:14, marginTop:10, cursor:"pointer" },
  foot:{ marginTop:24, fontSize:12, color:"#B6A8B8", fontWeight:600 },
};

