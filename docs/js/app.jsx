/* ====================================================================
   app：Root(門檻↔主工具)、掛載 React、註冊 Service Worker
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

function Root() {
  const [view, setView] = useState("gate");
  const [audience, setAudience] = useState("es");
  const [stage, setStage] = useState("es");
  const [theme, setTheme] = useState("cute");
  if (view === "gate") return <Gate onEnter={(a,s,t)=>{ setAudience(a); setStage(s); setTheme(t); setView("app"); }} />;
  return <Tool audience={audience} stage={stage} setStage={setStage} theme={theme} setTheme={setTheme} onExit={()=>setView("gate")} />;
}


ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
