/* ====================================================================
   icons：精靈造型(可愛/北歐/科幻)、Spirit 分派、Sparkle、各種小圖示
   零 build:由 index.html 以 <script type="text/babel" src> 依序載入；
   各檔頂層宣告共享全域詞法作用域（勿重複宣告同名；載入順序見 index.html）。
   ==================================================================== */

/* ---------- 圖示 ---------- */
function Mascot({ type, color, size=72, animate=true }) {
  const eye = "#3A2E3F";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ animation: animate ? "bob 2.6s ease-in-out infinite" : "none" }}>
      <ellipse cx="38" cy="92" rx="9" ry="6" fill={color} opacity="0.85" />
      <ellipse cx="62" cy="92" rx="9" ry="6" fill={color} opacity="0.85" />
      <path d="M50 12 C74 12 86 30 86 52 C86 76 70 90 50 90 C30 90 14 76 14 52 C14 30 26 12 50 12 Z" fill={color} />
      <ellipse cx="50" cy="58" rx="24" ry="22" fill="#FFFFFF" opacity="0.4" />
      <circle cx="30" cy="58" r="6" fill="#FF6F91" opacity="0.5" />
      <circle cx="70" cy="58" r="6" fill="#FF6F91" opacity="0.5" />
      {type==="nini" && (<>
        <path d="M34 46 q5 6 10 0" stroke={eye} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M56 46 q5 6 10 0" stroke={eye} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M44 56 q6 5 12 0" stroke={eye} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M40 16 l8 6 -8 6 z" fill="#FFFFFF" opacity="0.9" /><path d="M60 16 l-8 6 8 6 z" fill="#FFFFFF" opacity="0.9" /><circle cx="50" cy="22" r="3" fill="#FFFFFF" />
      </>)}
      {type==="kiki" && (<>
        <circle cx="38" cy="48" r="3.5" fill={eye} /><circle cx="62" cy="48" r="3.5" fill={eye} />
        <circle cx="38" cy="48" r="10" fill="none" stroke={eye} strokeWidth="2.5" /><circle cx="62" cy="48" r="10" fill="none" stroke={eye} strokeWidth="2.5" />
        <line x1="48" y1="48" x2="52" y2="48" stroke={eye} strokeWidth="2.5" /><path d="M44 58 q6 4 12 0" stroke={eye} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>)}
      {type==="max" && (<>
        <circle cx="38" cy="48" r="6" fill={eye} /><circle cx="62" cy="48" r="6" fill={eye} />
        <circle cx="40" cy="46" r="2" fill="#FFFFFF" /><circle cx="64" cy="46" r="2" fill="#FFFFFF" />
        <path d="M42 58 q8 8 16 0" stroke={eye} strokeWidth="3.5" fill="none" strokeLinecap="round" /><path d="M50 6 l-7 14 h6 l-4 12 12 -16 h-6 l5 -10 z" fill="#FFFFFF" />
      </>)}
    </svg>
  );
}
function NordicPal({ type, color, surface="#FFFFFF", size=72, animate=true }) {
  const ink = "#2E3A44";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ animation: animate ? "bob 3s ease-in-out infinite" : "none" }}>
      <path d="M50 16 C72 16 84 31 84 52 C84 73 70 86 50 86 C30 86 16 73 16 52 C16 31 28 16 50 16 Z" fill={surface} stroke={color} strokeWidth="3" />
      <circle cx="40" cy="52" r="3" fill={ink} /><circle cx="60" cy="52" r="3" fill={ink} />
      {type==="nini" && <path d="M42 62 q8 5 16 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      {type==="kiki" && (<><circle cx="40" cy="52" r="7" fill="none" stroke={color} strokeWidth="2" /><circle cx="60" cy="52" r="7" fill="none" stroke={color} strokeWidth="2" /><line x1="47" y1="52" x2="53" y2="52" stroke={color} strokeWidth="2" /></>)}
      {type==="max" && <path d="M43 60 l7 7 7 -7" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {type==="nini" && <path d="M50 7 q7 6 0 11 q-7 -5 0 -11 z" fill={color} />}
      {type==="kiki" && <rect x="43" y="6" width="14" height="9" rx="2" fill={color} />}
      {type==="max" && <path d="M50 4 l5 9 -10 0 z" fill={color} />}
    </svg>
  );
}
function ScifiBot({ type, color, surface="#171E38", size=72, animate=true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ animation: animate ? "bob 3s ease-in-out infinite" : "none" }}>
      <line x1="50" y1="6" x2="50" y2="17" stroke={color} strokeWidth="3" strokeLinecap="round" /><circle cx="50" cy="6" r="3.5" fill={color} />
      <rect x="20" y="18" width="60" height="58" rx="16" fill={surface} stroke={color} strokeWidth="3" />
      <rect x="29" y="33" width="42" height="24" rx="12" fill="#0C1022" stroke={color} strokeWidth="2" />
      <circle cx="42" cy="45" r="3.6" fill={color} /><circle cx="58" cy="45" r="3.6" fill={color} />
      {type==="nini" && <path d="M36 66 q14 6 28 0" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
      {type==="kiki" && <path d="M40 66 h20 M50 62 v8" stroke={color} strokeWidth="2.4" strokeLinecap="round" />}
      {type==="max" && <path d="M37 68 l8 -6 5 5 8 -7" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <circle cx="20" cy="48" r="3" fill={color} /><circle cx="80" cy="48" r="3" fill={color} />
    </svg>
  );
}
function Spirit({ variant, type, color, pal, size=72, animate=true }) {
  if (variant === "scifi") return <ScifiBot type={type} color={color} surface={pal.surface} size={size} animate={animate} />;
  if (variant === "nordic") return <NordicPal type={type} color={color} surface={pal.surface} size={size} animate={animate} />;
  return <Mascot type={type} color={color} size={size} animate={animate} />;
}
function Sparkle({ top, left, size=16, delay=0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position:"absolute", top, left, animation:`twinkle 2.4s ease-in-out ${delay}s infinite`, pointerEvents:"none" }}>
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
function MicIcon({ color }) { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 11 a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></svg>); }
function CamIcon({ color }) { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7 h3 l1.5 -2 h7 L23 7" /><rect x="3" y="7" width="18" height="13" rx="3" /><circle cx="12" cy="13.5" r="3.5" /></svg>); }
function CopyIcon({ color }) { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15 H4.5 A1.5 1.5 0 0 1 3 13.5 V4.5 A1.5 1.5 0 0 1 4.5 3 h9 A1.5 1.5 0 0 1 15 4.5 V5" /></svg>); }
function SpeakIcon({ color }) { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9 v6 h4 l5 4 V5 l-5 4 z" /><path d="M17 8 a5 5 0 0 1 0 8" /></svg>); }

