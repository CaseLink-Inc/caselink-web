// CaseLink — Onboarding walkthrough video (v2: real product flow, liquid-glass)
// Self-contained: minimal timeline engine + onboarding screens + composition.
// Mounted by the DC via <x-import component="OnboardingVideo" from="./video.jsx">.

const { useState, useEffect, useRef, createContext, useContext } = React;

/* ============================================================
   Brand tokens (from CaseLink prototype + design system)
   ============================================================ */
const ONB = {
  ink:'#1A1F1E', text:'#4A5250', mute:'#7A8886', faint:'#B8C2C0',
  line:'#E8EEF8', lineSoft:'#EEF3F2',
  accent:'#3E8EFF', accentSoft:'#EBF3FF',
  green:'#22C97A', greenSoft:'#E6FAF1',
  amber:'#FFA940', amberSoft:'#FFF4E6',
  red:'#F04A5C', redSoft:'#FEF0F2',
  purple:'#A855F7', purpleSoft:'#F3E8FF',
  page:'#EEF3FB',
};
const HEADER_GRAD = 'linear-gradient(90deg,rgba(255,199,148,0.30),rgba(144,240,197,0.24) 48%,rgba(62,142,255,0.26))';
const FONT = "'Satoshi','Plus Jakarta Sans',system-ui,sans-serif";
const SCRIPT = "'Segoe Script','Brush Script MT','Apple Chancery',cursive";

/* ============================================================
   Math / easing helpers
   ============================================================ */
const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const easeSine = t => (1 - Math.cos(Math.PI * t)) / 2;
const easeOutStrong = t => 1 - Math.pow(1 - t, 4);
const easeOutBack = t => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
function interp(t, ins, outs, ease=easeInOut){
  if (t <= ins[0]) return outs[0];
  if (t >= ins[ins.length-1]) return outs[outs.length-1];
  let i = 0; while (t > ins[i+1]) i++;
  const local = (t - ins[i]) / (ins[i+1] - ins[i]);
  return lerp(outs[i], outs[i+1], ease(local));
}
function enterExit(t, start, end, inDur=0.85, outDur=0.6){
  const ein = easeOut(clamp((t - start + 0.25) / inDur));
  const eout = easeInOut(clamp((end + 0.15 - t) / outDur));
  const opacity = ein * eout;
  const b = (1 - ein) * 18 + (1 - eout) * 18;
  const scale = 1 + (1 - ein) * 0.025 - (1 - eout) * 0.015;
  return { opacity, transform:'scale(' + scale + ')', filter: b > 0.2 ? 'blur(' + b.toFixed(2) + 'px)' : 'none', visible: opacity > 0.004 };
}
function clickAt(lt, times){
  for (const c of times) { const d = lt - c; if (d >= -0.001 && d < 0.72) return d; }
  return null;
}

/* ============================================================
   Liquid-glass surface helpers
   ============================================================ */
// Iridescent rim + deep blur + inner bloom: the surface refracts what sits behind it.
const glass = (radius=18, tint=0.72) => ({
  background:`linear-gradient(150deg, rgba(255,255,255,${Math.min(1,tint+0.20)}) 0%, rgba(255,255,255,${tint}) 44%, rgba(255,255,255,${Math.max(0,tint-0.16)}) 100%) padding-box,`
    + ' linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(62,142,255,0.42) 20%, rgba(144,240,197,0.32) 50%, rgba(255,199,148,0.40) 76%, rgba(255,255,255,0.95) 100%) border-box',

  border:'1.5px solid transparent',
  borderRadius:radius,
  boxShadow:'0 6px 14px rgba(24,38,58,0.08), inset 0 1.5px 1px rgba(255,255,255,0.98)',
});

// Specular sheen that sweeps across a glass surface. p: 0→1 sweep progress.
function Sheen({ p, radius=14, strength=0.55 }){
  if (p == null || p <= 0 || p >= 1) return null;
  const x = -40 + p * 180;
  const fade = Math.sin(p * Math.PI);
  return (
    <span style={{ position:'absolute', inset:0, borderRadius:radius, clipPath:`inset(0 round ${radius}px)`, pointerEvents:'none' }}>
      <span style={{ position:'absolute', top:'-30%', bottom:'-30%', left:x+'%', width:'40%',
        background:`linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${(strength*fade*0.45).toFixed(3)}) 30%, rgba(255,255,255,${(strength*fade).toFixed(3)}) 50%, rgba(255,255,255,${(strength*fade*0.45).toFixed(3)}) 70%, rgba(255,255,255,0) 100%)`,
        transform:'skewX(-18deg)' }} />
    </span>
  );
}

// Glowing liquid rim — the brand gradient bloomed behind a surface while it's "live".
function GlowRim({ on, radius=14, spread=7, blur=15, opacity=0.62, pulse=0 }){
  if (!on) return null;
  const o = opacity * (0.78 + 0.22 * Math.sin(pulse * 4.2));
  return (
    <span style={{ position:'absolute', inset:-spread, borderRadius:radius+spread, pointerEvents:'none',
      background:'linear-gradient(120deg,#3E8EFF,#90F0C5 52%,#FFC794)', filter:`blur(${blur}px)`, opacity:o }} />
  );
}

/* ============================================================
   Timeline engine
   ============================================================ */
const TimeCtx = createContext(0);
const useTime = () => useContext(TimeCtx);
const STORE_KEY = 'caselink_intro7_t';

function Stage({ width, height, duration, background, children }){
  const [t, setT] = useState(() => {
    const v = parseFloat(localStorage.getItem(STORE_KEY) || '0');
    return isNaN(v) ? 0 : Math.min(v, duration);
  });
  const [playing, setPlaying] = useState(true);
  const [scale, setScale] = useState(1);
  const tRef = useRef(t); tRef.current = t;
  const playingRef = useRef(playing); playingRef.current = playing;
  const [sound, setSound] = useState(() => localStorage.getItem('caselink_onb_sound') !== 'off');
  const jump = n => { setT(n); localStorage.setItem(STORE_KEY, String(n)); if (AudioEng.live()) AudioEng.start(n); };
  useEffect(() => { AudioEng.setEnabled(sound); if (playing && sound) AudioEng.start(tRef.current); else AudioEng.stop(); }, [playing, sound]);
  useEffect(() => {
    const wake = () => { if (playingRef.current && AudioEng.isEnabled() && !AudioEng.live()) AudioEng.start(tRef.current); };
    window.addEventListener('pointerdown', wake); window.addEventListener('keydown', wake);
    return () => { window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); AudioEng.stop(); };
  }, []);
  const raf = useRef(0);
  const last = useRef(0);
  // a few extra renders after mount/seek so the camera can measure its focus targets
  const [, bump] = useState(0);
  const settleFrames = () => { let k = 0; const step = () => { bump(v => v + 1); if (++k < 3) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  useEffect(() => { settleFrames(); const iv = setInterval(() => bump(v => v + 1), 500); return () => clearInterval(iv); }, []);

  useEffect(() => {
    let raf = 0;
    const fit = () => {
      const s = Math.min(window.innerWidth / width, window.innerHeight / height);
      if (s > 0) setScale(s); else raf = requestAnimationFrame(fit);
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(document.documentElement);
    return () => { window.removeEventListener('resize', fit); if (ro) ro.disconnect(); cancelAnimationFrame(raf); };
  }, [width, height]);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = now => {
      const dt = (now - last.current) / 1000; last.current = now;
      setT(prev => {
        let n = prev + Math.min(dt, 0.1);
        if (AudioEng.live() && now - (window.__lastSync || 0) > 1500 && Math.abs(AudioEng.now() - n) > 0.25) { window.__lastSync = now; AudioEng.start(n); }
        if (n >= duration) { n = duration; setPlaying(false); }
        if (Math.floor(n * 2) !== Math.floor(prev * 2) || n >= duration) localStorage.setItem(STORE_KEY, String(n));
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.key === 'ArrowRight') jump(Math.min(duration, tRef.current + 1));
      else if (e.key === 'ArrowLeft') jump(Math.max(0, tRef.current - 1));
      else if (e.key === '0') jump(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const seek = frac => {
    const n = clamp(frac, 0, 1) * duration;
    setT(n); localStorage.setItem(STORE_KEY, String(n)); setPlaying(false); settleFrames();
  };

  useEffect(() => {
    window.__seek = (n) => { setPlaying(false); setT(n); localStorage.setItem(STORE_KEY, String(n)); settleFrames(); };
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'#0b0e0d', display:'flex',
      alignItems:'center', justifyContent:'center', overflow:'hidden', fontFamily:FONT }}>
      <div style={{ width, height, transform:`scale(${scale})`, transformOrigin:'center center',
        position:'relative', overflow:'hidden', background, flexShrink:0 }}>
        <TimeCtx.Provider value={t}>{children}</TimeCtx.Provider>
      </div>
      {!/[?&#](record|clean)/.test(location.search + location.hash) && !(sound && AudioEng.live()) && (
        <button onPointerDown={e => { e.stopPropagation(); localStorage.setItem('caselink_onb_sound', 'on'); setSound(true); AudioEng.setEnabled(true); setPlaying(true); AudioEng.start(tRef.current); }}
          style={{ position:'absolute', left:'50%', top:22, transform:'translateX(-50%)', zIndex:50, display:'flex', alignItems:'center', gap:10, padding:'11px 20px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.7)', background:'rgba(26,31,30,0.72)', color:'#fff', font:'600 15px Satoshi, system-ui, sans-serif', cursor:'pointer', boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>
          Click for voiceover and music
        </button>)}
      {!/[?&#](record|clean)/.test(location.search + location.hash) && <PlaybackBar t={t} duration={duration} playing={playing} sound={sound}
        onSound={() => setSound(v => { localStorage.setItem('caselink_onb_sound', v ? 'off' : 'on'); return !v; })}
        onToggle={() => { if (t >= duration) { setT(0); } setPlaying(p => !p); }} onSeek={seek} />}
    </div>
  );
}

function PlaybackBar({ t, duration, playing, onToggle, onSeek, sound, onSound }){
  const barRef = useRef(null);
  const pct = (t / duration) * 100;
  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const handle = e => {
    const r = barRef.current.getBoundingClientRect();
    onSeek((e.clientX - r.left) / r.width);
  };
  return (
    <div style={{ position:'fixed', left:0, right:0, bottom:0, padding:'12px 18px',
      display:'flex', alignItems:'center', gap:16, background:'linear-gradient(180deg,transparent,rgba(0,0,0,0.55))',
      zIndex:50, fontFamily:FONT }}>
      <button onClick={onToggle} style={{ width:38, height:38, borderRadius:'50%', border:'none',
        background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {playing
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A1F1E"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A1F1E"><path d="M7 5l12 7-12 7z"/></svg>}
      </button>
      <button onClick={onSound} title={sound ? 'Mute' : 'Sound on'} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff"/>{sound ? <><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a10 10 0 010 14"/></> : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}</svg>
      </button>
      <span style={{ color:'#fff', fontSize:12, fontVariantNumeric:'tabular-nums', flexShrink:0, opacity:0.9 }}>{fmt(t)}</span>
      <div ref={barRef} onClick={handle} style={{ flex:1, height:6, background:'rgba(255,255,255,0.25)',
        borderRadius:99, cursor:'pointer', position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:pct+'%',
          background:'linear-gradient(90deg,#3E8EFF,#90F0C5,#FFC794)', borderRadius:99 }} />
        <div style={{ position:'absolute', left:`calc(${pct}% - 7px)`, top:-4, width:14, height:14,
          borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
      <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{fmt(duration)}</span>
    </div>
  );
}

// Continuous specular travel — every glass surface stays lit and alive.
function LiquidSheen({ radius=18, period=11, phase=0, strength=0.5 }){
  const t = useTime();
  const p = (((t / period) + phase) % 1 + 1) % 1;
  if (p > 0.6) return null;
  const q = p / 0.6;
  const fade = Math.sin(q * Math.PI);
  return (
    <span style={{ position:'absolute', inset:0, borderRadius:radius, clipPath:`inset(0 round ${radius}px)`, pointerEvents:'none' }}>
      <span style={{ position:'absolute', top:'-45%', bottom:'-45%', left:(-48 + q*196)+'%', width:'36%',
        background:`linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${(strength*fade*0.35).toFixed(3)}) 28%, rgba(255,255,255,${(strength*fade).toFixed(3)}) 50%, rgba(255,255,255,${(strength*fade*0.35).toFixed(3)}) 72%, rgba(255,255,255,0) 100%)`,
        transform:'skewX(-16deg)' }} />
    </span>
  );
}

/* ============================================================
   Brand atoms — Logo, icons, avatar
   ============================================================ */
const LOGO_D = "M98.1,31.9c5.7-4.3,11.6-8.5,17.6-12.3C97.9,9.9,80.7,3.6,65.4,1.2c-21.4-3.4-39.6.4-51.7,12.5C-2.9,30.3-3.9,58.3,7.8,90.2c12.7,34.6,37.4,67.8,63.4,93.7,9.2,9.2,18.7,17.7,28.3,25.2,6-3.2,11.9-6.7,17.7-10.5-10.9-8.2-21.9-17.7-32.4-28.3-24-24-47.3-54.8-59-86.8-9.1-24.8-9.3-45.6,1.5-56.4,7.5-7.5,19.9-9.7,35.2-7.2,10.9,1.7,23,5.8,35.7,11.9M194.8,143.1c-7.3,9.2-15.4,18.4-24.4,27.3-24,24-54.8,47.3-86.8,59-24.8,9.1-45.6,9.3-56.4-1.5-10.8-10.8-10.6-31.6-1.5-56.4,1.7-4.7,3.8-9.6,6.1-14.5-4.3-5.7-8.5-11.6-12.4-17.7-4.7,8.7-8.6,17.3-11.7,25.6-11.7,31.9-10.7,59.9,5.9,76.5,16.6,16.6,44.6,17.6,76.5,5.9,34.6-12.7,67.8-37.4,93.7-63.4,9.4-9.4,18-19.1,25.7-28.9-4.2-4.8-9.2-9-14.9-11.9ZM127.6,104.4c6.3,0,12.1,2.5,16.3,6.7,54.5-16.2,101.5,16.2,111.6,70.5,4.3,23.1-.1,46.1-14,59.9-16.6,16.6-44.6,17.6-76.5,5.9-8.3-3-16.9-6.9-25.6-11.7,6-3.9,11.9-8.1,17.7-12.4,4.9,2.4,9.8,4.4,14.5,6.1,24.8,9.1,45.6,9.3,56.4-1.5,9.2-9.2,11.9-25.8,8.7-43-7.8-42.4-42.8-68-85.9-56-.7,12.2-10.8,21.9-23.2,21.9s-23.2-10.4-23.2-23.2,10.4-23.2,23.2-23.2ZM71.2,71.2c-9.2,9.2-17.7,18.7-25.2,28.3,3.2,6,6.7,11.9,10.5,17.7,8.2-10.9,17.7-21.9,28.3-32.4,28.6-28.6,59.7-49.1,86.8-59,24.8-9.1,45.6-9.3,56.4,1.5,10.8,10.8,10.6,31.6,1.5,56.4-2.8,7.6-6.4,15.4-10.7,23.5,5.6,3.3,10.7,7.1,15.5,11.4,5.4-9.7,9.8-19.2,13.2-28.4,11.7-31.9,10.7-59.9-5.9-76.5-16.6-16.6-44.6-17.6-76.5-5.9-34.6,12.7-67.7,37.4-93.7,63.4Z";
function Logo({ s=26 }){
  const id = 'lg' + s;
  return (
    <svg width={s} height={s} viewBox="-4 -4 264 264" fill="none">
      <defs><linearGradient id={id} x1="0" y1="127" x2="255" y2="127" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3E8EFF"/><stop offset=".5" stopColor="#90F0C5"/><stop offset="1" stopColor="#FFC794"/>
      </linearGradient></defs>
      <path d={LOGO_D} fill={'url(#'+id+')'}/>
    </svg>
  );
}

const WORD_PATHS = ["M362.1,127.1c0-44.6,27.7-74.9,68.4-74.9s56.6,19.4,61.9,49.1h-20.6c-5.3-18.8-21.2-30.2-41.9-30.2s-47.6,22-47.6,55.9,18.9,55.9,47.6,55.9,37.4-11.4,42.7-29.2h20.5c-6.1,28.8-31.5,48.1-63.5,48.1s-67.5-29.6-67.5-74.5Z","M506.8,172.1c0-18,13.2-29.2,35.8-31l30.3-2.4v-2.8c0-16.4-9.6-22.2-22.6-22.2s-24.4,7-24.4,18.8h-16.1c0-20.4,16.5-33.8,41.3-33.8s39.9,12.8,39.9,39.2v61.5h-15.7l-2-15.8c-4.9,11.2-18.1,18.2-33.6,18.2s-32.8-11.8-32.8-29.6ZM573.1,157.1v-5.2l-24.6,2c-16.3,1.6-23,8-23,17.6s7.5,15.6,19.5,15.6c17.5,0,28.1-11.6,28.1-30Z","M626.4,170.9c0,10,7.5,16,19.7,16s20.5-5.4,20.5-14.4-3.1-10.6-13.2-13.2l-16.9-4c-17.1-4.2-25.2-12.8-25.2-27.2s14.9-29.4,36.2-29.4,34.8,12,35.2,30.6h-17.7c-.4-9.8-6.9-16-18.1-16s-18.1,5.2-18.1,14.2,4.7,11,14.2,13.4l16.9,4.2c16.3,4,24.4,11.6,24.4,26.2s-15.7,30.4-38.5,30.4-37-12.2-37-30.8h17.7Z","M698.3,150.5c0-30.6,19.1-51.9,47-51.9s45.2,19.2,45.2,48.3v7l-74.3.2c1.4,20.6,12,32,30.3,32s23.8-6,26.9-17.2h17.3c-4.7,21-20.8,32.8-44.6,32.8s-47.8-20.8-47.8-51.3ZM716.6,141.5h55.5c0-16.2-10.4-27-26.7-27s-26.4,9.8-28.7,27Z","M833.6,181.1h62.5v18.2h-81.8V54.6h19.3v126.5Z","M910.7,65.8c0-7,5.5-12.4,12.2-12.4s12.2,5.4,12.2,12.4-5.5,12.4-12.2,12.4-12.2-5.6-12.2-12.4ZM913.9,101.4h18.5v97.9h-18.5v-97.9Z","M959.1,199.3v-97.9h16.7l2,15c6.1-11.2,18.3-17.8,31.9-17.8,25.4,0,37,15.8,37,40.8v59.9h-18.5v-55.7c0-19.8-9-27.8-23.2-27.8s-27.3,12.6-27.3,31.6v51.9h-18.5Z","M1072.6,199.3V52h18.5v95.5l42.7-46h23.2l-36.8,39,36.6,58.9h-21.2l-28.1-45.2-16.3,17.4v27.8h-18.5Z"];
function Wordmark({ h=22, color=ONB.ink }){
  return (
    <svg height={h} viewBox="360 46 800 158" fill={color} style={{ display:'block' }}>
      <path d="M362.1,127.1c0-44.6,27.7-74.9,68.4-74.9s56.6,19.4,61.9,49.1h-20.6c-5.3-18.8-21.2-30.2-41.9-30.2s-47.6,22-47.6,55.9,18.9,55.9,47.6,55.9,37.4-11.4,42.7-29.2h20.5c-6.1,28.8-31.5,48.1-63.5,48.1s-67.5-29.6-67.5-74.5Z"/>
      <path d="M506.8,172.1c0-18,13.2-29.2,35.8-31l30.3-2.4v-2.8c0-16.4-9.6-22.2-22.6-22.2s-24.4,7-24.4,18.8h-16.1c0-20.4,16.5-33.8,41.3-33.8s39.9,12.8,39.9,39.2v61.5h-15.7l-2-15.8c-4.9,11.2-18.1,18.2-33.6,18.2s-32.8-11.8-32.8-29.6ZM573.1,157.1v-5.2l-24.6,2c-16.3,1.6-23,8-23,17.6s7.5,15.6,19.5,15.6c17.5,0,28.1-11.6,28.1-30Z"/>
      <path d="M626.4,170.9c0,10,7.5,16,19.7,16s20.5-5.4,20.5-14.4-3.1-10.6-13.2-13.2l-16.9-4c-17.1-4.2-25.2-12.8-25.2-27.2s14.9-29.4,36.2-29.4,34.8,12,35.2,30.6h-17.7c-.4-9.8-6.9-16-18.1-16s-18.1,5.2-18.1,14.2,4.7,11,14.2,13.4l16.9,4.2c16.3,4,24.4,11.6,24.4,26.2s-15.7,30.4-38.5,30.4-37-12.2-37-30.8h17.7Z"/>
      <path d="M698.3,150.5c0-30.6,19.1-51.9,47-51.9s45.2,19.2,45.2,48.3v7l-74.3.2c1.4,20.6,12,32,30.3,32s23.8-6,26.9-17.2h17.3c-4.7,21-20.8,32.8-44.6,32.8s-47.8-20.8-47.8-51.3ZM716.6,141.5h55.5c0-16.2-10.4-27-26.7-27s-26.4,9.8-28.7,27Z"/>
      <path d="M833.6,181.1h62.5v18.2h-81.8V54.6h19.3v126.5Z"/>
      <path d="M910.7,65.8c0-7,5.5-12.4,12.2-12.4s12.2,5.4,12.2,12.4-5.5,12.4-12.2,12.4-12.2-5.6-12.2-12.4ZM913.9,101.4h18.5v97.9h-18.5v-97.9Z"/>
      <path d="M959.1,199.3v-97.9h16.7l2,15c6.1-11.2,18.3-17.8,31.9-17.8,25.4,0,37,15.8,37,40.8v59.9h-18.5v-55.7c0-19.8-9-27.8-23.2-27.8s-27.3,12.6-27.3,31.6v51.9h-18.5Z"/>
      <path d="M1072.6,199.3V52h18.5v95.5l42.7-46h23.2l-36.8,39,36.6,58.9h-21.2l-28.1-45.2-16.3,17.4v27.8h-18.5Z"/>
    </svg>
  );
}

function Ic({ n, s=16, c='currentColor', w=1.75 }){
  const P = {
    home:<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></>,
    fax:<><path d="M6 9V3h9l3 3v3"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/><path d="M17.5 12h.01"/></>,
    ref:<><path d="M8 3v4a1 1 0 001 1h11"/><path d="M4 21V5a2 2 0 012-2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2z"/></>,
    cal:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    msg:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    user:<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:<line x1="5" y1="12" x2="19" y2="12"/>,
    chev:<polyline points="6 9 12 15 18 9"/>,
    chevUp:<polyline points="18 15 12 9 6 15"/>,
    chevL:<polyline points="15 18 9 12 15 6"/>,
    send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    check:<polyline points="20 6 9 17 4 12"/>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    users:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    help:<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    info:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    bell:<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    phone:<><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="11" y1="18.5" x2="13" y2="18.5"/></>,
    globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 010 20 15 15 0 010-20z"/></>,
    image:<><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5-5-9 9"/></>,
    pen:<><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
    shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>,
    paperclip:<path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>,
    bldg:<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></>,
    sparkle:<path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5z"/>,
    arrowR:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
    dash:<line x1="6" y1="12" x2="18" y2="12"/>,
    star:<polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.3 21.3 12 17.9 5.7 21.3 7 14.4 2 9.5 8.9 8.6"/>,
    lock:<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    key:<><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2M16 7l3 3M18.5 4.5l2 2"/></>,
    award:<><circle cx="12" cy="8" r="6"/><path d="M8.2 13.4L7 22l5-3 5 3-1.2-8.6"/></>,
    book:<><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{P[n] || <circle cx="12" cy="12" r="10"/>}</svg>;
}

const CRCC_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAWfmNhQlgAABZ+anVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAFlhqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOmE1NzhiN2NhLWUyNmEtNGZiNi1hM2NkLWExZjY0ZGRiMzdlOQAAAAOTanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAuGp1bWIAAABEanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5pbmdyZWRpZW50LnYzAAAAABhjMnNoV4XbSrub7hNcqnd+nTgFlQAAAGxjYm9yo2lkYzpmb3JtYXRpaW1hZ2UvcG5namluc3RhbmNlSUR4LHhtcDppaWQ6MTU4NTUwM2YtZjdiMS00NmI0LTk1ZmYtZjA5OTQ3YjZhM2Q5bHJlbGF0aW9uc2hpcGhwYXJlbnRPZgAAAeJqdW1iAAAAQWp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuYWN0aW9ucy52MgAAAAAYYzJzaHOrt3Ey2vccMVfxYBReNk4AAAGZY2JvcqJnYWN0aW9uc4KiZmFjdGlvbmtjMnBhLm9wZW5lZGpwYXJhbWV0ZXJzoWtpbmdyZWRpZW50c4GiY3VybHgtc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5pbmdyZWRpZW50LnYzZGhhc2hYIBq3j0uTnddk/9/0l1+BswfeuY6PD2JPDhakkYghpQsjpGZhY3Rpb254HWNvbS5hbnRocm9waWMuY2xhdWRlLnByb3ZpZGVkanBhcmFtZXRlcnOheB9jb20uYW50aHJvcGljLm9yaWdpbi1jb25maWRlbmNlZ3Vua25vd25rZGVzY3JpcHRpb254ZkNsYXVkZSBwcm92aWRlZCB0aGlzIGZpbGUgYXQgdGhlIHJlcXVlc3Qgb2YgYSB1c2VyIGFuZCBtYXkgaGF2ZSBjcmVhdGVkIG9yIG1vZGlmaWVkIHRoZSBmaWxlIGNvbnRlbnRzLm1zb2Z0d2FyZUFnZW50oWRuYW1lZkNsYXVkZXJhbGxBY3Rpb25zSW5jbHVkZWT1AAAAyGp1bWIAAABAanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5oYXNoLmRhdGEAAAAAGGMyc2ibZl23Zi5Nf9w2sMDF7yo7AAAAgGNib3KlY2FsZ2ZzaGEyNTZjcGFkTQAAAAAAAAAAAAAAAABkaGFzaFggfHJSQpJ2jCSXDbD4RGnjcD3hbd3bb/6IXLLLAQxSB9hkbmFtZW5qdW1iZiBtYW5pZmVzdGpleGNsdXNpb25zgaJlc3RhcnQYIWZsZW5ndGgZFooAAAI+anVtYgAAACdqdW1kYzJjbAARABCAAACqADibcQNjMnBhLmNsYWltLnYyAAAAAg9jYm9ypWNhbGdmc2hhMjU2aXNpZ25hdHVyZXhNc2VsZiNqdW1iZj0vYzJwYS91cm46YzJwYTphNTc4YjdjYS1lMjZhLTRmYjYtYTNjZC1hMWY2NGRkYjM3ZTkvYzJwYS5zaWduYXR1cmVqaW5zdGFuY2VJRHgseG1wOmlpZDo2YjU4YTQwZi1kOWEyLTQwMmEtYWRiZC0wNzgxMTQxYTIwZjFyY3JlYXRlZF9hc3NlcnRpb25zg6JjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFggGrePS5Od12T/3/SXX4GzB965jo8PYk8OFqSRiCGlCyOiY3VybHgqc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5hY3Rpb25zLnYyZGhhc2hYIJiAkcIdJX4Fgl0+5kfjePWcgPzC/+at70QVd8ahhpBnomN1cmx4KXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaGFzaC5kYXRhZGhhc2hYIAWKRZ19d06AsC+2J0xAMk7qDTTjwmbmXHsDbIw+hHKvdGNsYWltX2dlbmVyYXRvcl9pbmZvo2RuYW1lb0FudGhyb3BpYyBGaWxlc2d2ZXJzaW9uZTEuMC4wa3NwZWNWZXJzaW9uZTIuNC4wAAAQOGp1bWIAAAAoanVtZGMyY3MAEQAQgAAAqgA4m3EDYzJwYS5zaWduYXR1cmUAAAAQCGNib3LShFkCEqIBJhghWQIKMIICBjCCAY2gAwIBAgIUQOWgCu7COdC+uIP6BkIFPWdVEwAwCgYIKoZIzj0EAwMwSTEXMBUGA1UEChMOQW50aHJvcGljLCBQQkMxLjAsBgNVBAMTJUFudGhyb3BpYyBDb250ZW50IENyZWRlbnRpYWxzIFJvb3QgQ0EwHhcNMjYwODA3MTg0MzU2WhcNMjgwODA2MTk0MzU2WjBEMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEpMCcGA1UEAxMgQW50aHJvcGljIENsYXVkZSBDb250ZW50IFNpZ25pbmcwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASYegpry1AYBRTVNL1CpTlbROnY3dey+UrsF9C3phYrATN3ZHf93Mo8RQN0KOUuOn19P4oWNFWe5n2/She9N7eTo1gwVjAOBgNVHQ8BAf8EBAMCB4AwFQYDVR0lBA4wDAYKKwYBBAGD6F4CATAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFM5R4gSBTmRbI/jjxM+aPpzB11zCMAoGCCqGSM49BAMDA2cAMGQCMDFzHRSeAXrSy1WOzkbhPZ6Km2wGTmZ/2gK18k8BQGXyqz88Rdrz6CTX9flAnYNVxgIwcF9c3fVhqmJKpi+UhasNUMko69cyX6STPfta3Q8EjyzDjzoyrol46FP6VFHhvUcJoWNwYWRZDZ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2WEDbTB2aUL6HPyyOhxU+g4xnaO/7kZU1QirFdVjw4OfdGakKBk5T61YlH0lCccpPEPNpEZVGf0C7p3uzLgl/miYmCOwOTwAAEABJREFUeAHs/Qd8ZMta3gs/tbpb0owmz87h7HxyNOlgsIm2ccDXgLEx2XBsXzLGgAHH78fFxuaSo8nBwAEutonGGBsbzCGcHPbZJ+w8e+/Zk2ckjVKH+v5PrbW6V7e6pZZG0kgzvabeqjdX1VtpBUmTtdqdOIH9HYP2ZAz33hxu7e85NdkTJuM3zhzINLn2fQTivu/BDdiBcAP2adKlSQQGIjA5QAYCMiEnEdi1CEwqmkRgCxHYS/cmkwNkCwM4MZlEYBKBSQSuVwT20huHyQFyvWbBpN5JBG7ACOylu+MbMLx7rkv7+ADZc7GcNGgSgZs+Anvp7vimH4xdCMDkANmFIE+qmERgEoFJBG7ECEwOkBtxVCd9mkRghyMwcT+JgCMwOUAchf0Ak3cD+2GU9lAbJ18j9tBg3LBNmRwg+2Vo9/B+sIebtl9GdwfaObnj2IGgTlwORGBygAwEZFfIG6ySyVZ1gw3opDuTCIwZgckBMmagJmqT54zJHJhEYBKB/ghMDpD+eEyokRGYPGeMDM1EsH4E9tbUWb+tE+mmIjA5QDYVronyJAKTCGwcgYGn1QFyY/utaOxKJVtp2A1tMzlAbujhnXRuEoHrEYHr8chxPeq8HrHdW3VODpC9NR57vjWTBk4iMInAJAJlBCYHSBmJSTmJwCQCkwhMIrCpCEwOkE2Fa6I8icCNH4HJ14S9OsZ7r12TA2TvjcmkRZMIXNcITL4mXNfw76vK99gBMrn32VezZ9LYPROBcuW4HIRqIwdlJV3VuVFw9+1G6cte7cceO0Am9z6bnSj7dpHs1lD36tlsaPe8vse+BDfWuMtBML+EQVlJl3KXJW+/lzfw0O+ZodljB8ieicu2NcQLcixgto/Sc2Msq5ZV3DKDefsGdqvBu1XPLgbeXTLsVJX2XcJO1THxe2NEYHKA7OA4ehGO7X4d5VJULUu86t+8Eqr864GX7aiWZTuG8UrZpFwbgWq8jK/V2DmO6xsGO1fjxPN+isDYB8h+6tReaKsX3fVsh+s3jGqDZaNglE3Jt51xl6PA8kEodat886r0BO+PwF6Nj9s1CP0tn1A3QwS2eIB46twM4dn/ffRIDYP1ejZMv8qzrWmX2wH2ZdgOXzeSj/0WE7fXcCONwaQv60dgiwcIL+zX9zuRTiKw6QhMNp9eyPpj0eNPsEkE9lIEtniA7KUu7I22eMFXYW+0av+14maPYdn/vTlybt3GLbNWFTa2mGjs1whMDpBrHLlyoVyjm4n5kAg4tkPYNwTLfRsGe7tzW3vz4H7u7X5NWrfVCGzuANna/Nlq29bYbXEirvGzXYy91p7t6tfEz85G4GabN9d529jZwbzJvW/uALnOM38yEW/y2XoDdP86L6HrEkH32XBdKp9UuqMR2NwBsqNN2T/OvRgM+6fF+7eljvO4sJd7WfZhL7dxR9o2cXpDR2BygIw5vOUG4HJMk4naJALdCNzsT883e/+7E+EGQyYHyAYD6gPDsIHaRDyJwLoRmMyhdcOzd4WTk2/dsZkcIOuE5/ov+nUaN67oJloA5Xi5NIwbop3ScxtK2Kk6JNegPX2NOwX3ZE/2ZKP2znBPDpAhY+E5Yxgi2n+sneqI/Zawh6LiJpXNMV5Cydut0vXuTl3jbs+705rBWjbTus3oDtYzoa9PBG6KA2Qzi3kzutdnyK6xVndwO6DajNJflbfHcDfRTXJZBfOuFeyv9GHcUNJ7rnTjtgrVzthHlb4B8UmXNo7ATXGAjHtnc8OuCXeshI3nxNY1yjpcbt3LjlkOa9Yw3mYaUNq7NGzGdld03agqXEulg34G6SG+S5Uhoh1llfWW5Y5WdhM7vykOkHHG1xNtHL39obNBb4oTNVImoFOpLOlNlEJ3KOBzv6QNorVfurG2naM6VozZVsd8qB21F27B1iY3ZRDWam0Px/UMehrGG9SZ0JuPwOQA2XzMdsXCi9EVuTQYHx8GLExWwY6gvagM6QAwD0g0pVMVN70R4LKnsgXsWu23UGXXZLN9teFWbGy3a+CADoNKA9wHQ4V1zairHMfJdtRrH4MwTt0Tne2JwE1/gJSTb3vCuTkvXmiG0sp4CeYZd2kwXoLpEtbjWVbqrSnpeCggoywhhKDMkAUFIDOEgheErAew5R8CipxAZV0uq6DKZX5JVvGS59L8Kpi3WxCoqAqQO5bcxx1zPqZj99XjZ2CYi7ENSmMOY03JgMMu9CTIHCQlX+pd7p+h5Bg3lHRZ2s5Q0pNyf0Xgpj9A9sJweWEZxmnLqMVm+xKsU0Lps7vYC4F1m2QrwHw76sXVjp5YbOl9c6t6++Ul/dnFHN5K+Y7Ly3p0bkVPXm3p9EpHFzFcaEu2bWEf2T6qG4vxopqy+m4ZwQwUHDvO9y6UfRhVXkvL7fNa7Etbx7KEkjeqHJwDHRrBMGoVg6s4udSJOt3q6KmVlj641NT7F1e78Bj0h1aaema1rbPozHekVWwoFPHDFOg/WPBpNoVQc5HAeBUSc5JtdwR2zd/kANm1UG9vReUiHPRaLlrzyw3Di9sbxRV2+6evtvVH55b15mfm9EOPX9J3fvCi/s37L+jfPnYh4d//+EX90BOX9SNPAU9e1n946op+iPL7gO984qL+3w9f1Hd8+IK+A73v/vClJPvF5+b0P84t6V1XVvXsUluXqaeVGiB12yCu9PKcspLKfrissCfoGBGoxqw67qVpN/YIfVgsYnCOsfnQclt/vLCq37i0pJ+/cFU/dm5ePwz80Nk5/cj5K/qJ83P66Yvz+tmLC/qZSwv6KfCfBH78wrz+A/BDyA0/dm5OP3thQb9ycVG/fWVZf4rP5/G/TD3loZLaUDZoSIlq3wEzRGXC2sMRuKkPENbVdRsaL5ytVG47wxpbmO5PWrAg3jD8pPCuuaZ+9YVFfc8TV/RtH2Dz59D4mVPz+h/nl/RunjaeWGzqXLOtJe4+06afZarXaprK6pqq1RNuOoRMbXaFq+2YnkBOswk9ie2j8yv6gwuLevPzV/QjT1/Wd3H4fO/jl/UTz8zrt19c1KMLLV3gicUHWODRBPfpTpUmapydgyqlpKzJNRABh6WEJCoIx8xPFecYq0dX2vrvPD3+PJv8j5yd14940+cw+PW5Rb1lcVnvW1nVM82WzrbbmuOAT0+VTKIY2BoYL4FnDFoIOAdaClpgrln/KWzeu7qqP1lZ0u8tXtWvLCzIB81PnV/QL19a1P9ZWNFzHCgrNA5TJQC/XokeaBhcr/bcCPUyS26Ebmy+D55Im7e6dgvW3jj75vgV4dB98Xpvg5xns/7jiyv6qWcW9O0fvKQf4Eni11+c5xXUsi5xULQ4KGqs5IYPCaCR1VQPNWX8C4C8+wDsJapCzs/Y9AOLMFMNXdvVbe/DBqjTiCab1llegbz7ypJ+4wwb1pMX9b2PX9BPPT2n/37mqt4/v8oB1FEnSOxLoinyleoCoTvk/ck8miQFqQ+0M9d18zrYP9M0xv2nGJ6sA7QAv4L6wGpbv8uB8dM8GfwwTxQ/x1PE78wv6t3LyzrdbsmvqtoEMQuZ6gxAnbE31AhwAPJxxhmVxoIuy1wmRj6k8fccaGA/FbjZADIk852Onmw19daVZf3GPE8wF+d4Qrmq/3O1qSebHS1J8pgbdI1XuEb7ifm1RyC7dhf7z8N+nnjVtvsGkT0gfYvwnb4Pjf/nsYv6vsev6PfPXtW55aYCG8EMi7yhOss7UyAXeT+od7mCKhSSqPxfImOJU+IfksMmqMOGE5PvTDXqrHOoiPJ8U3obm9qvvnhVP8RTyvfy+usXeAp6x+UVDjXeolNfLVO3Zclfqogs9sAoVC+FHjoWtsbBWFa7o1Tti9tZArVXRZAKMAw+hH1ovJUnwV/iddQP84TxYxwav37lqt7Pk8UVNvMWwaz7sGAcMiKMqQL/GM50M5CXyStZAGCTRyqIkAZIuewCDDePIqUSD/g1uL4p6qtxqFxleN+72tRvzPkwuZJei73lKjcRHayClIXkYtPZFs2G1mNfhqHCCXPdCLBs15VPhHspAqw5L28vOsNVFuFbLi3ru3jS+M4PnNf/eHFOc82mDtcDUNM0G3iIWb6svUICGSltBLInA4dAwUNRrmIUYLKOHD9IS1v2jfxAobLAZtLgddgUEDjI/Errj/g4/xPPXNb3f/iSfpHvMW/j+8k5nl68KZaHievrA5yzH3JYVbi0vUKtj25Gd31P1y4daEu3X+4j3imIJkiR0tBhQzh1nnF/Ox+4f+Hcgr73zGX9LN8k/mRhUedaLWVMjINZphk27wZxrynjX+BGAlDAW5B9dAFOWVc+gjBIMTXIiOdIXsqKoN2Eu5Ll0qBUBzauIOGZ6jylNpiLbVryNPPTh8lPnp/Xb/Hd5BlecXnMabawYmxzLxBrEtUljy7XCLeBsVN+t6Fpe9ZFtu0t28MOPUEMu9nEcjm4NGy27tTewpB9QSEEXeRVwO+cXdK/enROP8zTxgf4DtEImY7UG2qEhoJqLEQPbQAP8uX9wBtAKs1IkDt2XkKF7fXcBz0dMCcg6ZP1UG9DMFKK8kHizSiy6ZFoAu1hY6v7MKk1dJZ3L79/eVU/zCHy7R+6pJ99bkHvXmjKH3zpqryxYJG89WWu0NDH3EfEQNvdR4PZLg2p7yDeYC8TvLfxpPEz55b1ncTop84v6o+XmprjveUMsTzABl0nroEbBr+e8jjnvnBQCYt5clZCIYuJmRMW5diQ3EIDIteRzAoaVkqJpNruGQI38ZiNNdqYcaCcx/j3l5b1o3yU/yW+lzze6igy4FnGAYdMuQGWecJdjuxgPlDlDtZ047j2LnPj9GadnuzGBBxW/bXUa1tPas4GsbY0xyL7b6f5tsFrql946pIuLC/pQC3oYL2GPCTgVlMxeDGyJVCKLZwlSdPsqQAvUBmHTQqmq2CZaWR9KfHwm5i274dSItsDieYdWhyEQmZ5lkUdqEsHa9IKH2X948M//uQl/eCTl/XbZ5b09FJbTepjX8kPkyCR8JDXkhDdOJf76bGOdPJCu6O38aTxc2cX9N3P8/rnzJzevbSo1aytGcZ9tpZxqxDkRYx6ioujkobJDEFFjnAzCkhzIcnysTOdA8pFSuICdzFIl7wqnyE2G4ipHaYNtIAhionvHCSlOsYHaXiWdfS+1RX9Ik9R/+Xyks7Q50AQArKkWGRV24K1pwq6s6fas1uNGRim3ap2d+vZj4ObFh+L3psJT/l6x4UlffcHLurnn5nX2eWWZho1Xg0wfOw0bBEsUm8DLNfuSsuRMBDqLm1xCUnHREIqmXlVQGSSokw0kUpLqr90XZGW9XPhILAbQxthmz4YxK5RZ1NsA0/w/ebX+Aj/vU9e0A/wzeQPuOM+xwdi2wTs2WPSRoV5SuYPgyTcA1nZtmFNcX8MhEGLPGk8xjeCXzl/Vd/33BX9wtkFvR36CoGuc6PgpwyhCMkrQrwRC4+/IUpyUEI+eeSBQUyZp7pdt3UAABAASURBVC5u45yV8i7pRiaO7EbrXhXdUq/rPzFQoB3kiUoOofPSLZPaEC36ErJMSxyIb11d1c+cX9BbF1bS75g4JkG5B/vOsdzdXsv3ctt2MlbsQOO49/CNozfRGYyAJ5ZhkL8u7RXtkLNLPrvU0o8/fknf/8Rl+UdupxoZr6lYVrzXsN8EZOk1UVpsJpSvUPywXcOFB8upxFx2gUUsZehZA98s7NiFwhWiCIhVjdukm2h4LqsAq09e0qksFU0kCCl3lkS0JQB1DpOpWo2nj5o+vNzWm3ny+i4Okl98dk4fmG9qyTsmpjQHUyxJIHsuuVkGN4zmukhg3G03tFB4mpuC376wqB88Pa8f4eD8g/llzRHFjM11Bmj41RRxQTXZu0xARkq8lJmoQmLmmdk5NjCmMEuZyxJgJ0WPd8KrmTtQofts4Jum6CUz3P5UJrdJFhV43ZpQboiC5mvSby0s6+cvXtXjKy11CBAaRCLmSs4rKObmTOA6RWDMA6Q6YteppVusdmCe93u5Tt0a2Sa3h9UaQtAyLf2NF67q295/Xn/A00eNO7Q6fL+R8N5pVVYVKSZA3W+vipVpqQEui1YG0JGp2yCWahcvtfsZPqhKSV9ZVGdeBaU92BcMuqYCTZtGoslIiW9ZDrSDNnMzzl12UGADFe/NL8P731dW9ANPX9b3+BXX2UU9s9JWOwQllSD2EzzYofILqus75+xuTpNokxKIi6bKQFd0pR31Np4ufuzMAh/D5/QbV3hl12xJtUzT9Dfj0HBXPN6G1Bcy8/o6Bc90cEkdw1Mo2HmZ8qRPrC1JuBGgxClJMEhGSjBZ4i6h7a9af1DoH3t0ClWaWsisk/hBHXDe0IqQqFUP+mCnrZ+7dFX/mQ/t5zEMAZuk2+cWDikXgUzSbkdgzANkt5u1S/UNTLxdqpUFNKQmFglLQ+Kp47lm1Hd/6LJ++qmLPMp3+MaRyZ8zQjJLivgoDg6ThoKTVIrMbANrE2ny3i0LFXVluXNVr7wG57YNuS169jkI9mNb812uB0N1CqYPqAQ4iDh17ZHd1hDYUP17K5HT4mmeSv4zTyXfyVOJf1v+rVeausjuE9loMmJI4UbjpZci6FCgT1SlBNr8ZZ8bWbk9BoZWz6x29JuXeCX5whX95Ll5vmusiGODQyNTg0bwWSi13X4NHZkkEtFUCTCL5OYbtcRlFSL+lECSGyD78lhiVdCJDx6RpYTIuMG0yxJUkZln2jr9gFI/o0slGyh6I+M55JRz97XDnYM9tLhp+tPlZf34uTk9ytNIhEnCOk+5bY4Pb0chmxQ7FoFsxzxPHI8XgbQKyLh98+P6n1xu6tved5FvHgs6NlXj4MiUP3V40XvxG9AnpRWYZ2bm4Fotc2lgxVVJs9Jig59KM4xT+mM3hURbcpCsY3sv7oSziRnPQTIvgfov26gUFP5VuSwvweyEk5FSj9IhYgIfxpMOtGMRO4GPx5mma3WeUDK9c66pH+Wp5Ds/dElvfv6qHltoyX9OI2N2c5bgQRteuM51AsUwgO1U6rkswfxhwJ4sQxvheQ63P15o6ifOLOp7np/Xb1xc1DmeNjIFNdgZA33KOx7S3XjaSLFjLxUhh6cExiM2eRnRUDJLSJHl3JDz6QvuhYnKC1aB5pq5B/CeIJebroD9dPCKpoynMteU3FHrKmUqL7Nz/+ZE5TbOzTVtAIflPnusXbrffE9XHQfnMP2Z81f0e3NL6e92wYKjgZqkxOivXpNrZyOQ7az7iXfPZ8OoSHiZe0E0mf2//uJV/cAHz2l+dUXH+GCaNhWMvVhZYsXiKz2x4kDzjcRSCOtS5PoQ+LRWTGWqCR+UESV4MlC5l3ACnLVjRy1W7mqno9V2G+ioCd6C36b0As89J+u8YvxhmvtWzurgu5PwCD/nodbFESV8WNnjYWvH+HK9UHLfcj+RDdV9qaWDZKbW0BVu7/+A7wg//BQf3p+6rP92dkmnuNtvSX6wS4AFjbEHmGUyCbiqkYAuKuSYp7ySYRRlaRThTOB2+pf83rHY1M+fvarvOsUT5ekres/Cojq8njkYMg6OmjzGQUHllW/Qkb5FPBqK+mKu4aLCRSeXm2830RkQrU5jXObgnhvQh0FCo6DBTNuv6y8hzQXGPY09LeokwJ5a03gUzY7U5w2/QxkLXx2XyO0TNKWIPCFkSU5ZpqgcixQJsPWZ2iaQGf3QVEO/dXVRv3JlQfPE2yzr0RQsBhK2A5wJuUMRyHbI755wu1fmUZrowyLihZCF9EH4Pz67oF/hA/E0K2OGzSUqU6QMLCDhgNT1YDymxRgTLy1mlHDH3SpLFnbCLcXe8gIVLoVreVNockC0OSz8Y7xTQTrWqOnuAw09cLChh2ancjg0leh74d/aqOkI0AjUwWFCZaSO2viJ1C82GLqjgK98axJcMLeHBlBAwwMhwQEnN24AzeVGgChsAVASTo1HUCeXgOt1X90chZoagaeS0NDjC239Mgfyv+OpxH8H7PcuLOu5ZketEJTRSJK9JdAWrrxljFJQ8hdCSN9i0qFxtaX/eHZZ3/H0gn7suQX9n0vLmuNwmyLwDdUlXsXFTu4hMD6pevcFSAFAJvNLWpF/mEGTiDk4Ru63xzaV0N7ESxwy6eWGuX7KaSfVM1KR7w0ddWJHkeBlGDZwfgj5cdp5MmS6je8wt9dqSgB+K7wTwCH0pnCcMe4dDkNDxGPuP+VyYHEJ1/0UZcSiBKULN/Al6yHMyyTJeZY7DGZZZ6rR0J8tr+gXLlzROTrrMSxllhtPYMOETLKdjkC20xVM/A+PgDftEIIutaN+/tl5/e8zc5qtSXUWaGBleOGEZMomRRm8KACXic+KgUQSvVYp84VqKmLcgcveQM5iRLraamuZVyZLvEuu807lQQ6GT7ztgP72fUf0JQ8d01e/7IS+4RUn9E9fdlzf8PK8/CbKb4b+Fvj/AvhXr75F/+KVJ/V1Lzupv//QcX36vUf1sbce0iOHZjhY2LjZiFaaTa2urkqdlrIIpC2CBtCSDu1K7aPf5pSbRoxQQyFn9radnBaGKQaUxrmNV8w6iqEjhUhNUdPE8jDgw+7ZpVX92gvz+r4PnU+vun7/wpKe4huK/yig92o3h5BrEMwvYa2MeCNcitIpPuT/AR97f/z5OX0XTz4/deqK/uzyVS20V9Xgg8ZsPeOVW8C/W01vaGMEUtsV3eSEmmUNPMNDT75ikuW7a4HDBiPPtUFyMT03jkunZJeZgeN2bGvJfwurtarVVkuH6NB99bpePzujv3DkgD7jxKy+9LbD+rLbj+jL7jisLwdSCf0VBXzlHUf1VXccAY7qH952VJ918rA+4fCsXj49raMcMB0OlBX8tzpNiYMlYzzcC6Y47QnMhJDKvO0SRALTBjhFP0RPCg5dZNrIEJgoB+sNPclNz89fnNOpThRDIF+oJV+KUCYMoJtJWzDZjPtd1N29nqT5tYs9u7mq8mQe0mMvBHYT+f/h+KVn5vSWs4uazjI2jXzgbZawEJUle3MkLz9xsY4EoXSxsqKUFp75rCnWUAcRSxfj1VbEb013HTyoTzh5SF/JQfHPXsVh8chRfeG9h/VXb5nRxx6d1ssP1HUHG90hbA4A0zRgGi9TgEvDLLxb0HkpTygfd2xGn37LtL7onll9zUuP6Rtfflz/+JGT+oL7T+iNtx/T4ekDWqEZ3rRW2LBaHC6Y4411HsWdL72hJNF22orEOEU3JX0zS+hKjMRuCEwlXZAICEkkLm0DeEZsa7VMKyHTY7xS+tXT8/qhpy/p+564qJ8+NaffPbeo9/Pd5EUaPEe8lmk3BXFU92qDebye57B4P98y3nJ5Rf+F7xk/+hy+uAH45RcX9e75li6jGKirltWoORD7QF+VfOE2lc4iDfXTQ5oLEAFmoA4KpwR5ltuinkiXiZMjOVrgkTsGR7KEFofGKpttoE13NKb0xoMH9IW3HNFXcyB8ze2H9abbD+lzGMe/cWRGH3NwSg9NMQdo+0ngWJbpKIfMEebCERp22CVwHN5tzIEHeRJ9IzaffoQ5cMtBfTmHzz+89Yg+/chhPczrxIy2LDdX1eIgSd2ijyTGmiYzLqnJzgxWqELBo9rUZ4vygyKkWNb49vUCOr/AIfJUG8SKVioBVonenOXuBYApcWOGeHBOXZdeFo0oCjYUsaEwuKyGOSb+zzx1RW89v8BdqrhbDxIaSMnFZYzFZjZUnkJaUJgnMqLJWoRnvkEK3PG2WbzetKc5fj7m1ll9+SOH9M9feUhvevCQPubYlO6ZqckHQnLdW9VUFpUuF4ZE9GcRfYN3AtvXEB8AuZ1N5VWHp/TJHEhvuvegvvmlh/XNLz+pz7vvhF7PBjXLxtNsNWXwK4/UWuzyTRWK+kj0BYdFMl2gqaDqrrxPZsJgLUpS0ouOD9ABogNFPBqqqcEG1OQ9zhleab1zfkW/dnZBP8pTw/fy9PA9jMn3P31FP/LsvH762av6xeeX+DC/pJ98blE/eGpBP8ArqR99YUE/f+aqfo9XUx9eamoxRk2x4fomoEZdwXVFwkl9FEVbaBwEqhagBU2CleSgpAgOhwSRktEEIZklecQ6Iu0kZyBwQ4DDuPt1Ih+xdCIEfeTMtP7eLYf0j26f1ZfddhD8gD6KTf/B6YaOMR4zmNaAtAnYF+CxNXh8cZtXik6JW2bI5ZGWSFPIT+LvZfj9VMb6/+aA+orbj+uTZ2d1F4d2ttoqXnPylIijDvqRGEXKlLpIoipZTP4DHHePQmbYvpZlugTxcxfn9ThrCVR9V4RKhpSbSDbZhPpNr5rmzk0fhR0OQDmX06JjoflO9qeevKI/O39VNRZY/tTQW6vGPJHTosGY1F0f5ufNzTHbdtg4xOsCv6ZYWW3qSKjrr9x1TP/klcf0jx44oD93dEp+emCbxjXeIpA7yXO7YsPpq8S8XDpebp8FeFL5LtZPKn/p5Iy++uGj8muwz3/JUdpyUEfx3Wo35dcdctvljbPXtORmSK2YoYTAzWcDwgyikuCTKowe6k3Hfr3XOGbGgzJeGdbUyHj9RucXYJ7lVd9TK/n/xve2q8v6P/NLCd61sKLneP23wB29X3vVs6CpWlAdH0E0i4pJqUmpLDJcIkQhpUgtCcl5Mcer9jmnkqNjeXIMG1LewB2xmMa8pSavC9u8njzKofixRw7q8287pC+/87D+3q0H9VGzDfnAOIRtPp+wdKPsCN62peQTp5QZTu+pZ/r047P6ituP6os4xB6GbvNqs01b3XlakZ4msECbBIIpiKUUHl9HCz5UL8GP8D2GYs4uEJxfubigp/xLJOClYjSSMiM5mDSYKkvjg2A3hkH+SPomFnisd777643Wztc+UMPuTI2yyy5TjSAhBC3yOuGnn7isP+aud5YNqOPdiBZ6QeVLB0Xo/pQ89FgsIm8oXnC4lEl/3zjOXdln3XtM/+J1J/T5987oId5F1WxlRZejwFVaJ5UolSXQW4V1AAAQAElEQVToppMbVBh5o2O3Y4uV7mhk+pRbD+grHzysf/WaW/RlDx7XR/Lu/QD1Ntn88lcdVOxdruguVOFpo6JfE5cqOcZLa/MM3nxcGhLuACrwL1PGgV4PNQ6VTFPE008VLg3+kdIMrcBGHSiV7Dxq6WiWx9BgTg6Vmt0QV1iy0C7RPjZ+QykoSpsaTfFE6IOjycHbYtM8QVv/4uGDetOdx/RV9x7R3zk+ozfMTsmvmrLciKb012D2jkGggXZeVHkA+pWzMzwFHdObeH12P+3tcJPjp1Ax1j7YDYV6JSp2kkPhMSecF8od4j+lmuaU6VcuLem07w5QtpjCmrm/gnBhsKAsjU9g6xFIc2zr5mNa7vJorV+dp9eY7b4GNbfBNbn0LGYdye/Vf4lXJH94dklHGg212kgtoJ60SdigAkYRqVAxqpxAwuLz66omH0Zr3BV/Mh83v+G1t+oz+CZxG5s1ntk4UtKuXqkjQ2o0H3C7jtYyfRTv3r/y4eP6Z6+6VZ959xG9ZKahOh9h2822/DHWLQ8VN0FBRZKv9MoGlvVM90qoxKcsEtV6CAogdmDOk9i6xDLh1QyFSIXJNubeKdCwQY82rwSEfcn8PkaXqErsrwfGumq00zXlfY3yk2a71VaDefMI8+dzbzvCoXFUf+fkQb3mQEMnOfDSgo54MFDsenLAXGm1I/Bq8F49e4Ano2P6+7cc1j18I+rwbSwS+0g/3VzOAyKOolPV3nQB1jEaC80WvkMIOg/zVy4t6kIHCbYROqUSgZfoSbatEUjzbVs9Xmdne3OeMItp2O++MK/fAfwLgp0O911M/I4XD2KHzUUJaeMw02BmsWB8R2+0TbbKHderjh3U17/mNn3JAyzKqQyulQ023KPAonc/fN9+51Smv3nnQf3Tlx3T1770uD7tzkO6k4+5GfFpcqB0rKv8iuwe0T1McbN1TAJCSxQdsZw201hMXCg2KUtzKPOitCIqOdUlRFUy1YPSm0sAASnpVG17PNFScZlDUSQsCxu32n0orE2iY20DaNJrka9wg6C2dD8fwj+T10Ffe88RfcXdh/Xxh6Z0klgk01ha2XIPwLDm0MYGTXvt7LS+khuez2TuHqBffIoSZyI9RZiilnoEMcwJbIvTmOZ4G79+OnyO8tfmluWfriMsCKWy1CavETVv0suNr57d+F3c3R6WE89lmucsi8D78rddWNYvPDWnw2yOHTZ+8ditID/Fy5f1XZYQEXqzUSrFFRMERsyb6qFa0Jc8ckxf//LjetVsXTXqKfWFjfbgRXfXtopFb74/sr+cj/CffdesvvEVx/ngf1QffWRaJ7irjuUrLjaNQP8pih72NuDSse9ovSXnEmPEjVTKB8skSpl1aUmBE04YOZFyZwBp0EWXXitby5FPJlpfStyXhJP5FRUtkCdFmwPUh+it9P8vEIev4ND4qnsP6y/x5HbfdF0z+Ei68tXDTO15oK/TtN+v3r6Wg+SVfB+RD0k33AFxCUR2/06FhtVL+CgJlpd8I9YA+dDKqn5vflmtQsj0YhwhKvpQk7RNEWA5bpOniZsUgXIpp5LZ60XwwnJHP/PEnGpeKJ7IRN0bnTd8Q9rs0PVdeQlWE+/alZCkIbFAVrlje4g7z6945XF98okDaqBgH2JBBkB7+EpdGWwfm0SXhUKAOMwrro88OqN/+NBRfd3Lj+lz7j6ku6ZrWuIj7NLqMntNU/4x0cB3AEx4teM9wjEKIDkEYhHwJUrrEKYUWpVXireQYqL8sodEWQYr2YPnfBikgLPEB0/Jcnj2n2TgLikQB/z3A8xUhWKgzCHgw4dHh/4s8VrHP3b7au7SP+/2w/ra+47rc287rJfP1HUAb7Jjg6rXGkZVuOfw4H64VTTbv6T4Jl7F/aVDHCm8jnUMfIBGdCIxCsrocpCgc1C6WEKU1iKMaCSbGDVVq+mdS8t663IzPdWglCe7yLEN87ihxo2jcK09ycfhWr3sEftNzJEdabEnniE5BwkhiLNDv/zEFV1i56+nRcB2z0Tv6qBHSmQvoycwSbCMY4Nt7GT6lDtn9aaXHde9U9JSZ9VLBwk6aF6P5JpL2FL9ZSy6xngzD/DkvGOqpk/mtZZ/iuvrHj6hv3jikA6xsSy1m1pNv2MQu/2PhQ+XOVS3fqEn7zZkZbKWevyclC9a4SKHxI/oxYKOCbd360VzjVTAaGInYVGt8QQxt+ekCRwabd7bU+iO0NBn8H3gH/Mx/B/RZz+BHScIpMKBPe5/SLOZtZFixDgzlfXXjxzUFx9nbHk69xN6LcmTBrFSAmc5R+kynnyxCgJ+PB6mIzcgvz+/qKf5XsQ9F1LUIzBmst8xVQfUtm454GjfkGlu7pvWrtPQvTh07HP69ecW9NaLS5rh6cN3mZFVEN0PJrzLNOEL3OwS8v4kqTBRnc3mbz1wSH/r3lnVeUD3j5zOU4F/B8F+xJXbgOxict0lbE+19oYnNhBynhqgic8M9Bt4ffMlDxzVt77+Vn3pS47p7kZdGZtEq+XffO7k96oEgbCkTSPiYA0gh43cSKDM9+ZSzzIRcNMqLvszWvIicgFR2OZuwMDJE69S8qWLPhQMdP1B3LV2Oq30uxEHafVHH2zoK3k99fUPHZF/sfP+A/QLk27jjO8g0Kwd9D7cdb4WejK34bUHpvXltx/VXcx1/2hyjdL8rKfWxRznLlEg5hlss8D4/Ne5RV2CwdQpNIoCXoGtKSwyrBGMxdi65Vju96DSsLHZg83cX03y4vC7ev+V2F8/dUUNDo/80dxbRz7JnFfBPcxp63gzyqkOu0gN4WeyuXzirTNajU21WCGRCvzhcZ678AXAegZUb4zEodHXEWjHVZSH+C7wcbcc1Le86qT+IU8lH3X0gA5zq+mf6mnyCkjEwxF0JAmVUaKYsOTSkU3I0CzXy/NcgX0MJLAlBcpeCnBUgX5pqjaJ/bpS6Xc22mpy4GXcZT8wNaXPog9fx7h+EU8cr5htyD/ySkMLQ+3atX48lHqoXbru4BXUl9x2VPew6zc7HTHUvZojaAWYCjDyVLJ9YLdpcYb96WZbvzu3JG4vcqUyDyXSX9pHP2dCbRSByQGyUYTGkvfPyJAFzTGTf+6JefaDwD2m0hWhEpJKT1eDOWx1oF4QCZBjrjYi/5HDv/3IUX3siRmt8Mqqw+KATR67fn2IGPzTKLu9+7jnVXDbtgL2sa4dG4KAEByrPFjT4K8/MqU3sQl/4ytO6AvuPaqP5DA5Dp/bezX9Tp3DBAtiFTVYRxyssKLQk8G0P3TNM9iRSwPsPJkA0EYcE4hPux3qXwHYy3R3raG/ddsh/eMHj+prgE+69aBubWToSgw52d5McZeb5R+c+Ae3HtFD3Hg1OUTKJ0ARKeN97fGCIXiOu4rL8g54xqusdywu610rLWGq9S7brCefyIZHIBvOnnA3F4He0VDa/fbzi3rq8lL6G1e84k5T3HPdEzWBs1KZMl8Y5TKI6cPwNPzPeviw3nh8WqudJj7y4bKWwXfj3nm8v11lk5oD/HPx5mG6YynVjfeyBO2mYTwLR/EtMwyEw6x+SMGLdBlNOhwCHgueo3ILG/HH3XpAX/rAYX3ty0/oszlMXntoRrc0Ggrc8a9y57/K00nbGxIfHAKbe+DRwm5SRbhLpTNwktKmkxCly7oJEiXEbksOIaNtQJtjfxX/Kwy6/0fBO6en9Em83//aB47p6x4+qr9CG+870OA1pPJhwhxskvoiEHWYQH/xicMcIjU1HSPGIbACKIh7qUzMQfNpAI4eYWdklaDNospqQf+b7yGXrIQxKlisTYjWMuGM4iPa0XS96t1sp7LNGmyf/o3nyYPOw4c+tNjWr59a0LHpjIOAiU1X/fplzeSF4XlNIdYGWi4iNoE3HkF/9cEj+pgTB7TCk4cqy0bpSlaJ64WVseCW2bguc4is2mnS2bksrOO6KjNusLpLg/FrAvrneOY+Co/wOF1Ug3kbH94/6cS0vuyho/r6lx1Nf+zxb/ON4Q18Q7ljus6rolraYPz7FSscLC0OlTY7j114BJLHlKl3QUcGydBB0U97TcpV7JbaHcYoUnem23k19ecOTesL7zqkb/ST0QNH9Ll3zcp/rHLG3jxsBuMTGBEBgo3Ef37n848dSq+z/Eu4nuOc+WnOI07JmoZEMD4uPTccYo9VjVHxb6j/0eJKKbVKD3rGPV4Fs58KuWvo9ap3sx3MNmsw0V8bge5gs6G0EP/Gc0taaUdemzA7uQuy3IDIe1wxkb1VmQN0hZ1EdNiQPuklh/TnbznA3ZefPHxEIEqWVjZA230qQFxSrKitK+2mVjhMYF23RFP6Fnq1IZZV6WvDi1hUnTAOJn2YHMuCHpmd0l8+eVD/8P6j+qZHjusbXnZMX8SB8qnE9yOPH9CDfMS+baauw/WgRiZlkZeHHMQRkHEgI5514j+Dv6Po3T5d03187H7N0Sl92m0H9eUvOaxvevCwvvH+I3rT3Yf1cUendU+jlv7QYBrpok2aXJuIQNRRxuPzT8zqMPFrc+xzn1TY+3gQHDEqVcj5XmieGf4uOIXR2+aX9Dw3Cxk4rgofFFaimKStRYDh2ZrhxCqPQDn/AqS/fbx/vql3nr+qWTYZbk7F+cFGaq0KgJJsgSxZsgIoSb4jft0tM/q0u2d5zcHhkRQDeqiTQgleBYCPlnzJxKSTkbcUNddpaYlND/VtTxGPBopNJ9sZxjV0f8fV7dNjo8hpPBAnAsy9qOQD4A429o8+OqO/c+chfek9h9L3CH+X+HKeFr70viP6XA6Xz4b/WTxFfDbwd+8+pM+D/vvAV9x3WF+NztcAX87H7zfdcUifyVPiaw9O6c56TX7KyFyxO2kwzpgogfbMtT8a4rGTbudbxuceZz34QPeRQVxDEc9ARyDJ+1PJ9wESmQtLrIk/vbrI7ZUEKV/D7MyfwPgRSHN9fPWJ5rAIeLKa7wPjf59d5qnBFFsWAlJOqIeZ4cmbIMIHjHODpLsOTOlvPHCMO9cWr7KsqQFL4RggYcmyAKkk87xAWkjmeBJZ4O7Zi6iism2o22ywQ5cG41Wo8qp4Vcd4areRIbCebIh6zkqHhi1NBoUQjBA7WmGZAY4XwDQyP6m8ZKquV/J94qMOz+jjjxzQJxw7oI/noPnzR2b0kbyWes3stO6fqut2DiDrH8Z4Gh8+xNMdL64hJVdlEFdZMh5Qk7SVCDBWLyPuf2l2Ri0WCfdmjCOOWDdecym0xB41mHnyTVWA4Z+Ai9xIhSzTu5eaeqHJOwLGBPU0TLn2kNwKQ9gTVn8EWAL9jAk1XgQ8vwylNnuQnubbxzsvrmo685biKSzul/LSepEpG0EMKvC8NCeqwcT+W48c050N7Jj0ShfMVA7PhklZN3iXWF9a4Elkjjs3vxwb7uHauW79el7Wk7v9htK+ipe8rZeuOYfooNhRWYEHzADPshJ8EKwH/XoYp4RTUkKd5VUaYxDyYpJfVZPIxQAAEABJREFUYwQYv784e0Cv4PvWCnOaJSaHufTqVZYAvcipQpHk0YsApciKWIpR77q6nPjlcEVkQ1OpMFQ4YZYRmBwgZSQ2Uw7R9Qb9losrml/l3p+J6o2mqpZP1Jgmr3FU8n0KJc/x1WZHf+HeQ3rtkQZPME0OHh9CgWmPQtfK+Ppg38Kq6n+Rp5DLnaZomXb6cv1VKOszr8Sr5Sh+VafEA4iBYuuprLAM0ChP1YqMl4C+z53STQgWwCwZoJO0zREoQlzH7d86dliHuCFaBbyAvM5y4KxmDNKwoueSc4Sn+FgATJ5C3snH9PN8Y2SJwFBeFP6LQpNr/AhMDpDxYzVU05POe8jplY7++Nyi/Hhtnmcm8znZ5GVMx0BilJkFPGk0mdD3HW7ok++aVbuzil6weaEVK3jBchGc5WDUkFPOo7pGBbrEgrvIKy171w5f/W3ZuDKamJRcGhKxxWyzdQ+tpurEuBtVAgbenChS8uaVkEm2cxFw7Avv/o/KPuXwQaUDpFwpFblRrzSXhYnPGdDIksh0ifX2nqUV6EqKPdzD3aMm2EYRmBwgIyJUmVMjNPrZ77i0otO8Y/UBkmydsdOQ5E3Gd0M5Xt4pRSZ05EkjqtaO+qT7D+t4ZrrqN1YJhX6yT9ZHVFcBuOsPIWiFJ5GLrVUts4j69LeZGLeZrpbmuUhQxc0YpM0bBYO6g3TVzrISzF+DuwOA+exRVpnAXolAlD7m0EE9WKvJP37NIpKf4BmuooUlFpX+FWS+9iBCprcvLGsetDCQfSTQ5NpsBCYHyIiIpc1jhKzKZl9O/8vgW84tpW8YnBZdsSd2PjGHeINleYvD4+UnZ/SGY9NqxxbqAcBFUF4qvyBzpJqbaajyEl4wU1GsFFaQB7vJ4XGxvapFyqR6nbOidd1WuMmGLmOLyKDf0s2g7yo9Ci9td6J0nVXYiTpuNJ/+sdxPOzor/wCD57TBfSzHnKnO4ZHfqJV8y3wjlfEa6ww3Uk/yMd1r1/KkbMQDQVkUYJO0UQTK2G+kN5EXEfBELFCeCHLq8flVPQnU+rb8XObJme6EMDKnC8zyNrxp1fRxLznEYvBPuVsTphPyYRN5GK+vWttWwPX1bEJSbdOoi60VXeFjpOUV9euGuh1VGNUQ6wyTlfyyHKYThjE34NmmhA1Uh4pL27KsKplXpSf4mBFgbbx0uqFHZrL0Kisfc3L4pNwJpJFUpMyUIfBNRHqUj+kdyK6oi8CcpLEjMDlAxg5Vv2Ja/NzCeBK+/fKq/JvM5pn2MeD5mINzsWUDoJEt3JO8Y9tW1MtPTukVh+vy04eQKV3WSkiXk1N57npybG2eyyKCHEwbg5GS6fJVmH/M9xIf193mJNyhLNW5jm/L1xF3RdV+dJkbIPZdwgaqG4pLP5spB53atuQN9meQLvW2VlZr2pqHvWxVZ/180uFZTfEk3WF1eU05fv2Qr0TL/dcDPM/9FFLnNdYTqy1dxAg3eTcHwmXSkAsn+agI3DAHiCfOqE7uCJ8KPfnmOQQevbjCcwQMJmSqyyVk+TrLKHO8EHlSS57QdT6MfMSdB3SALyGddFSUU7Ysk0mS5Fgv79eAv4YBj5TqHiEze6Hd0nm+i1zrT2jZl4Eq1yS3wbBGUDBGycyvQqG+74tqnHauf/a870M1ugOssQfqdd3XyNTs+FkeVXcZfr7uIJwAJCn10KCL7Y7Saywkie/MAD1J40fghjlAxu/y9mp+eKGp5/l4XvMPprPVp/lLFZ6LsaSj0vlBgSRPHb593HmorpcfnULm46O6reQ61Xx9aa7Z0+lhSVKpuIImkSfAMu+EL7Sb1/xxfdB3quA6ZgNRuI4tuUGq3kMB9VyrcQf3F/mgnpkgxHnz8pxF5QR3ePJTyWNLq9y6WV44MHotsKGba3G+N229f+zNlu3xVgXeA3m+vPPyMu9hO8o4LAabHGGUAJpOER8wHYhOO+hVt87oaC1/J2s92EO8mJtDsTS0rpL6r65NP7tLuV7rrHTaOs8hstWP6/bTdbpHkL3Ypj0Smq01Y68FlMX08PSUjnPz1uJVVlpgHBtupmFYJ803ZCHo2eWm5iBCCFgN094kzwtpkyb7XT3b3Q7s/wh3e8CkW2LyfXBuVTXwXhxhkhJNSUrzmrnOJM0nKm+udKQe9NpbZpD5XkicCV3P4Brr6lkU6msYBX+Mwguqw/3YRQ6ReQ6T1O4x7PayyjWEYy9364Zs21bGynPU/wnXS6caarHAfGO2NjhokRK/LCECq2yetwD+S72Qk7TFCOzyAVIZwS02eC+ZnWt2dG6xlZ4+mL8cEL3WmU4UXSYhC3z3EFu01OL96/1H67r3AB/P4UQmc5GSyfAsyDraxit2fYX02jhQgf9M+WUOkSt8G2nT6q7K9UdumBb04n7DdGlLHQlYlQDK7HO+eXgVTyGewP66mGLby5RPYRgke3ZR6vnQeWqlmatYOIFNR2CXD5BNt29PG5xZ7miZw8CLwHc/+eQs5iwtr9I5HtMh4sPFv/vhuyfj3QcYI3aGbVGAbTVt7CFpOCuBRnpC+PdT/CO+F1pNrbe8bLbV1t2sdoT4Zu36WP32nCphLAOUHjowpRP+xcLKUeB15Z+4QlykXuRj5ah6dqXFHC9UhhRuyxD2hFVEwPtFgU6K8SMQk+qphVWtttpp2nqyRjC/is0nLweJETStbdSlf9x3tia94vi0tQEUKhNafbi2dK076UthWVKfUUO3MjcUwn9Dyz+hteROQQ+mQm2QPaFHROBmjlc5v8qyDNF2xGQ2C3pwqq5Op5PWU68OnqzLiiplt05u2F5YbaXfSgdNthW1CVqNwAj8hjpAuhNjRGe3i+0J6rqeWmhKTN5ymvqQ4NigGksNOSU2aXFFyjaT/LaDNd3D66s03T1zkQVkIZVFZgJ0W1LFV0JThmdKEkiRTAAkeWJktMlPIP4JrasjDpHCckcLt8ewmUo2q78Z39eiu1fbdS19Gsc2DiiNE4eqThUfcMUsDXrZlH+asawlKAQARedRIWFkfSl/0m7rEgvXGn3CNYw+6YQoIpAV5aTYVASCmlE6vdhko+X4AE/mqYRmwkYg8YqMOcppEtTmw91dh6Y0wwRvJ9nomTpMMsgbpJPLa8liz9i+A/3w67mLfBOZi3mLexo7j4WiikqzCk5elHJTVdz0KBvLdhvcFrfP5W7XvVfqG9Z/89Zrn+UG65Sl8UG4d7qhA6xGz1UxZ3NQeqoI6l1VXOgtd9o6z1sE+SoHp1/Jkn0Iu9OJbB9G5vo1uRwTyqucCJdbHWWZQwjDreov4MDwbY6ByRrhRMo7OEBshQs4wxJ2w9jXwtuqyyhazELE/nKnpcscIrC02xfVD62y2pYSt65xl0ONNsW8di9RymOom/dyFD0mjoBxl9sHUSfqmQ7XMvlVctVvWZdLg9JIGDMoHTD+YRhVr7KhBS/XLIh9Uwx0Yofa7X1sh1zfQG49gwyVLr241NbCapvp6CcOJqIPCcaMlCalVY2XpfEOr4FCCLq1fH2FteU7AQPNTVWUvLLUyPrzPonL7TawMlO/0sd17trayHYqle0ry83UYxu31+Vm7Ebr2tto6TiS7WvLOLXtTZ0yio5FiW9nS2dwdrxeY5pu4L1PHHhmCTrdbGtVXDSuTwzLaRjP/AmI+E2isIUIBJ2aX9ESE4/zoLAfMs1gkdLGyxGTJvd0LeiWGSa6rYKzHKynIRt6RUWjLusY1srNNayVaEhdSpf1Y1dqymBRiEr8q7GlszyNpEWn3bu67ahUWfLMKvGyNG+vAKHbK025bu3wuDgOLrfaiLW2OYdlpTsb+bpKr7GoiFSsvbw2016HLMTEN52FTGdafEjvRHXXcu4yN5rk60ZgPzyBrNuBHReOmExnl1pqM+kiTx5+bI40JJKVgChN0pTBRJR+SuRYQzoxXZN/38I8zHY85V3I8/UqSxop62m5jYYupyD8f4q82FrVAn3ryrYJKapIoVvPpZta6lbx9Wyul8ztu15174V63X+PlcudaE9Q0D2NBnMmFtBfi+s2x2UO5Mxd213lu+QqZLCCARwnwqUm1/oRmBwg68dnjTSfZFFXePrIIDxdSyXPO+M9nrGSK/kV1m2zdaU/X8IMxdzqXbCmocsYgQza5WrDuaNk1i4h18lz83JMtNBYf4sSReaJ458iu9Be1SVeacGy8o5D2b6ydIVV3PQE9l4EqvOjim+lpUPHG+btjbrqPEZU/cNOVZRlIoos6SFIf0iU0uyiUPXw6PI0uQYj4H1gkDehN4iAH5EvrzpHkVlIEjczEGy6iUhosQHDy0l0ok7y/cP/IU6nNOhqFUrrFlufyqVlSCsjdGtxc7vEADKo1adbtN+8i62mLrSb2q7vIr16Bxo0hKzqVvEhqhPWViKwzTaeLzsyTjg+xOExxfz2G4Gy2bDzBZiQkiuFgnZbOrwu4CFEvgq20QmMEYHJATJGkPpUmHH+Ed5LfgLhEWTUQZAmYsow8KQ2MMGP8f3DQY/QfX4HiTjIUJ+FvWqnrkHnqS0x1W9RCal6DhLCIP/9rLO80mpu6kBMHkZmrmetcDh3rd61cSLmVYCcpG2KgOO6Ha48Ewy5r6gZJuIU3zTyEwOuKzKAplTFEyPPfOOzyjxWmuHqv4oKiqJfto+onWq/97J9FIbr3NRiAs63OprjACkHJd3xWJYmoRHaCW7MkPZUEN/1HJmqDZumGIyZ8DOm5lhqZR96yv0V9OQ9rNQ1h09AJSn/xvqZ5moqu8xNIvZZmvS3ZH1uKd1K6XoM69laPgjr6Q/KbDvIm9Bbj0B1npRe/PTh369i6cGyhgG0mhgIr8OSZY02C3SxXbxRKAUDJWYDnP1F7lT7JwfIRvNgSOSv8PpqqRU5CAKvpXoOImgJoJLIYZDQcy4d5QCBOyLlOsznEfKN2V4QG2utrzHcR9E2TI0ZfKdXXYwZEWki95PIXOxo/SWJ4jrJbTCso7JtItdjqDo0vRFU9TfC7WsjnYl88xHI52Ee3elMmq1lLJ8qF585CZKnKmlLv75a6FzLbM393ow5Ib8Zu31tfV7mCaTVEu9RmX7c7pCYtMovz06AlGiXfkLpsKE62Ic5QMwTm602cVHTJrRz1a3Y5Jajcrc8VlreqyHA9Y8MBEw74Od4neXvIoQJziSVEXB8SnxSbj0CsWvaw+rwjmWsMhZkirNFBvhpgZY4dEKdJYjKn0BMIJyksSNAtMfW3VOKaYJcpxbxAMLddd6C7pQzYqi0iXkMlTOd13lHO9so75DMMaCymZRXO8RifF+DLgbpIc79sDGUbWZuHzk2TBlyfK7d1jk+sK/kgbBgQ4gbauy8gttQQlnbIF3yN1M6TvbjcjN2E92NIuCoWidolgOkpMo4l6U1uoASqSCDVviQXtJlWQgnxToR2LcHyLBBHjpR1un8VkWLrbZWO+3KhtnvKXK7U22fae/AUzRwphbU2cSGmnsOeMyxa8nDQM1jh2QAABAASURBVIurbdyc39KyLHNrU3lfc9r51XZLLzZXtJn/6dB+bHu9IFCxgSLFvdqeKm75ZsC2pd/N2N2Iuo7FtveL4DYAMc+9xIbWMZQp+fdARoi03pWqW0/hBpft2wPkeo7LEh/cmp6hRSPyiZdvnXmOoCIPgWnG1+Y6h0f+c+qRKY5OkZAW2O4W1Xqr+GArhsvioNpQukbfHasXV5c1H9tDdUpmWU9Zmu9aDCXucifBdZWwE/XspO+daO9O+ayO8bXX0fPm9ZUo5l3X72DQTXeFvjmL8hwtWcm+JCbluhGYHCDrhqcQesIZSpLDIfLIm8iCnxd5nvgpg0aXL+hQUXVmJm+x+u5qYSUahXWT9dZVGCEcZTeKr3S0BUmbuOjmKG2LvJZbVHi6uaTL7eaa/iJK5tY14rIE0yWUeiW9XWVZl8uqT9MdGC5TWMCdTBuMbwV2qh9bacuNZjPlyZYGLVaHLO9mzIs1Ofz0VyUKAWSBURTEZMyIxZA0OUCGBGUjVuZJOuafESvmXzpDPAm3GvDSz0ZtW1fuBoxUsNCQK/SwnB4nt43Bui5TmEDc9ozlHEKQ/5fDYYeIbdYD+yhhI7315IMy+xzk+cP/uxaW9cPPnNe3PfGifvj5C3piaXXNwTdoa9pQ+qviJc/lKL5lNwtsbwx63hpZUAiAgt8a5zAqqD2zbfsl2FFV3aj87Ebt2E72qxc0JungtuJJaSgaYI0cjQo8jYQQkkXwBM8FFaxg7GARhvpey41D9XJmVWZLQy4ZXK9+oRdT/6wTeI0n+j/4m+uxNN6G0vVcixu35XfOzemb3/+s3vz8Of33c5f086fO6pvef0rvmFtc1/V6ddtvaWw9Q5Uu8ZulrPZ/O/u83m9ZpTqLgQiUXRrcf5tuO9txjb72jXlvL9w3TR7e0DQZhou2nZuxCTLn0kEgUXNBcD5o8LKo5KX9EwKLni10mcwv8WspB/0M0rnvQMtDjm5HXu0o/koyUAtkXwoh6DIf18+0VvM/o90nHY8o/Y+nvVbL9oZByVMrLf34qfO6wmuQWlZXFutqAC8sNfVDz1zQpaafTwatenTooX3YZvijdPsc7mNiJ/tn3waHZ3B8czqX5riYnTHB4A+2RE2ucSJwwxwg43R2u3SCuLNOpwVlctqbbsYMqKTXVkmcssRNWC8r7XuchOVzPKFrs3WFa9U35PT89TCxqLSlq+qj6iDvfS41zhmiq522TvNxfWGTv8Rle/suS+OjIa9ztLyQ2BmNemxhSS+uNNUImVqMcYeBdGnxY1eX9PjiSmGQF+bn2ODTV8ntL0e1puSXpa2quOkbBaox2/4+saYYt+riM8kwrqnK/LIt3C+skVcZpV6VN8E15ov8SaT6IuCfLPIvB3oCeqJ6cjFtKzrmFKSVgAAZ2JYDZZ4qOjkj5T15IlNmniERey0rujHYPtOGcuEmnLYX6g4b0ZCa6qQf873EE0kpQ+2aUr/xWq9rOT2L1U5Mi8Lja64PkBwParbautzsmJ3an5AiG+az7HOhsqYYlFfpEndZhdKJeSW+38rtaPsoHx6HrsyEoQxQwslIOQuElPCyTITS3NTk2jACkyeQ9ULkmVhCRY8bVZUzLJaIfAfKMcJhQWLfjIlDBk5uksLJchV2dq9h10hBxdGA3UgT9EbJ1uOPkuFurJT3M1ettrqKizh0qOhcc1XnWz5ONNaFCZZjqW5KyX79PtxtdPsT4CHRnB0kqF6yvmU9zmjMuqOlnj/rSXNZ6cN1Gjfkkv2Rb1d73f9hPbZ/f9/IF91ajXI8++RDnFmvT2etqwmHCNwwB8iQOUD3rjFVnXpmFu78oS6RSU5GSpONclRAEfX+EymMSYW37Sq2x2Ppxe3dlpaVDgec2b8hsVmtMQs6316Vv4v4lVHij8gGXXb9jNAfi41TEqpBPtBA8iHFOc2DhM/pEXxsBcgiIS6way8qbtd1Zj1DVWmQrspuJrzNh0aSPEwqLw+SAdpxMgwe10PXba6I1ehUuB2tcINL1sbtBu/wprs3ZIZkxSNIVRSLGcsek1cRKQwUviPyXPSHOoPxwQmc81DehbSZujajO7TpRQyGymDmYtcCRnGp3UyvtAb//Eko4ovJmhTWcLbO6MQOB73kcfTBQavSQeKMt1sU5th/WWqdlmlXrrL/Lg27Uul1rmRUP/0LgR43BkpdoK1ptMhI8FNOaUFM41fHIQlGJcUKPkGHRuDmPkC2OEFqRM2TLXqGdn10kV6grVRQIXAHi4o3oQq7kLpA6GLLkFqzZeuNDIe3eSOrXG5bQ75ie7wcI8+FaSH7+9JVNnH/d7mLlY/r1d45UiVg3U3DeF3hmIg3H4+Ry/TtIznNa/eTSeKt48vqpbiKl7zdKB3OEnajvj1TBwFPP5BB50FZnc4HWldhoZaEgUeWqYxFnahJtpkI3NhRq0yWoUEpZ9BQ4WimN7nA9CzSmg+qXbeu34CrwPbYZgdqQwfotWk4d1BvtFaghkHtTdChp1tBe8wK1ifvIypKCQ0DbQqJm2dxQCboQk7h/1vkheaKrnTaDrOGXagNYyf9OFRSPcKGK/jg8AHSHVQzUM2LNOqFk7x254N1DdKYj5u2VW+vtKPslGNV4jtReqZc8g85uOMMYnDpijx4BuMG84F0W0BpVoMbPLevvEEwbv4E1o/A5g+QIuDrux1XusPDtEPu8992rfaRoJBKTgUVu6J8MT/TqxH/1c9QMi0YBX1ORiltDz/YzWB9iWnBtcGg2563YjNOjAEtSFffJHueQ+Qsr7X8SimpVjLUKtRadCP5Wov8bPAmUtq6zPceMBDLcjtokDwHmaTrHoElBuNKq6OsWF/RLUqZEYMJg3EAlCRx0jSYa/LlhepyAmNFIBtLq6pUBrrK2zKehm/L1tfL8EAteM6t+au67C/5DlRtWOpiyrTa7mhuuan8G4qY5kGbvwZtBunc43BuLtuO3P4N6/naSN6zzTUdpRzKwyWKhzadaa7qhdaqWunZomdlzPouR4HlBsvL0vgosA43r0ncOywSSe0RyPE9k+eh2zPNuZ4NWWTw0v/rQel2DIYmrU8EhRgsX64ZK/FglmtzlnT5CblRsmqnt7FP2Tb6uu6udqsBR6ZrmmnU8wNk2MD08XIiBDZFZud8s52aae6o7Sifyklt72RjNKpUKctNNz4PCmZG8oKQKYSgi62Wnms25f/xEElfsrahjzlAbCQv1X1o9I1L2nWGWfd62cNyLyVdljl3h/JhTduhqva62yVO/hW+n7mdDovBeB+UzFSyJhlfnx0npxqqjhdTrmuWVLvUPkWqndvGLkwOkC0Ec7ae6Ugj45UUU4uBIe/emRq3y7I0XoVVPoIwZ6usNfgo2zWKVQbtqJK7jlN/2e6+Ev54belXtI9YWdJe0Fd4lfUcr7RWutFe69leDGsl43EiamsPkfxO1Xnf4YKuk21c7hVwewx7pT1ux7WMie1HQajMkWUOEK8v63oMU8lcSeutGpACN5/v58rwcdg/GWODAiwr0EmxTgSydWT7TlTMix1v91SQjvLStLuZjFlxZKIu8zLfdzzejAStvgvHJV1BS5bL6KwPCk5R9IkGiXF0SpuKbkjtDKVkbTkg6pJrkTW2lWpyWdfGZC4tWSEEzbVbOsUrrcXKCrc8pDbmUbVlcLYFyGtUekXZ8xGhu6Otwaunp6IVuq6X22PY3UZc79pC+j89/GO8Yp64NZ4iCSAiwFniPAcYjhFnjngjranCJhdO8nEjcEMdION2est6zDhPSArN1qL4pCHfwYztD+NzV33/jAcm8Nh26yria135oDDXz/NB2TC6qmm8hGG6Oa/smjX7OTnlvNTp4QWHggQ7z0FSsq8ELPSrnZaeXl3Wpc7w14G2NCTDzWaMkQAfF727WNeMo8SnHEhbrmvAz2bIvjppnulB2Iy//arrPqe2E4Mmp0H5S6hdfhLmNxbmMYQe3sQ1LpgNhXSIyBd+KoXRCawTgckBsk5wRok8x45OZb2JiCLz0HMRLJ+sRhLPygYzmKhnrvIxGEEIORM0SbaelR685fW8lNwepx/bSN6vPYxy+w1rZSW3rCPS76pWrBLgvIkm76VkXyglvCdKnjJy/8jm86srOs9hUhFfMxpCf41FM9JYl/h6lVjHsJ7OZmT2NQzso8s3YsZNBMO6fJXXwySikI/hMB2EKUXmkLX8XyzMhIwnkN66TQqTbKwIZGNpTZTWROC26TpPILyPSpJIbqAYTLB9J+vtPSA7f7WZ/n/wjEnrE8c8SUiuNY3riQZda1Vj2vdatLk6q9pV3P6q4Ke/51dW5F86rOqN2byhavYvby44DKmM5EqXP+irS2nDK26oMVG49ggUUaa43GqrXJFr/CIveaFAXAbG80CQ6r5xqOgUKpNigwhkG8gn4hERuGuWB9/0McOzjhnIRByhCttyKaC/0IzynVIv8LlM3Sus66mrtm2I26+x6gza5JW7Ht/IFRiwGNc0I6ZnW0354/qwH/PF1aZSUX1ukxrRxxkrTjZOpkYmsHMRCL2x6XA39mKzrRB4nvWdhUoZpQcDvhIPuZQwcUXs/GP5jYSTTdKmItDbxzZltj+UPW92oqVMSd12oK56GT0YZV0uR0EIQcvtoHn/tmxqmDUTMjrDZrRw65J8Gbl+Gj/SzXqytUZrtM1wFRVVv3dOAM8lBUs4b43xKgyYVkUJt3sjIQRd5OP6s7zSWsWbeVuFEEK+uaTKU9b/biNs1fPm7FyzYbSVG1LCaK29IHErd6YdvQitgJ73AVJU5LkFi1ePPiIYQhjpTQClGOFUKOefZCFPuZE2gDdJ40eg3ALHt9hHmp4T297cwulxXmHN1GtpgroO9h0XSmWh02WUdMjk/29ijgMkhJKZtIZkG8kHTcaY/RWXPW1jJfR8VlR7zCFYUCi4g2XBrhauJtEgeUrbPWjibiVzrYY6sV2MHZ3iEFkqd4ctOLSvEqrm5okxCwpV9kh8PK3h5uvHo+rZmobhfm50bhrmovvLlFf5iJ6iUwhcwO7OsS6OoMSF9PaZhmoOFsYkYxMYMwI39AEyZgw2rebJd7hR00HAdzV2YF6ClJnTD2ab4z9lcmm5ycHjqWtOr8ypjfLS0yi9jeSj7Lx0tmBrs65LE/bhsssEgfZrBYtYvP6WkJ45wDsAiWWcOJS5OvnIrRpviJ33wK5NLaVDZFlXOn6pgdomE2/EsIh5O8DK0bF/k67D5W6C6zS4Tkcpx8sWmQvkTJCbJ/W6HLTA1/PFdjt13pExeOzS3ILoK9HyuvXcs49buBGE1U3mdYkJsm4EbrgDhLmyboe3Szhby3RiOuMgcI1e1p6ua8H1WcOluIPlJknnl/yiJSgk5vBsUNb1MVx9LO6gz7VG/Rp5r9Zq9XNM9exCt1fBgkQZ80+7NJhtsVbTZTb5S0CrFjRdy/iA2VGATrs2HfViV3FBJsw+jITCYzABlCUoKaRfCmtJ6ZtdVra4AAAQAElEQVTIGV5r5VsKjDFTCL1eJ9+pAc4AGpYfMBs7QzsplWUiKpn5JZTsQbrkl2VIfS8pStrq/p1l4zzVbGme9sG9eRL9L0NyqdXRIourvE/xXHI4hsYUJin9JYlpBvQIr7BunqBtb0+z7XW3N7x5cux0SxpMvLtmampx55MmcVGp710NqX54nsQJT1lI+fNzy+IZJOHOQnJgbAjgo49b0EXRJyqJ9WSlTiiRHSvdCtcSOByohIPjAxyc3/vYaf2Ttz6vr/zT5/QNb3tO//HZCzrHLph5MygOET+hYOE9oBsZezOvCqEgXBoKMi9g+H84PN1c7Yt1Lhydh26N/Tpuk9uwEwvGfg39NfYoy3LIZ1aOS3+2sKpv/PBZ/YP3vaAvfvS0vvwDL+h3Ls6LcPaMrzMWdrR+RyKv4MxKS0scIoETxE8XPUkuN10F7vxIUTOM90HPvVwtzbkCnRRjRGAn1sMY1e5zFc9EunDfbJ3FyqIuaFhMx5DAOIgSSMXEjKplmZ6fX+VuSarx3r5iitZgCn2MUbrmG/qUd4hwiwxV94O0ZV0eDfMke3G1qe95zyn98uNn9dSVq3pxYVHvOTevH3vPGf37d57SBxdXU2xqxYkbCZyh9GV/AV4/rcQJyq+yNBWilAVprtNO30WWfThZsAH4Xbht04DhAxepjmRW0Anfhcx1D6umRTt+7uycvuH9z+pPz1/S/OqS1FrSs/Pz+u4nTusPLi2k5g+z3U2e209Td67KwrmLF1b9M3ih2+/uIYIwx1mntAQy6bh0+47UG5o2gqxMlg3DS95eKq93W7y2r3cb9l39nmC+abnnIE8gENz0VPoAI03RguUNMbGYwOAZu9rFpZYuN9tscAMztzAZLGzex1vD6JOORYzjYhwdVzZUzwGygD7Xskx/cu6S3sbd8YGDM4r1ujo8kYSpTIGnuLdfXNF3vue03je/rAbvo6exqxHUwNYdqACyiCgYDEQ5bRy5E6iLfkDdukvq6FRzRfN8F+lXWEuF4E3IUJHhJ/mnzEp2YogWasMLsz6dQbpPWCGG6fnp4hdfuKTvffKMVulXaNS1GjOtdjj6siktKdN/Pj+vqy1rVpxtGS06ugV7t3/r1r0K7ceUS4NxQ4n76HhxhfXEYPs+gSlncXrCiMwU65nngwSmDOZ1eOV1nNdXPkCSLFlNss1EoLseNmO0H3Q9QXa6nXccaCjjQFhb16hlE9HPtNQOOsMhkgd/rfXodm9Gd7SX7ZaM6q131xCC2izsD8wtqV1rqAPd4Ra/BTRpSJMV36lHfZDXMd/xvhf1TvSyWk11VnxAHpMTEBMG0JTAoxFKF4NgmYH9A1Fgs82/i1za4BCxu0CdNA87p+AsgbF8zCCTc8pNJJsYNmGSq7pisA7wKy/O6bufP6fgeYezNnFqgbeBFu1uh6CnuTk5s7pdBwiVUO+mU9HmTdsNGGxce9A8XT3X7Mhr0eMd8UFYQPMbgRyHSUoySkIlQqVbuImpQ5tPMUmbjEB3PWzS7uZSr86uEqc8MdPQATY7/zRHHhDf74iJm1N5HvKikncU9PzcSoVjtF8P92Ym6El6WBIMzcbRGWq4hln1VMWtuBFtnRQNVmkHYrkd1aHfKTh0znd8CZC1OUS4cdYziy19O08if8YrrtCoKYOPKhqurQTZizZzpQ0ERz60XuBJ5EK7k5qhrhP7hkDHWAbq0gCa6jNOV2QwrwqWVelBvCqv4oN6a+hSmXaxR+o/89rq2589zQ10UECZG2hiynyjg23AvWrTs6sdaaljjVyG6u4n2rxblZ7l8LjiJ66yzqL0/CIceTPgESJiBwneTsGLume6Lv8SYVcP8SSNHwGvlfG1J5pKK1f5dXyqppPTmfwonC/XPLeUOZrPSd/Kms3O48KyEGp6jjvuVWZ0ybO+ZdsBpc/t8LWej43rsUbUTC3TK48dVN3/JZTjQWeDAq59h2gghsTCX9tPcYj8m/e8qD++sijVarC8LaJapFApjRuSq4I/WFBVjwXRpv7TrRVdaLfT5psLY9pYEPscS+6SX4RlKbgBkK/grIScyPOS11/ab5Wznm5VL59AUhPmz3J4/Munnxdnqmp2SLwcGc4Kpb2QA8OHSOBJ5Bb075qukUshjF2b9uv1PK+vvJYy+spIEjZyx6joUImWZYoZWg12v9s5QFKEUpYbVNCcMclHRoAQjpTte0E5YbalIwPOTE5nQXfzHaTtVZ1mnbmubbCUkjhlkh+1n59b1QJ3whmTXhtcpTfuJ5Nmj07kQBZZGgOsnSRTY9bWme7+qNeLtc1ro0+541Y9dKimJh/TUzCSnRKa5yFthA7HmeW2/v3bT+uPLy6owSFSJ76FeupbiWvTVyCEIf3gw+nmqs5xiPjOvucPDJXA5lyjJs6aogaYxorC6FZgc+aOaZR/NPcHT13Qtz/+nLJ24BDGC810XCPB8uERiWJ0Y1nNDTr0D+46ruPeHctGYlKiu1nuRrWRDj2Xfq+KiDBukH3JcjNKUU4TWxgHidsxbm4sV9yN1qaabqiMKbfV/twsdiMmFjPRkkcOT6X/h0AsZkcEtot1IcsyXWSTvMijd417Xqaz7GtdozGF49Q/pqukFrSRx1yetz/Hc8OcI+LS6rR111RdX/zSl2iG7ZvzRKHvX7JImb+PKOvoRWLz/7zzRf32mcuaqtd4zcD9Nos+KZGVNZUlrJRMGxLRl5kbqdUguZ4zHCIvNJvyn8FAkLQjeRakEgJ0AmfgSopdQuNcw7RLXln2+3Ergi5R/IunTusHefI4EDI1vMkRA88XeVzS6YEHeDUOkDbfPr6Aw+OTTsymVqq88FOi+62kd92+GB9sf5s4+CewalnW1XN38xihDUF4QEjg5BJzMiro5HRdhzIiGSVITa7NR4Dwbd7o5rLw7Cp6XKLM5BL1AcK9j9jeVE7UXOZ8cPvFkAkfQtBiK/Iaq6k0AFalChcloAZnMFX8WRFxUYBtnNbTHSXL+eSkwRqGsFDJuexn4CxO8kh/V3lt9Km3n9Tffuntqq0uy983MqIWAFsYOqziCHSwUdbSPOH6rned0w8//qJWMt5Vs0n4MYUHEmIdElh1eKzyupO8VIhQFehQ9/nWqvznT/xLaEh5ZRZpW8JoSWB8gkIAVIIdqHLlW9Ugt6KwLjrcLuh9K6v60vee0m8+d06z9D2L7q/cfVpNySsrAYHTuM6B2+Iw/JQTh/RFdx9XLdU43HMS3TAZH9Dp5tmVVvfJLA01PJflenR3EyuIOZODXzvfyTfMuoVWTuUk22wE0v61WaObQd8Tbk0/mYCDvAcON3SwFuT/yMY2BnWvfoo9SOxFshv2A5262kIzUWumsC1LQGl7kh1uwlO/uql+cMt77iwrKW+qkX5GKXibjmrT8dhe0Rc9dLc+/cET6rSW2f9iviGiFi2X1AGiHQNZXNUqK/zNH76kb3vPKT3FRnGg0eApJqrG3Tdm6Acs2FzJq8myFFTvIiYMhUJuIdoniXqvdFp6ng24I660Igp/NMS6ZgWFdJiIUpWr4rbC7UdLHZc55P5DRS3nS0sgv3j2ir7sXU/r0StzOlabUi3SAvoRCn2/Hoy0LQHMlVZLL589rG96+E5NdduHoNC/ngXduabqbW8Y6oQunlrtyId/xjhCFmqRKARAaQoUTMWY05y74EH3HphiTM3Ldbt6BYJ6gU2KURFgZo4S3dz8MEb3PcFu5S7m9pma2twJmraZS4NxQ/KVMlMlBD3Hd5AVZnUuqlqUOhuUpUlZbqC+GfFQl0OZG3jFhpQWMl3VdLupL3vV/frUe4+rtbSqDgufs4AFba3cV2RzNNZheXfUVpv3+X9weknf8mfP6r+8cFHLtZpm4U1hGICYvAf5AIgYGihIPQwibSguc8hl/t7hzcc/xeOnkWW+SwXXj9jjErAyZJQCXIe3HG3ywl3FIqfyPGcbf4J4/LMPvaBv/eALusTrqIO1OgdsSL2z3P304WEGR7ICX9Nb9P/Bw8f1Xa++RyeykDvbI7nbvF0tsi+Du9YtQZ68usrai+mpsayrLBFb3eFKYMI8/9RknbG8tZE/q1lovuUlDNIlf1L2RyDrJ288ascmQjFLp2uZHuQphFf2KvaddYOY2oNt4HXMmcWOLrajaiEwndc12yVhat3QuoZLhnPtIDhLYB2D6CPcGHWgvap/8uoH9an3HVNntaUOsXDsOhYDKMoW/jAciU2boyE0OnqRO+3veuycvvldz+mPriyp5W8jIfKQ0+k7gLTOZffVAwD3rk41Nt8r+L8K1OBkXRBYUCYpQ5n9GmxIQiY0NfQKcA0UQ5K/wfzqi1f0Je99Rr/24iX5LwtnIePwED2P8veaSEQ6to1B9FYhi8jbesnsQX33K27X7bUB/wOkTXcbdqoJpd82MXmGD+gi7lGCKiV5mecIimQdBeLHHDxYy3SSm5AkGlRMzEk2TgS8LsbR29c6aeJUe7BdOI49915ysK5VcC9w5iYTmckMTUo1xcRJKFlIm10IQf6N9Gd5jVVjs+jdWea2KG4uuTLD5qwq2tdgPMqUYLC/yzGiV9QVu5vwwU5T3/yaB/Rp9x+XVppsimyYKDtWpbtYWIrSd42Rp5FO6Ohtl3kaefeL+tbHzujty7wG5CCZ5jtAjadAdtVUFVXjk1hjGzX8ojrGopBZiTHJYPruNMMuo+GZeagk2pu39ZDBGpEwSnKXVnFpI4PpHvhHT//P3JK+8rHn9E0fOqUzxOEgfcnnAvopYU+9sYAOveK8VZMnlIenD+gHXnWXXlLPUp97nsGwJb9uiVb3zfrtaoj92pfLefp4anEV0rOGEEQYUGXFBWWOxDiKy/OIGaPbpmo6OnjoIp+kzUWAmbc5g4l2LwLlBH348FSan56c5hl6WiVW4TL7Qwjy/w3yOK+x2FZLJVaBhFg31kXfSXmfogIHpu/kD/A66xtf+RJ94SMnFFodjgc2fDofUYzER+A5gEB3IDp8QQ9qEbum/teLc/rmt5/Wt73/nN7Oq4zIhjDNa50aOt6EExS7ScQ22m/KggJlgE6Q8KgQAk8iNWUSEHoQg/wvCyq8STCUXzBNxJxam68V+LXlH165qq949Dn93+97Wr9//grf0epqqCYfgIHG2aoExyrSBlF7LcvUXG3rzx85pu9/7d16ie+iozXX1ny9OY7M5townkXqLWN1msf+S622MuZTNwRJmLJUtbEEzhgnF9Z92eyUptEwTjFJW4yA18oWTW9CM8++Id1+5OgBnWAhe3OTL2ZlZLEbHQZ2Y+ig8+GLK+nDKeuhq2pZl+hDRkv61HaBWNMSMwzU3dsGCqzgI0opxYYOt9kUp1sr+vKX3aOvf9Wtmu200/vsyKyMPGkk5SJLNmwAAryhOtaN0FYrtvQ/zy7on73jnP75u8/od84v6DIHzExdOshrnikOE/Fk4p+6sZ2bQrWK1B/xpQRKF/u2MuiM8cvgBOOUGbqm0SId8QAAEABJREFUs8gBBz06RURVgCySuf4/u3/7wlV96Xuf15e8+2n99wuX5TY1spraKHR4uqAKciWAlZ6QUt+JR5ZFtXjF9ndvP6nvfu1duqNOJ2mraKf22OW2j2jSOuzhVgELA0U3WfPxq01uJFJ0Et88U6l0XBKCyGUqInGN6XvJAwcaKWqFCOleTIO93ntt9LrYe63agRZ5ohh2wLVuZbfKv4N0+twPrY85EYupm2VBp3mFdZ4Pt7XEU5Fraxe+t2a4vVax666HmZVvv7HXR/ofQ03Z6oo+597b9G/+3D16yXRdkaeRwF2l6A/JpgoBjGQiBCNBHYpabGsqa6oVWvqzuUV95wfO6+veeUbf9cQl/c9LizrfWdVUvaPZelszHDh19EW8o4HdOxqivWbp8JCialmmkP4p5QlHp8am1EbfOmlnlzEE2BiDlNw2wNxlSc80W/rN8/P610+e1We980l91fue0h9fuSKmjA7VaoUba8dkGrExBEofaPabcXC4r6FT01e/5HZ948tu1ywKfsKSQLT3rp1slX23GYtHF1bTWLn3jpnL9QATRipyYxF0O6+w1tPdG7JxenV9W5pd3+p3t3ZPvO2u0ZOyhuOXH5lS05uSK/BtpBc2408yp9goEpqyyFTO2Kgur7T0wmKTzYuhsLMkxWEqe1npp8cZgiWltbZDNDdgJUejdRAPq2WQh1rXRylzGeh7XiIG6RCH1uqSPv7EYX3nR9+nv3LbjBq8nghs1oiIZEx3jeyj4syBlvLXPEEdwtZhw+7wAqyetRFEPb+8qt947pK+9dFz+pp3XaC8oF89fVXv5471qsSBEuT/UfJQPegQG8kBygPqyAdEUJDwZwgBXAZxBbCglsc2SkWReAgFKz1JnuKVyu9zkP3g6cv6qvc/ry98z9P6msdO6adOndOzfPCd5qlhKtTU4jBoY63CUe6dHDoANIc+d9QIUYEnqAemGvqBV9+pL73/JAchPCoNIZDvzRRploHimpP9GOyoLM/zyPbsworqYgKUTJeOnUsrVyA/bCU/id7Cd6aTLNohahWLCTrO7CL6N36gHAjDtve0cOrilUen5c0uau20TByUUlk2gsXvue4PqU+k7yBhiGWp3LMsOWtK/Hs/WsPfCYbrGuW30tT11NzbXB7VYZNsczfu1zMvadT0La99QF/3mtt091TgUG6lQyJyejhertZ2nrhZ6MhBK89dzhsO6g5fEjqargFZW5eXV/Sn5xb0Ex88p3/5ztP6hne8oH/9vtP6nifO6aeevaSfO3VRb73SVKPWUC1kyoCQuXWuSWKYFNK/qODXYcov3wH/r4tX9aNn5vTvnruor338RX3Oe57R3337U/rqdz+rH3ziRf3hhTmd59A4QN9m6/ZfV4dORJx28KkYlKlDvRHfMfWFUFAizTo8VdGOZqZPuuWkfuwjHtTHHT+Mvrjc+0C5t9NOtTASuycWW1psdwTqRMyULtdpkLnRuakAlQFKeg/w+Hcwy3HySRoRAcI3QtJjO4w9aoJtOQIPHZnRUe4SuTFSZKoa7CySJSAjscExh0F8R5Q2PnB/B1mmTINBicnYKYytacVNOrfJCFjP0+g2WRKITsBroIyAgJiCEtlYvUdP8Z7/M+64Rf/+I+/XX73jqKZWpE4nSGzsjlECghckbMWFPVEHSTnbijqw/MudbQ6ZVl1q85SxyCH0zEpTf8Srrf9y6op+6umL+p4PnNF/ffEKm3WGbUgQgj3bWw5VKm3wsCM1/3/n5/RvHn9B/+GZs/rNc5f12NKyLnda1IVCLVPg4GiHTK0ojokof9cBpW3gMia8BA6PEiJdBDJplc3xrqlp/etX3a3veMUduoO7E88ZW2gfXGEH2+jovX9umbVEDDuSX0Om6pgTqSSqqQxlKzyu6MEktHrk4JRcdtXhT9LWIuA4bs3yZrVizg7r+u0zNd1/qCHfmaqYuGtUmbElLy+jslrQqYWWzvDKppZ5OHLJsDrG4ZVLZrju+tLc5trqt4+1HvJ6U24hkDbiCAfceymYDM4i8Ws2m3pgakrf8sp79a1/7k69enZasdnmRRUbAQeJgLSh2p5KXRhA7U4+byIOOzjswPRh0kISqdgxr9Uz+a8EH2xkacy8yQtdzhhcYyhfeVn6xRQN88Uh0NEy31OmMZjmqanBYRFCpo4C/kQZ1eHwcn0GuW5MIyUFWuQ0MBo6kl/JYa5mp60p3st97p236idff7f+r9sP85rGLYgK/NM+uAJtjMBOpbmO9KGFZdU9B6gk1RVTLs8JA4hD3oXUJu5OZlljLznYwIpkJsX4aaI5GAHvWIO8Cb2ZCDAJPXcblK86PiO/kvJUjiz2iB/Lij2jLCiROCGsoXdltaMnriyzcXk4InekGFZSrOB9KHUmmXe2PsEoImmvEQ7nrlFbn0FbSoVhzSnFZWld42uB1tgBm4PvwsNqU3/xxFF9x5+7T1/58EndyUbtv+jr/4hKNawdMpzZRMRS6QrEMLB5hJyDS7OtQ8jT3uKf4upAmOff5k4HPyPDw4oyTp/Axg6JDywLPTBliSkOEImHBOoRwLHA5gQX30Vl4jLKZpdMwIPBLaLEJWwQmDHrcHC0FKj3E48c1U+87l79y5fernunp3GJDrXKdtofl1scrrGp9mFY64YbLr4bnuHVYEZMHMdBHduZn0qELj3WHufb6jXdzk2D5Ygm6RojkF2j/cS8EoGPOXmAuyLuaPOtAUn/MiqpwMQXd9kSmEtm8wcuLXP4JI7WXiFneSXkWCW3zFBhbYAOdbOBTVc8yngE3y0zdO0h3OUuPQJhS5b3zTZ3jCutjmaJ0d+77w5938fcp3/00C26rzEl8Toqcsfuu3dx4Ii4yzEFUpkqCqA5RNMG5AmnzLjtbynLn2yKPrhuHxRYKb8CnoMCutY3rzwXAoTNogKHSlCEEeHlCRokwozIFWmh362hE0IuW+IUymJdn3LipP7Da+/R97/hHr3u2CzaKAtADxd7LNGBdVq0vnQdwzFFH5xv8soxKDAe5ANW5gBF3EIhjQo8EUqP8JbgAMz0lFLIJsXWIzA5QLYSu9hvVJIvPTojv8pqd7y9sFmgZlkfVAnk3LKyfQU9cXlF59koszTxrWThADDxBzi7Rva1qCCKotuGki7LUlDQJZmX6/TFohLEHTpvdNgwpCWeRk5kNX3uA3fouz76fv3jV9yl1xw6pHqrpnYbt8QOsfxnPgw+CNg3xP69BtCWArWQmmxEHjG3E5IhSZa9AZQlBnWvqIAeKhjw4KBuHWgknLJMMXQURQ1ZVFYD49BbbbZ0LNT12Xzr+dk33Kfvfc1deuOxQ6qJy4cM/pVA13zRxG3yVDYllsia0nWNlq5R3zSjSSQfm18mTsXW5Qr7vLj2iJbLXMAUAomqw3r5wekUi5hy2JN0TREoRuGafOx540gLDRQ7kso5fLgW9NIjDbaKjvKDoFJdrOAV1HdCIdT04mJHjy+sKIB7+rMCnCqa1xct++hWdLvSRcytQFUZ9gAJp0gjBYXcRarDEQGYrf5WscJBchTZ37jjhL6NO/Z/87rb9DfvOqLb6lOKrUx8g2dnZ7PmgGBI2GyCMhXA7p5JUGXlgScHoQ+QOkA6GVwyAq4+khkSC0uXuM79ggT7RIfzQV1AqYZ9HYZLV+A/4d9p1/Xq2SP6Vy+9S29+43369pffrjccnsEXDlIltAufmO/LRC92tN0vrLb19NKq6jWPoqM6WCPxY4xCgrwpKZzE9pZGTfcd4CXloEmuNsm3EIF8FLZgeNOblJOwKNNBQFDecMsM+4+3ocgU9gSHSYoFULCtkMNgTqOLDohf07zn7KJaiHIFI8jyIuWYKDkVVwC6yUQJXeb1RVJj+9u/6QYVPkI1IAFmFlKclrmLnwJed+SgvurhW/lOcru+7pXH9JdvndV9MwfV6NQU2sSFO/oaldexbbCh+3crGnx3yDjqAx/COzwx+h05Kukw6aCPSAyLUkaVmPphCICwIgOR8d2j046agq5DT7FTTfHKjVfscl25f6VfGHzloYP6yvtu03/6yHv1Sx9xj774nuPy73akvqWKgoS9duByiw074HqoS3oylH/tzKAPzq1onpgHBcZG6cBOfod0MCadIBFXPwPeO13TiToRJ96wdFNdO9TZm+oAidsdRDtkfsqQZ/qIkwd1qFFPG1G+7zFhy3rRJ0HleVoB2EYUMzbFD11a0QVusbMsg4Na4dNYH2BjuvRivIRhvFK2HeUa/wWjKLpVVGnjhlJYxd3FojtGS5VUmu/o9cqIjiGJ1akFNWuZVjivV5sdncz4lnDyhL6GV1vf+oY79c2vvVWf+eBxvf6WI7p19iB3rVNqh5qamLfZ/NscHqvgPvx5iJChrZjGjj0mPztiUgAHgVluPG2zQ0edDu/jW0taaS9rqbWsZWiGUnfMHtAn3XpS/+The/Rjr3tAv/z6+/VPH7hVr4GfXqLgi6rwQu+SU0qo/Z62oxdEemgYIgHzb583WB8iyB4vQ6ozZT0z+8hZgbEzP+hlPOnVQSOziGKStiECN9UBsg3xWusiVlhsCvfO1HX/bF3NlreYdESkCWw1g7VjmsDRKAqUbGZiEzl7taVnF1ZZG2uHBS30vSQMoCPS+tIRRhuw87pHK62RDzJoFKnroIp3mQVSylzaTRAbQCFLBcwAkkNEWhCEjO/RKe5xtaWjPEV89OGD+sK7j+lfvPwW/bvX3K5/++rb9E9fepu+6CW36lNvu0WvPXZM98xM6RAbE2eQAj6ajCGmSocKuIeGgnESENXKa9QqgqO8eHr9gVn9pSPH9MW3365vvu9efddL79dPvpID49X36fseuV1fcvsRveHgVPrDfTglRRyRXJl9hbwnRuF2U8Ht0vsFce8Mm2mv9aswyvYKN1fPLLVUSzFTCpmfDOWrdGCc8XSRxg3EB89BDp1HZqegJmk7I8CS2U53N7EvVrznsO9wPuqWA9zpst+kKV6NSaGEYrSM26eI2CBl3MVGfeDSEtO/f1hyOYprUljD2YuM9VqZy/K8r+10uuTmmwQUPKW4iSsaA/KSnVm8X5Ivf3Rvg/i1YLPZVmh1dJQN/+EDDf2FEwf0Ofcc0Vc9clzf8qpb9f97/b36vAdO8hrKR0gU2ooelwQ4YTSiPJbGlX4pMIIeYhP7+ofv0A+/4X79v695if75w7fpTfce16ffMquPPDytEzSXhCHaJKHfB/hQUgBxGa0EPpAsGgUDqnuGdHvHbUzZ641tgp5dbqUn9BpPnZHgGSjyqohvCKWXkNghl/htpO5m7O/k3aLD3FUr5JNi6xHo36m27mffWMbtbukQhx916wFl3GF22HzK6qzmO6Ec2FcQlDhoShnT/v3nlnSZd/IhMP0925NkMEOG7iDXtOtxuRMwzPcwXl73aEku3yB3FwdUEitlovcgVOHDBQxayiTK2IMgiTj6p6S4eeWA7miRA2WRD7EtnqsWUJMAABAASURBVFJmeEq8p57p4dkG79LbanLIpGOEklPEKQeFvIySX33Z7TR3tHdP1XWSzawhLmTpqYWxcwknT9QvQ07lOboJKce3LBMzz0qVnNo/uWOzmbZbf9zePXa1yQGOdw733M54aR0ZI+iCdEhLyt+3XnWort4foMyVQl5M8muIgNfcNZhPTNU3C3PiEe5AHzpc12rH97OqHCM5zlRPk92T3MJ8w4nK2JROza3qaRZKLdRScMtFkIi9lI3RsDFUhvYoj2JFxAZc8vLSng0VHVBzDKApBQe3D2DjgP1HHXz6dVSL915NPsTzCYXDAQvk6pTjJHVfZ6WBRlhU4IMLb72EP5JCFpJmnvXEqRkmk70zg3hoikk1SGtKbXAN2mygvuNit8eVlKXxjSAWCmVZkGuKBQbi3fPLatSyFKeqQrJ1VlTs9WXU4AP/ADcJrzw0tcau6mOCby0C2dbMNmW155Q917a1URWHPgymQ9BHHG+oyaT3ZmUxe1LaQ4wbqvV7onOiKISMD7Edvfvsgvcw9Ps1k17VcIfwdLCN6bu/TSPa288e03NFrWpf4mXZVStbUpZdAZu0ZG4VbO6x6cA0lB/Pi8DnJwfjxyCASx4fjyEIBAcNeS/hxEFLTguucaPmuzQkvBAUhdnbCbRkjbthvDVK28DYoS7RsqCneH11Cqj3jWQ+GiikYXJ4vf5Me+hctmHeUa/pJen1FS1kbe5WPFz/jQ435QGyk4PKFE3u33jbAU1zt2Q6n7BsOiYKcJEUyYz7rsllltX06IUlXWpHPhZmabmgkpLlCSmy3G9BXLdisFVDGrJtDS0dlaXrIq4uEpR8l1V+Eo7MvOm4F37V4T/M12GT6diFmYbCMvLY0fHrrbRdFcw0QhWlkl0tkzhlVW6y7GNsA7G2lt4muw3uh7pwqCwoS+MbwbB2rmfz7vlVtVAIPOHlPYrdURj0xZkhhpB7gcg3LVV++xwHpKp+t81VJjqTNF4EsvHUtlHrRh6oNBtTJr/Gupd3623es7vLnu552YvlWjoq1Gp6YaGlp9JrLDbBKAX+aciFaAh3t1lhSIXDWzZMc4jxWpYN+1z2iB621kyOmx8zXCZQ97JLb0TebIRO5MDO/P2i3Wbj8Y9RB8qkIT/CBAwyKkNFvjoYQoLmOcgGCQcbaOyIeIeduleOgMvNVGV9241j49dX75lrquGvXMnI1kojmmMepxxUXOX4TEG//HAj6YJ2U2k3mtGVTJB1IrD7B8iakVundTsoSvNwh/z7jvYQj82vPTGTv8aiHvYbuc78IOnlZlqmNMWjQghabQe998Iyd1wMTzdeXUTltZYjDeNFVRbXMAXk46b1zUtpWRZe3YACLYsBjZI9osQBd//DhciGC7zvd+NRra/EbUmEVWcAjjRqmpmaUpuDpM13ESXLwJaVAUF18mm+S/mX2DqSsnQnTFztBFpJXyMuKxmUtIKUSu3zy/1wr1xupSvj2QU9sdTW2dW2aplHyzWxfqiY5OVjRhfMUxldTvu7Zqb04HRN+bW2xlw/l07yzUegHJHNW96oFludUYUd+393Un/kySnwmO5kHa6+6Wt9IKLBNkRKBGodeW96/9lFzbGR1cPaIYpoOZWl8bFhS0Y972vN13J62iqXssqrjMFaq1JSalZLywy2MlRl6+P92vYRiHheZpwEM6GjBofHY3NL+qH3vKDfempODQYxEnsUU/tr5DVMDvB0+LYXl/TLT1/SY1eW83GFn9eR5+u3Zueku1073U6dKcut1D+OjXXeO7eqFoeBR85jkiDPeuvGil1gVdGwNh9CXjpb1zFwP5EwjJpc2xuBtbvT9vrff96YbL1GbxULaa6+7vgBnZip+/trorXO1Zv7URl3Ws/PN/WhhVU2swzbCPSMQ4GWZUGOLAb1BumRhpsWxE1bJIOxGzS2IhtL8jw8bjSzxoZ0oBZ1piX9+PvP6tvefl6/+8KSnl9sYthJP31l4xCCSBzqQfV6piutjn79+UX9hyfm9L/OL2u5g3pfCn3UbhHXp9a8d4RT21X/oJ/LPBG+h7VQ564qUAtvGxU9IFTteinEcZHAeAnmZei98siUspJZKW1rqLD2FrqnG9cL1bDY9qQ3OLbtY2SHQCBufo11rJ7pNcenirsnuLwqYaanA8Wo8T7AznRkoay2ot7x4iIYduYn6OER2kAxVupZjqW+jUqDNed0nhfV0JEe3cMK6UAxXI6LAb0q6XtXIAYF7krrPHXUpmp6y4UVfefbLugPn1vRAdT9Z7799cMf0j0+5ffyDLuMCupsSP4Ju8NZUJOD5NeevKxfeWZeZ1arpwiK+BIjp+IKRbmTRVnrTtZR9V2tb7P9s62h6q/E+/lBj/It8OxKUzViHxiHYAUPjg3AScYSGDc49H76ONnI9NIDtSSTmdpH12aDep26dlMfIDsS82LgPZGN/pW7Don9Jn/dAZOUV2thwrqcdNecKBZIhtFj55Z1MW14a4fJ5obk4hqz4X6GcwerSu1NzBJzaUhMn4c5sl6equrZjFYd1EmGQ9Thk8SmIxlRim3gqYNzQ4uhpl/80GX94Dsv6/zVVU0TXv9RRMTpcEc76Zem9uANrA4DVWWMj59gxAnzzrNX9dMfvKL3XmnlY5yMnbmttuTgMgmYotjGtP0e12uca6tCqeuelni1HMWv6qyHd5g97+T1FeeGHPekSwMcUQpGwxxjLnvgejnf9XKePo4wB9Lrq554gm1jBLrjso0+J66KOe2J7NdYt09larMYTHtn8uO12IRyejBcQZ7wgfftZxZaevTKiupseLYp3CaD4bZJtE3ZZmqwbqCHvarNyakeltN5PsiNxXaQS51Xe2saYDMgL1IpL8uCnYqYcmcJI6vFtmYa0tMrbX3nW8/qNx6f0xSjknFL2+Yg8GblGKOa+pFoEzhxDT5AaiBeMIEdzaBOSE80L15d0S98+LJ+/8yymoUNZqSSCOA7kUr/O+G736d7MKo2y/q1c2oUP5dunJ9pSx9eWOHAZtVQeW9M8Azd8wBdmT8exxnojz7m50prWe5yAtsdAa+H7fa57/z1zcVtaz2TlkPiMK+xPuK2A2qBiw0wUJkhrwaCxPKABCGBpORF4Hvatzy3IF7T9+7AkFoN72B7L7ltbtXo9uUag/Kcdp7L7aMKjkdO5/I8N6eHmeoBBxoix7rO4TE9VdfbOIy/7c/O6v0Xl3SozmsnDo4W4NeN+Rg4pybs0imCM7eIh0EO8aCax0++0LGChQpyHcvttv7rs/P6tVPzmvftr9USRGEGhETtx6xseVnuTh+C3ssN1FyzrYwAxkqljn6F7KJRjDlUm7V2/4GGHpnx6ytzYU7SjkTgpj9AYhHWsizIrRcVR0a96P7yXYeZ2vnmJGMWyFc+4b0XJYDF3OcJBF02tlot03vPLHDX3GQDY6gsxNY+UU2piidGmW253KpHGjZQ51qOFQb953RvU8hpImBlOVwqLm/03PwXlDVslcfQdeVgGoAIxKsem8p4F/7fXlzQv33rRc3x1dv/p1ATRy08RZ4iKHggzG0ifNfjp0B/C/G4+ODIaJb9UYj9TC5lXYigjEMkpHF7y+kl/dKTczq9zO2z8sv+Iu0h5YxtznfKr5vpfu6kf9cxDFYU9WcXyYmv609AVo2lY4oaY+e5gBfLKfwq8vXHpjVD45M+vEnamQhkO+N2/3llrm1Po0tHLpn8dvrqo9N6+FAj/W0s00r8wKYTFWBEwMnbocvEBAlZpsvNqD958SrrJANyTecGVFKyj4RsmI2jWfW8vsNRmqP49rZWtpZjvS4MEQ+yqrRxPhthHuTXVu3GNE8FV/WD77qsKXaWGR4XOhwaHW/+AIPA7uPIR/FMkjajDk5Q0aok/zRvLWQKHOZZFhSCFPiXSfLrL9tHf2EHAh544NSHLi3rF56Y04cWmmiVKWIVGMOS3p4y4iYAO5W227/9jdPWp1Y6evbqknx4O+a2cT8TOINhvtFAZDMgwPOBMct4ve7wFBwY5OYbm8D2RyDbfpf70+O4E3vs3tlhAf7pnU+4c1Yr3DJFz3omdenHKsbLkt0spcRDP7AY3vrCkq6wk5ULIcQSs1ZXPSfGzPs9SFW6imvE1WtvrjBI59w875flVJ7n8jwva10ryeVF3hV3kW4AInGJsAOQdZoK9Zp+/ZnL+rlH5zQL09t3G51OAfYYwSO995NIjHbVkQ+P5WZHBxmrV98yo/s4/Bt8hwpZkBeMIWATZH0yknGDNzCh98LVpt7MIfLYfBNpnmI6PtyKnl0u2VpOc7dmuAkr92kT6tui6n6958oqN1yR7x+0AAZ51zdDmXDYlEhIkfEQ4J++evBgQ/f4JyOi0lUUCd+l7KapxmvhpunsrnS0nK1MauZz2jK8XfzlO2blHyv0x3QzSzW3qcRdGkqe8Rp3vqd4F/zei8vsSzVcmWuNHriqHrUONrbiOj6GiNa2iGaOqbdWrWxkWa7V6OcUtVOQUsW1TlvZ1JR++Zl5/eIHrmgm6xByg+RXU7m9t3M2cw4QHyi29d+68lPHIk99Dx0/pC941Ql9/suO6W8+cFivPNpQjX+RQyXStAQ4AiXHF6dP8mEKvMYuN7/a0i/6EJmzVwQpWctWhsS4pmx7vAxvwnb7ds+H19TPvdyR3s33qnrmp+5CVhgHLyrApSGXBokB6RDzDuPzmqMzqiMoTMAmaacikO2U4/3od0cmHHPbsbiDD3qvYBNa5WNreu1BZSQZLC9L4wlgpLtZFkurE/WW5xe0yMYUWCSsljKVqqncKCuaspGaqFLrXTRtPfEWZaXXXlliVYfmlWA+IXHBwRAUiFOt05Km6vqlp6/oFz54Jf2Iblvl4WFVDg2KSCdtGxOORtbWCmOTwf+rD57QV7z+Vn3EsQOawt2xWqaPu/OgXn2soYY3KgA1J6x7qecv0B6GCMYCh8ibn5zXB9ccIsgHPLgt9laWxm8EGLs/STHoUW6YXlzi0IUmpdeKeRwSpYGwOZCso8god3SUp87Xs87EZW2KpB6MTGDbI5Btu8d97rCcdNvZDfYRJnHQp94xy2LoMNFz7xvWlWZ9hyePoPefX9bj/pFGXqXgBAdJSCmVZwqrSDfCVfYh9askhpSx4OXxFa872sqmp/T/PTOnn3/skg7VpHbspLD4ycP6ESoBBAkKOXetS7xpuuvgrL7sdXfq8x85pluw8w9TtYh3K9Y0HaSPvv2g3njHQc3yioo3iorY2YcY3RyUrpznfS3wzCItNNv6ucfn9OG+Q0TpihVbqlBMXNvmUJBrilJvjWAbGG6HYRtcbc4Fla4SgbfyDcmx7RqnidDrsW+sSrCOJTy0yOP1hiMN3VEPaYngTtGZlSawIxGYHCBDwuoJOYR9jayoj7/jiO5oZGp3PN3ZIJjcrstg5y4NSpk5KKAaQqb5VtSfnV5UW/CSQlcpUYltkwKsVaD7pChb7NKQqdenXl/lqyBDoRASsyZSAAAQAElEQVTYJTJeW9Ubdf3mc/P6j++/oiNsIh14VuXBhEObTSUoL/Hh11URKuKj2Qr62NuP6ut46vi4Ew3VVlpqR+pHJkcXOynjo3zUy45N6xPvOaRbPI6cIoHDJOngM6Wo/ECXcmtoP474EPmZD1/Wc1e5s5YvCyTOIG3myq02Y7E3dMdt97N8PP/wPDFKBiFvPLhvEjwUoIlXliYChMcysFY+mtdXHjnrw+4bGutOYHsj4Fhvr8eJt7WTtlgHR+qZPvrWA2pFjoFA6NMMV3fDEVdSTRmEE7gXQ0D/3eeWdJZXIjU2LbbDXj3oWFVFWRSJtRvZztRHcLqOjRiK3hhF7A0l4/DwT1tNTzf0P88v6icevaBDjUhMiTHqvlOlKENj1GbCDKilg+Kv3Xdcb3rVSd3dkJp8/2jz1JEUFSkA71DG2e0jp9EdB+r6xHuP6K4DDTVbUZGxQbGbsFAJqakQdaQLrbZ+8cnL8t/TgiRhi6zaOOuXgELXT4lXyxK3C+PbBdvpb7O+3sXH8wVusEJghmNMhFIMUt8cmIQohSyQB+WX9e6cCnrpwVquXwpy8SQfOwKbU2QX25zBRHtrESg3sk+5+4j846TiFYn3JdZImvA+JIyYdg2e/5YbF3fKgQ+KZ6+29Wj3Y7pYPupe1s+JYVguGcx7moOSki5bU9KDZU8+6GuQHrQcmx7hyDU7poFvHo1GTX/Ea48ffO9FsYcQF15LkVsnUIayMjO6gQ7ybyt/wUuP6fMentXhTpODnU3Lh4F1GB/795gkKH14Y+MQOcaJ8In3HtbDs3V1eBKhGjRiKvDCAaYEURLnveyrju/nF5r6tacuUxeClNj6rISliyok8ZAsDPAG6QHxpkj7MmzKaJuU5ziM33ZhKY+bA+HAp7KooIrDMumhEruYn+pfd2xKBwm2D3nEIqSaXDsbAUK/sxUMer9ek3OwHbtNh5D3/HUnDureQ1Na4fVKOiBYBaR1m8MWk+QdbpvfcXZJVztRrJPEq9rmNST2yGwcnZHGfQLXPNzbcG6f8RpilE2kz66pahBhBO8ObPK1el3v5qPrD7z3vMRH8Kk0owNHrth+MjnsAcxJAV7W4TVgVAP8819xq/7KPccUWoJXU2CDZ6dHNQJ9NUJQKXlAEkIQQ8AB1NEb7zqsh2YztWGEgFMa53EN6FGbEgu2Moxp73RW03t4Uvq90wvUCS8lfFtHKUucwQyNLquKd5n7Hgl615UVnV5pKmNy+w1iJ/UpEpUIZqgWIT9okLZhz9bqeuOJWTCSgx4oi2RLQ0FOim2MgKf1Nrrb2NVNM5BDOuq70Cki/nG3HdDSaqfY5NhqqrpsmGnvcSjhsx95H4LFcmJRfJCP6c/xxbfGRmRZYAEF6/aBOQYh1Ygrl48QrsveuuU6bkc5LfiEAmMTgT4FidccU2w0zxLHn370vK4utTQNDdtnAPFCBwuhLWLqPcXHQht8NtT1D15xmz7ljhllzaY60PIOH7Xm6rFCV2Y/Eb8RX9McCm+8+6ju59VJsxXF7qcQggLaho6i3CDjgm86MHa/e2pe77q0hFaePDdybHie7AtRFTeLGlzsa1jmAP7ji0uikJ8gDARuaJ9i0WFWhAL/Wu2oRw5O6b7pTN04FjpDHUyY2xYBtrNt83VDOdqW+VdxkqOe7tJf4/35bK3Ga4zI9FeCqN5yKXH2J7g537wQMl1ebus95xbhB7FfypdlLhOElPdlQ1h9cskaBm3y6qt5pC375khZn2BNE0K3ZaGi6Dv8Bk7nVNNPffCCnpxb1UE+mrOXJ62Y8jzzhmQnUR212XlmiOEXc3h8/O0H1FppK7KZ27chj3RuV+bmG0pZz3dUpA3exKZ4mvzYOw/rgdmaVtnMOgyMZaUPl107bEgy/Jen5/QcbbA8B2vlteV0L7ekR91oWNBTV5v6EBCygS2JjjNsHAx5nyFzhNyRSgcyyOt5fTUFz3JIMKksNbl2LAIDo7Vj9dy8jj2jK733Yrj70Iw+5pYpLfFR1RtJRQxaGLgwwEkJPHpJsAG+48yirrBR2dZ3XF4oMSkNZpbkvB6W03luriGn1ubryTavXfVWxdd6Gs0JdLTGy592vaZfePKC3v7iVR2ohXQ4iPggVn6F7qbT4fDwQeLD40tfflKfcPu0OmzcHQ7xXMlWhtwyz91Cg6mAZ4Moc1C6sGEQ2nDxqI+7+5AeOhiKD+shaQiVhFCSQM0PHH1BS82OfvXJeS26cSqvXKukBktbm1ctS9z8/QiRIL398rKu8i1pvQ3Jcx3VvIssJPc7ctdwSy3T64/4+LCIcaewrKsLfb1Sasf1qnwX6i3Ga290cxf6e32qqOwJXiwO+mfcd0jiMDAtrlLFpQHWkBQVWCxPzbX0oflVZdiHNHQpG6K/FdZmfPXrRqrr58Bgc3W+HvTZFETer8KqSwQF3lHV+e7x2y/M6TefmtPBho8T1yz5R3PL6thfJOzy+AbVeFT43IdP6hPuPKTOaluRwyPYLKjvGiCRreXkPm2MWJSodBTUoNI33nVE98wEnkQ6ivCVLpCUyEyndgVlPKmcml/Wf31hkSNOlavQg9PDIEjUphIgh6ZBm6FKe4YZdLEZ9U6+f9SY25EYlk0b3k+4JOu48FPl649O69Ya4w9jsO+DtO12E2jSbla363V5L6PSG72bdHELKbIpbMFsA5P8DunP3XpI98421OLDb7khxYplFa+wFULQCk8f7+QppIVSvkCiAv+6eqGLbYhsQnXA11pLc2LSMpaQ0dkmVSL9C9xt1nnyePvlFf3sh+bUyDL8l9FjA0lUyDdj/EewgEokXp/1wHF92j2HFZdbilldIUqEMhmhqpD+iSsUQLFhwgk6tvBh4SeRKRx/zN1HdIINbZUni8AhEdjyA/5RTSlZBarGqBYy/cmLS/rTiytJlmdJI0fJUSUfnqxpGC4dn+s6DONbbJ/mhxeafDxviaHqOk0HSTpMItEjVkjyfrqVOeYbhikG8SNOTKfo5lwUJ2nXIlAds+2r9IYZyW3sSOmK+e/FMc3d1iffOaNmm7CziSgtAfVd7C99dFpG2Av99/Ex/XyzpVoIyTIUmmVZkBTjcFAjVTWrOKINkrW9TfarmZvaXGHnvJJRUmWp1BdnKVw9dtrwG9DnOAx+7kOXtcrrvxk26Y58uW6AWCQ7O4CdccA4vp901zF9+oMnJT95FIeHVTwOLpVnUrfU0Mu+DUp6IeVl/4IkqufIko7Ugj6WJ5EZiZdtaCCwHJIU5H8RHkjql9vxO6cW9ByHGwrdFLrY+oj1DFUt04YqbxRuvahR0mvn279hmCcfD++ZWyFuUSGgRYqFokufIY5PwSoOk4C+1OZp9P6DDT00k29jmJZqk3KXIpBHfrsru4FG0pN4W8NTOHSI/ip3xLNZkB/Dyzq8oAoVebV08aQQzFJWy/TC1ZYevbyqmu/bukr2mhTXyaxjGKYynD+MO4wnmWtQuvJm9ejErGTeL0SW6+WCKi7lttzUq8bTR8xqevMTF/Ve7tZn6pn8BKaYx0TdCxuSw+Ld+40nDuhzX3pCU82m2iGTXfrO1cENJhKo7wp91HDCOjHZGqvqBHlju/NgTR9316ymOfCSGipJ050BpyXkQR36H1C4wjeZ3+QQWeKpBUFKkdxAMTKFAckgbfEwnvlVGEenqr8VvKyjLO3jUlt6bG41PU3mobG0v9emfIjkhwlWMDyG/kmtjzgxIz478SkLZi4imiCTtCsRyOfxrlQ1qSTNbK8PEE/3+w9N63W3TWm50xZvzNMiMF/KjxEvElTzwNkOCMg8aD503nVuWW0UOINynSJHrcD6i1H8qtY4OqX+RrqWu72l/mCZ9xWuFekHWDeZZXnwEQky05jSH527qt95ekGHpzLlf9sqUx4jFHoGilmHw6WjBw/P6PNecYeOhqgW/kMolZRfJsE4g4RYvvAkg/H1wDqFOaYRkOw+UFdgQDq8mrz/yIxee8sBRQ4R/16DuIICuZRFgUW5/Z3QUYOnlg9fWdafnF8UIpVXKJERpXUNpbjEXRpK+7K0nvEqmLeT4HbYf1kaT0DA/JNXl1od1bk5CETEcz/JKlkAt60BlPgwnhy0xxo1vfpIwyygN9NKPZjoOp/ATkXAe9FO+b5h/FYn5IhOjceuOPIdlYP/l/mo68PAd6IWl5AcJsJZolLmxWQkhKDHL63qYrujGnjiOSuhVCzp7S6H+O9n9VPrVh/7tw3ItPDZixV4TTEdsvQnXN78+EVF+kriwC09BradgAMAQdqQO5luyRr6gpfdonumamr6PVf3z5Ogh4USYCYVmGQEFy40zuV22ptKCzOUXx3aHFstveLkQT1yZMq/4yhxsFgayCJZKOzM9nwIyvR7z13Vs92/l5W3r+JW610BoYFiTRrXxxrDbWIMrR/mY/MrjE+niERRGfwCS0WV5MhNc6DJAfLI4Wnd4x/fRoGUdMvMtKGkJ+XORMB72M54vsG8butkTKs8ZfqY2w7p3gOZfIj4EV2uyDAifpEdzuLA+/0Ly219YL6pOptjSIY9o9x7j1b/Eu2j1upqG68xvBcq7pcrLkij9E3q1Or6T09f0Afp60yDpw42D/e31E9xQ9uHB4X8A52f87Lb9EruTlts4oHN3PxhUK3L/hKYaRgwGMLq1xhQiNRba7f0EbfN6o7pTE07Z/xsZNSQ8IRE2Zwh1W9xiCxHS7YP7NveytL4bsJgvab93xN8cIHXsMzlNIZmpij0WuYwGHoccfMQlamm1x2bpsxnQjKtKk3wXYlAtiu13CCVlBO5LLejW0d4DH/V8Rm+73bSwuhwEKS7rLSiyhqG1MiKafJqxH/axK+xIIUpBgmj1MBS1Cauno81RmtEaxhrTDbPCAoR4KCocXj8yYUr+o1nrmimXkuv+bwHR/cuuMtk4D48MFGTDyN/7d7j+sTbD6rFR/MOm7jjYq1x2rGRnuVV6PMZS8qIR1G8OpP8jfejbp/VgRChkbkDFVU4ifKQ15F9+Mqq/vD0gpsNv5SCjpXcOhGRHLRjV17POO6rmsZTj+jnqdWOXlxcVQgh9dX9T0jVaVLOx7kDv41CE7iDJ8tXH/Lrqygpt0c8SbscgckBssmAF/N5k1Zr1e3Hry08AH/97sPKWESdcnVZaHytGZx8sVjMa2N94NKKLvKax/YIvdJS0Z9Zu5+zU1S3JjbLkXV0lQqNor9Vts3r3Jm+yPunN3/okpbbGU8jId8qgorLSAlSG92Pu/WAPvuBY6qvNiUOD8d3RFA0eNlTH28No0+6IeFuxRDU4jXjbTN1fQTfQwK7IIktUF3IqyEndeDWs6DfO70o/3a26LHGuFJdSc9YQtZkuF/D2zojryfPN+/Fdu+fa2qFU8PtMj3Mi/moEBXiBeHYNYnnG45N6TiDa9kwuwlvdyLAEOxORZNaigiwCAqsW7z+5Kwema2r1WnJ+0VSSZlGXIEFFZWxwZ6+2tKHWTV6qgAAEABJREFUF1tsrrzagTvcYF1ncp1exKpeaxhV4QZ4sk3ZcMXUnAF5lxd4+pDcm6xe12+duqxHLyzpwFSdpw8phKDulWykDqdNm6ex+w/w3eORW3WYA7XFV+uoPE5d/a0gleo2a+7akw0Hgl+lPXxsRg8frvM9pAMbaUxF6hdYGj3fVJixgsqvPXtVW32VZdcG+91J2Cg8VXmJu2yx87/zyrLEeNJV+XJ7/dyWSjJUYIOQOziW+QlkitnxhqPTsp9Cao0JXIcITA6Q6xB0L4a82nwT8Z/i+PO8cvEvnollEfKVI5WKrBQ0xVqDR4L2wvHd7TJ3Yx+4uIwmTERONrfceA49WU5X89H4oNUgbcthvH5+3pJRetYtIWmSZXSgwaurd8+v6refvqyZ6Sn6J7EPp9L6Qf7nCGEQeE1EcP6vB27NP5q34QcfQchQRkx+DekaHbgVHRof2m299paDOt4Iake2zYpfuqyyc9bP6N+TbLC//+LSphpuW8OmjHZbmX6f5mnxmYVl+SnT1ftw6AbAjEHAxv1q81rzXt4JPnSgNqgxoa9DBLLrUOcNUiUzeht64oVjT2+8dZZ35RwT7CSBzUNsiDFCD9QRoL2QKNJ6M/3Biytagmnc/KCQZMbHBkxK3QpassYv1xjnDJonN6sLxW6Z+KpcMHyAXFWm//TkZc2vtOXfe8k18EVcZCfWk5QFqdOO+pQ7D+njb5lRk+8ebXSiOmihhI7A1L0wSLhLQyLWz0o362vlUusacoqaI2AiiM8zOlTL9BpeZdVjJAIApZ84BOUykahHDphGLeh/Pjuv/j+4iHCfpUh7+8F/PLGlq4xVEFuQheJyCTgGUEXKxygWzDblKw9P6aDNwAulfVXkPdpXTR7ZWIZhpGwiWDcCzPR15esIPYMAewjF9vKyI1O672Aj3ZnGgsc+KEPEFWcJOSlI6Vih9IfjOpvMswstnW1G1UI+nNZHyVuSC6XNiXww4WKQtYZeo5Ocr1FTqmiNsrgKg1Jm0oAkJfBIJylwEXh9FVWvN/S/zy/oT0/PaWaq3utHSBZ5dwq805b8p7w/44FbVOfVVQdf3oitZJ+2cJxwbBTocis46DWk0mPXRdG2Lp16EOWmdWjwvYen9cDhhtq01zrR2QDYhfnLsaX/9vw8x+GAQkFar0CHFvYxVLBLzGH1+zDwj+/WsiD/Po/Hqtqcsk8+H4ICohw4btP/Tf/KIzM+djAzH/E+S9WY7LOmr2luvuOsYU8YOxqBgRnkhTJb5870xIz858DFThNjvjhiRTdH8zy1D2GmoCu8MH9ibiU/QODlluSkpFfJ1rDWMCrK14om3ykb7om20vwkC0Z4PVFnUznNrfqvP3VFqtE76GCNlIlzoEAkhRA0o5o+4/4TurUutTriQk7ynh2IYRQEpQxI1ybk1umCEqbqZZUqPYCvK449ZaNuYo1D5DW8yjpao83EINlbWKqC0zU2SKkWanrn2WU9enm5lO77coEgPMHrueCe0FdCoMETErY8EJZFEEOb+XFrvab7D9Q1ufZGBLK90Yz91Yo08TfZ5Ii+gSJPJuzIAMfFx7Cp8F18cC0hJVmfopvShhgUQmDj7OgDl5axg0YhALK+wfgoSIo9YT/ZT3W1BtnQJKX6ukoVJAkrdIlW2wZuNX+1UK2h//rCgh6/sqrpWi13a2GyA3Gizxkl+7A++rZZfRSvhJr+o1fwkxr+SBI6pFSq70pcOGUJ2k0hr7NLj4+4TsMaB4kpN0chBO66paP1oNcz3jU2xUKcxxAibZqUZgSF5O53Tl3VEq/qNHAltQFelQxVYlfwjWs8y1idWW2qlmUpFu5DArLUd7cT3EWCAu8QiYcONnSSb0jWIzRJPMmuMQJFfLfiZXKAbCFqm4n3oO4aGgYpteI1xw/q5DSvNnj/HcLwhZgWTjIgg/AH9wz0Se5Qr5oeajaUmeocN9vIQ2ou7VjX34A8eAeAl7ZINtIGp8KHl5r6H88ucHgwNZEJnQi47AIicYDe2sj01+85ogavgtrRTHWvEEIXT0iX7CKJPZjFQcY4dOlysBxhG2lbu93R/byKuW+2kX7MN1f1S5pqC+wwqs6rST9hvu38Yq62p/Nq+wcayvw05/nFlhb4/qFCNWf3+u5XXBblfCwg/KrL/Jfy/cPPH0wXBJO0LRHwNNuio/5Vt0UnN5vZZuPN/B8eogHBbTN1vfTINE8U7aQf2TgN5ULrlkgDMoPf99e5kzu72NYF3uHU2Gyqeqii6bwHwWjKjFSgwqugFQWt8aXqVRgVBZIeBqE+44ooRPFOO6odavrvzy/ozFI7/XQO+6x6VwDNIaCdtYP+wh2H9UDagKNCFnrug/quHtnD1NNWecUSGSJLLJsbCj3rR+iyTOyCTniZweuhMbnyt5oaO+SreQo5yHcsfxyOSalQzomka45f7f2v01e1wBgntZRZkpD9kRXNfYYDpBMy+pYzQl5U6IJR9goyMqkPMs8fOTSVuKVNIibZdYtAdt1q3qWKmXu7VNP41RR7Q5+B767YA/Xq49MslapomDZyNh8vqmQH6e8gp4q/oWT+yH6PFOBkm9KwFge2h9J9KBFKHx7lIfgh2v+WFxY1zesdv75BTLJ2Ad41gE4n6KHZKX3ynYcVuJPvwLNGqgIco+HJSobh0gHuOoqIIpDqG7BaS1pxLVcYt7iNPumbhqMz4qHTLPmyRYIykIx1LavpRTbet6b/zthaBisEPBnfDxDUoplPLfA9J4h5np49KY0jWCf5CeT2eqa7ZnitSbdJ62hPRLsQgVTFDX+A7MRE2wmfKraB1508oAMsFJN+PaW+i5pJacUlfuCjMouP3WyRO9OneI2lvg00JC1nXcz2ZhTQ5Y+gC3Zf0VdFnyQnBn32tynXKXPr1iDabJD/68yiLqy01PBJCi+If0EKISj/J66gaZ5APuWeo7pl2u/QY5JFJAJTukLKyyyXlRRlvziFc40OaoPJOiUMygbpPj0ThUKO5rncr05HLztxQCemyr5I1eYlPGVRDssfnbmqOcZaxZVE4GUJumeT27jAofn8cv79g5lbtDWPR/RIoJRThYjCtA+Qlxysa5YgmA7wJ+n6RyC7/k3Yfy3Yrsk7zM+DvOM92cjkd+RVOTehXl69YHkVwXQhysBGdGpuRfl31sTt6VaxwmlRVCU5PlKQizebr2kJm2YfD6LB64xTyy295cUlTdWyop/cnaIrvm1kHJAZ26qb5jv1Vx6b1kfdMqPIZhTRMd8wbtuoUhGDVI5hNK7eaFeuDOgq5Lj9erwO1YNecXxGDGFqV9pYkwoxwCYUfc+yuk7zFPK+S0tw85Q2XeSmgrM9DleaHV3i+4fH000dbDNT2ewEjk+ik1LUQ4cbqaeJlzQm2fWOQHa9G7Dt9XvWbbvTnXHopnptGFINME5weNzF65m2d8rEZDvxbmccuYu1EFXLMp1f6mgFnZCWWcjViiIninwYrxCtWwzaDdLrGltYGLDpK7VR8gSMtYb+iFczZ5daxdMH22IQV1DgjlMhSCRRznLAfMJdR7gTJS4KgiW6rHEu6xnG0c11vIEHUANFNdlRCVX+AO7fQelCIaN3sqnJSAc6vIa7n29ft/F6xnfaUuCflAW0kMcgmeFY1aDffn4p/8u+yi+0Ugxc5pw9mtP2iyttrdKhEPIbhUjL3e4S3HK/ljWdcDLuEzSF/gOzM1ASbjS59kYEPCd3uSVeDTtY5Q67346Wl00sy9KnF45f59zLo7p/5j2KDYzF5q2y1JFvvwwsvC4OnbGqLnOA+Ec9Q7BnW3etEhLwl5DtzsJoh0kUkac2UVYT/Dobw5nVlv7whYXi8KC38GPqt2hxSCD5qUx6LXfqrzs2pTw+6l2hhw7DcLmWvY6N9Q1rjMw0lLZluUbRgn4I9MRqZWnc4B+Z4G2cXsmrrFrXN2OPvjdY64SURW4U6npyvq0X/HffzetC0uhSGyGuZiOd7Za7zvMcIB36Zd+mXTLieUFe9hfUM5wiyIfqwSzoRMOrA9Yk7ZkIXIcDpDdt9kwUdrghYy/tQvGBo9MSG2ssQ+Xy/8/en0BJllzpeeBv77nHnntWVmXtAAqoKqBQRAO9oMFmA93cmlQ31RQlNknxcNg6wzOH4qE0Z0bDM8MjzRHPjDRn5oiixJFIcUZcRI40pEQekZweLhqqm0svJBrdYKPRaKwFFAq1ZWVWbhGRsbi7zfdfe8/D3WPJyMyIjMgsf2HX7Nq9165du+/ZtffsuXu0oOZwfQStUtIK2wPeIvBdasPaV9F0uy/ZuxLaqQPsN7nqdPTzV1b0ynJPMxV3pTHo1ISYFLElUUt0vNip9QO8OF+gkqk7uWTooBBJiILfWbKOSdiuIRHQ6CA6o4yOKN0whMGHZYsHYZhZNNMuDykeHjV09tm/emppRo/Pd3i6IIwOVSRaWK40QlQ9mvzsW6vYU2jOk7M7gDuVvwPVu4tybt9iAYl7A5/rVjIIbaWUDDEG7dLgJ8+F6fpRnHOM8iNYQI7R6O+jKfuZsMyvsOgJgogXAcIIDxmePiaXspWJmjMT2O5yYFnj5epl3iV4MXELRejZT8+674d3Z9j617vY/E/fWNWMLfB4XBqMGzwGhoCYPsLTx0d4+vCWj0yXxnK1B/INo6VsK606wLIjXNPaqvFRMD3qtIkSQrbj3ZkJLqHdTfJdeZeGH2KMNXp8WqkOU4ImIEnq0ucvXV6TgzEoFF8pFPC3cmPHCcJBeme9pwF7Uh6fx7KThUWyjMn4gKXyzEzFDQaLuAk7NZrSjsQD1ZH0+h7uNO019hIN9OypOS3yLsR3pUWeycTEIWcqkXv2Gai16izXh3aJl6xqAonaw8wGT5O8Ib1BdivSOMNVwzj19jWGERa4bbfu6HO8EP7K1XXN8G4jbjnNGBmX5Yk3WoT/AxdPap7F0lt9kz1FM4htCaphR9o6rM8wpIxUWtSlYSizG9J0ZtkWdhPdjV5U0Jpz7/N3cbEbTyHGd2qDJJt5Seu9vn6WdyGc8iKGIlLByY0bQI9HwnCS3uUpua5smWt7mWYZXxFZA8Sewi+zkG7XCtHDSFOdu3hguoDs4piDJrcXflvupf80i8cpbke9gFh+GCSiwqRyaQVN6Y/7Mrd4WhnondX1kfBroREI+chGiNtR69qijte26HeAjXQZ2qhzL6lbRPh/8tYydmcwxrWjyqxNVpCXzszqoyc7GvAoklIK+SKeosiRG2/BhAZH3rUiY2yrr4yI6YbC2Z6bNwnbpQrFcgW7kxwjEB8wqi7o+9nCjKcQaE5bOmFC8AJas8X5K5fWdXMAwWl4kRQZk+4L7Lc7zoG33q5v9hmlAF8B5Txkrlib73EOAYJxD89PIN7ac7CCrOlxfDzgc3J8rHlALPGFfaemtvNsshzV0/Lmq6TH5up4UdzSmGNDUU+9oQ3MqMApvZC8c2szvqw1FG4RKzK0dcqJKpSdUmay70TfTuh4TzsAABAASURBVNtLXx4Vx9ZuXevXltf0xUu3NNupuMtEAgURTJD1GCvkMhz/64dPPnZCC+CQ4JaEeEH2yNHacFvptizBK5iQRhcStxmFkLldho5WxG1bfD+lx2o5Yqz8sV5/Cu/cbA3u8JmUbJwFUJw5G65WCF9nu/IL1zYkcHFkIAH3NbnTfXa4yuCu9wdqt2ejWY6cDIQEEqlFiwekU9xUBYPsvo+RPqdpZw9MF5Cd/XIo1L0u/HbC+O7SJ+U8e7597rxNd9DMrCDmcbsOhnkQXTc/aNSh6t1bfa2BV9FZcE0ej5aFsr+8CU5SKNSdHrYg2mCTrAOCA+aAl6i/cGlVq5u9GE+MBRmSfCAmd0280QdO8vRxyk8ffSnMMNcgjrYERdNozZQW7L+Cj2JiSSrgfh2Y3f52YD2tjPEhmOgKJQlrXNkvuIVYNKRZLoBnT8yI3TrZL7KmYJNhKAk3ZPljvr/A+6NNE5pukGiw41X4tPlnWPyF14T1DKwxsFjs3GfGQzGY6bEb73Ah+FNYpoHaG0atJSAq0+xIPMCleiT9vmc6TbuM1BNmlBVyZC397Jx/Mi41k8VTa0S6FRohGU0paXljIP+XQlSZtAXbCFus3bDtTbZTdms7So/AjG02OzPla+Bt9sJ/8a1b6tSV4nsS8hgzzbZKP1HVqvQ9jyzpZCWxntISkWGyfKkUy9IIPxWGRQxwMqCdwAaa3pQVuO+SHbg64K4nygy/ALa4LmE1GSlnMqeRMrW46beB1PBxE0oHeuZEV6dmahY4lJAa9rDwlZFYhF9bWdfXljel0lDH5mgH1BqEfSu8t+G0yzc37ZDCb64YWlm8anpSwhdZ81wjJ3hKHbJB4JBP01F7oDpqA6b9b3nAk6atnZlx6CJMQIy55QygWkTAmWcxwQI1gwC3upl1i/cE7YndaaLtRLPSbXQIJHkeiyPwtkJd4IWm/R/cVtdsX33u3RW9fnNNHYJgfKMcDTEOSidGzoIxYCuvo+8+P6s+wSclU9seXRosvX+wm+w3B/dqIHWAWZrPEdVm64Q9Ug8bV/p9Xvj2dJV+Hfh8xzxHo8Uqyx8jnkOJ21OYJVwh3B9gfAja/+HRGNjp0YlOin86FY8kqPCyqlEHQavosI/w595ZwwYzIUZKIRrokWceUTHC31HyU7UpttBPGMaHloPEOIt45JZZrIQ/yIIyze7MA4crPT0rh+vfu9CeIvY84o/yEmg9gYhboYf5RckUAyFFkBgt3fCWFxCCSkoJ2fG0nTLOd21nmUmq6wa32B+0drrVaq7082/eEvEPYDyoKHznVESJYA+Bjz6yoAu8WfZWlhhgko+SG5sEWo6TGlEX9qPLCqEamGHR6LBoXGOx+KUbq/qbb17TX/7Odf35b1/Tf/btq/rTr17Vfwr8Wep/Afpfe/2G/sE7q/rVm+t6F4NY+zSD0g6rUmIhasx2ETZAjvJ2mW0qgFEWpuIA+z627ha48x6gMeELswIQI4FmdTjPX7uxoWu9QuGOAmlYR5mwP7qnJAXqzNtXXJqgiQWPgrRltS0vhPBbZOImQmzpJS1wnlpZpB7O9AAOcLqA3MWluDUptrD9q7lNm+YiOjtbq7JS6iRFVGgmVVRMBILUlsj76eMG21iJYEv1tiltkyiUkm8xJ+tbHI31NCmHaWF60Lmzrwnar6yu69evrKqb2L5iAJYJIQdJKpb1snKCoPHJ8/NKBHjExvrRxEGzCcr2qvV64ahxbI9F6csbG/ofrtzUf/ada/ov37quv31tRT+3sqovbazr9X5P74qnEPX0pjah3dIvrK3q716/qb94CfnXruqvvX5d/+ImwZvOifPyQuKIl6iTtKfB2vmwjYmGPETqNNfAY9xI+K69nHNrNZS29lHFKuZfYv7ytfVCHOZpiBlxK4Px+wfjNtxk0bXNPpdbNgRlWG1tLGWWF8851HQtUYh4x5WHEBjngzYqptKDZvJxsre5ou/IpJ3bDKnNReT975qzE5MNJil6cd3gypDmSkDi/Udf1zf6BzTJGmNCd8m2UybpljAU+ra8qvVL3MXfXO/FdpGfsMrtKKMhWd5Fv1/pfSfn9P7FWj2iacWdtnl3DFaGNyoWJ///jdxJ+tpmX3/59WvxhPF3WEC+ubGG2r4cqGDHwu1FIGVF3PbillJSqrhz5pxsVFmXBj390uot/Xc8tfxX37yif8SCeMP9JFSxUJKTXKHYI01K0ENID2DUdOyX6abFMOC0JWgk2+lF61eurBFsg0Q2KQWpSbtzGoF7LRKG44dJNb5mr/ECxNyWZ1tMZ5j4OUdhnumtnKkLLPY+L6abP4Xj4wGmw/ExZmrJlgfmufv2hCkvmJlfsKLelIOmDBqz0L8XZLw3GOgmAdI4ItGwnYxRH2aj1BZPZeqnodCOyM7snamtAkyUA+JN3oR//u1bqh2MG6ZtzQT4UjoXQTzp42xfzWZCCLxG9I6LxIj8ceCaPablWvp7l5f1Z1+5qn96bVWbg01Zfwf9yRHbXdNf6SQqoO4fwO7M/svAgPMtFgsKOt9gwfg7l27oL71yWb92a1OZc1dxHlIICQt0R0dC2uBvbD+20NXJbqU+fdgiWBMph6++dmNdl9Z6t+3LeicUHEJ1xNJhh1lXuC5dtVtCwkjTe6lTCSQuWyokZE7yeOd21LbSNsIWa4rdPw9U96+raU+jHrjd9b80U2m2w0RiAjVzaniHNtQDryVaxkB8kz9vP5RJ6BhWthDf1W7VjCFIYR0Ut02WNihCVsEKrrHDHIOJXbZbvsaL869c31SX9zt+8mj7c2kYcAfLTocuzHbjhxMHVBJ9JCsYgiWHlV2RhFhN4O+AvImj/uvXrvHEcF3LeVNL0Drwfdseup0Z0MZyYdPAtnzXiIq1hhv+zOZWVg8JL9wpDVRxl/yNQV//LX389JVl9TqVKoI+3SCVGIECtM/DLTBdC9x6P7nUpU8aJoWOOHdZHBDIlSqt8g7kqywiQTbtyGDcAl+iNsXU6ywgxsOrMExrYUgXFJLrLnyjcZaJ0Iw0xl8yS0zhqD1wqAvIUQ/usPr3hX1Yulu9i3Wl0wSPgVcEiA5q7dxy/8w/V4fQIg5oazFRHWYsSeMdUzsld2KO88ZrE/J7MiNU0CDJd+MpJf3i5VvDf4g0gFPsxk5SRG1Kdqz0odOzuuAF1FHUcmOQhjXEQ8WQAGKaie6z4qXHK5ub+i++dVU/f/2W5lk1vJXFusTaUfRY3v6k6UjC4yYC3majBo/cdWOUAzrpg3sh8XcxMltb1yvpp95a1t9966ZWOIdlTLQj6rkfxMGcb4dizRY95MmeOTHH01vCXir0aYkii96CiDVMX7i8joy5Bss2TKpbGJX7mmyHwq6bLHLJ9nNOg0oWCyy+NHnLLBjQ/Ok8n6tTLCBbPDDY5BpvE5Rpdp89wOV+n3ucdrejB9oJ3pYzVaWzc77zJEh4wgCkbZOGeRY085CMObUcC4i7ielqZBdwb4Zx9nbKCN/MFkbIkyhrRUMqwqyFWiFwOMh1uOrKnTwiRBDbXgaRudPOYt3Qx87MRqktRSqjsfQoFCqaYuzBQTlqhQv1dYLWf/PadX1j5ZZOsphoUOxBJLp05oXG8gn7okRJW1qvwTLtYhCle8P5iMoLSdlqzKpTX2lG+rmrq/pbb9zQMotIeRKxpDVtgfvYqtmSUisjykopsXWV5U/knZ2rwQcIFPthyZhsBxZ0cOory5t6Z+Rn3jPSk8k0wyT9sOtr3AjdYNVOqYyu2O5eW2soS4oRgcLMbM9JC/iQyva0pWQ7b0q5Lx5gKt+XfqadlBmxPz8g67mxVBMeCGpuBMlFgabSFA2t1ByUbvonsyO8ZPIUEEIpcrIhAr7/tK0VBJLoIMB4CxEFpMIi0HYJHN9e3dC3vH3F+48+NHHkiORGAJK/13BxpqMPn+zK7xysDy/AafNAt2XZHWZkgCpnJRzxLuXffv2qvrqyLr9TIoZZinCbAWSRMcFFCWuopU3pE9yJOpLGxiFThZetwCgwANxHn62rPovVr9y4pX9waVlrrJ4VPZZ+EGrTWEdSW7VqNYd1zsJ4utnGyviRanATLYpsBitfIv3q1bXgSXdbpLttWNplvAU0bik08nUcc7P5dGD0YBnobXI1fGmkJVKmlNTlegHdSqFgq3pP2ER/96TrPdh4uoDcxUm/q+t3v41G5Ba5q6yYQKMm+npvoZ2krlvGWy0W9wLSh5nSiDIL7AK7Se1G30WNiGIFxEHjBMFQYUunqvXFa+vyC/66SggQaCInawaQIRNj9OLZeZ1h7M3aiYBTI2R0DEwHSuK9Q6LXgVbrSv8j20ifZ9tqpk7inTYdJiyhcHvkowJulGIrsTAUqYZDYRJFyLg0uJKcTUDGAi8iPR6l/tm7q/rpK6vq1eJu2stBEU6l2J7nLVKgFqTzp3mZPsdCZB+hXuLcmp+U1B6ezF9mAYmHrCAWiUD3nbnNvoV3FMS07XTMXGP4yfbGIIrIjr21RErrmmVgqYgffH5oig/e1OOokVNzHM1679pErCCuMXNwwSlepGdqoCWeBdJkiJCCO1omJujy5kAbEH1yvag0LfYs0p7chokQqansUSBEKgKNHRvY9StX1guNPFMX4PEqDkZKlJ/D6O89Nx97+gPzg7dHluEZKHyHz2OLNlkw/uHlFf0M4J9KGcBzasRAjRlA2zSs2nIgghxly3eJTNhL6WoAuPs1+GRQpfBCldRnPD3ei/zM5VX90o015SopWQFCpGg+mpkW3TZEazHap80Z3gOcB/yOSyN+iTYqRwf9r9zY0DLbdoXS5gnEQHEEKaUk3wzYHwnv5AAbgvUkqq400BAYszEx1lnGVXCJqsblNT2O0ANM15Heh2dphPbeRI9k1O0UZ+5E/xeXZkUMCjwyMwylEnlkPm8tMMNuEUDWmbEptRpDKrLtlCDvmrXybWnBUdz13aCV62DTO5s9fZUnkFmeDKhGE5ts3EMagLDu6emFjj7E9pU/wppSoyEEo8keWSrBGf2/eHNDf/fNm6rYRnKwcqOigtydUbQ0oy2YZnDdZQlUDnmJqssSu1p+KZ0XsBSCNEMW2zNj8nbaMsS//9aqXlnjdXsIZShFVyAjWbBH6kbtmxmeYJ5Y7NII3RAzuhXgPMXY67rWtd5A37y5KTU8+UhkQApayaEcYkqKrrR19LgeN+z7lgROamuMaws1lsnMZ+3QEjcEaIRCMmNYoT5NR+qB8QVkemKO9GR4bowasNRh84dzUoJgyeXAhCCpiHqWEbLaOmx5AfFkpakUmXY+9uLt3GJIHW1q3GCmS4Oajn3H3SEKvLK8pkurm5oBN01xlDH5rtsY655eOD2nRWTYMkeiHRVom0wytPW2hFalgV7d7OvvvL6sPu8huPknMCXeeQN2DLKIyaaF2zRyYHSGkRuSbaKKZwvB9rluMN7KFe5ojiJXQ4B+6YizqLf6ff3DSzd0A41QsSuX31fMAAAQAElEQVRblSWHZVR2yqwSPRfnu+G/3MpAT23rhEroXmx+lS0z20iV3pyPw7D9OPkAa/RAGlW4xsK2wSJimp+KzWZI8hNVC0GHYboNL2PILCBVjJIhKhBkND2OhQeqY2HF1IhxD8RMgcREqQimFJ5PEAgS7eyi5gk2xmuk1vsD+Z8wVTHbECSlEZzqjintSB0hurOR6qT8TnVunFWlWr9+bUN+KqqqosAvuY25TUPSLMhvYAGJwE/AH+vOFYMbAUYNoIwsqWbB2MBXfmn92vomugjTCPh9QCwG+I1qeAhUPty3S6GB/SXnAeIIHoIOanhdwh5xJJU/0G3J+ukVicJy3Zh1pJT0hZUN/YurKxJPSTFGMwHLJUoDxbZkuhdUb2Odma15HZ+HfWwhCtSL9Td4AvP7BsWRIy9ZDpmCH2Zui8f1r7KA9PCnqXmYGQnvBmK2fZVBLONPt5nrDxGEQJOZ16DT4og9wJQ9Ygum3Q890E475k/QFnhpalo7YUbLkGkJIU2FRJzSeq8v3+0RTz3/gjvMrNAVSsSN7R9os3/h0rVt8PuYX7++rsqrh3UYiOoppQhoFBHYHyc4Pn+iK3/+P/qJQQY2niVXW+uT/PFbv+v43LVV/ey7t+ILmA5WuVVs8dITmEM8BSln2gZI8VSUs9ykTtQlLaZKF+qOZvtJGwTAATSPypPGkGRdOWwPFlgOpORGC0aeaInyn+N9yGsbfVXupJDRYskCkApCTpMhL9N2Fmc+Nl/LQdYMyxoQleCLo65qvbve15X1Yi2kkoaCQ6TQDyWnDxvf6KamFfyXvZoLhgnm4W9chmMimbIF8DzOmtKuGjJoi4YdGgwlpsh99IDnwX3sbtrVfjwQEwTBx0/OqSYwNE/+UEbnTQlczKcgRolESokFZKANblkTkzWlBHXntNfJH201iu+saZKa3HMQO6nSJV5ufPvGZnye34E6BQeLSUYz0r1c6blTCzo902H7ydQGclOOFtCsI7nMSTOV9E4/s0W0wtNOZjEIl3CnXkoiLkgGUEJAIodnDRXxy4uAqGc5vm2y+F7kXcK/9fgZ/ZkPP6q/8vEn9Bc+elG//8JJddlj2+z35DtjqxnkAapob9UAytSCxxn9ImGWkO1wLi6j308hG3Vi1EJXQmIruWZoKWhvUdlaLyBd2lonwy489BpxUbHIrOOTN+P7IKOaLFFgZ2rhHUqOscucHy8IsuNwUg4Y6Q0ZEtRCMy48tNSt1UkaOwqvkEbxQpnm99MDw2vwfnY67WtnD7SToS2XOhLxQMwjxdEyKHNLZEJ6MprvCZok9Zis60CCmIGUUkzM1LZJEHdJQ9YQ2UVwH2QH+G5V6Vts3VzmBXIHXI0tUlJKgIAkdbDw+VMsmNRts253NEI1gVkE/H96ZVlfWe8ZZQHK4qEBjVtKLD70E+SoR5bYhwewpctd8k88ekb/+ctP6I88c1ovn5rXeQLYh7HrT3zoEf2ljz6ul2dn1GMsGTsrArVaQKegaezI1Eqvzgcixwe/dG1N30JH1alY7CwjOIg2KU/oScHN2Jl1nqe0012WkmzhwilB2fUCCZu+eWOdSggVNj6GcH9S6Za+hoj8BJK2qsMBb5HASM1Q8QCVwUAnOLdMgyCjcFgaf5Dhfp6Ow/RTdZjKp7rvzgMpJSaQNMedZsUKMiAgsE6EMpdMLXDyksBLMk+07YP4m791kBGiTECbxvDRSiuwS3kHojHRLV9Xlb62vMGWmjANis3BRoGqOQbYe7Kb5H9dCwrVzDwqAm0yJYKvVFeVXuHl/D+6vKKagOz2uIv+M0CcImrltmmi3uKUpvv7Mv7xw+4g63/73GP69z50Tk/OFc8hEsk6jbxwel5/4ePP6MfPLajHexb3gHrsAEMZyWKl38BKZnpmNEgpM/abBMaf50X3GueWVIRGcswcqbVoWSz8/0EuYN8gl3pw2wZZ9CJ1UPrKzU1561BxwKAsOQhpFKd66GmZxdkWt6aOdmi/KCxXcxTrcJMWO7XibEAiNfwHv3hYxlLdj1Ox00VzP/q9fR/Hy7JJa+YJBN6ecYDdNhauQFIhGwHc3uCJ59/DqjwpoReh8eDZ0g6rdGCtUM6uj752fSOCgG2zSZApohYBdZNgeHGuq4sERn9XwHybbTC+G1jDOj76mcs32MLqEcjF04fHWUKScwf/oR76ET3LBMA/P0I8V17b1L/zzHn9nseX5I/dBl8jhztylR2rGfr7kx99Ur/t7Lx6bM35wwCoMpeO6dEVA5Tomz7tC6qkhGpk0Per12/FN+RrAiQN4Y2mRgFyQXWJkozt9ukF3oPUaGrbmR1yZN466yD31q1NXdkYKKWGm2GqwUG3MCqHnrLe5b2Pu7FPwnRXDCZgG16BDALNuQFUXagu27rx4wzvNdt8PR76mI/vyT+elrWT2x/jXWS7YoCZQaP0yWrmnNGIIQ1ZJT6k2Fe/SlA0PaVoqTs/9tNubxnfCV/vD/TazQ3N8jRlUwIaYxIG28YM8f2871mqvTWTGu5eRWKxSOog/83VDf3i9TXwOnzhzDqbuDNUEjSILgs4ZCVtbvT04xdP6/c9fZKm5iRhlnY8YJleY+9/+NKTenGh1saAZxiCu+lqGlqLQXEUrGkaFGcrtPusn0JgtJOwSJoLQCcfT/Rjq8/M1PK30r0l1opF6QzAvHgH9jYv04cKoA/xw0ZsQOMLd+VxvYOfiwmuQaXwlitYSdQ5PSQjhcRaHU/hW5RCn+bHxwPttXt8LHoPW9JOlJh/+KEDcqLDtPOKQV0sDaOTzuS2jXFmX0hZ5s3lNaSp0rylG4WyLdHNNto9EzCoywv017gTfmtlUx06Kf2P5grTvNB4+8p3/zTTSOzR+FHampZoOSDCfPbqqq7wYrpcyBlq0dnmlm0hDxW7NdDv66WFWf3xD56LJySZv9WFdj2yCGyV/uSLFzUzGOkpjIfZNNzCIIxUjHrR/ArvKV5l+63uFOuFj/JI/0WOtqTAKXm1pcVurVNs+fnLlpBGDAC1oJLMe5VtLFftlTAthO9D5k59JqKUfAN0lfdTnK7oPOwxn5pFDKAluQKQGIV0At+MuCRkJutBPDbZ8bbuoN3UXLkHrfa9pc8X+2GNeIknEE84689NdHF/2VkzCUsRBIvFxLvO3WefWlzOkVHZK43IjKB7tYC31SeVSKOUDu8nvkoQu8VTSEX0CJ6VN0C8lD/55CDxzOKMBhYwsQwo9G3P3FjyU8Cb3NV+jq2gVBMwcYibF18Zo+VIkRvfidLkTDYP/sc/dF7nOokXzRASbfaTkPMi/eLSvP71J8+qzxv7hNd5QHAuoSpgV10IMM4bLHyff3dVfXyDBUNpuEPcyGg908MM4z07W5cukqCIIwNtyqrR+SoLt7c/EQlGW0blsLMRcwb0Fe9AbMAIHfIwmbwFnEUqFj8925GDFJQxWVcQcXHM4HhadVhO8rk5LN3vGb2+0A9isK0eX4IG61zsVupzC+e6g57LEjngumIAdTLqiVaB3No0ZmqJZ8Yguwho+4oK2WQdUhOYjN05eC/e/X3l6pqG3+tAjWl5RLPvqM/PdXR+ppLvmhFphpdGpEwtkCisOxFEP3/jll7nZbaQdKB0UM9ivGT2FSgVcurkMs0y7iD3pB+5eFLfz7uMYKAjZMgacYtR2zv9oafO6EmC3CbnSNZBYy8kgVOnqsnDNJ+dxIn6lWsrusRC6IAvf6LMzLaB8Qlw1T44z/siNu0U40HetGKwsVwWWBbvG3YwdhRHIBi4y/sHvn7XuIlwj7kYaRRgNOWkYB548FxSbfAlnkAiSBUybUqaqBbiNL/vHohzc997nXa4qwc8/c1sA0P7z3Q8z0z3vIpJ2BKYSYFStnzHCB5AFDHNlWC0WdtDW9+7bKXbcidpdz0KluEGW+sQv7PSU6eqbHaAeQVS3Fla79NsIzlQxDhMkLCaxmoPiKRSS3LgvEn9s1dviYcIOdxQpSSNNnO1RHOZbH8MoHmh8hcEf/8Tp+inaT1UgADJ8hTRrsVdn4TzBLjf9egi70I4K+7LwkNdpeI8OmoaZyohgl/e3uzrCyyEoBiSBWvPPpHgvGadZdFa4MlJI4d9bjCpZmbf6vd5kU6L6AwqJTWQw0x00qgvfSVxLyN/IiylLR6DbaRKYVmf/9HS0nM8SbksUtP8ED1wV6q5zO6q3bTRYXrAs6jR/+j8DHON4MTsMtngCOMSEqixRpjCMcwndZk9ZwdwSE06mGm4o5YRE8z34mcb3mWL5tLypogB8gtfB/sQtRCWO57URMxnlmbVwcrgUQabUvBkIY0cCDk4fpV3B19ZXleNcveHh9BoOQQCoyQZzSoaMwZkRPzpqd9+YVEfXOxwBw9hH8ntDDuJ/uhjp/V4tyN/+z+LkWcgBEu/RnPTuClslmyW3+N8/uq6eE6jJVwEy3aWR6QdDy+ECzyBLbKA+Oluq5ct8YTyjc2B3mYby9QtbfRhwqFBo789b0nyT9h4EQHlWt7qmKFuVVosmpOREmOYZZxmUXVxZJCOrOfj3XF7pR9vK98r1vkqbYHJ42H7TtMB0nhEnXYmtWXDiGqTEVO1wp3tGjPUuFWG2GFn9E+X0UtdVXoHG/zrsAkjYAV9mBFgLLvAC+FnlroE8qyUWkspjVMM5bPkql+09zu1fvHaLS3788rIwcI1cAtCkAIPaVA1wOLhj9zSkR7tdvW7nzypJjapEdV+DncxKffobK3PPMJTiAfEjCoytqFgrbzZQxzEQd0L4Ddvbepbt3qq69I4jxmUkRxPprDjp5NkxsfEQ9R9C3LSJfSKw5TSvzEIh5qwqnQWzr/OQrbe1ukXLvQtO6IOfTyxFCPiJ5Bx+tHUdrbxaGw5Tr1yxR4nc6a2THpgkSjnO06DFxJfyCNzsYgH0ahDkiJwrHLL55fXido2ee18pBHyKD5C3gUtBhCj6Q0ROqwJ7K8ub7CQ8bIBZRlOhtUmSPJW0jnu3J+Yr+U76ZY3XrqVgRYUFY9Yl9nX/+Wrq0pcveXdB/fs8EhN08yCQoyKGu0oTRlQrveyPnNhSc+d6Agzodx5cj8Gt7QO9/C7Hj2p07UUv8EFw/Rsh7SC0LYleCklrXFy/yXbcTyCYBNEW++CBi5aoErySKSUkk6y+OYRJq7R6MG6rdd4AsRdkBNQkpsU7PDyrT6yrrCfujlI8p97TM48RsotOSpNMt903Kn52jXRVtPjGHqAKXgMrZqaFB7w1PE3tBORwBMqM42GiwgSEUoySJMyfKMpJfl7W7f6aig6/CPThYEiQneq9PUbPcJEWDlShoBsWCZ7jBfop70VQyT0eBVHjnyYMZ7Cy6p5+vh13hlcurWuGdOHohltedjENrgW/gIhwcs6yV3+73r8hBycINxTCp3FML1wYkYfOzGP371Z595HISS3+mqqLhKe8aL4JcZ0nScqTnXImWcNjfoRWqBkWWfx3QwNiM3UnUorY25XM9Z3dgKeJwAAEABJREFU1ge6XlYQyBkfKUCHdOQd9F7bxCfN+bVdO4hMkJBCUZexLXWqsDclaBNS0+rRe6A6ehOmFuzkAeZPkC8QJLqcJW5Sm7tTk+EyIYk9rrRF4AhFudkbaJV3ECmmH/LjUiFzkJl7cMBz6Tth7+l/m7tfB0fTMgHAZdtn4El6YmFGM9iYs0Np4SbqBRvPK8bg/zb4q9fX5E89pZE2o5KhOzKoqbGK/tfxyadOz+kjp2ZaN2mXrrTfA/Whq0bRjz7Gtlj2ggm0/VsRdroIgE4KNDLkK2zzR5K/sbLBNhYafbKDadsbZKKwyCm2zhZqZNBBK6XkvAh64XT1Gu/C/ASglkU51n8RP5B8Ui9mhd4bbGUap+uoj8m1lWFZEI/P1/0pnrLcqG1rfArHxwOEpmNgzNSEcQ+UOUS4lB4hwM5zF+atGgt5IkbpDCBUDfOIZLRNiScQZuANHkO2TzwEaLFb2i4/Irl306FghZLl/kBvrfVVUfFPhpjp5obAQTrwnl6aiZ8PyY5wtMN0GdXIkXKpdGC+wyLwpZsb6tR1iJllsERbGjegLmQq8sRr/C6KfvixJc3BaP1ouXuBjO7SPus3nlvS+wjq/thqha2F7pyzRIfkcU6Dkp0DlBkdt7L064wrVfJOFhR4O6QELcFFPH7d+ORMHTpNS8Eji5SUUpL/E+D1jUFQnGGGi8OFVNTTfSDXN3vy77O5YrtHS+MxACPBpDGpD9HX/VJtBgCNfJqOmQe4XI+ZRVNzpJHJ4j3geWbigACoOJhlpBZlnqkAxIgOOZr7F3mvrfUCLwLRgmxEObWxtAtrkjxaz5MKsKGi15sE+qv+jkZVpMflCKV5oAV4/h8goLH2jakaraCC2K+qTvrq8preXl1vtqAyPVkwxxAto4YiDtcrWBXZgAXtPITvPj0Ph4TOEVEId5voAF0MWyew7xNnFzXo92IR8HmB66IAFUYODkLusO7tJz8tmPIVxub3Vrhlwhhzx0nur0O//p4Q9wryWEIKmnxEybJJJ1dZyOnO1IBgBXZIWRiypXs5bmQmiFvsIVYkyJ0Y1AkeQXwteayj9g8bTJEj90B15Ba0BnDRtOhxLw/F1IlZ3VaZQ5rz//am0xJ8HCtdaWsj3mKhcc0F80/XY+KasjO0fezM3Zs62hZr5F0al26VUtIltk5W2NNPRMNiKXnTKBPtvC1/aqajc76DJkLQxE23gWWFfFJWr6r0azfXtcaKU4decRQJkJKsKzA6w6iUuMSBvpI+df6Enpy/+5fnoXYioxc0F6Lx3/LIYrz49R00I45lf4BERsRAEYulcfMDWNgwUW9sbAJ9eWwhRzsn48PSFeRdt89O4L8Bvom6eQYYtiVo+Ok6i7nJLZS+25oOFXFfN3tZlW2iEnZRbu8021zISCCbOXen57oChUYaIuDTdGw8wOw6JrZw3RwTS46FGbmxwhNvsVOxBeCFAycxsRwvGvb2omnoTzXd8J0nErSSAfTe0qSSpq8xpdBI8emfNQKHmPiuhwwIKcz3AnfGX4arkng4kOXG1DcVFwZu7nWTRv79KBFtWZsUihqFltHEkSDaD1KliqeCTz9SXp5n2pg3IX5XVVSVdqkUHz05r2fnZuR3UJKXPcxEiFTMNSIOl4CDvxcRIXsDf31teUMVPok1Ap0k7XrQ3j8D40kMKjGoJP+JI9GxeFJLeocX6RseNNQgDmWCcM9Z9L2LlgH0m7yL89MSaJNoQQqHNJQokrDMDIWZC3Udpbdv/ZQGdZqOmQd87R0zk6bm2APMJReqCApn2VcndsZ88/RqIQQcGEygYpSClOQ7/HYLyyc5MTVhNClRGih2SLtzJoRHBRsbLNHD5m+vbmqTitc7Crk0BO4Me87zNDDDyuCmraq2bESiEAKdqtIbbMm9fmtDxmleeLvlOIOkRLseK9RT8zP6DWfK9lUa62QHBfTnPgN2YE+SLB4qQRYZz/ecmePJg2WBetEBTqO26tKB1WWAM/N5svrKyjp+ywR+DYdoe63fpYnGzXUzP4HMOc5SKXSVg0pCuKrKAjL5iTzEi9w95jvpGaWxdukq72DqVK7C3buzteYmZ6oYrH8HzpXQV8iuTuEYecBn9RiZ8+CZclgWe9JEAKQD/1aUdyFMi/0PaBGYguAK0OAufLeWCUbXbm0ilpRSQkAqucaOMZobj3HHK2Oy4yyFctpbZhPDL9/qKfOY4NDphQMWtkgFz+oQUB5ji6KWOYojhZI2l+IuXIKalaqkrxNcV3ghW6WEInEkeAoINVnlaMqMHX0omywgH12a1aMztbwQQ9o9NW2HApP1IWM7YlFb9APnFsQ6orKNVUzFFAXQbLRs7fZYa8b1TcZ4DXsd+IOH/PaUIOUYy2Kn1qKfUHcUzvIEv7k50Cp3FLaPhk1CB6mp3HMxrntL3VX6vskC0mFsO5rYiIYprRLKirO6WFdwqZD2aovQNB2RB3yGDq9rn/jD0/5waZ7wledbO8AnFrs8UWQCEADRgdGYoUwsNzbAjJTl9je4Y3cAjclJloN3SFmjnG5EvNC1jazE1RU2usvsjC2dVGCmqnSRJxDLQ5JLS2yHRBDM6iP0tZUNfEAdvDQIpWoP63Agtn8SAikl9VjEOlVfP3jxpGZSkWyKUjmgvLXE4/3oqQW9n8XRfYf6lkmlXTzKeVMUbmOsxmb/34zX1/uqqlErC15ylJBSKrW5Oum0F8aBiQUKx3hSSkk9Vu1brJygEEtKLkbscvVeIPRtU5DkBcQ3P5WS3H+yDP1GaXwCYIVPOpXkf99r9rgvTJnCcfEAp+kQTdntKjnELh821XbhU0v+3sKAiUWo8QzzIF0CJIKqAkxGKPAqVbrGvoW/5ZyUEAju3hliuwrsxbP+AMlBwr+8em2jFziUuFPOMGxrjIIoukCEeGSmsrmSkmArSQWoGI8KWQ3c4K78Ve7OuwRW/xqvOELGSg3U25QSixR9ZAQcV8/hi4+dmm/ZQp3u+JjoY8f29Gf6AnfO33ViRr0Byzc0Nx0HziOCkZsB7jEhqjXe1by6uqGUUvMEluBKJS+lcYM4OiDtR3kbVVC3Eu6K/5F/g1Udl8S1QRMEdpKGfJdpN21XWQx7rCCcEa5BRryb4Ei/vgHwYu/vQGk4cu1wTElH7YHDXUCOenQPRf9Jjy3MxEj8MjEiAJOQVIKvkeCSESGYojFRfde20su6SeCtCEZBR+S2qUSXLbHJ+hZnR6zieWGF7ZLrvDglboeNdD+UzQQEB3Vvu/hLYpkoP+TT1xCnBVWkxTuPpLfXe3prfTM+odTSQzlykXLkJWvwTGtcoBdYPB7jLj3nwt4134vvTndtuMVo+/j46VnMs8ICkTeZZXw+SsnpaiQ9dtNfXduQf2Sxwn53a9jqYbxm+oluhwI6CUTWI1FxouJur2+wmEmiKh+mCb7xg4EdlEG6Rr+buS/364XBo4U87NJPjAx/WDdiH3gRLk8gWZY3mDeF4+WB6niZc3TW3OkFmg/D1F2UOtB2mIFlAjIFLdeAJ1sEIuouPRmjZNr597DeYhvLY4O9P4tHBd1wP62GclmYqes8fdzYJGjIjIwGl9gN5prtO0VAd5Cw/Qq5Ni9laSEaZXkB/A7vc1YIRrVlrQQWzLhLj0WVOq99ArX+4qusPgvo8ywgsyhkF8et3Qzpw00f5J3LQs07Fzpt7fFYR0wvBpgAkKgnFstKr66u69ZAjBsSKQHC8hRgTHGkyKWlToJj7Q2BIkVkFnQAA67wTkrN4b6ScSMuDwS2lIXuRudVFsPYyoNtk4KHPYFD88kIWiPvwufR36lZqgsnxMyYwrHzwHQBaU7JsbhIy3xpLNoqFggQs5ypAatDsdN5Ay62RJFwJUfw6TMT31jpQfAGwoSgFHSyCDIuJ2FoznZkKJomWjvYX2Xx2ISeUgo5HjKKXaUaQf7cbK3ZCgJmWQyMFgoQR6ElVVD6PMq8SgDkwUamO+iEEvnIirYOSvRiPPiwKuAkhA+zgBinqhDWXRx5n23oz5JPLczp2cU59dnGclOD6S5LqCfH5lK3xQXrVJUu86R1mSe4iq0wtxFGN2rVHlEncytvB3bwpa+PFLLOBSY5Sylp6/ew1BypKQ+38DuQxPmz/yvsqJSUUprolOvVFA+G0k/aJ7uVvOhTVSJrWGDTdJw8UB0nY97ztuw4S7IWCCS+y+R9sCNNgRFnEYcInQSkhua6Z12P/ZvLqz14chXwVNTex64iOzGgkYYKG/uvse/tYF/TowzQQ4wybKM8P9MR6yLcDFjKEgbwKFLQfYH2uIv3x3erpDL2TOlE6TtZo0NwBw0MMOJMp9IzC93ig7a9y2GDfSD0sw+pMRG/3P7YUlc9FtMwGptIoChzAkqDIRJrYkpJq7wzeGOtr4oBRxsL2maD8QZcNT9+raCWGK7CafKRAk2gftO0gh0D8DZtXS0t5c7LLcvH25rufj2gd3kCiQcJDA0aZ8LlKLg1bBfxROmnx6Vuzc3D0F3Bm2bHzwPV8TNpapE90E4o4wts95ybqwkQTHtmnieo+QEWYFI6DYHQYRl2b/QugUjUE6A4UuR3mrWtUuhJNDdQDFOpZwKg34EIOVMSRrnUyJHgPcITSEWpACmKREF78lIFrwH/Q6JLbMXVqSKimKumpAGo8xao0jbJwTe+/3FiXk/Sl9rDgi0+Wtpho/Wd8P3I0M7nxd184jRPIK5jEUUkqzBEBd8YbyEGhazbe+vRP92SqOOCEE/kLQ6ZZO9mzXKDsUjAZZ1FYue0xuoRC0yw3WMgh5r10X6Fd1cVRrc9blvwkfG4KBgPUlQqsNPcYICa/HDCQzKq6iEZx30exiFe2swh4spwPH7qmKmTzs135f+fYd6EyFC2RVhmIhYNaHyFdweWt8UttHIHV1qzmPbRrZY3iVZEwZaaCxJM311W1M/OcMus8QPyOIGaZa/z7qMEIghNClkPzHWXDVRYUUEz399DeXa+I29juV/TYN1bcj/71PDswqy6BE9vyfi8+Y68bWo1hqg3SMZ212mi76yuyd+nKTY734KUUiOJdBZPcon3INWo+mDAonTK8VRjfa7dF8BGf3T4Kk+jFbj7bO3xIpIgtADKeOCSjHvxPzvXgeZLpiGaMYVj54Hq2Fn0QBh0yBe1Z1bjB8+9ukp6YrGjPguCp1SJFI0NTdGIU7hxuTN10Lq8sqFNqKggv/OUYhqnfTX0xbTBwnGDrbMUHRbjHDBsSyiB30mVTrK1BBqkSe2uJ/dLcweT19c2dcPvBHCGR2Z9ASgtpSwdIB+0EzXWXT1/ak61miNRBo/yMBP9uBt/UfL8rM9bxprSoReydtxRZtPJSMYMKSW9ztbPMgIe/wjL7DHw4lzjhFO8M4j9n+DSAht8rYAJddqA7n+5S9GkEGjwwyn8DfRbbMdVNiC6sDVG2tJ4gSEFpEb+Ak/ctl/CTpKmx7H0gOf8sTTsQTCKa/2+mOn589Tol9BZbXgAABAASURBVAkJLLwfj3VkGJBsjOmUFDLfc+/Sck8r7G1YByzsLTnIPSfrHFWSqhQfG36Dpx7ziGs2oYjQrYO/7Z1Bzu90IMHz81LBqGxPKPL3IjbZf6kQs05JobfFWUdkvVGyyBo3dBi3f8JEHNktMsh9SPa/uznDttKzsfD33XuJh2aEobsYAzkh/Q4LyNvcvdcVU7RVGG1HsmSVZJBO0pfHbG9SDX+gip6ggKywAPuTcUK3DvkIO7D5bf+cDefN3WECha8A2wwaCSoJI9uaBly4mfP2KE/cqbEVVcGfZsfPA1ydx8+oqUWNB1JTMpGeXpol92yDNixahCAxJJtWwE8u1wlC8dMYtC5Td6iUFltpZ+oWfy+sbes7fX9x8QpbThV3kaRoZn4LDgbxoYCaYEIlpRSWheBEBktshuk7PIEYr3y7jUwCHHRcehEJMA1iQpsv6kzgOsvd/zMEIrNSmwXiyuGBbbV2++NjpxZiKyqbyHhNHwefqxEKVYuu8ALrTb8/8GBg72120oKf6JArwbucaVThEYgo9M/E3/DW4t6KEL6H1Oh24b7futVTjNuERu0IGhTLtYhxf5Kswwn1p/SCTjbZBtI0HRMPNJfnMbFmasauHnh8YUY1gcABVQRJ+WDGOSZREDHISSYbjCKulY2B/Kko4zKxZBbZE8qkLfmk4M5UhVX+n+B0Gbhta2Xb0jT/9MY8V17mblMcYRblZGJXX94Su7y+qS5M4kroBd1e5sQOjqFw+9xxv+/UvJ6esxaFvPvWfTrcV6Kvj7DwV/Q+MIG6aR4HaEkjgy8iEBiLtyvfahZOHieKLLnbU4ylTMOZ5rz24TgIUwQFbTTnBoO7ev9CgOnbYCel24T2QXBnI2Jvr27wRGGCOzAYH4EJeQzVADsXq6zFeks+rt2RZlP0aD0w2ns1Wpnix8QDkxOLUOCXigtsU7BSiHgkH8MpFvJNLXBzAWaeP8F0bX1AE+740QN1IjXtJqij1Z0kxmhNJaWkHj35nUtKDRFFxlogPugML9Dnagd2U0WLAmqOdggVHH+b/vpGZgFJ1MQiIcUwEEoEWmqFbgRIBvru96VnCd4dc5EVNBLcA0jWdzs1GGIxf6Hw9EylPkbbXNNcluauMRwK1oAhyWfKwdRPcre3m8bo9isQ73aFEkgkFEdNwhaSeCjTfTlw9ICOLm1wNYCD7ppsVzDDYEym4ZluR7NVUMeyoewYdXtlv3LbW04pd+qBHU7TnaqYyh+WB4ZBhQ5OMKlOzXblm/bkiBAAY5iaGei6USClFL+D9NbyBtQEOLWl8TuD27X0xbTB1gvvTcO6Vt6lgTgXHZ5nAelgWzs+TA36aGZeRSN/KdF79zUakwWB+N0oSuszzRC4FTR0IX+WbR1xeNHyXbpZVO9Pajp7ZKajR4ESvBmQ6QBJtnlHY2AiqSs8gWyC2687ycEKssfXxZ/2KeumMrj9Z77HLRDf2a9zbqJBk0Eu2BAp1f3kt2viF/Z+Aql9EicUJs6NbZJLceRE1iTeYZ3iRslj9hiC2nTWFEHaK9uv3F46DoM3MsrDUH8kOn2ejqTjaae398DwgmNGnOKW7MJiVw4WaieeRg5kyqQcoYH2afDqtbVoZ30GyDuk3Tk7CI+Q3M4grEpaI1KSVBHExLHFEXypIvcnk5KaY4g09ZFBVFXSGwTRZVakCn2xUIRYaVTyIKBV5elEHESemarSE2z7URNNXRws2N97aWyMm68rPY0d9kmIq2HQnlQWESMAZsfoQSmT3uUOfpVKXTVtioLIIUfpzIvGLIvl1ndB2LKC4dxyLqlqDT+i2Oihg8/ZZfYyE+fB4xrr0Ea1hGbxyOEXxkn93FxHHnJGxucOEtiDnzyeB38U4yOoxqvT2rHzgOcUM3CmTnrav/DKIwikEngmjA16S/PVCvhu/Y3r67GFYj6qYqq2YndaWsdebVaIlD33i1DIGnenTb0mIjwyU0cNluIOmVrgTUnBYlAob6xuxlNULB6QXHpMLiMYQovSjQInXNLfCSLQc2xhmXxbcLvbCt25AGYQCDlvBES/G3IgxLow16U1tl0PSxD7BDfphj8AsdkPHdGIBrDJnfAuFfLw4QwN/P8zuIFvROkBvj/RxCUjlyt+id5wGw0uDhwSV5jfu61gexrVbntG6lSxBjsR8pj9noha/HhoG5jsQ4RGWk3R4+SB9jwdJ5seKFs8CQ7FYCbVUC/BQcCLp2fln/WISWVm0/mYqGkG84EugfTaWl/eUkAFlK002m6Lem/YCne5PPSwABQ9pQ/nBqlW0slupeEYitiOue+s3yGIJiJvQsJAEYun8RZaWpRkmSh6lj4en6upiR4BBm953cfD/XmCPc9C5lPil9set/FJGDXLvITV6/jS/47W30g3TdC008HY6iTNOzPfwgbj0FuHre62hWW5A4Iyvsz2W593Lh59UVzo4JzLzIpg87xouCwLh3hKzuKBRU+dmB2OlKHRiBTjoJymY+WBrTN8rMzazZjjSfckOBTLPGka5UafWZqJj7UyB5mCIz0iY74poC6C74nagXF1baDr3A1WMS1bCYVMCG/LaLSNtjchggHNvIDwEFKEh12BEEEsw3oWL0gHSHgcFBMpXiHLpq6xELzj75SgN1YcdAyNRmWhaWsg8E32fr9/Crz8mqspyBxheoZ3Vz4PsYBgB2bGMFrLXO4EG4z/TbbwMk5r+TQfS5kIa3120Qxy4VckinzmesnDvq7zQsV82OPJjccp91Rz39/hvdsA+zMn0va1Cm1NpmJalA3uRcTycyyCF5qPXsMK213aRIPxKRwfD1THx5T7b8kDcUGOGPnoQlcpmZDl3B5rS+OGJvwajcDaIahcX896k0BcV9z5F86h5ausHg4Otssw3lGWvzXtIOFg2vIyiAMLBQHDNSEnrfb68k+xJBjWaSjbV5YxFIbHbDqN48nHC9UjvHfo0rCRsiBwFCnp0bmu5jkPfjIbnrjGlDH7GKDrBrMdUN/mvHmRcN3Q8owXKJSUkuxX+zGnOPWF7Ry9iY6vbfS1GUYEEUoycqCAGT4N+g5bjwM027oMpUCxq6XBjuQ2hsxyd2amI39qLRjT7Nh74D29gPhCPogzdPDTUBEImXdlxqkUJ7t1fGGMqnziot92EC4NME0PIHDU1NcIHK9ebz+JhZAjDPStZGnXXAIk1/YHOcx0EzRrnQWkWEvNRJQ0hTLBy4F0sYP1wXZbEGRK2sKR0CpPTX4PEO0ZixeKkEMsAYLW1sMIV4LuoN0JH4VIKDDzKCDrNOfNW2o9v4xoTAgzwb3Y2cYAQjokUhmp78ovra2rB7NQYJGokjcJRSRaZi1w994GbXNNb31UQbjFltgG5wA0kr0fyD6zfYnRqS+BN+I7IPRAnRRmUNtZhQUYAQ8sOsv7sVmMHZoJz4vLzg2n1KP2AKfqqE2Y9r+rBxz4DBYgavjTKRcWOhGfU6rUssweBQfXlhclges7y5vc341KHRwefTQR3AEKU0N5W0alyWa5E5/v1CGddx1BFmLyC3l/qiv0ZxQAHhtY8QEL4bBuIh06SFn+ce76K9OOEmwI/S/UlS7M1uoRITNjztCKA4yVpSFDL+RSN+7m765vap1xVaNRFEZuBcDd1PV575MhZ9xgEZfhE+T8f1UGJh4m0A87prq82VPiGvUCOewOYxhKs5jEKYwsi0ZASkkXF2c046obuQSycTKSsSkcIw8c+Rw7Rr449qacnu3ocRaQfq+nOHHDGcUsw3rniaAKGinqYGmQ9NbNDW0gbxok0hZGZSvdGZl24w02I0hCjpR5ksoRJCIsEj26VZLjHNSQGM2GNBBiiW5s9GLLJVEfyoFv1amY4aIBBywHoCfZwjLLQLcu7ju43wG30jVjfnJ+hgWEUG6ibW2sgTKBFYrFEkH12nqfrbwsVIQfG+FSWMjAauRxe3H2dTGivsg1eY9HgxBv6kK/DvxI8vd2rvsjvNbN9eg+bZPBpABXDI0NHnWCcZFtWh6kGBGV4KuR0PQ4hh7w9XYMzXoITbrTIXk2tW2MM5kceD9wakZ9ZqSDqMkamV6IqByJwJ0KSu4J+fbNzfhRxdqRGdquaUvJmMgu5KFMauzoETBtmyNAGnJpTXK1S/8OhgyhaWGqw4fLFhBG7irB0wG4XXysM8BiiATelNEndG+T+Y7/yaUZak3aMqQhNIXbNuihFE2/DEUfYEHDNcVk+iVt4Tgj6mSZgGtbQJVSkr9PYRieNzOA8IkFG7AH/RI9fItmRBpOu+4k8Q5d/l7QkNEio8It7W7KRs+bPILcGqCAJxBvw2XoXuAwy2kEmlHAt1xNNHpqaVYUsusYPkpKQqQg0/xYecDn6lgZNDWm8cDEjHGAEDPq/SdYQOIuHwFS2Q8AIRkPOWasSwpImQmZ4wnksn+cDx1tSGl6OoAiyxM+o4ltdvKSSv/gZrig7BDhSCNBpLUGJjJtsv3vrLHtxvabaaHLiFtGBXlSaW1pAPoA35xki+wsW0bBpo1to9g5tUI7c/em3kHbJ3g5bHEHygFjiMXEBHqIYivjnDVEHLXCeN7lHVY4mHZwSCFM2aYk6/MC4iCMG2AUf4QkBJf+QcW1iY/yInhgqR3bK/7e0QC1dIoVWB1IlJgS4ysl3MKSb4ps/2MstKkMFgUaYknT4zh6YLqAHMezsotNnkTPnJwTcQUJZh75tjRB9qeTahpcX+vp9eUNVfxta9MQrN9olJG5VmCiWojDPCnWJTJ/V83BIQ15W4hNm+GK85NUG/i3uIXiekWo8Ytj/xfCoFqhGS6txOC6wXgL1C3il9Z+oUz1yFNK9gQv9VlAKvCIq9hLYpQxurDR9UAmMr//uMRCStPgRGmVUStZQpPbz1Qptge9QNkP5vrO3zzjfgLh4cDoOEzoG2fuv1bRv/v6zoq//DlQqDUBFVE4C8MCgerxs4hgvxcf/xfCczNcIME50Gyq7JA8MD1bh+TYA1G7Nc9Qx3Rk8l3gDq1TVeLGFFqTLNegbYF0M4Ez21lZGzwafPvarWA7qASyQ+Z2O5D3SUqxzy8CQvSRadYAppus+braYwkLkbDbP7tx6dZmkbUOVI0l06zUpRngtn3Arbh/rLEDDRJ50RnIEWYXZmp1HWAxisRduAMntmE/KSxzWahRxYtSH/QKT46xs2UB6ttTksO1t7nqhE5aWo/Fx4COvTCPt6fBOOG2NevcTci/QvDWypq8IDBIxFIUbjMEEFJYGUykfN78CwWLtUpbaNN0/D0wXUCO/zkaWuhJd5qtmbPz3Zh8nvotDIVaxMKBFwlX3+AJpAct7mLRALpncss9BcxEiBRB34vGar9P0BsNXxYq4CC42E3xHQ/bo20H7WBUGHgLPe/6V4TBQwx6mEwQLEHHBEGiJIG4Eqxz+MiB1O3c3PYZv9+w1W/WI3Pd+Ilyb9XYXPlokbY0DU+6anDVw/WXQGNwMUhTR2Crk1hsubcYSln435S3AAAQAElEQVTHFuDbkWYFbbguCmEs34WMhWNiY5VVXtT7y48dGxKcpl8G4usjSG021kHWxcWuvPAHe2RcUZ9mx9IDh7SATM/+gZ7tdqIxCf2z7hcXuupv9uPJwpMy2M5aaDt3vQknNdH77Rsb8v/XCHbwAtsxGz2DkwI78Uzr09dary/fTYKWmBdI0ZCxYYn3E3HR5d0N4J5V1uPvLVQOV4hGGHIb8FA5VroiS4oHEF2Y6wTeyrmZJo/SZJJ64HUvYFa61KnkXwf2S2x3PQrmt7YG3mSWsV9v8PTocTVkClMpJpKpFZnbFQivDVX7WoEttUbJnpYotNMRsjsxdqUlvXOrJ79rSyjNnO/Sua0pjXKgZKSgRJnFfYWeXOrSauuyCZaFhogrUzhOHqgOx5jpGT9Qv6aizV51IHrfKRaQQT/mpjmelOYZD6DSNAkZ8+uq0uWVXvOR0JbbltFqJEPBSG0/qDU5yA0/hUWjVovfw4hgkgkPiwTSlJrAhYxTJmshwgfK1riT3QQcEP1Y0X7KCtGSmgaIjtXd/iLbfKIvJwPdaV+Hde5LcH9Co+o6DORct4qXxaZn/GFbrcl1lwaPsx1T0DH+GvtC5ckRThAtOQploTClRj4jkxl4hrAFiW0uCGMpIzVGuOfKKzc3dKuflLjebJUhodU2UZCgZI88MmUs8HbsQqejD5xcgC8okjO30z4Oyxn2IToVOWAPHNICcsBWTtXJE8qT0BPlmaWONonWWYo7bgdYg/nMSKhytWQmAgkF79zY1JXVDXXS3Z32FJr3zrxYhHaMC3nKYQtwf1cBc1ozh6wWydjpdn768AISA8lwJwFSpAl6RfsL8zOiUDmsrWC3ze9A9La6RgWw0arPzXTjfGVVhQs9HEFJgmYpilhcFEPwgnCdJxB/w79pFfTCRZ6GpFBDjTv58YXCPHG4zE1LqoeSvD33xXfXuO5IGWh6YckAGyG4NlLts4IsssA+xtYsrGka88DxrrTX5PG2cmrd0AOJKPH+U3NyLIgXldrrQBhBT+CUUvw8+KvcIToobU3vndq7XaFvYeP1IZ1AEJwgpIj3ij41PELEGTaUBcQVs9vSeAEvQCkl3dwcxCKZUiguTMS9DROdxCpkAiwKR9CcByyOSad5YQ21SWY2aFvsQGpZB19u2f8IC4jNLn1s0aMeNkXmoQD4Ej/WMG/xJHaLG4ZRV0AW7ALibKKuBvwhBWsJICOhiysAJNM5IkgfTrrBk9I3uL5SohcSXWIYOck9usAETp8xWBCjzkD8bm+pfDwPqqBoXwfd7EtuKnQ4HpguIAfg1zIdDkDRPlR4wj17albdulJ8osadt0CoiGnp+qguGnlOcyOrb13nDtHTE5mDnHyhKzJ3jHIKunVPYZKzipq34CxmEHWNHIUmqEnvrvXk7TAHPSIOyUEQvU5jYLq1UxJkuwx0oVNBQEhHf2BV2G5LLsx2eAJhlDbNznFpBgAVm0E4h146KKJe8bTipw9/Ko2hWSDogbi9wRXKCoH5ZuhUQ0WwXKEWhQkHALbXMKrK5+yt1U3OHyZ6fPRpvvuNatTtEfMNxnN86OIxXqDbdk6hm+CzKKbZMfcAl9sxt3BqHjOtcQIBwtiTJ+d1YXGGADtwdQs8U6MGQvJ8bSd5YlrXtP/2tfV4kZ5ShKmQbrPUIndSNo3cXaIPp1GrTC/qSn8nOrUc6Apte15B8g7OZRYQb4lQLcFkS5FJBaCR4BOIiFBebE7VSX7KKQI6+sIGNlY8Pd8JzHZibuA+RwGlVs5124aySpK/v7GKU5Oda7nkDHAJZJ9LoII/y43FgBKPhNroC9EMTciAHlq6vNbXjV5ftY12L7kMx6jBY4ZkFChYPEUzhg+enlPxDizS0NQiBmWajqMHquNo1NSmnT3APIORdWKm1gfPzGiz329igsMFLJInKQUpK+SzmjKzPy69dm1N3lMvczwXnjQsNTyi9bC2DdnGTo2OTOAytMGDhYNoMEDBgDfE/jl3IRk9J+1wZO7Sc3yahx0pBWR0MTCSIiBym+qfLDGOsJmA1MMfT7Gw+gnEsjsoP3gStu2llKFLZCn5PxN2jYZ/xDHWlArugbqVsiUZyBo8/2OtPf8vSDTLsn/7tBtQp2m8OKc5FAjb0o4nYJvUTgTrnKS/zvs1Py219FYmxoEFrtumAIRMt60dfPP+E2zLmmYhyp2SrTXsxJvSjsYD0wXkaPx+d70yezz5KPThs3METGabK5PaIBfSEInAW/Hy/M2bm7q03lMHvDQlJxV5yahBd3i0PaWUCBU0thLAQSKiO9HRMpDgZyGG0GRKQe+zalzDRmrRNLKMrAfvEnQsQSPhj4EeXejq5EzFumJKkdrCSv1A87S3NvfdijzBy31Mo0GOj2DjkhhaKTN0kgsDqFNFttEf6J0NQm2rCNpYsjxgtv06AMniPFDKpdwNZ8L+w/tUDyaF/qKqT/G15Q0JgzO4gSKuO3drsBUGLHERwOsdLXFDdKF5OrP9bjeENMSmyDH0AKd7d6seak57hR/QIA9Y3a5Wtf18+Nw8c5XZxcwkRVhw6VkZExQNlm2BqlJK8k+avHrtFneqFZPb1D0A9ZNc6zOtLY0H0DkhS36yCR5ZUgpWZNRdensDUaOFiwhJpVIKf8JseWMgX5zlKUMeVkC0zdQHwLAEgeHvn5zsJsYmjiSGSykljRyIjtTuHd2HvowBHsfZmY5O1YyKJ6gKqxJt7bMCmEKdvCTGU04qVRaQqywgHjI1EgrJtyXa1Ch1X3aW1Q1Q4hIW53v0ynBrcyibAuzO0ki7ZfbZvn5jnXO2i21oLjYYUVngOUHewjrHAnK6Yy/Am0wjfUyyHs767v47juOtjqNR98WmB+s8DV2SCDyuvHh+UecWZzUguLguAkWBUtueeyYm5LNeuXorpC1TqGAJ2CntRp+QbfXUBIVoQmaaqFs0U6aU1K2qIME2uQD0gkgVuL8DstLLyKWtIUX0EXfumqARFDMkYKCkU91aFSKgzrcDKrcT75FC3/vR4E9IncM+B/gww+0yWIBibMT/rVKKYSChm9yq+y5fHNGsKSkUQsIHCHZZoFJKnF8qFmwK2JFMghm42oYaP0IGkksD6G1Skn/w8W2eGuvKHboV54WOjLmxywKmY2sQs2pseO70ghY5aT7FJmO+i12BHnblPfgMe+nBGQWn7cEx9thYuss53oV8KGY/zl7/xaUZ9XlpGR1s63yC0FRrwus3L6+I+CzmrsaOO5mZjb7R9m7eZfZXBEQHwuC1ckQH8wPgB28kS40xNNetzYFWgQq+33Vwu1oiDjocfFsgPiFBch8DROCfnfWr2EQF+v1MtuE2/Tm2nu4wKp5Ain9ohM08GjT2ui48QSlBc5lZULKW8QdrSOCMDqaQUzkyog1xjgW6ch3nUJDDQ8phuxGhNprGqW5jblu2uOsG11sYrfsb6NfX+1xdUEkxJgsyPp+vqIMLq8123aWfGp8+NUu7YofzEBOHBSim6fh6gKv5+Bp3bC3zVX5UxtG3J1iXaPTBs11FUIE2NKeZdJaJ6NEwCjmrrip9++q63u0N4j1IYY8qKJSd8qJjJ06hWQs7EfIiUCjkJioy8hRgPalhuQQdporGN9mu8RcJg4ewx2KI8VBvy6ANaAoSQQr0zJwXEJBjmhY73HMzRo/Ni4hLj6ctI9wzxpbnCVozlusbPfl3plJK+FABao9UEJrxhJeUkp9ACm0yt95xmlsVyhZW6jvlljFM8l5b3YxP90lJPizDafHQXI2y0FjKzIAa22sY9OgsoyzN5OaYrzhaWlS2Z7dhb28wpRy4BzhzB65zqvDQPZA9z/TCmVn5BWumPwfQAKaqS0jGuNFjwroCeN7WdaVLyz29trIR2wcRsMwDIt3jrPQNdtGzpcj2mZYSNAJG26dpowBXQuYqWyHr3HEnnlRss4GBkBgLyjw+AwRSEChZEJV0eq6r3fTD2JMV/HvJMGXX5vA8vpNsYXnVT64zPn9MyjgDKLZB58QVNcZZICvGdW19UzdY9KuKxSEcUkS2crRDr1CYQ+GIOvSQhJoCOtijj8Ff4r0a3YPRr5Hogl5LKnRoVBucczkY6CSn6+lFMtowAiR2T267O3fKOQoPVEfR6X3o8yHvgqlG+tiFBbGnQTzy1GJCMglJTSwyTeVoiZ66BOjVnvTFSysSOK2004H6nch70tymdoBrpGyBwVWXNf3PwXfdfcsNqLgwEHokbLqy1hexhW0NBYm8lCghfCpkwT2slmd8gbv707yoDloIBXZMMgzGksfmZ8jFGBJAmdQcQ6Spl8LjrWGt865rBcA90a5wx3P30LrXuCEkaO/SRUrOXTs4uLIxkBcQb1/Gwo5qlz4nvr4KDgbBeFygmNFjPM+enNPjM1Ros2Pag7Wj/JR4Xz0wXUAO2N3DSXtbvfc4M+joQ2cWdWaukn9LaKs7GK5QxGQlaLsawAR2WRGCfu2tZfmfFSVwT+gozWyA5g22d5EadshT6VbWHjU4ENDvGuFD/gjrQsc0WDskc/wR1MuscI2pSLk1RZuolnGZEBUj6hOMztCBt7B4xRC045RhaZhzkS22/oiBw3G2AsOyQSgqWvpXB1Z5AgEdS/bZKCGlJNLwrFs/Kko9SZWZwwbmlMoWVur7z5NeW97Um5yz5EYoIsWC73Pujl1voRExmeu2rxfPzGtOLJM21MxJcMNJ2rR+bDzga/PYGPPeMuTeZoZbn+KF8Ys8hXgbS0xCcZhOsZUgNDsahcZEraqkb165paubfdXp4C6BChtmOxX90Cl5RJEoSzbDrfQ8fExAstCct9LG2bnSJfbTRaAb2m0BgwWGkBUBq6lnHllO0MDfAfECM8prRI64SEop6Ym5jrxzFcbYEYFsZclodiY/XKqtsz7Kn04TOtQcwVPirxCs1+wqbdXNtLqsbJTzXXhtnkEMFHedvs126Br+95n3zYjoqz33odsZwOkJjjN/fLdbVfrgmQXsgunebXeDuroTmG0wb7RscdOnsE8PHIDT4pzvs7up2D49cADnZe+eYqJlJp70Gy4s8R7E4YEpm4FoSX0sODWMoGWCSNLlmxvcOa4rth08oxGJppPZCN3dTrJH6+bPOoLRhgTLFCkll0kzddX0pzhMFRmp1EHWCURX13oxEKpRlgyNtp/CgcgmG4xbfZ/K+YWOFjsVuhJAQpZ8K03WtziHjjUW6cJsTV+ZxcHQUDMkksdCYZfAb3gQPKI+flllwW9EQwbWMLXSNRxD9moCngELZTLu89Wxs8APKvlF+FevrykN0OhOmqJBqQ3PHmeIajAyW5QDLXI9PL3QhVhkQqAdSFC3Z2YbtnOmlDv2wAE40tfmHfc7bXD0HsgEBseC776woKrK8ncEcszAZjKGiblUKKLqNjmrprLZy/r1y2vgCSqEZFEy0EIwsjtY0mCJ0bLrK4o+TDeYVyCpyx1np7k9tu3mG1rzLLfez1rh8XnaCgAAEABJREFUMaQeEygS5ttKt4mhFnJUia96dGGG8URV0bw0KISjzhtbzvHU2MUPsVjgpyhtW4wFIQf+wCVqigM537GveAsriI2AnRB1pChNrSkNrRrTWrBPuuF/hGhyEOkmF97Xb2xqBuVFK71hr00rRVsvV2ehSf70+cWlOcUnsDAktaNF3G2HAM/JZJeGUdz1KRydBzzdj673h7jnu7/Id3bKjvogfvj8kk5xV9tvZqa3b2LyWQ381FRKCYEUpIH0pTeX44f6Usjmdgq7dldgPR1a5jZ6gavBM7gvNuKMjFMdS0FDgbdpbm1mbMHi7NIgRaDNao4M31CqybUsXWjuZoNKPcr7ne3VL+M5yYt+f1cjtnrwTcb2oUOyYpweT4xXGta9QK6MPIGoOVJTliLFAprQSVeoxYfykpvE6Yaa5MVFB3YkvbqyqTfiG+gopVNSGRpjKYj7L+C6r8+MJX1uFJ47PacTXBSm0Vq4Q7A0eeRJwrR+MB44AMdy+g7GlqmWw/VAmlQPwef/PEHzuTNd+ec/smdftmBkRnYE3wumxOTnPcg73NV2U+WWO8reljjSVVLmKSMppUTESBH8SntwkMoAL1EaKOQygMjjknexWifaIVbaW78B3SjdotFyhCzLn+MJRLIWSSbo+B3zRHBv3TDEMK5dKGJ4QWkyDyMGKBkVx/LoAmJiM0ajsCNV0FLymRil2nPBPrgtLM6XNX7lxppubvZEl14fGIavLhvukn4tF2DcLVxmdXgKe+ncgnxNBHXc3CDtlo2Kuqfd5Kb023hg1JG3Ed2NPTx/uwlM6XfvgftxcXeYuR9mIvr/RfgTTO7T87WZzcxW2w+VNBqsqirp0o0NfY396w4LSEx3ZKSJq2rvqkYPN5/vVAT5HDDKc9+zZDXENry5pBrJ3aSUdN3fAWF/A5QhZHgNNEUzIAoIJAQIWlJFg9PH/D/a2dyZKskfN27vuhlIJI8jBmLEgoYhToWTat9w4z55hmRCUlHToWIf+3y6D1qGWpeWqfFTkaQByTSKO080dB+/emVV5f+2NCrcEYC5nD9oDQ5W7IAxAPO7qudPlY80C5shy0dbGj8KmPZ5Zx6o7kx8Kn2cPFAmW9L3Xjwh75HHXS0TdtJG4jakCQaBZIOnjy++vQIvMYUVoLs8Wu3z3W7Rk6zIWYEM1YFzhhenCbykwIwCWcKmt5Y3tLLRly/MsBuymiM15VaRCUWKsc+zNTT+JcKRhlsN7g+2Q9dBIvM5O817EAd3GwPJBQuuC8YDgVwxMPBAKJOSbvAEwqsrpZQsPA4NqcMCRYrmEkTaZkoDrpdBEwdSE5TbVxM6b3LBfeXaKjrLrYDHFi1z5JgeI4mKx2ugifqDrCcXOrqIH4JJ1g4pgY+mVtUobYofHw94nh4fa6aW7O6BPWbSd104oZPdSv3M9PRM3EPWHbTszKbzr75xUzchpOQgAEKyzO1hcqq7vTTDFeVAkdETgKJMsMmUs3VSSpajFJAgUjo3+Anq0spGfKosWBDbkmhEjWRFTREoAn1eEJzq1jozO9METqTNNCAbxBZ3/SiA/r3IY67Ozc3INqdEDfq4OblZTAoVCeo5FlRvFflJ083MNc/lKHjxqBiw+8owMsJRcjK64DUAeSyZP0bYoTLeFy3Q8+2Vnt6+uY59xd+xXMCiRgoETUHFokIy1V8gfMHf/4hrBXpIkU0ky06Qip5J4rR+ZB7gFB5Z39OOD8QDWY8uzerF83OxlVAxsVu1JVRvn4amOMjXNe9B3l3TGxs99sarYSgn1rQq9iitZZydqXaJNO5X1gYujqaI9yNVU29pNjcA+oA219Y2lVLS6DjUHNFj09CFwSwHy9NzHZ2ZqzVgMQn7zTREI0sdPdgcvwP5wMmuMnfhwtB4ygrTMJS0VZfCj9AsV9F4ha09f5nQeAm7igNWyLqs8R2JQOtasCOjK81Asv+DMJJBHqltR1t+W1rC+r7IteNPzdE5/dlQW8WCUVCL2fQABKL09pVtfPmRRU3aMqY/Wk+z4+6ByXN43O19b9s3MjFbR3gi+67/5UcXtUmA8QmtiCDJsxrIhtRKb5UZtKoqXV3d0NfZx66Zzg7EkEkjDSwIZT/Ji9JMlbgjpRGGORimTJ3GLrvwMIfaeEpUzfJe+o21Hu0hkEyn2J5QX4gEKyJTn75OztQ6wVOIx8DwHcmKyFHnra0eTEDSB+ZZ6HhadNUjYAgRXF2GubRJjMl1+9RlgubfB7vJNlblAVK3rHW0pUmW8yLuhdROiPYIuPS5qdoG0O4+JXkh+Pw7y2G3TbXf3YcXxmHZLJIWsoztGbBteobz9MLpuejeNk9eE0EL7jQ77h6ojruBD7p9hzoZmmDg4lMXl9Sp8RYVklJKQKlLSTK4iBKE5H+Ruk6A/9W3VjT5cnb/djeS1idptq5Vuw8DuiGBJUDwKpYpKKmACwUnqcLezYG0vDFQVSViZoRW+XBQjNKZoTSkZQrIudKpmY4W6qSUKqEqwKJHDmnUgqRE9dmFLrnkoMtAFRAUsgxEQnKI52hn//gfS8X4LIPISGGUayBprvYmln04ojorvsTZNAnZ/WY0DRNdtm2uc8F87fqKOlWldsWPhUPlsKwXDZemuDT4JuGZEzO6yNOi6S2EXQiQWtK0vDMPHIk0Z/9I+n3PdBoT4z6M9mOPnNCZ2W5sY6UINyJPErkmj+EszfKndn79zRUts/VD3Cbi5J1aTGoY1t3DsAIyS0DpUKZB0dPyfaHNENhgRSr01PSVWUAk/4T7zfU+tIQdIdbEpqIrKJk8IhNIpBR3wydnpA7NKkdXRCLBj/KYZY/w8rjGzlhAWttsK+ChRbTGf75zN0RgHijO7eVbmxJtxcFwydtEDXqlJP8aQOiBlagXPMcWYoJ2r8k6vnJ9Q28vb6CKGraFzdjvsn0KgRnn0f3zwOWhaJOF5/nT8yxm0sBjtJDbuZzCA+eB6oGz+AEz+NDnBvPXLnlssaPnz85FkEnJRIM5DUxURWDxZO92Kr12bUOvrWwSgGvFcZdGu1lNPxVg9UVXYhFIqiDMmBG2aexI1GqeHK6zeNzc7Gm4zlghPCcHIUegIYlGxg19BM4vdulBFonSY4N8V8k676rhPhp5MTjNArLY6cbCF01icIFFZhnbYAhCZJmAO9CbLCB9xh4kZ8ZboF7h3y4gvGC1BrPtj0LXyBGckfr+0Izuz7+zMvxtrkyzVpPLlBISCSrJT6EWMIoxFSf3xXOL8CFYrhGjtq90h+L70jkVunsPVHff9O5avhcvgGb+3J3DJlvtoIx5qQrHvnxhQRvc1bVzdkx0pJLK9CXYZtpVurk+0Jcu3VTNhBZhbazLNFbbs+LAV7X7TfRnu6IBuNV4u8Nl0MiMG0R0SwzgCsFxFVuS7aNxQsa8KMhQQzVjdxSUGWuhpoGeOjmLxN2n0Zal31HKweKLBNELvPT3nbo1h8sYBgNqBgY16qWKe8QQ7RW9wTurdXhxqiiR3Ja8geVz0TJwZaju4OOWptC2iwLtffh3xz731g2EsjwG6y9PE9RdadQWG6CFpJ+gBjrHU/IHm/cfHpfFYyzIPAjpsK+NB8EHozbe9wWkubZGbXhP4Pdj3J956qS67OMM8OjeF3prTZKDl587/uUbN1QCU6J1ywclmUKxexoRqMExgcgHQgsHCEWwkvwEYqpBI4dt8ALybvN/QKyjsMftKDTnW3RvA813Onr65LwZAcGd7CQ49zGzES203TY2zRHI/T0IB93U+KYVGStpn0xoSm8NXl3b1C1uElKCQzJ7HBphiPa9AdSxWjM4dqcmtLDIvsDtX1/t6SvXVzVX1Qr9jYLA0ZLprSweXAaML3NH42vSNzcfPT+vJ+ZY4jKNrMxAG5o43xe0TfYlfMBCWH3AGh9sdfd9AXmw3XU8rW8v6pcvnNCTix31B97USTEnzRsCSJncjAPc05t9EV6EJn3prVW9ub7BNpYviRwLC1K3T57NuYhZt99zeKsks+ltljmOFS6JGy7GoMhkniSkyyvsqTs4IlHoIOgmgUwkK0XIQfhEp9I57ujHJHZsNCZxJJWM3cTx+FVe284Q4jSMnSxb1trflG5XEYxXN/paKd8m3NbEzQwVWTwZhAQVJ/T4ycdoAQgFuYOcNixcv8T21Q0We7Ew2K4hcO6iX5eM0/iAd2uZayEra6PX18tss/rjxIiUflFZkJKHPwo6lptuGCNOK0fuAV9r927EVMP99cAuk+7kTKVPPL7IAjJga0qEmy1Qc3gSEgOilizBRK9SpUsrA/3qpeVmAQn2rlka41BzQmmGPsfTwFy3BoOIfucUbI9JC932cksmIeOUsDXJMfES72GSBA9N2EXMURxUAzfNyLAu7oCTTnc7WqJPk0OebBSnejTJg9mhZ5MvLnD3ThQ1PiniJzIGVhZxD4RxZ8By/i7Icm+Az6hlYCS5aqhRWkEf6gG3207M+Ly4creQ5Ce+X3hrWXVdl/OEKvdJIS4BRRaI4qgaPLOQLHF9vnR+UZgnNXRNjwfaA77OHugBTI3HA8zINsB896NLSkzWOLHMbJJjEUJNCsIWHnEJmh9aPvfasjbBCcsIBEKJ8pLAxxPkMYLvMn13OW8GexYupBR/HfJFnhRsTIkdWYkI5zZVklZZQa6wv29e2CQf2Rng0oBlpXA8DLrvcC8sdFhAmm0RqE7W4/K4whPzHVzB6D3YCWjPJdwYZww5sqR1/OT/l5JSCl4Zn5lbMAMP1xaWc7OQXuDdC043ZQjBGtZuj1xa6+nzvtHIVQi7n7DEigLIYjxmw/EiiWiPp4/HWMCeXepiicQplw9M5aQauz2gOYTaMirT7Eg9wKk90v6nnR+YB8qU/PhjJ3SW4OQv1xGhdtVepAvbAatDFP/Smyt6hy2SbqobhqWa6Wq0hcJt8jwMBsY6RISZqlJKSUmUDdRVrYVOpXJYUvCBLFXI3tzsy4GxivACMUoRXMBJUW1KxyePLcH2YvnEiVktNbpRBZVkWYojS6npuS2bqhi1bXxycZanMpgMZmhqg0Bl3CoQAwcnme5/bXvp1qYUrnSDDKdJVgw640cQymiKCCl0zVTJ1HuApM9eWpEXkQ66BiwOPg/uxwuJSwNDcqHEFlfi6TapVp/y+x4/pXM8hZovH5gTthkHRnGqkRCRwZXRssVNn8LReSAuw6PrftrzXXtgp9kG7ekTM3r25Jw2CciJqefFwRPW4FndlgXPLogBPC4Qkd68vqmvXVlVl8luuxyPkpFJGCEm+thiZ7bAFMC2N+QKIHZhV4V+BzDQ0iIFKzKjV9lTXwYS3DwMTEiTQsiWjhlfqN5SeWxplhBFfSgLvkO6DXuHFvdA2qszeOd5Z9PtVCpjpR9o5DiLHDxRRAL30AvOHT31t1fXgwQa5KgULPIZGsc32amBEshBSDPldIDdXfLV8nNv3mSLFDN9LloDwH2dKUp0U9omnxuXrtac009ePK3pFU0AABAASURBVMFV4LbIkMI2ytHUqhylTfHj64F7vKSO78DeE5aNzjZmoyf4HHefn3zqhPo4wHXfBYLGrG3FXXpSiztEUbEccZuXnAP94ms3aJtioqNSo8do3YvLKM+4ddYgXW+VoLDIO0/UMguTKAEaJykCGyFRNfLv3urLP9UBS3GEXZgdBmJhU3c1+JFBR9FjbIsoGialoG/PaL6deBQUDLQt/jjr2flZYm4OP4QpOfLISkAOtGQNzxP2ndVN9aknRpsBpyKkQGfwRQXIR3ZmSPFhCWN3C5dZ4H/57WXNdXh/gxLfdtjOtotSck6wouCcP5AeW6qP8cT1kbMLtJJsmkHT44H3gK/HB34Q9zKAB74tE7QdgwO48d/05AnNcHfba6OtGZajjAnflEQvJ8XTArQOs/qXXr2uyzy91DyFQLK6O4JOkvxJLHcdixeLlPVUGmiulmCrPVJKBM+sivIy7z/8W17JTNsaJQjJaAFXACt0BxDdn+/mBc2hC9LxSZi6mzF+6X9+jgWkP8AnCGI/4ZYEPmwETipjgwheI32FBcQ/YojbIG4l+87gJw0vzMVFUGhHrm51L9M96XPvLOuNlZ4qzql1J/S6HAUPI64xnjgGXFgDhPzpq489Mq8Ls1wF0MNitzXSlE1hyhQeIA9UD5CtD7yphz5JmojykQtLev7MLE8UfXxGryURnEo1JnyDUkBHgIld17W+fXVdX76ywtOCLw3oIbBL5qjUsJqu1SHAzVRmNEDheDODuoVuHdKQkJLcpiaja725vMZdNf2ZaQMdieSDZQHcQaklIwXDdGmxU+ncfIe6lPjTA3B4LF189PRSR/EeYdLmMsAJqok5Fttr6z0tbw5UoyMhZQCN0Vfk1m1ahtemCoHhu5GWeAflAOf/49dvKnFjwSkrLd1JweA2SBRZhZUY34CFS/rMM6fKNiP8wgPJQJOGtKY+LR4MD1QPhplTK/fjAU/CNjh93xPz2mTrwDOZUMsEd85aARZ3tJ68Ac6gE8UzkX59I+uz376OVKIpPNJ++s6NXJ3E00+ifelP1gJztqo0T7AfgDsAGRCSy43eQG9cX5N58tHoMt/VFlqy7acbDbh7v7A4I/80SMhAHMoE4RhkOxiEC2IheHqhUs9+t5mWMxj3wI0bjEPjRl72qifs8kZfVzd66ICBMobNCZTMq5AvC4gbl3OAiDoEfv/IIi3uKn1nZVOf9/ZVXfHUKGxR9EnepNJXU8EKsCT5pf/TvKP6xPmFhgYRVkl75/uX3FvPlHt4HqgOT/VU8333ADMul6mtTz91UgvdDrE2x0R3EPHi4lkMBRp5ELEyUAIA9YoA8cuv3dQVgnpN0IEbCZEod8u8EJhXk82ig2KYUKsZrrSZKrn7Id1tamhrLATvEKAEIWwcStmmoXiDbFnS7/f1zOkFnWNvbLj4IIUaCV/omB62z+Y9d3KGAMupGLHTC4Wr5kfJcFua3WL6hv11q1eeQCAkBhs6k5RSwteJclxvLWneqzvlnSdvX63qzbVevEeJF/RpUssooeCYrg1uSr77iZM6y16jPzBQOJNt77xu3XfeatrioD1QHbTCqb4j8MAOs+mlCyf0vpNz6nOn6sDDSiK2pOUAvQUEGaK7gy9F3NFXVa2vv72qL797SzOp5s3FlvKCOQSMLwSjI66UeNeBjBXSgBvs6N4tamPQjbdtHNNuckd9jZfoNW1hW6rY2QqhpyFiMEQLUfRR/viJGZ20EmQSNEPIgh+LFAZNWgKR5J91r2GV4TAA8Eg7oi0xydteb8WCq/I0gK6ahcMLTWLwsyzKlZUG4DJK+36m0l0d/kj4P/nOddWYYP1WEn2R0bWrW4CMK77GXLJu6BOPL3FmsQNCwwbbObX62nJUqm3blqO8KX40HrjLS+pojJ32OuaBHSvEkQi+c2wXferZJa3xQnzAyuEJzf188MiYzdRMH6DGQJAxnZgQn4b66a9f1Qas8Yk8WjNuQGgkmeJvomcMaSc6cV41DANFSEdJnzUL1o31gVab/wOCYTaDMIhYKHDWArQmYT1YpYsnZpUS2kgQdk23Ye/a7tAYDOniiTmdnOvEux/bF3f2ZeS4AQH84/NRSJaQIof11q2N+LSch16RkVTBdDnfreJJgeaKA3nzOmaCB23fWdIrvDj/4pVb8ekrnxy6oTWKsrGMTS1ALiRFV2yhPssYXzpT/nlUUkKAoUW+PStcNVLa8cg7UqfEo/LAdAE5Ks8fYr+eZJ6Mv/2Zk/EE4Y98RhByRAFIxAGkSCDMaMIxi4i3GJT7PHmwZfGNq2xZbPIClHtXGoQoNrclaFFppAU6daDyHXDohU7TQEcXD8hygHFp+Uurm1pjy8yCljc9lAcymWXuugHIFaM7P98Bm0jYsXv7CdnDrOa9lZ+b6ejCQieeKDwRbbYXDJduOVY2uszvKOmtG+vy1l/NNmPIwU+pPB/Md+r4nyD2pzg4uyzgiUWFyp2kOBlZn3vrpq7c2mw+fRW9cc0URU2tVIZOD2PUY6vtoxeW9Fgt+WkRs+VjvI0pQ3WlMs0fGA/4un1gjJ0auj8PpGam+scVnz09qx53gjG3eRTgoUOidN1PJRFkmkBh7abVda3XL9/SP3/9Rrx8JS41Gi1RgBBRkLE8RW3Gq4UxqiQCvgheiTtk1yTrc/+VFPg3rq7IL1uDLo5R5cYDyGwnhYQeSn9U+XGeQGRlpkF2IR/GXY7ADqQR7iGg7hA7t2mGbrIX2sd5weyFO9lwEy1M6YXCw0quAy6DBl5XSW8vr+va5kCdTnJL2XcVDs08Ffhj1LOcA9QoIe92VDmXrkHYb0Kpf9rmF3l5XqGJarRs9bqSXTHSgHswIK66quTvJFXwgkb50KTpQMIDPreBTLOHyAPMVi8EHQLNp546oY1eLwZnmoNtTHpnQ4BNIDDfQHPlQV8/8+tXtDYQsSA5lmm3g6awnHOvS0G31OkJ/cQznhOy/AneQkcArvtAQussZt+8egsUOmmsI9ojSjKDok00HsA7OVPrqaUZ2gobVY4J0UI84nwnm6AxDD2x2JXfMexqIXJirFv8LE/aG2ubep1FpEOQNt+6ikxmoZBmq3IuRNQHYwEXTyFF4k7yb9zc0BdZQGZ88mwLjRPg5NJgfAjI0KUGnNfH2L76nnNl+0rbBIcthqecplvECWwv3oTotHofPeBr8T52N+3qfnnAEy6lpB97/rw6dDoAPFMnYpGpgKUzc5xZTsSPgNPp6Fe/dUNfubmmbsU2FlJO2dmOQFs0OJrTrQxFLLNXn9k/l7qIkBTLEUhdVbrBXfRby5vqtFsxpZHVFKztcFhm2iu2R544NadHZ6si5zw7e3AgpaQXeEL0gIi3Zcwew9hJasbT0HCbUkrapMFr+A0XUkfGDAonP234CWTgE24CYFqHdqUTCPtM/9Nr1/Tuek+duvFz9GMjRxRMVMW53OSe5eVHF3Sejr3YS9FQ0+OoPHA4/m+uiqMa1P3o93Acdz8sv7c+EjemWS89ekJPLNQE3H6EEz9hFFA5PPkBb3OEAFRvc6W6oxurff2jr1zhjnfLh8a8wCBGomHbqCkdtLoEjcRzh4NV6StrqVupJoiUtnDYVusg538idZWXtF0Uhw1o3ZbcjYlN6aJHAH327Lw61ungSnuLBFjAEJXjmYV52P3S6Xn5RyZBxw1FIPzRlB5eWw9Xs9C/cXOdcyzOj/CCcCrglIS/a+o0DsWZ91piS8nM/cMNXp79MxaQigXBfaKt6ERFAsaSmQYLAj4vv+nxk+N2jTW4TQVdpNsITdn798DhePM9sIAcjuP2f+LGJQ/NmknFnuEEDwen3/zCuXjhqpSUMCcxwZ0CqI8nJEgO/F2i+s99+YousQXWcRAZCiIQuDWN4uJpI2mu6/CBQfQfQY/F5ATbTXUjmujYF15KSa+vbGiFF+gVuFUWEdoi43qBQi24ZNFEAP3A2UUqxDSVw600LloYTR78BncxWTftfoL79w9fPsqLdG9jhekQE1BGlRlOLiY1RaFLVRLvQTbYAhQLQ0JOsl9wC2XSydmOKiXFwXmYqaTaAkHYX/bFd2/p2yxSHZ5AWa/3bhS6EzKJ7auBnj05o++9ME8dw4MHSrIExZ6JFvI4LBS4kSkcSw9wWR1Lu6ZGHYAHPPkSQeT3fuQxzbPX0eOuPzEzAxr9XigsZ5AzICPjW9tup6vXLq/qV9++oVkWEMs2zbYVNAuayxmiW8rZKkKlbTg5U2GJuQUIM0op6auXeYEeC4jiZbuaw20alMJtKJyMDsQeP+8//AKdftyJyUoIGHEJ2iaTDG29LSfEWvL9KZvOT3YqXZzvqucI3RpJmQDFgEoe4tBMt28rlod3ljf07lqvLAz4ISFPQS6d6NaUNCCJY5YtqIpyvwkX66e/fV0b/XbJuk1L92NAbINtyR94akmna84yBiVo+0n7lduPrqnM7h44SM6dXFMH2e8DretYXug7GJWSiVkvnJvXxx9f0MagJ5MI7eF/cyVyT3yDygFFQjCxEGykWv/sa1fVY1FJyZwCrbhr4kiO4lHJbCtl0dQqIvpUqZIXkHZFsRrz/QmfV95dQyYpocOpBEgwd0CfMKmMJBoP2GM7PdPRMydmCgOa2xuC4LaBbGXmGbYoxwPr4ohnljrqsbiH2ZEV27xQ2B/hN0j2scdgOuuOltf7eo3tvw4VXICElJIlpKWZWpXsPVrhxxkvIA0P8m3Tt1d7+oU3rqtbsxCFyhHDaB21yKgoBIxg6oCbFekHnzgV/QeHzF1ThEybublhtN7i0/LB8ICvsQfD0mNk5ehFf4zM2maK7fRTgyfuj754nvcg0oBgIoOlLUDpwgAaqcXddpYnl89+46beWNvgJXgtIkSEC+sM4SZr27hawyRsKSNp6FJ3wOdmVMRL+RM6FYvKNW5vX7tySxVyrV46sIoA66Bp4JFlcqDPE8sTJ7ryJ5ioQrx9spzh9pL3V8Lj+8DJOXwiDWxgC60ZTd2LRllMFE9qFfRN/PfNq6sQSNQdpOUDR89zquxryGwgJs5dspfN3Rtoa4F//J2bsUXW4TxxIiElRWmFLUBVq7W5pnqcm+d5r/PCmVn5yC3flQZyU+5U7MXbSX5KO1oPVEfb/Xuz90OZJLsqZeLj5t/xgXO6uOjfXiqCmQlfMJhN2qqXNibXnY4uL/f0s6+8q70+xZMiUCQ3iS2VlAruhWG+Tjo31yH+ZKVkOk8oLEz+OY4ry+uquTt2w+ysAUsF2hCTUlRFe2KUnr+wwItiLt+GX5h7542GvYVuxz1IfmP7yzwhznTq4cd5vXDirBKwQUbt3sKRov23rt/SBmXFamEeHpF9tIC+DrRYlJTi97G0nwP/Xu9l/cx3bsjnPqOb1NhiBe7FZQNmNpCx1U+Vn3r6FE8hti/TcyM3LR5KD1QP5aimgxp6gHgQ+Nm5Wp985gR72v2oe7IXJJfgQOFgbxpT38WQXnMX+j81XkaeAAAQAElEQVT/2ju61u+rU3HJOKoUicjbkJIIIBnKDAsGRdT6bDct1Vnxk+uOZoDlaxaNr15a0RrbMK63Ko3TcNi39YjFTlYM+KlogPCHLyzx5GKxLI8xh+AxzWJQ221rbf7g6YXyvzLwVbKYGYzR/ixPHRBIfgpp/WB6jexrV2/JXyiscYK/kFhVtMLHC3XiPRH+afTMdpIS8nsm+jf/c1fW9BXeTVVjfjenAWwx1hTFJAwa0P5R3ud8+ukzZkPHFmOtIHiLtiWkhzrd1ucP+OirB9z+qfmjHhiZlSNoWRcIMH/4Y4+qQ9Tp+6pGgNjCJB9V0OAEjuRwk8R2yYA2tb7+9or+5VvXeZlew8kATIlSIwc0lM4SvBIBhcb0PdCp2UonOpWrIY+UemBffHtVwi41h5vYIPMb0rbCC4hfEL9wfrHhEaRyg7ZlUx0t9tI5Knco+G52NUb55+ifOz2rzfY9SGvESLtYPFp6lOUpzr9i/B1eplf2b6OPZUMnZmud7FaxLTZAfoYFm2LvxLlYp8+/98r12PbymW4bhGp4cY6iAoc6iXOckJfW+wP98DMn9f4TPG1yHSAhWdag9+Zh/zzMI6/u7+CmvbUeOOwLq52zw36Y0N918aReOj8XTyEpJWJ1eQ4pMiUnGmCicYAUdcoNVp3/369f0Tp6uMklLmQAUbQ4byGDdKtKqIeDfgw5xdPPLIQBbanKzHc2BvqG73JR5kVBHG5LMZ4aIk3RJ/UJUk+fmNXTJ2ei3gqH3rbyAJUeHuutXuSdQY8nB5se/oBBYi0gLwkcrh3hApCSVjf68Um2lBKnCn/DRzz+98qpbtIgFqWsmU6lOMwMZCKjndD3+avr+sXXr6vDTQQKh30Wm9Bvr6Mj6oFnWkGnn5ks/ZZnT6sWzcAptlJTnzxPbb0ttxpMsQfBA81V9SCYOrXxrj3QzM6Kqf7jLz1CXBgopaSEQgNFpGaOF3xYSfLWSF139dlXrurLN1bZT+8gk9lCGgqFLoiROiwKDoqupJR0Zr6mjSKqoE11XeubbL1curmuqq6jre9sh7a0asdKuOjaHEgffnSp+VQXOh/0FGNM+sQjizzpMUaPJ2hkEdQbAlVjhiBH3VnSV95Zld892Oe4HpHM9lWSv3vjNcnQNaNRr/C4th24Vn/vWzfiO0MW9/rASSsF0u7NFS8erSqXftr0QvXSuTm9dHbeIhLnSmZq63B7wxbF2kttkl6o0/y4e6A67gY+zPbd/0mT9aPPX9DF2Y76vR5bSgM5GBTA00SmgtsygDoCZkip0sqtvv7eFy/xsjexeCgOxwgvClFxRptuStyFJiUiUo2aC7xArwgrDkoONIL/a2/5/Qc2KBFFEKJd9AUqjtEFBQlFHR5N9d1PnEC/m0GwLLBbKhK7ce8jfU9Dsj7+yJLOd+t4YmiWVMaMZ2lHwlBy+wjMiRruyvHpqm++e0tX/Q+mcI795P0kb3md6CbQrD7nrlNJnAI33Q7WS9uvXF/XP/nmu/iWdtDcBwrs6CFApl9XOSsWMNDWv7f2Q+8/EwuXbzjaTpBCuK1Ny4fNA9MF5J7OaEyPe9JwXxsz2f3f+37rC6e10dtsAgHzG3qO6ALiCASMjsyLCpFNndTVz/zaZX3xxgqBq6Y98u0A2jY09Ev0DrfDXjC6VdZjC8nLREjW7MUv97O+9OayxFYXvQc9kRfIyGZqAClRoxIp85L2NIvRS2zFBYHARdKIiHzQzEWMKJBjnIX92Hd+vqMXz82qN+jLtASt+AbM20lKZTwenAG+i4STL6/29I1r6+rGKiG5fQ391FyXSsX7pkp1YqqjSgZNHDRgrdff/MY13VjrqULGur3laBu8GGWvHDSLEjzKATYh6J9tf+rEHO8/ziJBQl/bD2wIuye62p055Rx7D3BVHXsbj7GBt5setzf93jVM9LGHwsJK+omXH+VOsY5/GGVaBAMQkuNFgQhXXlZMpSR4S7WuX+vpp77wBjemlRwnzE2tCSCuzxCBOjDZFtdsXekC70BYbdCblVg03uFu+RW2XQhrQY6urIPAFHimYqBgXVIiUElJPRaeZ0/M64mlmRDTPg5MouU+BI9QxMNOWPnxC0ta7WV8m7DGIMaZAUr7AyDBI4GU85bwi/SFt25KKclPem3L0zO1qjSI7S1OiYJOO+1wfO36hv4BC8hsp+bpdMD9Av3aMAPybhv9YU2oIPOiM0Dr+lpfP/TsGT3OefaiY9lRoDmtnE/hYfNA9bAN6NDGc4iKmYuHqH1LNfElKi88ckI/+L4lra37btNTXWWCEywcJFoI4qhxLCLdbkc/8wWeQq7zLiR1aDgInZYNTeiYBfHdMGFIi2yjxAKCQCKK1bxL8dPHtZVN1dTlDXproJ2L7YCyhuh9/g8/tqDFmm6R3+IgMGJnS29LuMcjjdjYGtSSbOunHz8hf1qqD5Ph4TGQkdTKmlFwtxKLRNLn31rWtd6Ap5BaPs8+h/501wwznKWAJ0Z8hq7SDmQkmfbff/2arm1wLuNpB1kMMN16WvBqb3xYYoh/onNhfka/4wNnldCZnCeQNllJi+9Q3oa9Q4sp6Th5gMvr8MwZvY4Or5eHQ/OBTqQdlLUkBwCfl//Fxy80QYWgQRD3u4kBpfltgMgsGIFDdxl3l1Wtm8ub+ru//Jq4WRY7VY42DhtxIqy7Q1ZzZQ14BGFXRudna5V98axNJH/p29e1SbDz04UIVAVobiOBoFONBB8SoYowCP7yxRNoiC4ViB6Og9HphTOLenK+yxNFX60PGDKDJRnBES5ixMZBfI46PNV9h/cXX3pnJRYgL8oZwSW2tOY4D/548LxPCvKjyTLCia9cX9Pf+9q7mkd20O9xOjJUudOAkMuuFzCKkLzWrG/29JueOqkXT/FUSJ9I0IbcQgbQaXp4PcAlc3iDeyiun4diEOUcx1AI7q593zOP6HueWdDa2qYcrYJsAYCk0SN4EJIy2ysDzczO6qe/8K7+5Ts3WIQ6BJssX0iWs4wXlY6fLpB+arHSqS5cgku37ujVm2v64us3CXQdtNGTG6G7TWNV2EK7uKXusxg9ujSnT7CAiCMl9wTyMKRm0Av46ROPL2qDsabE+Jrxu0hKZaT4kVRw52YCuT/QL7x2XX1oFb530F9g0Thdc864AZj3it7qQMbJGjNn4a9/+R3d3OipsmLAbb0IeZGwnMFyBuM0KQV2znUq/Z4XzsX5D+LhZFOtx9QDzOxjatlxMcuz7D7ZQhw4uJ72UOYAQYzRH/mex9Xr9dUnaJRg4UaGUTOaOgUJsazEU8it9YH+1uff5ikkqSKiEO4oFSGqSkndKomkZ090WWSkAUGsQ7vPEeTevrHB9hWXHrS4084qR1u61uC2VWi9tTnQd11c0NNLHflJSM3RiDW1B7fwKbD1n+ZuXjz5eYzDS49BksxugBopfAclI59S0hfeXtHbvASvcXyPBWWuqnSGLcQN/NdFTnSCmDHACtj6urSsn/rqVS3UnEXaWGYLNIpylkudXJnON/t9ferp0/oEj5kZ3aIf3eExHOMdtpuKHw8PMIuPhyFTKw7BA8QIGSZVE0VM/sz7L+gTz57WRj8pEdwtlh0EsrECKYpCSPBSgkCw6MzM6Oe+fE2fffuaZiueQqDVsMwWAa2qstga17MnOzK9w2PJMgHqs6/eVEpQmiuvaKZhk1w3uBq63CHBqof+l3n/4WagUjD10B2/8eIpPb4wG4skw/bDYRkqg279MjynDcHBO/E+6tJKT7/My/ROhy1D5OfrpPOzFS/Re5rlScTOys4aBfbpn/3lt7Q5qCSeJvxpK7OLay3ZAtQRVOxdDbCqU3eG//ESibtKVntXDaeNjoUHuHKOhR1TIw7RA9pplkIjvuiPfeopAnyfzSYIJCE8DFwEiiARLBzHw0TTTOTulhtQ/bf//E1d531GJ1UEuwyIrZBBPNV0Zmo9OtdlPekTwCp99d0V/dobK/JWlp9IshU6C3AGwUUDPKAEYcCCtNBNPIGcpF5SKgWWgVie4oFIu9nKgIj5OkfAf/n8vDY3Nhlb5mwAZnhwLtv2xoPrM2aA0c/6Z9+8ptW+OKdJHU7a+fmkHm03izM5FwNl/Cm0/49fu6LPsZ3YSVJmASEn0V+jl4K6AHSToo4eS/R5Ivz4Eyf1mx6ZswAwTe9FD1TvxUEf5zG38/RAbSRAbNPX0D7NE8gnLs5olZehxJQi1vBiNSiU8Rx+YsnpskD88rdu6Ke+8rYq7oClpKqCKQ7K0wTDR7ib9kKV4f/8qzd081ZfdQ0/DchITSCM4MTgXQ1AVxKXJwtWryd971Nn9JFHFkMspdJH5LTRQ3J4KIxYn3n6pHKq1CdYy8RRMMEOYsxRmAdOlFeVav3Lt27pSyzUCyzcPn/vO7ug8ywh7QIijpSS3lxZ1/+Tp4/5eFoZCJJVAChs+0UWgsLP4O7Pi4eh4rz8gRfOx7/KNV1I0VKTh2mGSfq0/nB4wNfrwzGS6SjuygPdqtIf+eTT3IH21XOkIDA4IHjSZ3A1gSFTqjmMB2TxNNHV3/zslfiJk0TQ8+85OZCdYk/9kydmdbZbE/KSvnNrQz/79RuqkfHTR8SojIKhTocqVxyewGEN4BPatMnd7m98+oR4H89OC4wi5vzBhGYIuxn//Y+f0OmZWbYW5TWApbr4A0eqVCThG0M8TYDHEwTna3N9Uz/ztXeUWRHsySdPLuo3s4icnp2Ru008Xtqn//kvv623lnucj4QaOOWEoNe6DdDQG41AXSYlGEnr6339IIvcpx6dNxkwHRbJohTTNPTAw41UD/fwHtzRHehE3EHZFinrh5+7oO998oRWeaGuCDx7+I1YQULAgUeqeHfyzs11/fXPvqG1QYk/fnn7kx88qx/l6WaO8NLhHcnPvnpdX7uyrrqu5IUBMjpIGOI4BUYi5I3WsaWXk04uzuo3ogsBm6dkxICsiwcSdrA9xgX9iaVZfd9jM/KL8JQSW4LadoTPkLUfA0diwNZUp6rZxlqWf5akC75YJf3IB07r8cUuElkp1fr737yin/ryu7w4r+Ufp3T7FqwPwXIiMxhAinqO1WugpZmO/uDL5WPgrD7CRHGapBhAiMptDJoeD7UHpgvIQ316bz84B44OQeaP/8Zn5GeFAXeojgOmj7Y2LepNVHDdqJ8mOrxM/ce8UP+HX7usOnXlT+c8f3pBTzloEdTe5Onjp37tiuLTXg4tbmhlUUbmOBRgsiHbADrZ4MW7P9r6/KmZsvC0UcpCDyKU4RbLjRtKTR7agHFzOvRjHzipWoI04CkEIeh2kP1iaHG705B5gnDbTCv/q9u/9cW3tSmpg/8fm6+E99CV9KWrN/Wnf+E7mkmVBrz3gC2aWh3SDv7uK1CrLRCkDJ613uOG4/1n9bFH5mljGjcSiCdgmt57Hqj2NWQuoH3JTYUO1AMH6vYdlAUpZn7WD77vjH7oA2d0i3ch2RGMkZjvuAU6uBMdyQAAEABJREFUTMlhKG43TaKGwCBzGSH8V3/hDX32rWUlnjjyxobS5qYGvPv4/3zlHf0ae/Mz6B0Qsdw8I08iCFmPIWoEqRYnmOWsLgvav/LiOUroiCSKBzrdbgCpCHz6mbP64Nk5bWz2JXwujhyOA2kT/giHZRCSndnPfXU6M/qfvnxd/+S1G1piC3EBWreqdHmjp//on35b79wcqGMdXkCswO3bMuN3cC9SBahDGyDj+rm5Wn/opfMsU1bQAPzA2jIq0+y94AFm/j6GWa7pfQhORQ7aA56ThgPRu4siYoNqAtf//jPv1wJXRI8AIurRp8/9ZDvXgURAS5SZu9Ksrt69uak/99Ov6p+/cV01erzV8XPfuab/4ZevqBok7qRLMLL6FmhO3ONOFiSr3M3aHlD1CXAvPLrAfvuJMEWtTaX28OR5ayge4oBHgtlOpd/x3Alt9Abydy5kGRxDkgbCZ6WNg3rwoPlRIp5E+n18PdBf+PnX9Rovyy8szes625P/wc+8os+/vqp5trYyvvWi4LZ4H33k9EECt/5SL5UBrs/aWO/pJz7yiD50epau4CsVI8jDLsppem95gGn+3hrwdLS7eSDrxfPz+r0fvyi/iK24Y3V4SA4SRDUHiACaO8hQkBqMVcQBqVKlb1y+pf/b3/+W/tYX3tZPff2K/sw/+abevrnBAkVQImg57NCQZKy0z/RhcDALoE7IYgGRfvvz53W2y8Lizmn1nkj4OzHQH3vuEZ2eazefTIFIykD4CZ/gehwLBbzQJC9AiXPxraur+l//7S/rz/yLb+nf/v/+uv7nr1/liaSrQb/HGoT/UekFaKspNCrkigO1oRO5Aefuea6Pf+PFC5wduOZROMF2MYWHzQP7GM+DvYCMXMT7GOsDLeKhGu55EDspIQIQNyIw/Dufekb+j3+bbGVVbDfFl8sG9GoBt3XpqBK4A7uopQhIm37KSLWuLA/0X/38Ff3H//Db+vY7m5qtuMwIQAginOU732jeqC13ubkU9OWgNuDdx4WlGf3O504jFc2iPOzMdh12HzvqH+mY04Evsp46Masfev8prcU2Fq3wDQzhQJUy4dLGb8Y4N+E7yh7nrlPX+vr1vv6Lf/GOvvCddS2xtdXrZ84VzVGHGK3AM8BTD02KavoZcC4h0w15Gsjvon7i5cfk76l4MRGLHCokG6v35vEeHvrwhDOzh/iDh7wHzyDTOSb9gZ8sfOmA8sh8R3/s009rwDuMPrSBAws9ln5zYM4JOZhApCEnyrBlYgRASV0hTSm2uGbqeosn6DQZLkrgRU+jEbYxmunWel8/9NxZXsTzah9dKWGM1QOHnTDjsLvYrr8Mr9DBM5E5AX/4I+e0hD97PGqEb4pEuC17KcgQ8I9dWyDjbyB4A83X0qmZWnOch+xzmWgK+JxFM68aICRaZMiZRSTLH3jg1Qm42Lrq67seO6Xf+YFzwRd2qT0y+lr8PVYy9PfYiLcP98FeQLaP5z1DuaeLd4/GmSj0b7z0qD7z4TNaXumpqrnLRZ4EB/caicKSJXg4+ATTvAbiKQMGqQQdEGIgDRAgQQwcMmjTh+noHrCHf26uoz/40XMRqkIG+kGnprtQa9wQFTLjBtC7TAfRzNuKi/rMs4ta5f2D4z5RHn81um2gF2GXAWR2FuzkVRjeoAE/mcBVLCIgkOOUOSu8LN8sWL7vhQY9/ZS1iZ657qz+6CefivdjPq9qFnO6mab3uAemC8gDfAEQB+7eejc2jGogQjmYsGboP/zh53TxVIeti36JFwQUB5sBWaBuCxBjRLPQ0paQo+7M+kKeSqYthYIGEnIwXYcIFwkUbrB99uMvP6IPnpmFjNRIwGr7oPk9J+tCO/3es6p7V2BDRrWEcRnfJv3bH39Cp3mpvmmaZbLXXmeUWG//GUDNNbFAqZEjS76V8DMkt/GCAIqfC9c0Tgl1ZFC40evp93/XRX3/I3MsMAOl1BpR5Kf5e9sD1Xt7+LcZvWfWbUQeePbEGFPy00DWk6fm9X/8nR/QxkZPLCGEEmISkYUk38XGuCfaumoIYbLAW8Fo6EpLLQEqi/4gmz1gr91PH0+dXtD/8nseh+M+YY6kDG6goAfnyJTijnLrMNxRo8MWnjAoFw/og+cW9ftePqdbG5vi3TgDxnc4jATeGEUF6lZ9zDupFQoqotRDmpImeQKQ4sFDm72BPvHUWf2Rl88rFpawp9UVTafZe9wDx3UBOR6n5QGYK8z9e/fVpBIWESv9V557RH/kM+/TzVubytDi6WMgdlGSBjnJzQKcuYFLA3gEqQanupUaWvChRgnN4SylpHWC1h/71JO6uFBF0BI0xORTYTBuoImLQwf3Yzj0jnbqgAHbPxT6o9/1hD50qlteqNsn+F+cAfMpSmsMdd3BPmjUW4b9a57bmFZwauixmGHgzEw6ZBdRZxfn9B/8pqe05EdSeJX7NX8KUw80HpguII0jpsW4B9oA8+99/5P6ie95VNdXNtSvkgZsMRHZEXZIckFkcTGMWA0dGuGJvPBBIrlmiSibzPXElbi5vqEf+/AF/fiH/bLWrYlk0cp4gaZ614W7vOvG97uhjcUFPhcneRH+p37o/Urr6yzerOL422yvrFHaNp8b6EZZF1xsA8sazHDZghcPn4fMU6DVVLnSn/rMM3rxdFcDvxhxgylMPTDhAabtBGVafW96wJFkZOS+2fSd7AzIf/RbPqAfeekRraxsKlW1lJKSJAoySY44GgnwwYSwWyK6JfHnPomOFe29F//MuSX9iU8/q5mELui7NR+lW8VofS+8lW3LvWSPjDdqHH7YsiPrk0+c0P/q+57U+sq6UoJpHzXyUeDXkIcV6wilFwW8GeTIQtBY4rQBAqCRK3GDkKqO1njZ8id+4Bl9+ukTZfFISTJoekw9MO6B98YCwgQZH/bDU2NqH9xgRvxkNKXEw0aOj4L+uX/1ef3wi2e0fH1NUFVpoNQfSNy6RhxzAyyJgDVCCLKzIWAxePn0aJb/8RRKtNTp6D/+HR/QU0u1BugUfaNOQlx3edDNsOUoPiTeAXKv7e+gq+2i9gEGuPh3v/8p/cgLZ7S2eks1szdxHmR/0QoRchKIZX0aqHEOFRCLShDgerEBUh8C7X0+vVPV38j6P/zAk/o3Xz6rGgUpIXsvJwH10/TweoBL8OEd3HBkngPDym0QJt9tJB5e9oSf7IqUIILMcXf6l/61j7Cd9YjWry+rN+iJFQRgySDQ5CortrcQj3hDSXwSoUuuGx+YJinepfBq3vTeRqWFNKv/6+96Xp+8uEigozP3iZz5w6Dn+g6AyhDbgbUrfSfZ/dCw7HbmbKmx8Fbt3jEGipvVwTf/lx/5kL77qSVdv+ltRTqqBhJbT+JJzn4uJXTXxUFbYbl5UPG/a9KAxSMHPWl9M6vbT/o//eZn9G9916Nl8aCpDtyLmh4PkQeO1QIS1/lRO/eejTjqARxC/wSt2M7iavlPfvQF/fs/9gJrR9LN1V4EIznIEMOI/k4AYcmRCshErRylRKyKDHXKZP6ve0+dXdKf/30v6rc8vciNNO2sC6lItItyj+x2Irfj76F6V9a+dN7LdbRDB0FCp8/DiU6l//pfe4knkZNavrGuDYJ/xTMhbK8dxc9u0ED4H79GyXnyp+isR7XUyx1trtd67swp/fkff0H/+ou8fxq058Ead3XDlDH1AFfdMXKCr/djZM4DYcqB+mwHZQ4ljkgpJRaG4pKf/N4n9Td/8mP65PtOau3Whm7x8hsuWyoJkBANEPEnOZNUQUyVpbI2N3rqbfT1Wz/8mP7yH3xe3/PoXCweKSWRkD7YtMOwDraDw9Bmow0Tuu0fB/9F9pv+3I99WP/l7/6QHp+rtLa+yfkZhP9x89CPaax9Vqqk8ssyA61vbOok9T/2qYv6az/xnL734sLWeWja5aacFlMP7OQBLp+dyFPag+SBw57krf6UkhKOcQD78GNL+n/9wY/pP/k9L+rjj5+QH0Vurm6ymPTU3+wre39kMEC+D6/PgrGh9fV1zSrr+546rf/H731Rf/bH3q+n5itZX0Iy7pDbzuhn95SGrC1sSArEagxReZAzD8LQjCFQBm1fefL+6Acv6K/+vpf0ez9yQWd4j7TR62uVxWTDP5jo3yLhxCReOCW2HPvQ1ljseyzgF+a6+r0vP6a/8gde1L/7fY/q3EwlHjw4C4kzpCE03T4wxdTQ++sBX4P3t8dpb8fbAxGhtpuYCSkGOcQ4gBFtOpS/+8VH9Ff/0Ef1V37fh/W/+/T79DtfvKCPPnpST56Y19m5GZ1bmNUzpxf1m194VP/+b/ug/sYffln/DUHrN7//tLosSA6EohS6tO9jJyPvSMG+e9pNcCcLdpM9FDrDtQ1efJ86Nac/9Vvfp//37/+I/vRve05/+GOP6+OPneIcLOj8wpzOzc/qUc7Hb3jstP7oJ5/WX/jdz+tv/aGP6P/8w0/rxTMzsYD7PPg0aHpMPXAHHpguIHfgrKmo70ybZSSBE8EcwBbYTvnup07qj/3AE/pP/9Xn9Bf/4EdiUfnrP/my/sZP/gb9d3/4o/q///hz+smPP6oXzi3wIpi2LEAOWvapS4PxuweMufvGd9XyvvbozgyTlsZ5yPJEfuLkrH7k+XP6kz/0jP4ST4ZeUP77P/CS/sa/+VHgJf3F3/O8/jff/4R+8JnTOjfb4SRwLkMnSkjcIzhN9jCtTz2wqwd83e3KnDLeYx5oh+ugshO0fEqzKeQnBwd/f4/DUME4waPJo/O1nljs6DH25890kyqEBrFoOGgRraqkTIG4DuqwLsNB6duPnvvdn0Y7HMFxb/MkYf9mzTKzz7AtdR7kAufgbLfSQu01o/AtL588zoF8oItk7P7DkXV8/4f6sPXIZfawDekux3PPF3E7E++y/3tsds/m76f/yU485Ibm7Y+UyqLAOhH76aNlJlglFg1RZjmQORM13dNhXZMKdqJNyhxk/X73N1xE8L8XAvffgseV8eqY73Pxd/aKzTkSYNRg+SMHxrGjDdi9I31KPDYemC4g7anY7SJu+bctj/5qP1wLdnGQyUCmc29nObhR1SSE+5CJciTbgTTC3R9qHYb9SR+O1H3vnw7tc/t5dESQR6txHsYICEQ7ygQYH+Mfp8rk4I6TbQdvywOpcbqAPJCnbXejiQm7M++J02h2MQGu3k61Y4HlDLeTfVD5Hpvhftjf9tOWd9qn2xnczqXB+BSmHrgTD0wXkDvx1lQ2POBg08KQEEjJWl5bmmrc5b2CF6J71fGgt78TX1rWMDrm3Xy4G3207RSfemDUA9MFZNQbDwk+GTAOelgONAbr3U9f+5Gxrv3Abrr20/Z+yRy2ja3v72Q8tmkUdmpr/k70KW3qgd08MF1AdvPMA053MDAc5jAcyPYLh2mHtu/066iPw/b9fsc3eX72224qN/XAfjwwXUD246UHWOa4BbLDceVxGeXhjO5utLYLx2Tb3WhYbJ8AAARRSURBVOiTctP61AP78UBZQPYjOZWZemDqgTvywOEsa14CFM9cxkZBHG0ddJqmHjh0D0wXkEN38dF34EBmOHpLtC3waXrcoQd2P5NePParzLKTsN+2U7mpB1oPTBeQ1hPvgdKhx3CchtoGseNk00HaYn+30Op1vcUlHRvU5+LYGDM15IHwwHQBeSBO0x0YuY/otA+RO+hwKrpfD7R+nwbq/XpsKnfcPTBdQI77GbpT+/YZndpgdqfqp/JTD0w9MPVA64EHfgFpBzIt79wD00Xkzn12ry2Os8+Ps2336vdp+8PxwHQBORy/PjBap0Hj/p+q4+jz42jT/T8zD2mPh3hypwvIQ3rN3MmwfH0Z7qTNVPbePHCc/H33ttybD6at75MH9rmtfTfWTBeQu/HaHbc5xDN4x7bs3uCwA4n17wa7W/XwcuyLoxyd+zccpQ3Tvh9sD0wXkPty/h6caWpL///smu1uwyAMRae9/0Ovd5I3t4KKFAOGnB9XED6MfZzE6TRTFJpoe1F+ZbAjNiv8WHXuilg5cxwBCsg4tttb1ktG8oG8Xvs59TX/Ko2jOgHxqs/GzugsKdZqFmt7/NLPQivCDwpIBMXDbeiFY1Ko1i+1mkfXCRjL6zvbdoy23+bF6FWKcvQZo+3vZZ8Csle+8LaJwL5fonoFejWF6xb5vb7vltCFQBgBCkgYSgzlIaBXZx5vejxRJCWVbGpdaZwxCIwiQAEZRRa7Kwjc5kwVi1fdJngCTUOAApImFTs5su+fiHaijK8QyE6AApI9Qyn907dvSsdwCgIQmEjgqYBMPPeMo3iPnpHH46PgF+PxKV4UIAWkBzzPZQ899k4jwJfONNQ3O4gCcrOEE+46AtXvjd/3+zq/OBkCnxKggHxKjn0QuEigWieqleXiASyHwGQCFJDJwDkOAhCAwCkETikgp+SDOCAAAQhsQ4ACsk2qcBQCEIBALgIUkFz5wBsI7EcAj29LgAJy29QTOAQgAIE+AhSQPn4b7uZffjZMGi5DICUBCsjytMx2oPrPpLMd4TwIQGBzAgEFhC/aze8B3D+AgJ5Ck8JRXy2CwEgCAQUkyxctj0zrjSJSLWq1x7q1BJRL74FdqzX5efr/BOj1EQgoIH0OxO3OUsjiIoqwZC8Q37batT2t61k3h4DlxdqWU23ta9uylzWHEBjwijyogDwnWQ+KjahvsrFTW8Wp2NRK6vdKdqReO+zvJxCdB9nz8h5q3F+X+i1rSvsYW0BgQLKOKyBiJCk9aiX1TbqW7PqUVjFJisda9cP0+HqRXenPJp2pBGaw1xkmBWf9WvtujeYk7VWLziPwreSadg7vagy23rc545eHdc80K9VXBM24Q1w3yDhm3hEQb+ndmoxz8lmSb2ol6/tW/R7JrtRjg72fEdj+F0jkjRNp67N0lHY9Pv0Lw/JVKkxNGVp59pQAEx1SvgMSOXjBFbtvfGv9C2ZY+vWVgsEPAAAA//8VqZOuAAAABklEQVQDALOpUGMBDIFDAAAAAElFTkSuQmCC';
if (typeof Image !== 'undefined') { const _im = new Image(); _im.decoding = 'sync'; _im.src = CRCC_IMG; window.__crccPre = _im; }
function PracticeLogo({ s=36, ring = true }){
  return <div style={{ width:s, height:s, borderRadius:'50%', flexShrink:0, background:`#fff url(${CRCC_IMG}) 50% 50% / 76% no-repeat`, boxShadow: ring ? 'inset 0 0 0 1px rgba(62,142,255,0.22)' : 'none' }}/>;
}
function Avatar({ init, g, s=36 }){
  if (init === 'CR') return <PracticeLogo s={s}/>;
  return <div style={{ width:s, height:s, borderRadius:'50%', background:g, display:'flex',
    alignItems:'center', justifyContent:'center', fontSize:s*0.34, fontWeight:700, color:'#fff', flexShrink:0 }}>{init}</div>;
}

/* ============================================================
   Scene contexts
   ============================================================ */
const ClkCtx = createContext(null);
const useClk = () => useContext(ClkCtx);
const LtCtx = createContext(99);
const useLt = () => useContext(LtCtx);

const focusReg = {};
const lastPos = {};
const RegCtx = createContext('');
function useReg(){
  const ns = useContext(RegCtx);
  return id => (id ? (el => { if (el) focusReg[ns + ':' + id] = el; }) : undefined);
}

function typed(lt, cue, full, dur=0.7){
  full = full || '';
  if (cue == null) return { text:full, typing:false, pending:false };
  if (lt < cue) return { text:'', typing:false, pending:true };
  const p = clamp((lt - cue) / dur);
  return { text: full.slice(0, Math.round(p * full.length)), typing: p < 1, pending:false };
}
function fieldFocus(lt, cue, dur=0.7){
  if (cue == null) return false;
  return lt >= cue - 0.22 && lt <= cue + dur + 0.4;
}
function Caret({ lt }){
  const on = Math.floor(lt * 2.4) % 2 === 0;
  return <span style={{ display:'inline-block', width:1.5, height:16, background:ONB.accent, marginLeft:1, transform:'translateY(3px)', opacity:1 }} />;
}
function pressScale(clk){
  if (clk == null || clk < 0 || clk > 0.42) return 1;
  const p = clk < 0.12 ? clk / 0.12 : 1 - (clk - 0.12) / 0.30;
  return 1 - 0.055 * p;
}
function ClickFX({ clk, color='rgba(255,255,255,0.55)' }){
  if (clk == null || clk < 0 || clk > 0.62) return null;
  const r = clamp(clk / 0.55);
  return (
    <span style={{ position:'absolute', inset:0, borderRadius:9999, clipPath:'inset(0 round 9999px)', pointerEvents:'none' }}>
      <span style={{ position:'absolute', left:'50%', top:'50%', width:60, height:60, marginLeft:-30, marginTop:-30,
        borderRadius:'50%', background:color, transform:`scale(${0.35 + r*2.6})`, opacity:(1 - r) * 0.5 }} />
    </span>
  );
}

/* ============================================================
   Onboarding UI primitives — liquid glass
   ============================================================ */
function Field({ label, required, children, mb=18 }){
  return (
    <div style={{ marginBottom:mb }}>
      <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:ONB.text, marginBottom:8 }}>
        {label}{required && <span style={{ color:ONB.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function focusAmt(lt, cue, dur=0.7){
  if (cue == null) return 0;
  const i = easeInOut(clamp((lt - (cue - 0.45)) / 0.4));
  const o = easeInOut(clamp((cue + dur + 0.6 - lt) / 0.45));
  return Math.min(i, o);
}
function focusStyle(fa){
  const r = Math.round(lerp(255, 62, fa)), g = Math.round(lerp(255, 142, fa));
  return {
    border:`1.5px solid rgba(${r},${g},255,${lerp(0.9, 0.72, fa).toFixed(3)})`,
    boxShadow:`0 0 0 ${(5*fa).toFixed(2)}px rgba(62,142,255,${(0.13*fa).toFixed(3)}), 0 6px 18px rgba(62,142,255,${(0.2*fa).toFixed(3)}), inset 0 2px 6px rgba(24,38,58,0.05), inset 0 1.5px 1px rgba(255,255,255,0.98)`,
  };
}
function fillAmt(lt, cue){ return cue == null ? 1 : easeOutStrong(clamp((lt - cue) / 0.42)); }
function fillFocus(lt, cue){
  if (cue == null) return 0;
  const i = easeOutStrong(clamp((lt - (cue - 0.22)) / 0.22));
  const o = easeInOut(clamp((cue + 0.75 - lt) / 0.35));
  return Math.min(i, o);
}
// Value resolves in place: placeholder blurs out while the value sharpens in (blur → sharp, 420ms strong ease-out).
function FillText({ lt, cue, text, placeholder, mask }){
  const rv = fillAmt(lt, cue);
  const shown = mask ? '•'.repeat(text.length) : text;
  return (
    <span style={{ display:'grid', alignItems:'center', minWidth:0 }}>
      {rv < 1 && <span style={{ gridArea:'1/1', color:ONB.mute, opacity:1 - rv, filter: rv > 0.01 ? `blur(${(rv * 4).toFixed(2)}px)` : 'none' }}>{placeholder}</span>}
      {rv > 0 && <span style={{ gridArea:'1/1', color:ONB.ink, opacity:rv, filter: rv < 0.99 ? `blur(${((1 - rv) * 6).toFixed(2)}px)` : 'none', transform:`translateY(${((1 - rv) * 5).toFixed(2)}px)` }}>{shown}</span>}
    </span>
  );
}
function Inp({ value, placeholder, cue, fid, mask, filled }){
  const lt = useLt();
  const reg = useReg();
  const fa = fillFocus(lt, cue);
  const sweep = fa > 0 ? clamp((lt - (cue - 0.2)) / 0.9) : null;
  return (
    <div style={{ position:'relative' }}>
      <GlowRim on={fa > 0.01} radius={14} spread={6} blur={14} opacity={0.5 * fa} pulse={lt}/>
      <div ref={reg(fid)} style={{ position:'relative', width:'100%', height:50, padding:'0 17px', display:'flex', alignItems:'center', borderRadius:14, ...focusStyle(fa),
        background: filled ? 'rgba(244,247,251,0.9)' : 'linear-gradient(160deg,rgba(255,255,255,0.97),rgba(255,255,255,0.84))',
        fontSize:14, lineHeight:'20px', boxSizing:'border-box', whiteSpace:'nowrap', overflow:'hidden' }}>
        <FillText lt={lt} cue={cue} text={value || ''} placeholder={placeholder} mask={mask}/>
        <Sheen p={sweep} radius={14} strength={0.55}/>
      </div>
    </div>
  );
}

function ReadOnly({ children, lines }){
  return (
    <div style={{ width:'100%', padding:'13px 16px', borderRadius:12, border:'1.5px solid rgba(232,238,248,0.9)',
      background:'rgba(244,247,251,0.72)',
      fontSize:14, color:ONB.text, boxSizing:'border-box', lineHeight:lines ? 1.45 : 1.2 }}>{children}</div>
  );
}

function RoleCard({ selAt, icon, iconColor, iconBg, label, fid }){
  const lt = useLt();
  const reg = useReg();
  const sel = selAt != null && lt >= selAt;
  const pop = selAt != null ? clamp(easeOutBack(clamp((lt - selAt) / 0.45))) : 1;
  const hover = selAt != null && lt >= selAt - 0.5 && lt < selAt;
  return (
    <div style={{ position:'relative', flex:1, minWidth:0 }}>
      <GlowRim on={sel || hover} radius={14} spread={6} blur={15} opacity={sel ? 0.5 : 0.3} pulse={lt}/>
      <div ref={reg(fid)} style={{ position:'relative', background: sel ? 'linear-gradient(160deg,rgba(235,243,255,0.95),rgba(235,243,255,0.72))' : 'linear-gradient(160deg,rgba(255,255,255,0.9),rgba(247,250,252,0.72))',
        border: sel ? '1.5px solid rgba(62,142,255,0.75)' : '1.5px solid rgba(232,238,248,0.95)', borderRadius:14,
        padding:'14px 14px', display:'flex', alignItems:'center', gap:10, textAlign:'left',
        boxShadow: sel ? '0 5px 17px rgba(62,142,255,0.18), inset 0 1px 0 rgba(255,255,255,0.95)' : 'inset 0 1px 0 rgba(255,255,255,0.9)',
        transition:'background 0.35s, border-color 0.35s, box-shadow 0.35s' }}>
        <div style={{ width:34, height:34, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n={icon} s={16} c={iconColor}/></div>
        <div style={{ flex:1, minWidth:0, fontSize:12.5, fontWeight:600, color:ONB.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
        {sel && <div style={{ width:20, height:20, borderRadius:'50%', background:ONB.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transform:`scale(${pop})` }}><Ic n="check" s={11} c="#fff" w={3}/></div>}
      </div>
    </div>
  );
}

function StepHead({ eyebrow, title, subtitle }){
  return (
    <div style={{ marginBottom:24 }}>
      {eyebrow && <div style={{ fontSize:11, fontWeight:700, color:ONB.accent, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{eyebrow}</div>}
      <h1 style={{ fontSize:27, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em', marginBottom:6, lineHeight:1.15 }}>{title}</h1>
      {subtitle && <p style={{ fontSize:13, color:ONB.mute, lineHeight:1.5 }}>{subtitle}</p>}
    </div>
  );
}

// Glass button — liquid surface, glow on approach, sheen sweep, press + ripple.
function Spinner({ lt, c }){
  return <svg width="15" height="15" viewBox="0 0 24 24" style={{ transform:`rotate(${(lt * 400) % 360}deg)`, flexShrink:0 }}><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeOpacity="0.3" strokeWidth="3"/><path d="M12 3a9 9 0 019 9" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"/></svg>;
}

// Glass button — liquid surface, glow on approach, sheen, press + ripple, optional loading state.
function GBtn({ label, icon='arrowR', clk, tone='ink', fid, pad='13px 26px', size=14, full, loading, loadDur=99 }){
  const reg = useReg();
  const lt = useLt();
  const live = clk != null && clk > -0.9 && clk < (loading ? Math.min(loadDur, 3) : 0.7);
  const bg = tone === 'ink' ? 'linear-gradient(160deg,#2A3130,#141918)'
    : tone === 'accent' ? 'linear-gradient(160deg,#5BA0FF,#2F7DF5)'
    : tone === 'green' ? 'linear-gradient(160deg,#3FD990,#1EB36B)'
    : 'linear-gradient(160deg,rgba(255,255,255,0.95),rgba(255,255,255,0.75))';
  const fg = tone === 'ghost' ? ONB.ink : '#fff';
  const glow = tone === 'accent' ? 'rgba(62,142,255,0.45)' : tone === 'green' ? 'rgba(34,201,122,0.42)' : 'rgba(26,31,30,0.35)';
  const sweep = clk != null && clk > -0.9 && clk < 0.5 ? clamp((clk + 0.9) / 1.4) : null;
  const shift = 50 + Math.sin(lt * 0.45) * 50;
  const la = loading && clk != null ? clamp((clk - 0.1) / 0.25) * clamp((loadDur - clk) / 0.2) : 0;
  return (
    <div style={{ position:'relative', display: full ? 'block' : 'inline-flex' }}>
      <GlowRim on={live} radius={9999} spread={9} blur={20} opacity={0.5} pulse={lt}/>
      {live && <span style={{ position:'absolute', left:'12%', right:'12%', bottom:-10, height:18, borderRadius:'50%', background:glow, filter:'blur(14px)', opacity:0.9 }} />}
      <div ref={reg(fid)} style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center',
        width: full ? '100%' : undefined, boxSizing:'border-box',
        background:bg, backgroundSize:'170% 100%', backgroundPosition:`${shift.toFixed(1)}% 50%`,
        color:fg, borderRadius:9999, padding:pad, fontSize:size, fontWeight:600,
        border: tone === 'ghost' ? '1.5px solid rgba(255,255,255,0.95)' : '1px solid rgba(255,255,255,0.28)',
        boxShadow: `inset 0 1.5px 1px rgba(255,255,255,${tone === 'ghost' ? 0.98 : 0.34}), inset 0 -8px 16px rgba(255,255,255,0.14), 0 14px 32px ${live ? glow : 'rgba(24,38,58,0.14)'}`,
        transform:`scale(${pressScale(clk)})` }}>
        <span style={{ display:'grid' }}>
          <span style={{ gridArea:'1/1', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, opacity:1 - la, filter: la > 0.01 ? `blur(${la*6}px)` : 'none' }}>{label}{icon && <Ic n={icon} s={13} c={fg}/>}</span>
          {loading && <span style={{ gridArea:'1/1', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, whiteSpace:'nowrap', opacity:la, filter: la < 0.99 ? `blur(${(1-la)*6}px)` : 'none' }}><Spinner lt={lt} c={fg}/>{loading}</span>}
        </span>
        <LiquidSheen radius={9999} period={9} phase={0.15} strength={0.3}/>
        <Sheen p={sweep} radius={9999} strength={0.5}/>
        <ClickFX clk={clk}/>
      </div>
    </div>
  );
}

function Actions({ continueLabel='Next', back=true, tone='accent', clk, fid, loading }){
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:12, marginTop:26 }}>
      {back && <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:ONB.text, fontSize:13, fontWeight:600, padding:'12px 22px', borderRadius:9999, border:'1.5px solid rgba(232,238,248,0.95)', background:'rgba(255,255,255,0.8)' }}>Back</span>}
      <GBtn label={continueLabel} icon="arrowR" tone={tone} clk={clk} fid={fid || 'cta'} loading={loading}/>
    </div>
  );
}

function Card({ children, pad='32px 36px', style, radius=24 }){
  return (
    <div style={{ position:'relative', ...glass(radius, 0.74), padding:pad, ...style }}>
      <LiquidSheen radius={radius} period={14} strength={0.4}/>
      {children}
    </div>
  );
}


// Word-by-word blur-to-sharp line. Items: strings or inline UI chips.
function BlurLine({ t, t0, tOut, items, stagger=0.1, dur=0.8, style }){
  const out = tOut != null ? easeInOut(clamp((t - tOut) / 0.65)) : 0;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', alignItems:'center', columnGap:'0.26em', rowGap:'0.12em', ...style }}>
      {items.map((it, i) => {
        const a = easeOut(clamp((t - t0 - i * stagger) / dur));
        const v = a * (1 - out);
        const b = (1 - a) * 18 + out * 18;
        return <span key={i} style={{ display:'inline-flex', alignItems:'center', opacity:v,
          filter: v > 0.002 && b > 0.2 ? `blur(${b}px)` : 'none', transform:`scale(${1 + (1 - a) * 0.06 + out * 0.03})` }}>{it}</span>;
      })}
    </div>
  );
}

function RefChip({ t, at }){
  const p = easeInOut(clamp((t - at) / 0.8));
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:lerp(0, 12, p), height:72, padding:`0 ${lerp(14, 30, p)}px 0 14px`, borderRadius:9999,
      maxWidth:lerp(72, 320, p), overflow:'hidden', boxSizing:'border-box', whiteSpace:'nowrap',
      background:'linear-gradient(160deg,#3FD990,#1EB36B)', color:'#fff', fontWeight:700,
      boxShadow:'0 7px 20px rgba(34,201,122,0.32), inset 0 1.5px 1px rgba(255,255,255,0.45)' }}>
      <span style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.22)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n="send" s={21} c="#fff" w={2.2}/></span>
      <span style={{ opacity:p }}>referral</span>
    </span>
  );
}

// Full-bleed line: glowing head travels left → right, then light keeps streaming forward.
function ForwardLine({ p, t }){
  const done = clamp((p - 0.97) / 0.03);
  const sweep = (t * 0.5) % 1;
  const sx = -18 + sweep * 118;
  const sf = clamp(sweep / 0.18) * clamp((1 - sweep) / 0.18);
  const grad = 'linear-gradient(90deg,#3E8EFF,#90F0C5 50%,#FFC794)';
  return (
    <div style={{ position:'relative', width:'100%', height:3 }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:(p * 100) + '%', background:grad, backgroundSize:'1920px 100%' }} />
      {p > 0.001 && p < 1 && <div style={{ position:'absolute', left:`calc(${p * 100}% - 180px)`, top:0, width:190, height:3, background:'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95))' }} />}
      {done > 0 && (
        <div style={{ position:'absolute', left:0, right:0, top:0, height:3, overflow:'hidden', opacity:done * sf }}>
          <div style={{ position:'absolute', top:0, bottom:0, left:sx + '%', width:'18%', background:'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,255,255,0))' }} />
        </div>
      )}
    </div>
  );
}

// Letters rise one by one from behind the baseline (SVG viewBox masks them).
function WordmarkRise({ h, local, at }){
  return (
    <svg height={h} viewBox="360 46 800 158" style={{ display:'block', overflow:'hidden' }}>
      {WORD_PATHS.map((d, i) => {
        const a = easeOut(clamp((local - at - i * 0.065) / 0.7));
        return <path key={i} d={d} fill={ONB.ink} opacity={clamp(a * 1.4)} transform={`translate(0 ${((1 - a) * 150).toFixed(2)})`}/>;
      })}
    </svg>
  );
}


function GlowCursor({ x, y, z, click, opacity, rot }){
  const cc = click;
  const press = cc != null && cc >= 0 && cc < 0.42;
  const pr = cc != null ? clamp(cc / 0.55) : 0;
  const ripple = cc != null && cc >= 0 && cc < 0.6;
  const size = 68;
  return (
    <div style={{ position:'absolute', left:x, top:y, transform:`scale(${(press?0.9:1)/z}) rotate(${rot || 0}deg)`, transformOrigin:'0 0', pointerEvents:'none', zIndex:60, opacity, transition:'opacity 0.3s ease' }}>
      <div style={{ position:'absolute', left:0, top:0, width:74, height:74, marginLeft:-30, marginTop:-26, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(62,142,255,0.30), rgba(144,240,197,0.14) 45%, transparent 72%)', filter:'blur(6px)' }} />
      {ripple && <div style={{ position:'absolute', left:0, top:0, width:34, height:34, marginLeft:-17, marginTop:-17, borderRadius:'50%',
        border:'2px solid rgba(62,142,255,0.75)', boxShadow:'0 0 18px rgba(62,142,255,0.5)', transform:`scale(${0.4 + pr*2.5})`, opacity:1 - pr }} />}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display:'block', marginLeft:-size*5/24, marginTop:-size*3/24, filter:'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 3px 6px rgba(20,30,40,0.30))' }}>
        <defs>
          <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3E8EFF"/><stop offset="0.5" stopColor="#90F0C5"/><stop offset="1" stopColor="#FFC794"/>
          </linearGradient>
        </defs>
        <path d="M5.2,2.4 C5,2.5 4.9,2.7 4.9,3 L4.9,18.4 C4.9,18.9 5.5,19.1 5.8,18.8 L9.6,15.2 L12.2,20.9 C12.4,21.3 12.8,21.4 13.2,21.3 L15.1,20.4 C15.5,20.2 15.6,19.8 15.5,19.4 L12.9,13.9 L18,13.7 C18.5,13.7 18.7,13.1 18.4,12.7 L6,2.5 C5.8,2.3 5.4,2.3 5.2,2.4 Z"
          fill="url(#curGrad)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}


// [file, srcIn, srcOut, oldStart, oldSpan]: each phrase is stretched onto the span its words occupy in the picture
const VO_RAW = [
    [7,0.04,2.4,0.56,2.18],[7,3.38,4.96,3.04,1.68],[7,5.64,7.47,5.14,1.72],[7,7.47,8.94,7.05,1.42],[7,9.36,12.6,10.84,2.56],[7,12.98,14.6,14.26,2.12],[7,14.86,15.66,16.4,0.82],[7,15.9,16.68,17.23,0.78],[7,17.14,17.96,20.34,1.22],[7,18.48,19.98,25.89,1.4],[7,20.5,21.98,28.01,1.36],[7,22.34,26.56,29.43,2.52],[7,27.02,27.74,34.02,0.6],[7,27.74,29.56,34.96,1.92],[7,30.08,31.8,38.06,1.82],[7,32.3,33.84,40.68,1.68],[7,34.44,36.56,43.36,2.24],[7,37.04,39.12,47.38,2.5],[7,39.6,41.9,50.2,2.12],[7,42.38,43.4,53.3,1.06],[7,43.42,44.56,54.46,1.2],[7,44.58,45.68,55.76,1.18],[7,46.14,47.64,57.54,1.6],[7,48.08,52.12,61.84,3.54],[7,52.7,53.84,65.8,1.16],[7,54.28,55.32,69.14,0.92],[7,55.76,57.12,71.22,1.2],[7,57.5,58.12,73.91,0.62],[7,58.6,62.64,77.66,3.78],[7,63.18,66.46,83.34,2.22],[7,66.86,70.56,85.95,3.56],[7,71,73.72,90.84,2.8],[7,74.16,75.52,94.54,1.56],[7,75.92,77.86,97.34,2.1],[7,78.32,79.54,100.74,1.22],[7,79.84,81.34,102.24,1.5],[7,81.38,82.56,103.76,1.24],[7,83,84.14,105.74,1.1],[7,84.34,87.74,107.18,3.36],[7,88.18,89.32,110.74,1.04],[7,89.58,90.72,112.64,1.12],[7,91.2,93.46,116.03,2.44],[7,93.84,96.54,123.53,2.74],[7,97.06,98.4,127.58,1.48],[7,98.92,99.92,129.34,0.94],[7,99.94,100.94,130.36,0.9],[7,100.96,101.99,131.32,0.97],[7,102,103.4,132.36,1.5],[7,103.86,104.96,136.83,1],[7,105.04,106.84,138.71,1.76],[7,107.3,108.96,141.61,2.14],[7,109.3,111.36,144.04,2.08],[7,111.66,113.34,146.34,1.86],[7,113.6,115.6,150.34,2.48],[7,115.72,119.52,153.54,3.72],[7,120,120.74,163.24,0.72],[7,120.84,122.9,164.26,2.02],[7,123.3,125.4,166.74,2.24]
];
// v6.1 retime: speech stays 1x; gaps between phrases compress so the cut runs ~2:34.
// Protected: the hold after "cracks", the brand reveal and the logo lockup keep more air.
const RM = (() => {
  const P = VO_RAW.map(c => [c[3], c[2] - c[1], c[4]]).sort((a, b) => a[0] - b[0]);
  const TAIL = 1.32, OLD_END = 170.4, TARGET = 168;
  const ix = at => { let bi = -1, bd = 0.6; P.forEach((p, i) => { const d = Math.abs(p[0] - at); if (d < bd) { bd = d; bi = i; } }); return bi; };
  const iPhone = ix(17.23), iSlip = ix(7.05), iGuess = ix(20.4), iBetter = ix(25.89), iThis = ix(28.01), iLink = ix(29.9), iHipaa = ix(116.09), iGrow = ix(153.6);
  const iTalk = ix(107.18), iDay = ix(38.06);
  const iOpen = ix(34.02);
  const keep = { [iOpen]:(g) => Math.max(0.8, g), [iTalk - 1]:(g) => Math.max(1.4, g), [iDay - 1]:(g) => Math.max(1.0, g), [iSlip]:(g) => g, [iGuess]:() => 3.0, [iHipaa]:() => 3.6, [iGrow]:() => 4.0 };
  const FAST = { [iSlip]:() => 1.0, [iPhone]:() => 0.22, [iGuess]:() => 3.0, [iBetter]:() => 5.0, [iThis]:() => 1.2, [iLink]:() => 2.6 };
  const build = (k, fast) => { const K = [[0, 0]]; let n = fast ? 0.3 : P[0][0]; for (let i = 0; i < P.length; i++) { const [st, d, od] = P[i]; K.push([st, n], [st + od, n + d]); n += d; if (i < P.length - 1) { const g = Math.max(0, P[i + 1][0] - st - od); n += fast && i <= iLink ? (FAST[i] ? FAST[i](g) : (g <= 0.35 ? g : 0.35 + (g - 0.35) * 0.2)) : keep[i] ? keep[i](g) : (g <= 0.7 ? g : 0.7 + (g - 0.7) * k); } } K.push([OLD_END, n + TAIL]); return K; };
  let lo = 0, hi = 1, K; for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; K = build(m); if (K[K.length - 1][1] > TARGET) hi = m; else lo = m; }
  K = build(lo, true);
  return r => { if (r <= 0) return 0; for (let i = 1; i < K.length; i++) { const [a, x] = K[i - 1], [b, y] = K[i]; if (r <= b) return b > a ? x + (r - a) / (b - a) * (y - x) : y; } return K[K.length - 1][1] + (r - OLD_END); };
})();

const AudioEng = (() => {
  let ctx = null, master = null, S = null, events = null, timer = 0;
  let anchorCtx = 0, anchorT = 0, idx = 0, running = false, enabled = true;
  let noiseBuf = null, irBuf = null;
  const SMP = {};
  const SMP_FILES = { notify:'sfx/notify.wav', rustle:'sfx/rustle.wav', holo1:'sfx/holo1.mp3', holo2:'sfx/holo2.mp3', activate:'sfx/activate.wav', sw:'sfx/switch.mp3', c1:'sfx/click1.mp3', c2:'sfx/click2.mp3', c3:'sfx/click3.mp3', c6:'sfx/click6.mp3', c7:'sfx/click7.mp3', c8:'sfx/click8.mp3', keys:'sfx/keys.wav', scroll:'sfx/scroll.mp3' };
  function loadSmp(){ Object.keys(SMP_FILES).forEach(k => { fetch(SMP_FILES[k]).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(buf => { SMP[k] = buf; }).catch(() => {}); }); }
  function smp(k, w, gain = 0.3, o = {}){
    const b = SMP[k]; if (!b || !S) return false;
    const src = ctx.createBufferSource(); src.buffer = b; src.playbackRate.value = o.rate || 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, w);
    if (o.dur) { g.gain.setValueAtTime(gain, w + o.dur * 0.6); g.gain.linearRampToValueAtTime(0.0001, w + o.dur); }
    src.connect(g); let node = g;
    if (o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); node = p; }
    node.connect(S.smp); if (o.rev) { const r = ctx.createGain(); r.gain.value = o.rev; node.connect(r); r.connect(S.rev); }
    src.start(w, o.off || 0, o.dur ? o.dur + 0.05 : undefined); return true;
  }
  // Voiceover: ElevenLabs sections split into phrases, each placed on the real-time timeline [file, srcIn, srcOut, at]
  const VOB = {};
  // Embedded audio decodes straight from base64 (fetch of data: URLs is blocked on some hosts)
  const getAB = (key, url) => { const d = window.__CL_AUDIO && window.__CL_AUDIO[key]; if (d) { try { const b = atob(d.slice(d.indexOf(',') + 1)); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return Promise.resolve(u.buffer); } catch (e) {} } return fetch(url).then(r => r.arrayBuffer()); };
  function loadVO(){ getAB('music', 'vo/music7.mp3').then(b => ctx.decodeAudioData(b)).then(buf => { VOB.m = buf; }).catch(() => {}); getAB('v8', 'vo/vo8.mp3').then(b => ctx.decodeAudioData(b)).then(buf => { VOB[7] = buf; }).catch(() => {}); }
  const VO = VO_RAW.map(c => [c[0], c[1], c[2], RM(c[3])]);
  // Music bed (Elevating hopeful horizons, 103.5 bpm). Source drop at 18.4s lands on "This is CaseLink";
  // one bar-aligned 2-bar-multiple splice at the 92.6s phrase line stretches/cuts it so the outro fade lands on the end card.
  // Level: in pauses the bed sits ~3 dB under the voice; under speech it ducks ~10 dB more (13 dB under the voice).
  const MUS_GAIN = 0.608, DUCK = 0.316;
  const MUS = (() => {
    const BAR = 240 / 103.5, EXT = 2 * BAR, lead = RM(28.01) - 1.0, start = lead - 18.4 - EXT, J1 = 18.4 - 4 * BAR, sh = start + EXT;
    const endT = RM(170.4), J = 92.6, OUT = 140.5, X = 0.3;
    const n = Math.round(((endT - 2.6) - (sh + OUT)) / (2 * BAR)), J2 = J - n * 2 * BAR, tJ = sh + J;
    return [
      [Math.max(0, -start), J1 + X, Math.max(0, start), start > 0 ? 1.2 : 0.3, 2 * X],
      [J1 - EXT - X, J + X, start + J1 - X, 2 * X, 2 * X],
      [J2 - X, Math.min(160.4, J2 + (endT - tJ)), tJ - X, 2 * X, 0.8],
    ];
  })();
  const MUS_DROP = RM(28.01) - 1.0;
  let musDone = [];
  function pumpMus(now){
    const buf = VOB.m; if (!buf) return;
    const tNow = anchorT + (now - anchorCtx);
    MUS.forEach((c, i) => {
      if (musDone[i]) return;
      const [a, b, at, fi, fo] = c;
      if (at + (b - a) <= tNow + 0.05) { musDone[i] = 1; return; }
      if (at > tNow + 0.8) return;
      musDone[i] = 1;
      let off = a, dur = Math.min(b, buf.duration) - a, when = anchorCtx + (at - anchorT), fin = fi;
      if (when < now + 0.01) { const sk = now + 0.01 - when; off += sk; dur -= sk; when = now + 0.01; fin = Math.min(fi, 0.3); }
      if (dur <= 0.05) return;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(1, when + Math.max(0.03, fin));
      g.gain.setValueAtTime(1, when + Math.max(fin, dur - fo)); g.gain.linearRampToValueAtTime(0.0001, when + dur);
      src.connect(g); g.connect(S.duck); src.start(when, off, dur + 0.02);
    });
  }
  // duck the bed under every spoken phrase, lift it back in the longer pauses
  function schedDuck(){
    const g = S.duck.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(1, now);
    const at = r => anchorCtx + (r - anchorT);
    VO.forEach((c, i) => {
      const st = c[3], en = c[3] + (c[2] - c[1]), nx = VO[i + 1] ? VO[i + 1][3] : 1e9;
      if (en < anchorT) return;
      g.setTargetAtTime(DUCK, Math.max(now, at(st - 0.25)), 0.08);
      if (nx - en > 1.4) g.setTargetAtTime(1, Math.max(now, at(en + 0.3)), 0.3);
    });
    const dr = MUS_DROP; if (dr + 3 > anchorT) { g.setTargetAtTime(1.6, Math.max(now, at(dr - 0.15)), 0.05); g.setTargetAtTime(0.55, Math.max(now, at(dr + 0.75)), 0.25); }
  }
  let voDone = [];
  function pumpVO(now){
    const tNow = anchorT + (now - anchorCtx);
    VO.forEach((c, i) => {
      if (voDone[i]) return;
      const [f, a, b, at] = c, buf = VOB[f];
      if (at + (b - a) <= tNow + 0.05) { voDone[i] = 1; return; }
      if (at > tNow + 0.8 || !buf) return;
      voDone[i] = 1;
      let off = a, dur = Math.min(b, buf.duration) - a, when = anchorCtx + (at - anchorT);
      if (when < now + 0.01) { const sk = now + 0.01 - when; off += sk; dur -= sk; when = now + 0.01; }
      if (dur <= 0.05) return;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(1, when + 0.025); g.gain.setValueAtTime(1, when + dur - 0.06); g.gain.linearRampToValueAtTime(0.0001, when + dur);
      src.connect(g); g.connect(S.vo); src.start(when, off, dur + 0.02);
    });
  }
  let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const CH = 4.8;
  const CHORDS = [[261.63,329.63,392,493.88,587.33],[220,261.63,329.63,392,493.88],[174.61,220,261.63,329.63,392],[196,246.94,293.66,392,440]];
  const BASS = [65.41,55,43.65,49];
  const ARP = [[523.25,659.25,783.99,987.77],[440,523.25,659.25,783.99],[349.23,440,523.25,659.25],[392,493.88,587.33,783.99]];

  function init(){
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    master = ctx.createGain(); master.gain.value = 1.0; master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
    const len = Math.floor(ctx.sampleRate * 2.6); irBuf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const ch = irBuf.getChannelData(c); for (let i = 0; i < len; i++) ch[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    loadSmp(); loadVO();
    return true;
  }
  function session(){
    const g = ctx.createGain(); g.gain.value = 1; g.connect(master);
    const music = ctx.createGain(); music.gain.value = 0.6; music.connect(g);
    const FX = 0.5; // element SFX at -6 dB: present, but the voice leads
    const sfx = ctx.createGain(); sfx.gain.value = 3.6 * FX; sfx.connect(g);
    const smpBus = ctx.createGain(); smpBus.gain.value = 1.0 * FX; smpBus.connect(g);
    const conv = ctx.createConvolver(); conv.buffer = irBuf; const wet = ctx.createGain(); wet.gain.value = 0.35 * FX; conv.connect(wet); wet.connect(g);
    const vo = ctx.createGain(); vo.gain.value = 1.8; const vl = ctx.createDynamicsCompressor(); vl.threshold.value = -3; vl.knee.value = 2; vl.ratio.value = 12; vl.attack.value = 0.002; vl.release.value = 0.12; vo.connect(vl); vl.connect(ctx.destination);
    const bed = ctx.createGain(); bed.gain.value = MUS_GAIN; const ml = ctx.createDynamicsCompressor(); ml.threshold.value = -4; ml.knee.value = 3; ml.ratio.value = 8; ml.attack.value = 0.005; ml.release.value = 0.2; bed.connect(ml); ml.connect(ctx.destination);
    const duck = ctx.createGain(); duck.gain.value = 1; duck.connect(bed);
    return { g, music, sfx, smp: smpBus, rev: conv, vo, bed, duck };
  }
  const out = (node, bus, send=0) => { node.connect(S[bus]); if (send) { const g = ctx.createGain(); g.gain.value = send; node.connect(g); g.connect(S.rev); } };
  function envGain(w, a, peak, dur){ const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(peak, w + a); g.gain.exponentialRampToValueAtTime(0.0001, w + dur); return g; }
  function osc(type, f, w, dur){ const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, w); o.start(w); o.stop(w + dur + 0.05); return o; }
  function noiseSrc(w, dur){ const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true; n.start(w, rnd() * 1.5); n.stop(w + dur + 0.05); return n; }
  function filt(type, f, q=0.7){ const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }

  // Sidechain-style pump on every beat (0.6s) — the modern "breathing" pad.
  function pad(w, freqs, dur, vol=0.03, off=0, pump=true){
    const lp = filt('lowpass', 900, 0.5); lp.frequency.setValueAtTime(900, w); lp.frequency.linearRampToValueAtTime(1800, w + dur * 0.5); lp.frequency.linearRampToValueAtTime(1000, w + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(vol, w + 0.8);
    if (pump) { for (let b = w + off; b < w + dur - 0.6; b += 0.6) { if (b < w + 0.8) continue; g.gain.setValueAtTime(vol * 0.28, b); g.gain.linearRampToValueAtTime(vol, b + 0.45); } }
    g.gain.setValueAtTime(vol, w + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
    freqs.forEach(f => { [-9, 9].forEach(dt => { const o = osc('sawtooth', f, w, dur); o.detune.value = dt; const og = ctx.createGain(); og.gain.value = 0.55; o.connect(og); og.connect(lp); }); osc('sine', f / 2, w, dur).connect(lp); });
    lp.connect(g); out(g, 'music', 0.35);
  }
  function bass(w, f, dur){ const g = envGain(w, 0.02, 0.2, dur); const lp = filt('lowpass', 180); osc('sine', f, w, dur).connect(lp); lp.connect(g); out(g, 'music'); }
  function kick(w){ const o = osc('sine', 95, w, 0.35); o.frequency.exponentialRampToValueAtTime(40, w + 0.12); const g = envGain(w, 0.003, 0.26, 0.3); o.connect(g); out(g, 'music'); }
  function hat(w, vol){ const n = noiseSrc(w, 0.05); const hp = filt('highpass', 9000); const g = envGain(w, 0.002, vol, 0.035); n.connect(hp); hp.connect(g); out(g, 'music'); }
  function snap(w){ const n = noiseSrc(w, 0.16); const bp = filt('bandpass', 1900, 1.1); const g = envGain(w, 0.002, 0.03, 0.13); n.connect(bp); bp.connect(g); out(g, 'music', 0.5); }
  // Soft trackpad-style tap — no metallic click.
  let clkN = 0;
  const CLK = ['c1', 'c3', 'c6', 'c2', 'c8', 'c7'];
  function click(w){
    if (smp(CLK[clkN++ % CLK.length], w, 0.42, { off:0.02, pan:((clkN % 3) - 1) * 0.12 })) return;
    const o = osc('sine', 540, w, 0.05); o.frequency.exponentialRampToValueAtTime(360, w + 0.03); const g = envGain(w, 0.001, 0.05, 0.04); o.connect(g); out(g, 'sfx');
    const n = noiseSrc(w, 0.02); const bp = filt('bandpass', 2200, 0.8); const g2 = envGain(w, 0.0008, 0.025, 0.012); n.connect(bp); bp.connect(g2); out(g2, 'sfx');
  }
  function key(w){ const n = noiseSrc(w, 0.03); const bp = filt('bandpass', 2400 + rnd() * 900, 1.6); const g = envGain(w, 0.001, 0.018 + rnd() * 0.008, 0.02); n.connect(bp); bp.connect(g); out(g, 'sfx'); }
  function whoosh(w, dur=0.8, vol=0.1, lo=280, hi=2600){
    const n = noiseSrc(w, dur); const bp = filt('bandpass', lo, 0.7); bp.frequency.setValueAtTime(lo, w); bp.frequency.exponentialRampToValueAtTime(hi, w + dur * 0.85);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(vol * 0.6, w + dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
    n.connect(bp); bp.connect(g);
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-0.4, w); p.pan.linearRampToValueAtTime(0.4, w + dur); g.connect(p); out(p, 'sfx', 0.3); } else out(g, 'sfx', 0.3);
  }
  // Short, soft "glass" confirm — two quick rising sine blips, no ringing bell.
  let chN = 0;
  function chime(w, notes=[880, 1318.5], vol=0.05){
    if (chN++ % 2 === 0 && smp('activate', w, 0.3, { off:0.36, dur:0.9, rev:0.2 })) return;
    notes.slice(0, 2).forEach((f, i) => { const s = w + i * 0.09; const o = osc('sine', f * 0.94, s, 0.25); o.frequency.exponentialRampToValueAtTime(f, s + 0.04); const g = envGain(s, 0.006, vol * 0.7, 0.2); o.connect(g); out(g, 'sfx', 0.2); });
  }
  function softPop(w, f){ const o = osc('sine', f * 0.8, w, 0.12); o.frequency.exponentialRampToValueAtTime(f * 1.2, w + 0.06); const g = envGain(w, 0.003, 0.04, 0.09); o.connect(g); out(g, 'sfx', 0.15); }
  // glass tap: two inharmonic partials, short ring into the room
  function glass(w, f=1200, v=0.03){ [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([m, a]) => { const o = osc('sine', f * m, w, 0.4); const g = envGain(w, 0.002, v * a, 0.28 / Math.sqrt(m)); o.connect(g); out(g, 'sfx', 0.35); }); }
  // water-drop bubble: fast upward glide
  function bubble(w, f=700, v=0.04){ const o = osc('sine', f * 0.55, w, 0.14); o.frequency.exponentialRampToValueAtTime(f * 1.5, w + 0.07); const g = envGain(w, 0.004, v, 0.11); o.connect(g); out(g, 'sfx', 0.2); }
  // soft mallet: sine + 4th partial, rounded decay
  function mallet(w, f=660, v=0.04){ const o = osc('sine', f, w, 0.5); const g = envGain(w, 0.002, v, 0.42); o.connect(g); out(g, 'sfx', 0.3); const o2 = osc('sine', f * 4, w, 0.12); const g2 = envGain(w, 0.001, v * 0.18, 0.08); o2.connect(g2); out(g2, 'sfx', 0.2); }
  // airy shimmer: quick ascending sparkle
  function shimmer(w, v=0.014){ [2093, 2637, 3136, 3951, 4186].forEach((f, i) => { const s0 = w + i * 0.045; const o = osc('sine', f, s0, 0.5); const g = envGain(s0, 0.004, v, 0.45); o.connect(g); out(g, 'sfx', 0.6); }); }
  // low soft impact for big type
  function thud(w, v=0.08){ const o = osc('sine', 130, w, 0.4); o.frequency.exponentialRampToValueAtTime(46, w + 0.3); const g = envGain(w, 0.004, v, 0.36); o.connect(g); out(g, 'sfx', 0.25); const n = noiseSrc(w, 0.08); const lp = filt('lowpass', 900, 0.7); const g2 = envGain(w, 0.002, v * 0.25, 0.06); n.connect(lp); lp.connect(g2); out(g2, 'sfx'); }
  // filtered-air riser into a transition
  function riser(w, dur=1.0, v=0.05){ const n = noiseSrc(w, dur); const bp = filt('bandpass', 500, 1.2); bp.frequency.setValueAtTime(500, w); bp.frequency.exponentialRampToValueAtTime(6000, w + dur); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(v, w + dur * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, w + dur + 0.05); n.connect(bp); bp.connect(g); out(g, 'sfx', 0.3); const o = osc('sine', 260, w, dur); o.frequency.exponentialRampToValueAtTime(780, w + dur); const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.0001, w); g3.gain.exponentialRampToValueAtTime(v * 0.25, w + dur * 0.9); g3.gain.exponentialRampToValueAtTime(0.0001, w + dur + 0.05); o.connect(g3); out(g3, 'sfx', 0.3); }
  // pop now rotates timbres so repeated UI beats never sound identical
  let popN = 0;
  function pop(w, f=640){
    if (popN++ % 2) return;
    const k = popN % 5;
    if (k === 0 && smp('notify', w, 0.22, { off:0.015, rate:Math.min(1.25, Math.max(0.85, f / 760)) })) return;
    if (k === 2 && smp('sw', w, 0.12, { off:0.02, dur:0.25 })) return;
    if (k === 4 && smp('notify', w, 0.18, { off:0.015, rate:Math.min(1.3, Math.max(0.9, f / 640)) })) return;
    if (k === 1) glass(w, f * 1.6, 0.024); else if (k === 3) bubble(w, f); else mallet(w, f * 0.9, 0.03);
  }
  let hoN = 0;
  function appear(w, v = 0.26){ const k = hoN++ % 2 ? 'holo2' : 'holo1'; if (!smp(k, w - 0.05, v, { off:0.24, dur:1.3, rev:0.15 })) whoosh(w, 0.5, 0.035, 500, 2600); }
  function rustle(w, v = 0.24){ if (!smp('rustle', w, v, { off:0.02, dur:0.8 })) whoosh(w, 0.5, 0.03); }
  function notifyS(w, rate = 1, v = 0.4){ if (!smp('notify', w, v, { off:0.015, rate, rev:0.15 })) mallet(w, 880 * rate, 0.05); }
  function scrollS(w, dur = 1.1){ smp('scroll', w, 0.22, { off:0.08, dur }); }
  function typing(w, dur = 0.8){ smp('keys', w, 0.5, { off:0.4, dur }); }
  function swell(w, dur=2.0, vol=0.06){ const n = noiseSrc(w, dur + 0.2); const lp = filt('lowpass', 200, 0.6); lp.frequency.setValueAtTime(200, w); lp.frequency.exponentialRampToValueAtTime(3600, w + dur); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(vol * 0.7, w + dur * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, w + dur + 0.15); n.connect(lp); lp.connect(g); out(g, 'sfx', 0.4); }

  function buildEvents(){ const E = []; const add = (t, fn) => E.push({ t, fn }); INTRO_SFX(add, { click, key, whoosh, chime, pop, swell, kick, bass, glass, bubble, mallet, shimmer, thud, riser, appear, rustle, notifyS, scrollS, typing }); return E.sort((a, b) => a.t - b.t); }
  function pump(){
    if (!S) return;
    const now = ctx.currentTime; const horizon = anchorT + (now - anchorCtx) + 0.6;
    while (idx < events.length && events[idx].t < horizon) { const e = events[idx++]; const w = anchorCtx + (e.t - anchorT); if (w >= now - 0.05) { try { e.fn(Math.max(w, now + 0.005)); } catch (err) {} } }
    try { pumpVO(now); pumpMus(now); } catch (err) {}
  }
  return {
    start(T0){
      if (!enabled || !init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      this.stop();
      events = events || buildEvents(); S = session();
      anchorCtx = ctx.currentTime + 0.08; anchorT = T0; idx = 0; voDone = VO.map(() => 0); musDone = MUS.map(() => 0);
      while (idx < events.length && events[idx].t < T0) idx++;
      const c = Math.floor(T0 / CH), rem = (c + 1) * CH - T0;
      
      try { schedDuck(); } catch (err) {}
      running = true; timer = setInterval(pump, 50); pump();
    },
    stop(){
      clearInterval(timer); running = false;
      if (S && ctx) { const s = S; s.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06); s.vo.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04); s.bed.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06); setTimeout(() => { try { s.g.disconnect(); s.vo.disconnect(); s.bed.disconnect(); } catch (e) {} }, 500); }
      S = null;
    },
    live(){ return running && !!ctx && ctx.state === 'running'; },
    now(){ return anchorT + (ctx.currentTime - anchorCtx); },
    setEnabled(v){ enabled = v; if (!v) this.stop(); },
    isEnabled(){ return enabled; },
  };
})();


/* ============================================================
   CaseLink introduction — master cut (2:00, review v3)
   ============================================================ */
const WIN_W = 1480, WIN_H = 940, HEADER_H = 76, CYC = WIN_H / 2, BODY_H = WIN_H - HEADER_H, SIDE_W = 256;
const NAVY = '#0A0F1E';
// story time (all scene cues) → real time: compress / slow / skip segments without re-timing every cue
// v6: every chain is contiguous story time; real times are placed on the voiceover phrases.
const CHAINS = [
  [[0,0],[0.3,0.45],[2.4,4.6],[3.2,6.9],[6.3,10.5],[9.3,14.7],[9.35,14.9],[9.75,16.38],[10.15,17.2],[10.55,20.28],[11.45,24.9],[12.2,25.78],[14.6,27.55],[18.4,28.01],[19.8,29.41],[20.0,29.9],[22.3,32.6],[23.4,34.0],[27.9,37.46]],
  [[190,37.46],[193.4,43.3],[197.1,47.0]],
  [[259.6,47.0],[262.2,50.4],[264.3,52.6],[267.9,57.4]],
  [[96.6,57.4],[100.2,61.0]],
  [[206,61.0],[210.4,66.0],[218.4,74.0],[221.3,76.9]],
  [[340,76.9],[346,82.9]],
  [[221.7,82.9],[224.0,86.0],[229.2,91.0],[233.4,94.6],[237.1,97.5],[240,100.2]],
  [[245.3,100.2],[251.6,106.8],[253.8,110.5],[256.0,112.6],[259.15,115.3]],
  [[350,115.3],[362,127.3]],
  [[320,127.3],[321.3,129.4],[323.8,131.4],[329.6,136.4]],
  [[121.2,136.4],[123.8,140.9],[125.2,142.9],[127.7,147.6],[129.6,149.6]],
  [[131.9,149.6],[141.6,159.3],[150,169.2],[151,170.4]],
];
CHAINS.forEach(c => c.forEach(p => { p[1] = RM(p[1]); }));
const WARP = [];
CHAINS.forEach(c => { for (let i = 0; i < c.length - 1; i++) { const [s0, r0] = c[i], [s1, r1] = c[i + 1]; WARP.push([s0, s1, (s1 - s0) / (r1 - r0)]); } });
const WSEG = (() => { let r = 0; return WARP.map(([s0, s1, k, dip]) => { const d = k ? (s1 - s0) / k : 0; const o = { s0, s1, k, dip, r0:r, r1:r + d }; r += d; return o; }); })();
const DURATION = WSEG[WSEG.length - 1].r1;
function warp(rt){ for (const g of WSEG) { if (g.k && rt <= g.r1) return g.s0 + (rt - g.r0) * g.k; } return 151; }
function unwarp(s){ for (const g of WSEG) { if (s >= g.s0 && s < g.s1) return g.k ? g.r0 + (s - g.s0) / g.k : null; } return s >= 151 ? DURATION : null; }
const ss = (a, b, x) => clamp((x - a) / (b - a));
const eQuint = t => 1 - Math.pow(1 - t, 5);
const eExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const spring = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(8.5 * t);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fu = (t, t0, d = 0.6, dist = 14) => { const a = easeOut(clamp((t - t0) / d)); return a >= 1 ? { opacity:1 } : { opacity: a, transform: `translateY(${((1 - a) * dist).toFixed(2)}px)` }; };
const bi = (t, t0, d = 0.6) => { const a = easeOutStrong(clamp((t - t0) / d)); return { opacity: a, filter: a < 0.99 ? `blur(${((1 - a) * 10).toFixed(2)}px)` : 'none' }; };
const win = (t, a, b, fi = 0.5, fo = 0.5) => clamp((t - a) / fi) * clamp((b - t) / fo);
function mixHex(a, b, p){ const pa = [1,3,5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1,3,5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((v, i) => Math.round(lerp(v, pb[i], p))).join(',') + ')'; }
const card = (r = 18, pad = '20px 22px') => ({ position:'relative', ...glass(r, 0.8), backdropFilter:'none', WebkitBackdropFilter:'none', padding:pad, boxSizing:'border-box' });

function Ix({ n, s = 16, c = 'currentColor', w = 1.8 }){
  const P = {
    lock:<><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    download:<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    upload:<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    file:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    share:<><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></>,
    arrowL:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 18 5 12 11 6"/></>,
    chevR:<polyline points="9 18 15 12 9 6"/>,
    edit:<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/></>,
    clip:<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>,
    call:<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/>,
    missed:<><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/><line x1="23" y1="1" x2="17" y2="7"/><line x1="17" y1="1" x2="23" y2="7"/></>,
  };
  if (!P[n]) return <Ic n={n} s={s} c={c} w={w}/>;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>{P[n]}</svg>;
}

const GR = {
  blue:'linear-gradient(135deg,#6AA8FF,#3E8EFF)', violet:'linear-gradient(135deg,#8E8BFF,#6C63F0)', amber:'linear-gradient(135deg,#FFD27A,#FFA940)',
  teal:'linear-gradient(135deg,#6FE0C8,#2FB7A6)', purple:'linear-gradient(135deg,#C79BFF,#A855F7)', coral:'linear-gradient(135deg,#FF9AA8,#F07A6A)',
  green:'linear-gradient(135deg,#6BE3A8,#22C97A)',
};

/* ---------- shared bits ---------- */
function Pill({ children, bg, fg, style }){
  return <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:9999, background:bg, color:fg, fontSize:12, fontWeight:600, whiteSpace:'nowrap', ...style }}>{children}</span>;
}
function Tabs({ items, active, size = 13.5 }){
  return (
    <div style={{ display:'flex', gap:22, borderBottom:'1px solid rgba(216,224,222,0.7)' }}>
      {items.map((x, i) => <span key={x} style={{ padding:'0 2px 10px', fontSize:size, fontWeight: i === active ? 600 : 500, color: i === active ? ONB.accent : ONB.text, borderBottom: i === active ? '2px solid ' + ONB.accent : '2px solid transparent', marginBottom:-1, whiteSpace:'nowrap' }}>{x}</span>)}
    </div>
  );
}
function RollNum({ v, h = 22, size = 15 }){
  return (
    <span style={{ display:'inline-block', height:h, overflow:'hidden', verticalAlign:'middle' }}>
      <span style={{ display:'flex', flexDirection:'column', transform:`translateY(${(-v * h).toFixed(2)}px)` }}>
        {[0,1,2,3,4,5,6,7,8,9].map(d => <span key={d} style={{ height:h, lineHeight:h + 'px', fontSize:size, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{d}</span>)}
      </span>
    </span>
  );
}
function Toast({ t, a, b, text, style }){
  const e = win(t, a, b, 0.45, 0.4);
  if (e <= 0.003) return null;
  const inn = easeOutStrong(ss(a, a + 0.5, t));
  return (
    <div style={{ position:'absolute', left:'50%', zIndex:70, transform:`translate(-50%, ${((1 - inn) * -18).toFixed(2)}px)`, opacity:e, ...style,
      display:'flex', alignItems:'center', gap:12, padding:'14px 22px 14px 14px', borderRadius:16, whiteSpace:'nowrap',
      background:'linear-gradient(160deg,rgba(230,250,241,0.97),rgba(230,250,241,0.84))', border:'1px solid rgba(34,201,122,0.38)',

      boxShadow:'0 8px 18px rgba(34,201,122,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
      <span style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(34,201,122,0.35)' }}><Ic n="check" s={14} c="#fff" w={3}/></span>
      <span style={{ fontSize:15, fontWeight:600, color:'#12925A' }}>{text}</span>
    </div>
  );
}
function Pop({ t, a, b, children, style }){
  const e = win(t, a, b, 0.2, 0.2);
  if (e <= 0.003) return null;
  const inn = easeOutStrong(ss(a, a + 0.32, t));
  return (
    <div style={{ position:'absolute', zIndex:30, ...style, opacity:e, transform:`translateY(${((1 - inn) * -8).toFixed(2)}px) scale(${(0.97 + 0.03 * inn).toFixed(4)})`, transformOrigin:'top center', filter: e < 0.98 ? `blur(${((1 - e) * 6).toFixed(2)}px)` : 'none' }}>
      <div style={{ background:'rgba(255,255,255,0.99)', borderRadius:16, border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 12px 18px rgba(24,38,58,0.18), 0 4px 12px rgba(24,38,58,0.06)', overflow:'hidden' }}>{children}</div>
    </div>
  );
}
function Opt({ fid, label, hover, sel, i = 0, t0, t, h = 40 }){
  const reg = useReg();
  const a = t0 != null ? easeOut(ss(t0 + i * 0.04, t0 + i * 0.04 + 0.3, t)) : 1;
  return (
    <div ref={reg(fid)} style={{ height:h, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:14, fontWeight: sel ? 600 : 500,
      color: sel ? ONB.accent : ONB.ink, background: sel ? 'rgba(235,243,255,0.95)' : `rgba(62,142,255,${(0.07 * (hover || 0)).toFixed(3)})`, opacity:a, transform:`translateY(${((1 - a) * -6).toFixed(2)}px)` }}>
      <span>{label}</span>{sel && <Ic n="check" s={14} c={ONB.accent} w={2.6}/>}
    </div>
  );
}
function SelBox({ fid, value, at, placeholder = '', openP = 0, focusA = 0 }){
  const t = useLt(); const reg = useReg();
  const rv = at == null ? 0 : easeOutStrong(ss(at, at + 0.42, t));
  return (
    <div style={{ position:'relative' }}>
      <GlowRim on={focusA > 0.01} radius={14} spread={6} blur={14} opacity={0.5 * focusA} pulse={t}/>
      <div ref={reg(fid)} style={{ position:'relative', height:50, borderRadius:14, padding:'0 12px 0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxSizing:'border-box',
        background:'linear-gradient(160deg,rgba(255,255,255,0.97),rgba(255,255,255,0.84))', ...focusStyle(focusA), fontSize:14 }}>
        <span style={{ display:'grid', alignItems:'center' }}>
          {rv < 1 && <span style={{ gridArea:'1/1', color:ONB.mute, opacity:1 - rv }}>{placeholder}</span>}
          {rv > 0 && <span style={{ gridArea:'1/1', opacity:rv, filter: rv < 0.99 ? `blur(${((1 - rv) * 6).toFixed(2)}px)` : 'none', transform:`translateY(${((1 - rv) * 4).toFixed(2)}px)` }}>{value}</span>}
        </span>
        <span style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid ' + ONB.text, display:'flex', alignItems:'center', justifyContent:'center', transform:`rotate(${(openP * 180).toFixed(1)}deg)` }}><Ic n="chev" s={14} c={ONB.text} w={2}/></span>
      </div>
    </div>
  );
}
const Chip = ({ children }) => <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 10px', borderRadius:8, background:'#EEF2F7', fontSize:13.5, fontWeight:600, color:ONB.ink }}>{children}<Ic n="x" s={11} c={ONB.mute} w={2.4}/></span>;
function Label({ children, req }){ return <div style={{ fontSize:13, fontWeight:600, color:ONB.text, marginBottom:8 }}>{children}{req && <span style={{ color:ONB.red }}> *</span>}</div>; }
function Radio({ fid, label, at, t }){
  const reg = useReg();
  const on = at != null && t >= at;
  const pop = on ? easeOutBack(ss(at, at + 0.35, t)) : 0;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:10, fontSize:14, color:ONB.ink, fontWeight:500 }}>
      <span ref={reg(fid)} style={{ position:'relative', width:24, height:24, borderRadius:'50%', border:`1.8px solid ${on ? ONB.accent : 'rgba(184,194,192,0.9)'}`, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${pressScale(at != null ? t - at : null).toFixed(4)})` }}>
        {on && <span style={{ width:12, height:12, borderRadius:'50%', background:ONB.accent, transform:`scale(${pop.toFixed(3)})` }}/>}
        {on && t - at < 0.7 && <span style={{ position:'absolute', inset:-2, borderRadius:'50%', border:'2px solid ' + ONB.accent, transform:`scale(${(1 + ss(at, at + 0.7, t) * 1.2).toFixed(3)})`, opacity:1 - ss(at, at + 0.7, t) }}/>}
      </span>{label}
    </span>
  );
}
function PageAura({ t }){
  const dr = (a, sp, ph) => a * Math.sin(t * sp + ph);
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <div style={{ position:'absolute', top:'-14%', left:'8%', width:640, height:640, borderRadius:'50%', background:'radial-gradient(circle,rgba(62,142,255,0.16),transparent 68%)', transform:`translate(${dr(60,0.13,0)}px,${dr(40,0.11,1)}px)` }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'2%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(144,240,197,0.2),transparent 68%)', transform:`translate(${dr(70,0.1,2)}px,${dr(46,0.14,0)}px)` }} />
      <div style={{ position:'absolute', top:'30%', right:'28%', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,199,148,0.18),transparent 68%)', transform:`translate(${dr(52,0.09,3)}px,${dr(38,0.12,2)}px)` }} />
    </div>
  );
}

/* ---------- app chrome ---------- */
const NAVS = [['home','Home'],['share','Referrals'],['phone','Network'],['msg','Messages']];
const NAV_TL = [[0,'Home'],[70,'Referrals'],[90,'Network'],[104.8,'Home'],[111.8,null]];
function navW(t, key){
  let w = 0;
  for (let i = 0; i < NAV_TL.length; i++) {
    const [s, k] = NAV_TL[i], e = NAV_TL[i + 1] ? NAV_TL[i + 1][0] : 999;
    if (k === key) w = Math.max(w, (s <= 0 ? 1 : clamp((t - s) / 0.4)) * clamp((e + 0.4 - t) / 0.4));
  }
  return clamp(w);
}
function AppWin({ t, winRef, clipR, clipB, headLogoA, navA, children }){
  const reg = useReg();
  const bellN = t >= 115.95 ? 16 : 15;
  const bp = t >= 115.95 && t < 116.7 ? Math.sin(Math.PI * ss(115.95, 116.6, t)) : 0;
  return (
    <div style={{ position:'absolute', left:0, top:0, width:WIN_W, height:WIN_H }}>
      <div style={{ position:'absolute', left:0, top:0, width:WIN_W - clipR, height:WIN_H - clipB, borderRadius:20, boxShadow:'0 20px 33px rgba(20,30,40,0.24), 0 4px 17px rgba(20,30,40,0.12)', willChange:'transform', transform:'translateZ(0)' }}/>
      <div ref={winRef} style={{ position:'absolute', inset:0, borderRadius:20, overflow:'hidden', background:'#fff', display:'flex', flexDirection:'column',
        clipPath: (clipR > 0.5 || clipB > 0.5) ? `inset(0px ${clipR.toFixed(1)}px ${clipB.toFixed(1)}px 0px round 20px)` : 'none' }}>
        <div style={{ position:'relative', height:HEADER_H, flexShrink:0, background:HEADER_GRAD, borderBottom:'1px solid rgba(255,255,255,0.7)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.9)', padding:'0 28px', display:'flex', alignItems:'center', zIndex:5 }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, opacity:headLogoA, width:190 }}><Logo s={36}/><Wordmark h={21} color={ONB.ink}/></div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:46, opacity:navA, transform:`translateY(${((1 - navA) * -8).toFixed(2)}px)` }}>
            {NAVS.map(n => { const a = navW(t, n[1]); return (
              <span key={n[1]} style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'10px 18px', borderRadius:9999,
                background:`rgba(255,255,255,${(0.72 * a).toFixed(3)})`, border:`1px solid rgba(255,255,255,${(0.9 * a).toFixed(3)})`,
                boxShadow: a > 0.02 ? `0 4px 14px rgba(24,38,58,${(0.06 * a).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,0.95)` : 'none',
                fontSize:15, fontWeight:500, color: a > 0.5 ? ONB.accent : ONB.text }}>
                <Ix n={n[0]} s={17} c={a > 0.5 ? ONB.accent : ONB.text}/>{n[1]}
              </span>); })}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:16, opacity:navA }}>
            <div ref={reg('bell')} style={{ position:'relative', width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', transform:`rotate(${(bp * 14 * Math.sin(t * 40)).toFixed(2)}deg)` }}>
              <Ic n="bell" s={19} c={ONB.text}/>
              <span style={{ position:'absolute', top:-6, right:-8, minWidth:24, height:20, borderRadius:9999, background:'#F04A5C', color:'#fff', fontSize:11.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', transform:`scale(${(1 + bp * 0.35).toFixed(3)})`, boxShadow:`0 0 ${(bp * 16).toFixed(1)}px rgba(240,74,92,0.7)` }}>{bellN}</span>
            </div>
            <PracticeLogo s={42}/>
            <Ic n="chev" s={16} c={ONB.mute}/>
          </div>
        </div>
        <div style={{ flex:1, background:ONB.page, position:'relative', overflow:'hidden' }}>
          <PageAura t={t}/>
          {children}
        </div>
      </div>
    </div>
  );
}

function SideBtn({ fid, label, icon, tone, clk, hot }){
  const reg = useReg(); const t = useLt();
  const bg = tone === 'green' ? 'linear-gradient(160deg,#3FD990,#1EB36B)' : 'linear-gradient(160deg,#6AA8FF,#2F7DF5)';
  const glow = tone === 'green' ? 'rgba(34,201,122,0.42)' : 'rgba(62,142,255,0.4)';
  return (
    <div style={{ position:'relative' }}>
      <GlowRim on={hot > 0.01} radius={9999} spread={8} blur={18} opacity={0.5 * hot} pulse={t}/>
      <div ref={reg(fid)} style={{ position:'relative', height:52, borderRadius:9999, overflow:'hidden', background:bg, backgroundSize:'160% 100%', backgroundPosition:`${(50 + Math.sin(t * 0.5) * 50).toFixed(1)}% 50%`, display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'#fff', fontSize:15.5, fontWeight:600,
        boxShadow:`inset 0 1.5px 1px rgba(255,255,255,0.35), 0 10px 22px ${glow}`, transform:`scale(${pressScale(clk).toFixed(4)})` }}>
        <Ix n={icon} s={18} c="#fff"/>{label}
        <LiquidSheen radius={9999} period={10} phase={tone === 'green' ? 0 : 0.5} strength={0.3}/>
        <ClickFX clk={clk}/>
      </div>
    </div>
  );
}
const FOCUS_CARDS = [
  ['22 cases awaiting decision','Mark accepted or declined','check',ONB.green,ONB.greenSoft],
  ['22 referrals pending','Send a follow-up','users',ONB.amber,ONB.amberSoft],
  ['2 stale invites','Contact directly','phone',ONB.red,ONB.redSoft],
];
function Sidebar({ t }){
  const reg = useReg();
  const clk = t - 48.3;
  const hot = win(t, 47.3, 48.9, 0.5, 0.4);
  const glow = win(t, 43.2, 46.4, 0.6, 0.7);
  return (
    <div style={{ position:'absolute', left:0, top:0, bottom:0, width:SIDE_W, padding:'22px 18px', boxSizing:'border-box', display:'flex', flexDirection:'column', gap:14, borderRight:'1px solid rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.42)' }}>
      <SideBtn fid="create" label="Create Referral" icon="users" tone="green" clk={clk > -0.9 && clk < 0.7 ? clk : null} hot={hot}/>
      <SideBtn fid="invite" label="Invite Practice" icon="phone" tone="blue" clk={null} hot={0}/>
      <div style={{ display:'flex', padding:4, borderRadius:14, background:'rgba(232,238,248,0.7)', marginTop:8 }}>
        <span style={{ flex:1, textAlign:'center', padding:'9px 0', fontSize:14, color:ONB.mute }}>Tips</span>
        <span style={{ flex:1, textAlign:'center', padding:'9px 0', fontSize:14, fontWeight:600, color:ONB.ink, background:'#fff', borderRadius:10, boxShadow:'0 2px 8px rgba(24,38,58,0.06)' }}>Focus</span>
      </div>
      <div ref={reg('focus')} data-stack="1" style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {FOCUS_CARDS.map((f, i) => (
          <div key={i} style={{ position:'relative' }}>
            {i === 0 && <GlowRim on={glow > 0.01} radius={14} spread={2} blur={8} opacity={0.26 * glow} pulse={t}/>}
            <div ref={i === 0 ? reg('focus1') : undefined} style={{ position:'relative', display:'flex', alignItems:'center', gap:12, padding:'13px 12px 13px 14px', borderRadius:14, background:'rgba(255,255,255,0.92)', border:'1px solid rgba(232,238,248,0.95)', boxShadow: i === 0 && glow > 0.01 ? `0 4px 12px rgba(62,142,255,${(0.1 * glow).toFixed(3)})` : '0 2px 8px rgba(24,38,58,0.04)' }}>
              <span style={{ width:38, height:38, borderRadius:10, background:f[4], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n={f[2]} s={17} c={f[3]} w={2.2}/></span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'block', fontSize:13.5, fontWeight:600, color:ONB.ink, lineHeight:1.25 }}>{f[0]}</span>
                <span style={{ display:'block', fontSize:12, color:ONB.mute, marginTop:3 }}>{f[1]}</span>
              </span>
              <Ix n="chevR" s={15} c={ONB.faint}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:18, padding:'0 4px' }}>
        {[['help','Help center'],['star','Pro Tips'],['msg','Contact us'],['book','Documentation']].map(x => <span key={x[1]} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:ONB.text }}><Ic n={x[0]} s={16} c={ONB.mute}/>{x[1]}</span>)}
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
const DONUT = [['Capitol Hill Dental',7,'#3E8EFF'],['Capitol Smile Ortho',6,'#90F0C5'],['DC Precision Endo',4,'#FFC794'],['Georgetown Gum',3,'#F08A9A']];
const RECENT = [['O','Owen Fletcher',GR.violet],['M','Maya Sterling',GR.amber],['L','Lila Kensington',GR.teal],['N','Nolan Avery',GR.purple]];
const LEADERS = [['Melissa',5],['Grace',3],['Lauren',3],['Samuel',2],['Nayomi',2]];
function Metric({ t, t0, title, value, prefix = '', sub, icon, ic, ib }){
  const v = Math.round(value * eExpo(ss(t0 + 0.15, t0 + 1.5, t)));
  return (
    <div style={{ ...card(18, '20px 22px'), ...fu(t, t0, 0.6, 16), display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <span style={{ fontSize:15, fontWeight:500, color:ONB.ink }}>{title}</span>
        <span style={{ width:40, height:40, borderRadius:12, background:ib, display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n={icon} s={18} c={ic}/></span>
      </div>
      <div style={{ marginTop:'auto', fontSize:36, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>{prefix}{v.toLocaleString('en-US')}</div>
      {sub && <div style={{ fontSize:13.5, color:ONB.accent, fontWeight:500, marginTop:2, ...fu(t, t0 + 0.9, 0.5, 6) }}>{sub}</div>}
    </div>
  );
}
function Donut({ t, t0 }){
  const R = 62, SW = 24, C = 2 * Math.PI * R, total = 20;
  let acc = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink:0 }}>
      <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(232,238,248,0.8)" strokeWidth={SW}/>
      {DONUT.map((d, i) => {
        const f0 = acc / total, fr = d[1] / total; acc += d[1];
        const p = easeInOut(ss(t0 + f0 * 0.8, t0 + (f0 + fr) * 0.8, t));
        if (p <= 0) return null;
        const len = Math.max(0, fr * C * p - 1.5);
        return <circle key={i} cx="80" cy="80" r={R} fill="none" stroke={d[2]} strokeWidth={SW} strokeDasharray={`${len} ${C}`} strokeDashoffset={-f0 * C} transform="rotate(-90 80 80)"/>;
      })}
      <text x="80" y="76" textAnchor="middle" fontSize="12" fill={ONB.mute} fontFamily={FONT}>Total</text>
      <text x="80" y="96" textAnchor="middle" fontSize="20" fontWeight="700" fill={ONB.ink} fontFamily={FONT}>{Math.round(20 * eExpo(ss(t0, t0 + 1.2, t)))}</text>
    </svg>
  );
}
function HomePage({ t, p0, lbT }){
  const reg = useReg();
  const q = d => p0 + d;
  return (
    <div style={{ position:'absolute', inset:0, padding:'26px 34px', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ ...bi(t, q(0.2)) }}><PracticeLogo s={62}/></div>
        <div><h1 style={{ fontSize:30, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em', margin:0, ...bi(t, q(0.25)) }}>Welcome Capital Root Canal Center</h1>
      <div style={{ fontSize:15, color:ONB.text, marginTop:6, ...fu(t, q(0.45)) }}>Monday, September 28 2026 · 12 practices connected</div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.14fr', gridTemplateRows:'132px 132px', gap:16, marginTop:22 }}>
        <Metric t={t} t0={q(0.8)} title="Received referrals this month" value={20} icon="users" ic={ONB.accent} ib={ONB.accentSoft}/>
        <Metric t={t} t0={q(0.95)} title="Practices in your network" value={10} sub="2 pending invites" icon="users" ic={ONB.green} ib={ONB.greenSoft}/>
        <div ref={reg('donut')} style={{ ...card(18, '20px 22px'), gridColumn:3, gridRow:'1 / span 2', ...fu(t, q(1.25), 0.6, 16), display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:16, fontWeight:600, color:ONB.ink }}>Referrals by practice</span>
            <Tabs items={['Received','Sent']} active={0} size={13}/>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:16, marginTop:8 }}>
            <Donut t={t} t0={q(1.6)}/>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:11, minWidth:0 }}>
              {DONUT.map((d, i) => <span key={i} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13.5, color:ONB.text, ...fu(t, q(1.6 + i * 0.08), 0.4, 4) }}><span style={{ width:9, height:9, borderRadius:'50%', background:d[2], flexShrink:0 }}/><span style={{ flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d[0]}</span><span style={{ fontWeight:700, color:ONB.ink, fontVariantNumeric:'tabular-nums' }}>{d[1]}</span></span>)}
            </div>
          </div>
        </div>
        <Metric t={t} t0={q(1.1)} title="Sent referrals this month" value={10} icon="users" ic={ONB.accent} ib={ONB.accentSoft}/>
        <Metric t={t} t0={q(1.2)} title="Earnings (MTD)" value={20480} prefix="$" icon="chart" ic={ONB.amber} ib={ONB.amberSoft}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16, marginTop:16 }}>
        <div style={{ ...card(18, '20px 24px'), height:418, ...fu(t, q(2.1), 0.6, 18) }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:22, fontWeight:700, color:ONB.ink, letterSpacing:'-0.01em' }}>Recent referrals</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:14.5, fontWeight:600, color:ONB.accent }}>View all<Ic n="arrowR" s={16} c={ONB.accent} w={2.2}/></span>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}><Tabs items={['Received','Sent']} active={0}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr', fontSize:13.5, color:ONB.text, padding:'14px 0 10px 64px', borderBottom:'1px solid rgba(216,224,222,0.6)' }}><span>Name and Practice</span><span>Status</span><span>Direction</span></div>
          {RECENT.map((r, i) => { const a = easeOut(ss(q(2.4 + i * 0.06), q(2.9 + i * 0.06), t)); return (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'64px 2.2fr 1fr 1fr', alignItems:'center', height:64, borderBottom: i < 3 ? '1px solid rgba(232,238,248,0.8)' : 'none', opacity:a, transform:`translateX(${((1 - a) * -40).toFixed(2)}px)` }}>
              <Avatar init={r[0]} g={r[2]} s={40}/>
              <span><span style={{ display:'block', fontSize:16, fontWeight:600, color:ONB.ink }}>{r[1]}</span><span style={{ display:'block', fontSize:13, color:ONB.mute, marginTop:2 }}>Capital Root Canal Center</span></span>
              <span><Pill bg="#F1F4F8" fg={ONB.text}>Created</Pill></span>
              <span><Pill bg={ONB.accentSoft} fg={ONB.accent}><Ix n="arrowL" s={13} c={ONB.accent} w={2.2}/>INBOUND</Pill></span>
            </div>); })}
        </div>
        <div ref={reg('lb')} style={{ ...card(18, '20px 24px'), height:418, ...fu(t, q(2.25), 0.6, 18) }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:22, fontWeight:700, color:ONB.ink, letterSpacing:'-0.01em' }}>Referred by</span>
            <Tabs items={['Received','Sent']} active={0} size={13}/>
          </div>
          <div style={{ marginTop:14 }}><Tabs items={['This month','This quarter','This year','All time']} active={0} size={13}/></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:ONB.text, padding:'14px 12px 8px' }}><span>Name</span><span>Num. of referrals</span></div>
          {LEADERS.map((l, i) => {
            const a = lbT == null ? 1 : easeOut(ss(lbT + i * 0.08, lbT + 0.5 + i * 0.08, t));
            const v = lbT == null ? l[1] : l[1] * eQuint(ss(lbT + 0.3 + i * 0.1, lbT + 1.9 + i * 0.1, t));
            const top = i === 0;
            const chip = lbT == null ? 1 : easeOutBack(ss(lbT + 2.0, lbT + 2.45, t));
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:46, padding:'0 12px', borderRadius:10, marginBottom:2,
                background: top ? 'linear-gradient(90deg,rgba(230,250,241,0.95),rgba(230,250,241,0.5))' : 'transparent', opacity:a, transform:`translateX(${((1 - a) * 24).toFixed(2)}px)` }}>
                <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight: top ? 700 : 500, color:ONB.ink }}>{l[0]}
                  {top && chip > 0.01 && <Pill bg="rgba(34,201,122,0.14)" fg="#12925A" style={{ transform:`scale(${chip.toFixed(3)})`, fontSize:11 }}>Top referrer</Pill>}</span>
                <span style={{ width:40, textAlign:'center', color:ONB.ink }}><RollNum v={v} h={22} size={15.5}/></span>
              </div>);
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Create referral modal ---------- */
const PRACTICES5 = [['CS','Capitol Smile Orthodontics','Orthodontics',GR.violet],['DB','District Braces Studio','Orthodontics',GR.teal],['MB','My Bright Smile','Oral Pathology',GR.amber],['GG','Georgetown Gum Specialists','Periodontics',GR.purple],['DP','DC Precision Endodontics','Endodontics',GR.teal]];
const INSURERS = ['Aetna Dental','Ameritas Dental','Assurant Dental','Blue Cross Blue Shield','Cigna Dental','Delta Dental','GEHA','Guardian Dental','Humana Dental','Lincoln Financial Dental','MetLife Dental','Principal Dental','Sun Life Dental','United Concordia','UnitedHealthcare Dental'];
const REASONS = ['General Ortho Eval','Invisalign','Braces','Early Interceptive','Habit Correction','Impacted Site'];
const NOTE_TXT = 'Anterior crossbite. Please evaluate for early interceptive treatment.';
function Stepper({ t }){
  const step = t < 51.9 ? 1 : t < 60.7 ? 2 : 3;
  const L = ['Practice','Patient','Notes'];
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'0 120px', marginTop:20 }}>
      {L.map((l, i) => { const n = i + 1, done = n < step, cur = n === step; return (
        <React.Fragment key={l}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, width:90 }}>
            <span style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:600,
              background: done ? ONB.accent : '#fff', color: done ? '#fff' : cur ? ONB.accent : ONB.text, border:`1.8px solid ${done || cur ? ONB.accent : 'rgba(216,224,222,0.95)'}`,
              boxShadow: cur ? '0 0 0 5px rgba(62,142,255,0.12)' : 'none' }}>{n}</span>
            <span style={{ fontSize:14, fontWeight: cur ? 600 : 500, color: done || cur ? ONB.accent : ONB.text }}>{l}</span>
          </div>
          {i < 2 && <div style={{ flex:1, height:2, marginTop:19, background:'rgba(216,224,222,0.8)', position:'relative', overflow:'hidden', borderRadius:2 }}><div style={{ position:'absolute', inset:0, background:ONB.accent, transform:`scaleX(${easeInOut(ss(i === 0 ? 51.6 : 60.4, i === 0 ? 52.1 : 60.9, t)).toFixed(4)})`, transformOrigin:'left' }}/></div>}
        </React.Fragment>); })}
    </div>
  );
}
function RefBanner(){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', borderRadius:14, background:'linear-gradient(90deg,rgba(235,243,255,0.95),rgba(235,243,255,0.6))', border:'1px solid rgba(62,142,255,0.14)' }}>
      <Avatar init="CS" g={GR.violet} s={46}/>
      <div><div style={{ fontSize:12.5, color:ONB.mute }}>Referring to</div><div style={{ fontSize:16, fontWeight:600, color:ONB.accent, marginTop:2 }}>Orthodontics · Dr. Emily Carter</div></div>
    </div>
  );
}
function StepWrap({ t, a, b, children }){
  const e = win(t, a, b, 0.35, 0.3);
  if (e <= 0.003) return null;
  return <div style={{ position:'absolute', left:40, right:40, top:182, bottom:28, opacity:e, transform: e < 0.99 ? `translateY(${((1 - e) * 10).toFixed(1)}px)` : 'none' }}>{children}</div>;
}
function DateField({ t }){
  const reg = useReg();
  const fa = win(t, 53.75, 55.35, 0.2, 0.35);
  const rv = easeOutStrong(ss(55.05, 55.47, t));
  return (
    <div style={{ position:'relative' }}>
      <GlowRim on={fa > 0.01} radius={14} spread={6} blur={14} opacity={0.5 * fa} pulse={t}/>
      <div ref={reg('dob')} style={{ position:'relative', height:50, borderRadius:14, padding:'0 14px 0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxSizing:'border-box', background:'linear-gradient(160deg,rgba(255,255,255,0.97),rgba(255,255,255,0.84))', ...focusStyle(fa), fontSize:14, transform:`scale(${pressScale(t - 53.9).toFixed(4)})` }}>
        <span style={{ display:'grid' }}>
          {rv < 1 && <span style={{ gridArea:'1/1', color:ONB.mute, opacity:1 - rv }}>MM/DD/YYYY</span>}
          {rv > 0 && <span style={{ gridArea:'1/1', color:ONB.ink, opacity:rv, filter: rv < 0.99 ? `blur(${((1 - rv) * 6).toFixed(2)}px)` : 'none' }}>09/30/2026</span>}
        </span>
        <Ic n="cal" s={18} c={ONB.mute}/>
      </div>
    </div>
  );
}
function Calendar({ t }){
  const reg = useReg();
  const hov = win(t, 54.35, 55.1, 0.2, 0.1);
  const sel = t >= 55.0;
  const cells = [];
  for (let i = 0; i < 2; i++) cells.push(null);
  for (let d = 1; d <= 30; d++) cells.push(d);
  return (
    <Pop t={t} a={54.0} b={55.3} style={{ left:0, top:58, width:320 }}>
      <div ref={reg('cal')} style={{ padding:'16px 16px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <Ic n="chevL" s={16} c={ONB.mute}/><span style={{ fontSize:14.5, fontWeight:700, color:ONB.ink }}>September 2026</span><Ix n="chevR" s={16} c={ONB.mute}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, fontSize:11.5, color:ONB.mute, textAlign:'center', marginBottom:4 }}>{['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {cells.map((d, i) => { const is30 = d === 30; const on = is30 && sel; return (
            <span key={i} ref={is30 ? reg('day') : undefined} style={{ height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, fontSize:13, fontWeight: is30 || d === 28 ? 700 : 500,
              color: on ? '#fff' : d === 28 ? ONB.accent : ONB.ink, background: on ? ONB.accent : is30 ? `rgba(62,142,255,${(0.12 * hov).toFixed(3)})` : 'transparent',
              transform: is30 ? `scale(${pressScale(t - 55.0).toFixed(4)})` : 'none' }}>{d || ''}</span>); })}
        </div>
      </div>
    </Pop>
  );
}
function DropZone({ t }){
  const reg = useReg();
  const near = clamp(1 - Math.abs(t - 66.0) / 1.2);
  const dropped = t >= 66.1, prog = ss(66.1, 66.9, t), done = t >= 66.9;
  const upA = easeOut(ss(66.1, 66.5, t));
  let node = (
    <div ref={reg('drop')} style={{ position:'relative', height:80, borderRadius:12, border:'1.5px dashed rgba(62,142,255,0.45)', background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', gap:14, padding:'0 18px' }}>
      {dropped ? (
        <div style={{ display:'flex', alignItems:'center', gap:14, width:'100%', opacity:upA, transform:`scale(${(0.96 + 0.04 * upA).toFixed(4)})` }}>
          <span style={{ width:48, height:48, borderRadius:10, background:'linear-gradient(160deg,#1F2A3A,#3A4A60)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="image" s={22} c="#CFE0FF"/></span>
          <span style={{ flex:1 }}><span style={{ display:'block', fontSize:14.5, fontWeight:600, color:ONB.ink }}>jane-smith-panoramic.png</span><span style={{ display:'block', fontSize:12.5, color: done ? ONB.green : ONB.mute, fontWeight:600, marginTop:2 }}>{done ? 'Attached · 2.4 MB' : 'Uploading · 2.4 MB'}</span></span>
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(216,224,222,0.8)" strokeWidth="3.5"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke={done ? ONB.green : ONB.accent} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(88 * prog).toFixed(2)} 88`} transform="rotate(-90 18 18)"/>
            {done && <polyline points="12 18.5 16.5 23 24.5 14" fill="none" stroke={ONB.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={easeOut(ss(66.9, 67.2, t))}/>}
          </svg>
        </div>
      ) : (
        <><span style={{ width:40, height:40, borderRadius:12, background:ONB.accentSoft, display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${(1 + 0.08 * Math.sin(t * 5) * near).toFixed(4)})` }}><Ix n="upload" s={19} c={ONB.accent} w={2}/></span>
          <span style={{ fontSize:14, color:ONB.text }}>Drop X-rays or records here, or <span style={{ color:ONB.accent, fontWeight:600 }}>browse</span></span></>
      )}
    </div>
  );
  [0, 1, 2].forEach(i => {
    node = <div style={{ position:'relative', padding:5 + i, borderRadius:15 + (i + 1) * 3, border:`1px solid rgba(62,142,255,${(0.2 - i * 0.05 + near * 0.18 * (1 - i * 0.25)).toFixed(3)})`, background:`rgba(235,243,255,${(0.4 - i * 0.1 + near * 0.08).toFixed(3)})`, boxShadow: near > 0.02 ? `0 0 ${((18 + i * 10) * near).toFixed(1)}px rgba(62,142,255,${(0.1 * near).toFixed(3)})` : 'none' }}>{node}</div>;
  });
  return node;
}
function FileCard(){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 10px 10px', borderRadius:14, background:'#fff', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 8px 16px rgba(24,38,58,0.22)', whiteSpace:'nowrap' }}>
      <span style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(160deg,#1F2A3A,#3A4A60)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="image" s={17} c="#CFE0FF"/></span>
      <span style={{ fontSize:13.5, fontWeight:600, color:ONB.ink }}>jane-smith-panoramic.png</span>
    </div>
  );
}
function CreateModal({ t }){
  const reg = useReg();
  const openP = spring(ss(48.4, 49.15, t));
  const oa = ss(48.4, 48.62, t);
  const close = easeInOut(ss(69.1, 69.6, t));
  if (t < 48.4 || close >= 1) return null;
  const MX = 290, MY = 30, MW = 900, MH = 800;
  const bx = SIDE_W / 2, by = 48;
  const dx = (bx - (MX + MW / 2)) * (1 - openP), dy = (by - (MY + MH / 2)) * (1 - openP);
  const sc = lerp(0.1, 1, openP) * (1 - close * 0.03);
  const insOpen = ss(57.7, 57.95, t) * (1 - ss(59.2, 59.4, t));
  const scroll = easeInOut(ss(57.85, 58.55, t)) * 150;
  const genOpen = ss(56.0, 56.2, t) * (1 - ss(56.75, 56.95, t));
  const reaOpen = ss(62.2, 62.4, t) * (1 - ss(63.05, 63.25, t));
  const sent = t >= 68.7;
  return (
    <>
      <div style={{ position:'absolute', inset:0, background:'rgba(238,243,250,0.72)', opacity:win(t, 48.4, 69.5, 0.4, 0.4), zIndex:40 }}/>
      <div ref={reg('box')} style={{ position:'absolute', left:MX, top:MY, width:MW, height:MH, zIndex:41, ...glass(26, 0.9), boxShadow:'0 8px 20px rgba(24,38,58,0.10), inset 0 1.5px 1px rgba(255,255,255,0.98)', boxSizing:'border-box',
        opacity:oa * (1 - close), transform:`translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${sc.toFixed(4)})` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 28px 0 36px' }}>
          <span style={{ fontSize:22, fontWeight:600, color:ONB.ink }}>New referral</span>
          <span style={{ width:38, height:38, borderRadius:12, border:'1px solid rgba(216,224,222,0.9)', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}><Ic n="x" s={16} c={ONB.text}/></span>
        </div>
        <Stepper t={t}/>
        <StepWrap t={t} a={48.9} b={51.95}>
          <div style={{ borderRadius:16, background:'rgba(255,255,255,0.7)', border:'1px solid rgba(232,238,248,0.9)', padding:'6px 0' }}>
            {PRACTICES5.map((p, i) => { const sel = i === 0 && t >= 50.4; const hov = i === 0 ? win(t, 49.75, 50.45, 0.25, 0.1) : 0; const a = easeOut(ss(49.0 + i * 0.07, 49.5 + i * 0.07, t)); return (
              <div key={i} style={{ position:'relative', margin:'0 8px', opacity:a, transform:`translateY(${((1 - a) * 12).toFixed(2)}px)` }}>
                {sel && <GlowRim on radius={14} spread={4} blur={12} opacity={0.3} pulse={t}/>}
                <div ref={i === 0 ? reg('row1') : undefined} style={{ position:'relative', display:'flex', alignItems:'center', gap:22, height:80, padding:'0 22px', borderRadius:14,
                  border: sel ? '1.8px solid ' + ONB.accent : '1.8px solid transparent', background: sel ? 'rgba(235,243,255,0.95)' : `rgba(62,142,255,${(0.05 * hov).toFixed(3)})`,
                  borderBottomColor: sel ? ONB.accent : i < 4 ? 'rgba(232,238,248,0.9)' : 'transparent', transform: i === 0 ? `scale(${pressScale(t - 50.4).toFixed(4)})` : 'none' }}>
                  <Avatar init={p[0]} g={p[3]} s={48}/>
                  <span style={{ flex:1 }}><span style={{ display:'block', fontSize:18, fontWeight:600, color:ONB.ink }}>{p[1]}</span><span style={{ display:'block', fontSize:14, color:ONB.mute, marginTop:2 }}>{p[2]}</span></span>
                  {sel && <span style={{ width:26, height:26, borderRadius:'50%', background:ONB.accent, display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${easeOutBack(ss(50.4, 50.8, t)).toFixed(3)})` }}><Ic n="check" s={14} c="#fff" w={3}/></span>}
                </div>
              </div>); })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:22 }}>
            <span style={{ fontSize:12.5, fontWeight:600, color:ONB.mute, letterSpacing:'0.06em' }}>SHOWING ROWS 1 - 5</span>
            <GBtn label="Next" icon="arrowR" tone="accent" clk={t - 51.6} fid="next1" pad="13px 30px"/>
          </div>
        </StepWrap>
        <StepWrap t={t} a={51.95} b={60.75}>
          <RefBanner/>
          <div style={{ fontSize:12, fontWeight:700, color:ONB.mute, letterSpacing:'0.1em', margin:'24px 0 14px' }}>PATIENT DETAILS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px 16px' }}>
            <div><Label req>First name</Label><Inp value="Jane" placeholder="First name" cue={52.6} fid="first"/></div>
            <div><Label req>Last name</Label><Inp value="Smith" placeholder="Last name" cue={53.1} fid="last"/></div>
            <div style={{ position:'relative', zIndex:3 }}><Label req>Date of birth</Label><DateField t={t}/><Calendar t={t}/></div>
            <div style={{ position:'relative', zIndex:2 }}><Label>Gender</Label>
              <SelBox fid="gender" value={<Chip>Female</Chip>} at={56.7} openP={genOpen} focusA={win(t, 55.8, 57.0, 0.2, 0.3)}/>
              <Pop t={t} a={56.0} b={56.85} style={{ left:0, right:0, top:84 }}>
                {['Male','Female','Other'].map((g, i) => <Opt key={g} fid={g === 'Female' ? 'female' : null} label={g} t={t} t0={56.0} i={i} hover={g === 'Female' ? win(t, 56.05, 56.8, 0.2, 0.1) : 0} sel={g === 'Female' && t >= 56.7}/>)}
              </Pop>
            </div>
            <div style={{ gridColumn:'1 / span 2', position:'relative', zIndex:1 }}><Label>Insurance Provider</Label>
              <SelBox fid="ins" value="Guardian Dental" at={59.1} openP={insOpen} focusA={win(t, 57.5, 59.5, 0.2, 0.3)}/>
              <Pop t={t} a={57.7} b={59.3} style={{ left:0, right:0, top:84 }}>
                <div ref={reg('insList')} style={{ height:240, overflow:'hidden', position:'relative' }}>
                  <div style={{ transform:`translateY(${(-scroll).toFixed(2)}px)` }}>
                    {INSURERS.map((n, i) => <Opt key={n} fid={n === 'Guardian Dental' ? 'guardian' : null} label={n} t={t} t0={57.7} i={Math.min(i, 6)} hover={n === 'Guardian Dental' ? win(t, 58.4, 59.2, 0.2, 0.1) : 0} sel={n === 'Guardian Dental' && t >= 59.1}/>)}
                  </div>
                  <div style={{ position:'absolute', right:4, top:8 + scroll * 0.5, width:4, height:70, borderRadius:4, background:'rgba(122,136,134,0.35)' }}/>
                </div>
              </Pop>
            </div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:ONB.mute, letterSpacing:'0.1em', margin:'24px 0 14px' }}>ADMINISTRATIVE</div>
          <Label>Referred by</Label><Inp value="Melissa" placeholder="Staff member" cue={59.5} fid="refby"/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, display:'flex', justifyContent:'flex-end', gap:12 }}>
            <span style={{ padding:'13px 26px', borderRadius:9999, border:'1.5px solid rgba(216,224,222,0.95)', background:'#fff', fontSize:14, fontWeight:600, color:ONB.text }}>Back</span>
            <GBtn label="Next" icon="arrowR" tone="accent" clk={t - 60.4} fid="next2" pad="13px 30px"/>
          </div>
        </StepWrap>
        <StepWrap t={t} a={60.75} b={70}>
          <RefBanner/>
          <div style={{ marginTop:20 }}><Label>Reason for referral</Label>
            <div ref={reg('note')} style={{ position:'relative', height:78, borderRadius:14, padding:'14px 16px', boxSizing:'border-box', background:'linear-gradient(160deg,rgba(255,244,230,0.95),rgba(255,244,230,0.7))', ...focusStyle(win(t, 60.9, 61.9, 0.2, 0.4)), fontSize:14.5, lineHeight:1.45 }}>
              <FillText lt={t} cue={61.1} text={NOTE_TXT} placeholder="Add clinical context for the specialist"/>
            </div>
          </div>
          <div style={{ marginTop:16, position:'relative', zIndex:2 }}><Label>Reason</Label>
            <SelBox fid="reason" value={<Chip>Early Interceptive</Chip>} at={63.0} openP={reaOpen} focusA={win(t, 61.9, 63.3, 0.2, 0.3)}/>
            <Pop t={t} a={62.2} b={63.15} style={{ left:0, right:0, top:84 }}>
              {REASONS.map((r, i) => <Opt key={r} fid={r === 'Early Interceptive' ? 'early' : null} label={r} t={t} t0={62.2} i={i} hover={r === 'Early Interceptive' ? win(t, 62.4, 63.05, 0.2, 0.1) : 0} sel={r === 'Early Interceptive' && t >= 63.0}/>)}
            </Pop>
          </div>
          <div ref={reg('urg')} style={{ marginTop:18 }}><Label>Urgency</Label>
            <div style={{ display:'flex', gap:26 }}><Radio label="Routine" t={t}/><Radio fid="prio" label="Priority (1–2 weeks)" at={63.9} t={t}/><Radio label="Emergency (same day)" t={t}/></div>
          </div>
          <div style={{ marginTop:16 }}><Label>Send confirmation email to patient</Label>
            <div style={{ display:'flex', gap:26 }}><Radio fid="yes" label="Yes" at={64.75} t={t}/><Radio label="No" t={t}/></div>
          </div>
          <div style={{ marginTop:18 }}><DropZone t={t}/></div>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, display:'flex', justifyContent:'flex-end', gap:12 }}>
            <span style={{ padding:'13px 26px', borderRadius:9999, border:'1.5px solid rgba(216,224,222,0.95)', background:'#fff', fontSize:14, fontWeight:600, color:ONB.text }}>Back</span>
            <div style={{ display:'grid' }}>
              <div style={{ gridArea:'1/1', opacity:1 - ss(68.7, 68.9, t) }}><GBtn label="Submit" icon={null} tone="accent" clk={t - 67.7} fid="submit" pad="13px 34px" loading="Sending" loadDur={1.0}/></div>
              {sent && <div style={{ gridArea:'1/1', opacity:ss(68.7, 68.9, t), filter: t < 68.9 ? `blur(${((1 - ss(68.7, 68.9, t)) * 6).toFixed(2)}px)` : 'none' }}><GBtn label="Sent" icon="check" tone="green" clk={t - 68.7} pad="13px 34px"/></div>}
            </div>
          </div>
        </StepWrap>
      </div>
    </>
  );
}


/* ---------- Referral detail ---------- */
const STATUSES = ['Created','Outreach','Referral Received','Consultation Scheduled','Consultation Completed','Accepted Treatment','Declined Treatment'];
const CASE_NOTE = 'X-rays reviewed. Patient scheduled for consultation next Tuesday.';
function Lock({ closed }){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12925A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2.5"/>
      <path d="M8 11V7a4 4 0 018 0v4" transform={`translate(0 ${(-(1 - closed) * 3.5).toFixed(2)})`}/>
    </svg>
  );
}
function DetailPage({ t, noPop }){
  const reg = useReg();
  const scroll = detScroll(t);
  const feeA = easeOutStrong(ss(83.3, 83.75, t));
  const mp = ss(74.8, 75.2, t);
  const nodeC = mixHex('#3E8EFF', '#22C97A', mp);
  const ring = ss(74.8, 75.6, t);
  const swapA = easeOutStrong(ss(74.8, 75.2, t));
  const popOpen = t >= 72.3 && t < 74.9;
  const rrSel = t >= 73.2;
  const lock = easeOutBack(ss(82.2, 82.5, t));
  const feeGlow = win(t, 81.9, 84.8, 0.5, 0.6);
  const noteIn = easeOut(ss(79.9, 80.4, t));
  const nf = win(t, 78.3, 79.9, 0.25, 0.35);
  const sync = easeOut(ss(75.3, 75.8, t));
  const swap = (a, b) => (
    <span style={{ display:'grid' }}>
      <span style={{ gridArea:'1/1', opacity:1 - swapA, filter: swapA > 0.01 ? `blur(${(swapA * 8).toFixed(2)}px)` : 'none' }}>{a}</span>
      {swapA > 0 && <span style={{ gridArea:'1/1', opacity:swapA, filter: swapA < 0.99 ? `blur(${((1 - swapA) * 8).toFixed(2)}px)` : 'none', whiteSpace:'nowrap' }}>{b}</span>}
    </span>
  );
  const TL = [['Referral created by Capital Root Canal Center','9:12 AM',-1],['Panoramic X-ray attached','9:12 AM',-1],['Status changed to Referral Received','9:14 AM',85.6],['Case note added by Capitol Smile Orthodontics','9:15 AM',85.95]];
  return (
    <div style={{ position:'absolute', left:0, right:0, top:0, padding:'22px 34px 40px', boxSizing:'border-box', transform:`translateY(${(-scroll).toFixed(2)}px)` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, color:ONB.text, ...fu(t, 70.2) }}><Ic n="chevL" s={16} c={ONB.text}/>Back to referrals</div>
      <div style={{ ...card(20, '22px 28px'), marginTop:14, ...fu(t, 70.3, 0.6, 16) }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <Avatar init="JS" g={GR.coral} s={56}/>
          <div style={{ flex:1 }}><div style={{ fontSize:30, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em' }}>Jane Smith</div><div style={{ fontSize:14, color:ONB.mute, marginTop:2 }}>Sep 28, 2026</div></div>
          <span ref={reg('edit')} style={{ position:'relative', overflow:'hidden', display:'inline-flex', alignItems:'center', gap:9, padding:'12px 22px', borderRadius:9999, border:'1px solid rgba(216,224,222,0.9)', background:'#fff', fontSize:15, fontWeight:600, color:ONB.accent, transform:`scale(${pressScale(t - 88.9).toFixed(4)})`, boxShadow:`0 0 0 ${(4 * win(t, 88.3, 89.2, 0.3, 0.1)).toFixed(2)}px rgba(62,142,255,0.14)` }}><Ix n="edit" s={17} c={ONB.accent}/>Edit referral<ClickFX clk={t - 88.9} color="rgba(62,142,255,0.25)"/></span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', marginTop:18, paddingLeft:74 }}>
          {[['DOB','Sep 30, 2026'],['GENDER','Female'],['INSURANCE','Guardian Dental'],['REFERRED BY','Melissa']].map(x => <div key={x[0]}><div style={{ fontSize:11.5, fontWeight:600, letterSpacing:'0.08em', color:ONB.mute }}>{x[0]}</div><div style={{ fontSize:15.5, fontWeight:500, color:ONB.ink, marginTop:6 }}>{x[1]}</div></div>)}
        </div>
      </div>
      <div ref={reg('prog')} style={{ ...card(20, '22px 28px 26px'), marginTop:16, ...fu(t, 70.45, 0.6, 16), position:'relative', zIndex:20, overflow:'visible' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:24 }}>
          <div style={{ width:300 }}>
            <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.1em', color:ONB.accent }}>CASE PROGRESS</div>
            <div style={{ fontSize:26, fontWeight:700, color:ONB.ink, marginTop:6, letterSpacing:'-0.01em' }}>{swap('Created', 'Referral Received')}</div>
          </div>
          <div style={{ position:'relative', flex:1, maxWidth:480, padding:'14px 18px', borderRadius:14, background:'rgba(244,247,251,0.9)', border:'1px solid rgba(216,224,222,0.8)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:ONB.mute, letterSpacing:'0.06em' }}><span>FROM</span><span style={{ color:ONB.accent }}>TO</span></div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:6 }}>
              <div style={{ flex:1 }}><div style={{ fontSize:15.5, fontWeight:600, color:ONB.ink }}>Capital Root Canal Center</div><div style={{ fontSize:13.5, color:ONB.mute, marginTop:2 }}>Melissa</div></div>
              <span style={{ width:30, height:30, borderRadius:'50%', background:ONB.accentSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Ix n="chevR" s={15} c={ONB.accent} w={2.4}/></span>
              <div style={{ flex:1 }}><div style={{ fontSize:15.5, fontWeight:600, color:ONB.ink }}>Capitol Smile Orthodontics</div><div style={{ fontSize:13.5, color:ONB.mute, marginTop:2 }}>Dr. Emily Carter</div></div>
            </div>
            {sync > 0.01 && <div style={{ position:'absolute', left:18, bottom:-16, display:'flex', alignItems:'center', gap:8, padding:'6px 12px 6px 8px', borderRadius:9999, background:'#fff', border:'1px solid rgba(34,201,122,0.35)', boxShadow:'0 4px 11px rgba(34,201,122,0.16)', fontSize:12.5, fontWeight:600, color:'#12925A', opacity:sync, transform:`translateY(${((1 - sync) * 6).toFixed(2)}px)` }}>
              <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:ONB.green }}><span style={{ position:'absolute', inset:0, borderRadius:'50%', background:ONB.green, transform:`scale(${(1 + ((t * 0.8) % 1) * 1.8).toFixed(3)})`, opacity:1 - ((t * 0.8) % 1) }}/></span>Live for both practices</div>}
          </div>
          <div style={{ marginLeft:'auto', position:'relative' }}>
            <div ref={reg('status')} style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'12px 22px', borderRadius:9999, border:'1px solid rgba(216,224,222,0.9)', background:'#fff', fontSize:15, fontWeight:600, color:ONB.accent, transform:`scale(${pressScale(t - 72.2).toFixed(4)})`, boxShadow: popOpen ? '0 0 0 4px rgba(62,142,255,0.12)' : 'none' }}><Ix n="edit" s={17} c={ONB.accent}/>Change status</div>
            <Pop t={t} a={noPop ? 999 : 72.3} b={noPop ? 998 : 74.85} style={{ right:0, top:58, width:320 }}>
              <div ref={reg('pop')} style={{ padding:'14px 0 14px' }}>
                <div style={{ padding:'0 16px 8px', fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:ONB.mute }}>UPDATE STATUS</div>
                {STATUSES.map((s, i) => <Opt key={s} fid={s === 'Referral Received' ? 'optRR' : null} label={s} t={t} t0={72.3} i={i} h={38}
                  hover={s === 'Referral Received' ? win(t, 72.6, 73.3, 0.2, 0.1) : 0} sel={s === 'Referral Received' ? rrSel : (s === 'Created' && !rrSel)}/>)}
                <div style={{ padding:'12px 16px 0' }}><GBtn label="Save" icon={null} tone="accent" clk={t - 74.0} fid="save" pad="12px 20px" full loading="Saving" loadDur={0.7}/></div>
              </div>
            </Pop>
          </div>
        </div>
        <div ref={reg('path')} style={{ position:'relative', height:110, marginTop:30 }}>
          <div style={{ position:'absolute', left:'4%', right:'16%', top:26, height:3, borderRadius:3, background:'rgba(216,224,222,0.8)' }}/>
          <div style={{ position:'absolute', left:'4%', width:'18%', top:26, height:3, borderRadius:3, background:nodeC }}/>
          {[['Created','Referral Received',0.12],['Outreach',null,0.33],['Consultation Scheduled',null,0.54],['Consultation Completed',null,0.75]].map((n, i) => (
            <div key={i} style={{ position:'absolute', left:(n[2] * 100) + '%', top:0, transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', width:220 }}>
              {i === 0 ? (
                <span style={{ position:'relative', width:54, height:54, borderRadius:'50%', background:nodeC, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 22px ${mp > 0.5 ? 'rgba(34,201,122,0.35)' : 'rgba(62,142,255,0.35)'}` }}>
                  <Ic n="check" s={24} c="#fff" w={3}/>
                  {ring > 0 && ring < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2.5px solid ' + ONB.green, transform:`scale(${(1 + ring * 1.4).toFixed(3)})`, opacity:(1 - ring) * 0.8 }}/>}
                </span>
              ) : <span style={{ width:54, height:54 }}/>}
              <span style={{ marginTop: i === 0 ? 14 : -10, fontSize:15, fontWeight:600, color:ONB.ink, whiteSpace:'nowrap' }}>{n[1] ? swap(n[0], n[1]) : n[0]}</span>
            </div>
          ))}
          <svg style={{ position:'absolute', left:'84%', top:0, width:60, height:60, overflow:'visible' }}><path d="M0 27.5 C 30 27.5, 30 5, 60 5 M0 27.5 C 30 27.5, 30 50, 60 50" fill="none" stroke="rgba(184,194,192,0.8)" strokeWidth="3"/></svg>
          {['Accepted Treatment','Declined Treatment'].map((x, i) => <span key={x} style={{ position:'absolute', right:0, top: i ? 30 : -22, display:'inline-flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:9999, border:'2px solid rgba(216,224,222,0.9)', background:'#fff', fontSize:14, fontWeight:600, color:ONB.text }}><span style={{ width:8, height:8, borderRadius:'50%', background:ONB.faint }}/>{x}</span>)}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:16, marginTop:16, ...fu(t, 70.6, 0.6, 18) }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ ...card(20, '20px 24px'), background:'linear-gradient(160deg,rgba(255,244,230,0.96),rgba(255,248,238,0.85))', height:176 }}>
            <div style={{ display:'flex', gap:16 }}>
              <span style={{ width:48, height:48, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ix n="clip" s={22} c={ONB.amber} w={2}/></span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.1em', color:'#B86E12' }}>REASON FOR REFERRAL</div>
                <div style={{ display:'flex', gap:8, marginTop:10 }}><Pill bg="#fff" fg={ONB.ink}>Early Interceptive</Pill><Pill bg="rgba(255,169,64,0.18)" fg="#B86E12">Priority (1–2 weeks)</Pill><Pill bg="#fff" fg={ONB.text}><Ic n="paperclip" s={12} c={ONB.text}/>jane-smith-panoramic.png</Pill></div>
                <div style={{ fontSize:17, color:ONB.ink, marginTop:14, lineHeight:1.45 }}>{NOTE_TXT}</div>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:16 }}>
            <div style={{ position:'relative' }}>
              <GlowRim on={feeGlow > 0.01} radius={20} spread={7} blur={18} opacity={0.45 * feeGlow} pulse={t}/>
              <div ref={reg('fees')} style={{ ...card(20, '20px 22px'), background:'linear-gradient(160deg,rgba(230,250,241,0.97),rgba(240,252,246,0.86))', height:370 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ width:44, height:44, borderRadius:12, background:'rgba(34,201,122,0.14)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="chart" s={20} c={ONB.green} w={2.4}/></span>
                  <span style={{ fontSize:14, fontWeight:700, letterSpacing:'0.1em', color:'#12925A' }}>FEES</span>
                  <span style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:9999, background:'#fff', border:'1px solid rgba(34,201,122,0.3)', fontSize:12, fontWeight:700, color:'#12925A', boxShadow: feeGlow > 0.01 ? `0 0 ${(16 * feeGlow).toFixed(1)}px rgba(34,201,122,0.35)` : 'none' }}><Lock closed={t < 82.2 ? 0 : lock}/>Private to your practice</span>
                </div>
                <div style={{ fontSize:12.5, color:ONB.text, lineHeight:1.5, marginTop:14 }}>Visible only to members of your practice. Not shared with referring providers or patients.</div>
                {[['Comprehensive exam','$120'],['Panoramic X-ray','$60']].map(r => <div key={r[0]} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid rgba(34,201,122,0.16)', fontSize:14.5, color:ONB.ink }}><span>{r[0]}</span><span style={{ fontWeight:600 }}>{r[1]}</span></div>)}
                {feeA > 0.001 && <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', height:lerp(0, 44, feeA), overflow:'hidden', borderBottom:'1px solid rgba(34,201,122,0.16)', fontSize:14.5, color:ONB.ink, opacity:feeA, filter: feeA < 0.99 ? `blur(${((1 - feeA) * 6).toFixed(2)}px)` : 'none', background:`rgba(34,201,122,${(0.12 * win(t, 83.3, 85.2, 0.3, 0.8)).toFixed(3)})`, borderRadius:8, padding:'0 6px', margin:'0 -6px' }}><span>Comprehensive aligner treatment</span><span style={{ fontWeight:600 }}>$5,820</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', fontSize:15, fontWeight:700, color:ONB.ink }}><span>Total</span><span style={{ fontVariantNumeric:'tabular-nums' }}>${(180 + Math.round(5820 * feeA)).toLocaleString('en-US')}</span></div>
                <div style={{ marginTop:14 }}><span ref={reg('addFee')} style={{ position:'relative', overflow:'hidden', display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:9999, background:'linear-gradient(160deg,#3FD990,#1EB36B)', color:'#fff', fontSize:13.5, fontWeight:600, transform:`scale(${pressScale(t - 83.0).toFixed(4)})` }}><Ic n="plus" s={14} c="#fff" w={2.4}/>Add fee<ClickFX clk={t - 83.0}/></span></div>
              </div>
            </div>
            <div ref={reg('timeline')} style={{ ...card(20, '20px 22px'), height:370 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ width:44, height:44, borderRadius:12, background:ONB.accentSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="clock" s={20} c={ONB.accent}/></span>
                <span style={{ fontSize:17, fontWeight:600, color:ONB.ink }}>Activity timeline</span>
              </div>
              <div style={{ marginTop:18, display:'flex', flexDirection:'column' }}>
                {TL.map((e, i) => { const a = e[2] < 0 ? 1 : easeOut(ss(e[2], e[2] + 0.45, t)); return (
                  <div key={i} style={{ display:'flex', gap:14, opacity:a, transform:`translateY(${((1 - a) * 12).toFixed(2)}px)` }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <span style={{ width:12, height:12, borderRadius:'50%', background: e[2] < 0 ? ONB.faint : i === 2 ? ONB.green : ONB.accent, marginTop:4, boxShadow: e[2] > 0 ? '0 0 0 4px rgba(62,142,255,0.12)' : 'none' }}/>
                      {i < 3 && <span style={{ width:2, flex:1, minHeight:34, background:'rgba(216,224,222,0.8)', margin:'4px 0' }}/>}
                    </div>
                    <div style={{ paddingBottom:12 }}><div style={{ fontSize:14, fontWeight:600, color:ONB.ink, lineHeight:1.35 }}>{e[0]}</div><div style={{ fontSize:12.5, color:ONB.mute, marginTop:2 }}>Today · {e[1]}</div></div>
                  </div>); })}
              </div>
            </div>
          </div>
        </div>
        <div ref={reg('notes')} style={{ ...card(20, '18px 20px'), height:562 }}>
          <div style={{ display:'flex', gap:6, borderBottom:'1px solid rgba(216,224,222,0.7)' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', fontSize:15, fontWeight:600, color:ONB.accent, borderBottom:'2px solid ' + ONB.accent, marginBottom:-1, background:'rgba(235,243,255,0.7)', borderRadius:'10px 10px 0 0' }}><Ix n="clip" s={17} c={ONB.accent}/>Case Notes</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', fontSize:15, color:ONB.text }}><Ic n="msg" s={17} c={ONB.text}/>Messages</span>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16, alignItems:'stretch' }}>
            <div style={{ position:'relative', flex:1 }}>
              <GlowRim on={nf > 0.01} radius={12} spread={5} blur={12} opacity={0.45 * nf} pulse={t}/>
              <div ref={reg('noteIn')} style={{ position:'relative', height:84, borderRadius:12, padding:'11px 13px', boxSizing:'border-box', background:'#fff', ...focusStyle(nf), fontSize:13.5, lineHeight:1.4 }}>
                {t < 79.8 ? <FillText lt={t} cue={78.6} text={CASE_NOTE} placeholder="Type your case note here"/> : <span style={{ color:ONB.mute }}>Type your case note here</span>}
              </div>
            </div>
            <div ref={reg('addNote')} style={{ position:'relative', width:62, borderRadius:12, background:'linear-gradient(160deg,#5BA0FF,#2F7DF5)', color:'#fff', fontSize:13.5, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', lineHeight:1.2, transform:`scale(${pressScale(t - 79.7).toFixed(4)})`, overflow:'hidden' }}>Add<br/>note<ClickFX clk={t - 79.7}/></div>
          </div>
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:12 }}>
            {noteIn > 0.001 && <div style={{ maxHeight:lerp(0, 160, noteIn), opacity:noteIn, overflow:'hidden', transform:`scale(${(0.97 + 0.03 * noteIn).toFixed(4)})`, transformOrigin:'top center' }}>
              <div style={{ padding:'14px 16px', borderRadius:14, background:'linear-gradient(160deg,rgba(235,243,255,0.95),rgba(235,243,255,0.6))', border:'1px solid rgba(62,142,255,0.22)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ fontWeight:700, color:ONB.accent }}>Capitol Smile Orthodontics</span><span style={{ color:ONB.mute }}>Just now</span></div>
                <div style={{ fontSize:14.5, color:ONB.ink, marginTop:6, lineHeight:1.45 }}>{CASE_NOTE}</div>
              </div>
            </div>}
            <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(244,247,251,0.9)', border:'1px solid rgba(232,238,248,0.95)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ fontWeight:700, color:ONB.text }}>Capitol Smile Orthodontics</span><span style={{ color:ONB.mute }}>9:13 AM</span></div>
              <div style={{ fontSize:14.5, color:ONB.ink, marginTop:6, lineHeight:1.45 }}>Records and panoramic X-ray received.</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height:260 }}/>
    </div>
  );
}

/* ---------- Network ---------- */
const NET_ROWS = [['CS','Capitol Smile Orthodontics','Orthodontics',GR.violet],['GG','Georgetown Gum Specialists','Periodontics',GR.purple],['DP','DC Precision Endodontics','Endodontics',GR.teal],['WS','Washington Surgical Oral Center','Oral Surgery',GR.blue],['LS','Little Smiles Pediatric Dentistry','Pediatric Dentistry',GR.green],['DC','Dupont Circle Family Dentistry','General Dentistry',GR.teal]];
// Digits roll: the old value lifts away blurred, the new one settles in from below.
function RollSwap({ v, prev, p }){
  if (prev == null || prev === v || p >= 1) return <span>{v}</span>;
  return (
    <span style={{ display:'inline-grid', clipPath:'inset(-4px -20px -4px -20px)' }}>
      <span style={{ gridArea:'1/1', opacity:1 - p, transform:`translateY(${(-p * 0.55).toFixed(3)}em)`, filter:`blur(${(p * 6).toFixed(2)}px)` }}>{prev}</span>
      <span style={{ gridArea:'1/1', opacity:p, transform:`translateY(${((1 - p) * 0.55).toFixed(3)}em)`, filter: p < 0.99 ? `blur(${((1 - p) * 6).toFixed(2)}px)` : 'none' }}>{v}</span>
    </span>
  );
}
const NET_MORE = [['AF','Arlington Family Dental','General Dentistry',GR.blue],['BO','Bethesda Oral Surgery','Oral Surgery',GR.violet],['SS','Silver Spring Smiles','General Dentistry',GR.teal],['AE','Alexandria Endodontics','Endodontics',GR.purple],['RP','Rockville Periodontics','Periodontics',GR.amber],['CO','Chevy Chase Orthodontics','Orthodontics',GR.coral],['FK','Falls Church Kids Dental','Pediatric Dentistry',GR.green],['NA','Navy Yard Dental Studio','General Dentistry',GR.blue],['TP','Takoma Park Dental','General Dentistry',GR.teal],['GB','Gaithersburg Braces','Orthodontics',GR.violet],['MI','McLean Implant Center','Oral Surgery',GR.purple],['CH','Columbia Heights Dental','General Dentistry',GR.amber],['VE','Vienna Endo Specialists','Endodontics',GR.coral],['LP','Laurel Pediatric Dentistry','Pediatric Dentistry',GR.green],['RE','Reston Family Dentistry','General Dentistry',GR.blue],['AN','Annapolis Oral Health','Periodontics',GR.teal]];
const NET_STEP = 0.2, NET_T0 = 0.35;
function NetworkPage({ t, live }){
  const reg = useReg();
  const on = live != null && live > NET_T0;
  const k = on ? Math.min(NET_MORE.length, Math.floor((live - NET_T0) / NET_STEP) + 1) : 0;
  const fr = on ? easeOutStrong(ss(NET_T0 + (k - 1) * NET_STEP, NET_T0 + (k - 1) * NET_STEP + 0.24, live)) : 1;
  const base = (v, a) => live == null ? Math.round(v * eQuint(ss(a, a + 1.3, t))) : v; // live: steady
  const stats = [[base(10, 90.5) + k, 'Connected', '#1EB36B', k ? base(10, 90.5) + k - 1 : null], [base(2, 90.6), 'Pending', '#FF9A1F', null], [base(34, 90.7) + k * 3, 'Referrals exchanged', ONB.ink, k ? base(34, 90.7) + (k - 1) * 3 : null]];
  const rows = on ? NET_MORE.slice(0, k).reverse().concat(NET_ROWS).slice(0, 7) : NET_ROWS;
  const row = (r, i, a, h, hl, key) => (
    <div key={key} ref={reg('row' + i)} style={{ display:'flex', alignItems:'center', gap:22, height:h, flexShrink:0, overflow:'hidden', margin:'0 -26px', padding:'0 26px', borderBottom:'1px solid rgba(232,238,248,0.9)', opacity:a, filter: a < 0.99 ? `blur(${((1 - a) * 10).toFixed(2)}px)` : 'none', background: hl > 0.01 ? `linear-gradient(90deg, rgba(62,142,255,${(0.08 * hl).toFixed(3)}), rgba(144,240,197,${(0.08 * hl).toFixed(3)}) 60%, transparent)` : 'transparent' }}>
      <Avatar init={r[0]} g={r[3]} s={50}/>
      <span style={{ flex:1 }}><span style={{ display:'block', fontSize:19, fontWeight:600, color:ONB.ink }}>{r[1]}</span><span style={{ display:'block', fontSize:14.5, color:ONB.mute, marginTop:3 }}>{r[2]}</span></span>
      {hl > 0.01 && <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#12925A', opacity:hl }}><Ic n="check" s={14} c="#12925A" w={3}/>Just joined</span>}
      <span style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:9999, background:'linear-gradient(160deg,#3FD990,#1EB36B)', color:'#fff', fontSize:13.5, fontWeight:700, letterSpacing:'0.04em', boxShadow:'0 8px 18px rgba(34,201,122,0.28)', overflow:'hidden' }}><Ic n="users" s={15} c="#fff"/>SEND REFERRAL<LiquidSheen radius={9999} period={7} phase={i * 0.13} strength={0.35}/></span>
    </div>);
  return (
    <div style={{ position:'absolute', inset:0, padding:'24px 34px', boxSizing:'border-box' }}>
      <div style={{ fontSize:28, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em', ...bi(t, 90.1) }}>Your network</div>
      <div style={{ fontSize:15, color:ONB.text, marginTop:6, ...fu(t, 90.25) }}>Manage referral partners and invites</div>
      <div ref={reg('stats')} style={{ ...card(20, '22px 30px'), marginTop:20, display:'flex', alignItems:'center', background:'linear-gradient(90deg,rgba(235,243,255,0.95),rgba(230,250,241,0.9))', ...fu(t, 90.35, 0.6, 14) }}>
        {stats.map((m, i) => (
          <div key={i} style={{ paddingRight:44, marginRight:44, borderRight: i < 2 ? '1px solid rgba(184,194,192,0.5)' : 'none' }}>
            <div style={{ fontSize:42, fontWeight:700, color:m[2], letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums', lineHeight:1, minWidth:'2.2ch' }}><RollSwap v={m[0]} prev={m[3]} p={fr}/></div>
            <div style={{ fontSize:15, color:ONB.text, marginTop:8 }}>{m[1]}</div>
          </div>
        ))}
        <div style={{ marginLeft:'auto', maxWidth:400, textAlign:'right', fontSize:15, color:ONB.ink, lineHeight:1.5 }}>A larger network means faster referrals, fewer dropped cases, and stronger continuity for your patients.</div>
      </div>
      <div style={{ ...card(20, '14px 26px 10px'), marginTop:18, ...fu(t, 90.6, 0.6, 16) }}>
        <div style={{ display:'flex', gap:28, borderBottom:'1px solid rgba(216,224,222,0.7)' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'12px 4px', fontSize:16, fontWeight:600, color:ONB.accent, borderBottom:'2.5px solid ' + ONB.accent, marginBottom:-1 }}><Ic n="check" s={19} c={ONB.accent} w={2.6}/>Connected</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'12px 4px', fontSize:16, color:ONB.text }}><Ic n="clock" s={19} c={ONB.text}/>Pending invites<span style={{ minWidth:22, height:22, borderRadius:9999, background:ONB.amberSoft, color:'#B86E12', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>2</span></span>
        </div>
        <div style={{ height:86 * 6, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {rows.map((r, i) => {
          if (!on) { const a = easeOut(ss(90.9 + i * 0.06, 91.5 + i * 0.06, t)); return row(r, i, a, 86, 0, r[1]); }
          const idx = k - 1 - i;
          const isNew = i === 0;
          const hl = idx >= 0 ? clamp(1 - (live - (NET_T0 + idx * NET_STEP)) / 0.9) : 0;
          return row(r, i, isNew ? fr : 1, isNew ? 86 * fr : 86, hl, r[1]);
        })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Practice settings + notifications ---------- */
const MEMBERS = [['LM','Lisa Monroe','lisa@capitalrootcanal.com','Admin',GR.blue],['MH','Melissa Hart','melissa@capitalrootcanal.com','Member',GR.coral],['GL','Grace Liu','grace@capitalrootcanal.com','Member',GR.teal],['LP','Lauren Price','lauren@capitalrootcanal.com','Member',GR.amber],['SO','Samuel Ortiz','samuel@capitalrootcanal.com','Member',GR.purple]];
const NEW_MEMBERS = [['DR','Dana Reyes','dana@capitalrootcanal.com','Member',GR.teal],['KO','Kevin Osei','kevin@capitalrootcanal.com','Member',GR.violet],['PS','Priya Shah','priya@capitalrootcanal.com','Member',GR.amber]];
function SettingsPage({ t, adds }){
  const reg = useReg();
  const addG = win(t, 114.3, 116.0, 0.4, 0.5);
  const baaG = ss(118.6, 119.2, t);
  return (
    <div style={{ position:'absolute', inset:0, padding:'24px 34px', boxSizing:'border-box' }}>
      <div style={{ fontSize:28, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em' }}>Practice settings</div>
      <div style={{ fontSize:15, color:ONB.text, marginTop:6 }}>Capital Root Canal Center</div>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, marginTop:22 }}>
        <div ref={reg('members')} style={{ ...card(20, '22px 26px') }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div><div style={{ display:'flex', alignItems:'center', gap:10 }}><span style={{ fontSize:20, fontWeight:700, color:ONB.ink }}>Practice members</span>{adds && <span style={{ ...bi(t, 113.3, 0.5) }}><Pill bg={ONB.greenSoft} fg="#12925A"><Ic n="users" s={12} c="#12925A"/>{5 + adds.filter(a => a > 0.5).length} members · no seat limit</Pill></span>}</div><div style={{ fontSize:13.5, color:ONB.mute, marginTop:3 }}>Everyone here can send, track, and log referrals</div></div>
            <div style={{ position:'relative' }}>
              <GlowRim on={addG > 0.01} radius={9999} spread={7} blur={16} opacity={0.55 * addG} pulse={t}/>
              <span ref={reg('add')} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:9999, background:'linear-gradient(160deg,#6AA8FF,#2F7DF5)', color:'#fff', fontSize:14, fontWeight:600, boxShadow:`0 5px 13px rgba(62,142,255,${(0.25 + 0.25 * addG).toFixed(3)})`, transform:`scale(${(1 + 0.03 * addG).toFixed(4)})`, overflow:'hidden' }}><Ic n="plus" s={15} c="#fff" w={2.4}/>Add member<Sheen p={t > 114.4 && t < 115.6 ? ss(114.4, 115.6, t) : null} radius={9999} strength={0.55}/></span>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            {MEMBERS.map((m, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, height:66, borderBottom: i < 4 ? '1px solid rgba(232,238,248,0.9)' : 'none', ...fu(t, 111.9 + i * 0.06, 0.5, 10) }}>
                <Avatar init={m[0]} g={m[4]} s={42}/>
                <span style={{ flex:1 }}><span style={{ display:'block', fontSize:16, fontWeight:600, color:ONB.ink }}>{m[1]}</span><span style={{ display:'block', fontSize:13, color:ONB.mute, marginTop:2 }}>{m[2]}</span></span>
                {m[3] === 'Admin' ? <Pill bg={ONB.accentSoft} fg={ONB.accent}>Admin</Pill> : <Pill bg="#F1F4F8" fg={ONB.text}>Member</Pill>}
              </div>
            ))}
            {adds && NEW_MEMBERS.map((m, i) => { const a = easeOutStrong(clamp(adds[i])); if (a <= 0.001) return null; const ring = clamp(adds[i] * 0.8); return (
              <div key={'n' + i} style={{ display:'flex', alignItems:'center', gap:16, height:66 * a, overflow:'hidden', borderTop:'1px solid rgba(232,238,248,0.9)', opacity:a, filter: a < 0.99 ? `blur(${((1 - a) * 8).toFixed(2)}px)` : 'none', background:`rgba(62,142,255,${(0.07 * (1 - ring)).toFixed(3)})`, margin:'0 -12px', padding:'0 12px' }}>
                <Avatar init={m[0]} g={m[4]} s={42}/>
                <span style={{ flex:1 }}><span style={{ display:'block', fontSize:16, fontWeight:600, color:ONB.ink }}>{m[1]}</span><span style={{ display:'block', fontSize:13, color:ONB.mute, marginTop:2 }}>{m[2]}</span></span>
                <Pill bg="rgba(34,201,122,0.14)" fg="#12925A"><Ic n="check" s={12} c="#12925A" w={3}/>Invite sent</Pill>
              </div>); })}
          </div>
        </div>
        <div ref={reg('hipaa')} style={{ ...card(20, '24px 26px'), alignSelf:'start' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ width:48, height:48, borderRadius:14, background:ONB.greenSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="shield" s={22} c={ONB.green}/></span>
            <div><div style={{ fontSize:20, fontWeight:700, color:ONB.ink }}>HIPAA compliance</div><div style={{ fontSize:13.5, color:ONB.mute, marginTop:2 }}>Business associate agreement</div></div>
          </div>
          <div style={{ marginTop:18, padding:'14px 16px', borderRadius:14, background:'rgba(244,247,251,0.9)', border:'1px solid rgba(232,238,248,0.95)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div><div style={{ fontSize:14.5, fontWeight:600, color:ONB.ink }}>Signed Sep 22, 2026</div><div style={{ fontSize:12.5, color:ONB.mute, marginTop:2 }}>CaseLink, Inc. and Capital Root Canal Center</div></div>
            <Pill bg="rgba(34,201,122,0.14)" fg="#12925A"><Ic n="check" s={12} c="#12925A" w={3}/>On file</Pill>
          </div>
          <div style={{ position:'relative', marginTop:18 }}>
            {baaG > 0.01 && <span style={{ position:'absolute', inset:-12, borderRadius:9999, background:'radial-gradient(ellipse at center, rgba(255,199,148,0.85), rgba(255,169,64,0.35) 55%, transparent 75%)', filter:'blur(12px)', opacity:baaG * (0.8 + 0.2 * Math.sin(t * 3)) }}/>}
            <span ref={reg('baa')} style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:9, padding:'14px 22px', borderRadius:9999, background:'#fff', border:`1.5px solid ${baaG > 0.3 ? 'rgba(255,169,64,0.8)' : 'rgba(216,224,222,0.9)'}`, fontSize:15, fontWeight:600, color:ONB.ink, boxShadow:`0 5px 14px rgba(255,169,64,${(0.3 * baaG).toFixed(3)})`, overflow:'hidden' }}><Ix n="download" s={17} c={ONB.ink}/>Download your BAA<Sheen p={t > 118.8 && t < 119.9 ? ss(118.8, 119.9, t) : null} radius={9999} strength={0.6}/></span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:ONB.mute, marginTop:16 }}><Ix n="lock" s={14} c={ONB.mute}/>Encrypted and stored with your account records</div>
        </div>
      </div>
    </div>
  );
}
const ALERTS = [['share','New referral received','Brooke Callahan, from Dupont Circle Family Dentistry','2 min ago',ONB.green,ONB.greenSoft],['check','Status updated','Jane Smith moved to Referral Received by Capitol Smile Orthodontics','18 min ago',ONB.accent,ONB.accentSoft],['msg','New case note','Capitol Smile Orthodontics added a note on Jane Smith','20 min ago',ONB.amber,ONB.amberSoft]];
function Drawer({ t }){
  const reg = useReg();
  const p = easeOutStrong(ss(116.2, 116.75, t)) * (1 - easeInOut(ss(118.1, 118.55, t)));
  if (p <= 0.002) return null;
  return (
    <>
      <div style={{ position:'absolute', inset:0, background:'rgba(16,24,40,0.16)', opacity:p, zIndex:50 }}/>
      <div ref={reg('drawer')} style={{ position:'absolute', right:0, top:0, bottom:0, width:460, zIndex:51, ...glass(0, 0.92), borderRadius:'20px 0 0 20px', padding:'26px 26px', boxSizing:'border-box', transform:`translateX(${((1 - p) * 480).toFixed(2)}px)` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ fontSize:22, fontWeight:700, color:ONB.ink }}>Notifications</span><span style={{ fontSize:13.5, fontWeight:600, color:ONB.accent }}>Mark all read</span></div>
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:12 }}>
          {ALERTS.map((a, i) => { const e = easeOut(ss(116.55 + i * 0.12, 117.05 + i * 0.12, t)); return (
            <div key={i} style={{ display:'flex', gap:14, padding:'16px 16px', borderRadius:16, background: i === 0 ? 'rgba(235,243,255,0.8)' : 'rgba(255,255,255,0.85)', border:'1px solid rgba(232,238,248,0.95)', opacity:e, transform:`translateX(${((1 - e) * 30).toFixed(2)}px)` }}>
              <span style={{ width:40, height:40, borderRadius:12, background:a[5], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ix n={a[0]} s={18} c={a[4]} w={2.2}/></span>
              <span style={{ flex:1 }}><span style={{ display:'block', fontSize:15, fontWeight:700, color:ONB.ink }}>{a[1]}</span><span style={{ display:'block', fontSize:13.5, color:ONB.text, marginTop:3, lineHeight:1.4 }}>{a[2]}</span><span style={{ display:'block', fontSize:12, color:ONB.mute, marginTop:6 }}>{a[3]}</span></span>
              {i === 0 && <span style={{ width:9, height:9, borderRadius:'50%', background:ONB.accent, marginTop:6 }}/>}
            </div>); })}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Act 1 — navy chapter: cold open, stat wall, the crack
   ============================================================ */
function NavyBack({ t }){
  const dr = (a, sp, ph) => a * Math.sin(t * sp + ph);
  const grid = ss(8.2, 9.6, t) * (1 - ss(21.3, 22.3, t));
  const vig = 0.82 + 0.18 * Math.sin(t * 0.9);
  return (
    <div style={{ position:'absolute', inset:0, background:NAVY, overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'28%', top:'30%', width:1300, height:1300, marginLeft:-650, marginTop:-650, borderRadius:'50%', background:'radial-gradient(circle,rgba(19,67,176,0.5),transparent 62%)', transform:`translate(${dr(80,0.12,0)}px,${dr(50,0.1,1)}px)` }}/>
      <div style={{ position:'absolute', left:'76%', top:'72%', width:1200, height:1200, marginLeft:-600, marginTop:-600, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,123,242,0.28),transparent 62%)', transform:`translate(${dr(70,0.1,2)}px,${dr(46,0.13,0)}px)` }}/>
      <div style={{ position:'absolute', left:'60%', top:'18%', width:800, height:800, marginLeft:-400, marginTop:-400, borderRadius:'50%', background:'radial-gradient(circle,rgba(144,240,197,0.07),transparent 64%)', transform:`translate(${dr(60,0.09,3)}px,${dr(40,0.11,2)}px)` }}/>
      {grid > 0.002 && <div style={{ position:'absolute', inset:-200, opacity:grid,
        backgroundImage:'linear-gradient(rgba(144,180,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(144,180,255,0.075) 1px, transparent 1px)', backgroundSize:'72px 72px',
        transform:`translate(${((t * 2) % 72).toFixed(2)}px, ${((t * 2) % 72).toFixed(2)}px)`,
        WebkitMaskImage:'radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)', maskImage:'radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)' }}/>}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)', opacity:vig }}/>
    </div>
  );
}
function PaperForm({ dim }){
  const row = (l, w) => <div style={{ marginTop:18 }}><div style={{ fontSize:11, color:'#8A96A6', fontWeight:600, letterSpacing:'0.06em' }}>{l}</div><div style={{ height:2, width:w, background:'#D5DCE6', marginTop:14, borderRadius:2 }}/></div>;
  return (
    <div style={{ width:340, height:440, borderRadius:10, background:'linear-gradient(170deg,#FFFFFF,#E9EEF5)', boxShadow: dim ? '0 15px 24px rgba(0,0,0,0.5)' : '0 5px 17px rgba(24,38,58,0.07)', padding:'26px 28px', boxSizing:'border-box', filter: dim ? 'brightness(0.78)' : 'none' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10.5, letterSpacing:'0.14em', color:'#8A96A6', fontWeight:700 }}><span>FAX</span><span>PAGE 1 OF 3</span></div>
      <div style={{ fontSize:22, fontWeight:700, color:'#2A3140', marginTop:10 }}>Patient referral form</div>
      {row('PATIENT NAME', 284)}{row('DATE OF BIRTH', 150)}{row('REFERRING DENTIST', 250)}{row('REASON FOR REFERRAL', 284)}
      <div style={{ height:2, width:220, background:'#D5DCE6', marginTop:18, borderRadius:2 }}/>
      <div style={{ display:'flex', gap:16, marginTop:22 }}>{['Routine','Urgent'].map(x => <span key={x} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'#8A96A6' }}><span style={{ width:12, height:12, border:'1.5px solid #B8C2CE', borderRadius:3 }}/>{x}</span>)}</div>
    </div>
  );
}
function PaperStack({ t }){
  const pd = ss(0.25, 1.05, t);
  let y = -780 * (1 - pd * pd);
  if (t > 1.05) y = -30 * Math.sin(Math.PI * ss(1.05, 1.42, t));
  let rot = lerp(-16, -3, easeOut(ss(0.25, 1.5, t))) + (t > 1.05 ? 2.6 * Math.sin((t - 1.05) * 14) * Math.exp(-(t - 1.05) * 5) : 0);
  const sl = easeInOut(ss(2.8, 3.3, t));
  y += sl * 84; rot += sl * 5;
  const co = easeInOut(ss(3.5, 4.4, t));
  const X1 = ss(1.7, 2.05, t), X2 = ss(2.1, 2.5, t);
  const backA = easeOut(ss(2.5, 2.9, t));
  const C = [[-110, 150, -28], [70, 180, 24], [160, 110, 38], [-40, 210, -14]];
  const sheet = (k, children, base) => (
    <div key={k} style={{ position:'absolute', left:-170, top:-220, transform:`translate(${(base[0] + C[k][0] * co).toFixed(2)}px, ${(base[1] + C[k][1] * co).toFixed(2)}px) rotate(${(base[2] + C[k][2] * co).toFixed(2)}deg)`, opacity:base[3] * (1 - co * 0.25) }}>{children}</div>
  );
  return (
    <div style={{ position:'relative', width:0, height:0 }}>
      {[[-14, 104, -7], [12, 96, 5], [-4, 90, -2]].map((b, k) => sheet(k + 1, <PaperForm dim/>, [b[0], b[1] + (1 - backA) * 40, b[2], backA]))}
      {sheet(0, (
        <div style={{ position:'relative' }}>
          <PaperForm/>
          <svg width="340" height="440" viewBox="0 0 340 440" style={{ position:'absolute', left:0, top:0 }}>
            <path d="M62 96 C 130 170, 205 262, 284 356" fill="none" stroke="#F04A5C" strokeWidth="13" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - X1}/>
            <path d="M282 100 C 214 176, 140 268, 60 350" fill="none" stroke="#F04A5C" strokeWidth="13" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - X2}/>
          </svg>
        </div>
      ), [0, y, rot, ss(0.25, 0.45, t)])}
    </div>
  );
}
function PhoneRing({ t }){
  let shake = 0; const halos = [];
  [0.6, 1.6, 2.6].forEach(r => { const d = t - r; if (d >= 0 && d < 0.9) shake += 13 * Math.sin(d * 40) * Math.exp(-d * 3.4); if (d >= 0 && d < 1.3) halos.push(d / 1.3); });
  const grey = ss(3.5, 4.3, t);
  const n = t >= 3.4 ? 3 : t >= 2.4 ? 2 : t >= 1.4 ? 1 : 0;
  const nAt = [1.4, 2.4, 3.4][Math.max(0, n - 1)];
  const bp = n ? easeOutBack(ss(nAt, nAt + 0.35, t)) : 0;
  const vm = easeOutStrong(ss(3.4, 3.8, t));
  const inA = easeOut(ss(0.2, 0.7, t));
  return (
    <div style={{ position:'relative', width:0, height:0, opacity:inA }}>
      {halos.map((h, i) => <span key={i} style={{ position:'absolute', left:-110, top:-110, width:220, height:220, borderRadius:'50%', border:'3px solid rgba(240,74,92,0.7)', transform:`scale(${(1 + h * 0.9).toFixed(3)})`, opacity:(1 - h) * 0.8 }}/>)}
      <div style={{ position:'absolute', left:-110, top:-110, width:220, height:220, borderRadius:'50%', background:'linear-gradient(160deg,#FF7A8A,#F04A5C)', display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 14px 21px rgba(240,74,92,${(0.35 * (1 - grey)).toFixed(3)}), inset 0 2px 2px rgba(255,255,255,0.45)`, filter:`grayscale(${grey.toFixed(3)}) brightness(${(1 - grey * 0.35).toFixed(3)})`, transform:`rotate(${shake.toFixed(2)}deg)` }}>
        <Ix n={t >= 3.4 ? 'missed' : 'call'} s={92} c="#fff" w={1.7}/>
      </div>
      {n > 0 && <span style={{ position:'absolute', left:52, top:-118, minWidth:56, height:56, borderRadius:9999, background:'#F04A5C', border:'4px solid ' + NAVY, color:'#fff', fontSize:26, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${bp.toFixed(3)})` }}>{n}</span>}
      <div style={{ position:'absolute', left:-300, width:600, top:150, textAlign:'center', fontSize:26, fontWeight:500, display:'grid' }}>
        <span style={{ gridArea:'1/1', color:'rgba(255,255,255,0.75)', opacity:1 - vm, filter: vm > 0.01 ? `blur(${(vm * 8).toFixed(2)}px)` : 'none' }}>Calling Georgetown Gum Specialists</span>
        {vm > 0 && <span style={{ gridArea:'1/1', color:'rgba(255,255,255,0.55)', opacity:vm, filter: vm < 0.99 ? `blur(${((1 - vm) * 8).toFixed(2)}px)` : 'none' }}>No answer. Forwarded to voicemail</span>}
      </div>
    </div>
  );
}
function Shards({ t }){
  const out = [];
  for (let i = 0; i < 120; i++) {
    const side = i % 2;
    const ox = 960 + (side ? 1 : -1) * (10 + hash(i) * 170), oy = 500 + (hash(i + 7) - 0.5) * 320;
    const ang = hash(i + 3) * Math.PI * 2, sp = 160 + hash(i + 11) * 560;
    const pe = easeOut(ss(5.55, 6.4, t));
    const ex = ox + Math.cos(ang) * sp * pe, ey = oy + Math.sin(ang) * sp * pe;
    const tx = 960 + (hash(i + 19) - 0.5) * 1260, ty = 512 + (hash(i + 23) - 0.5) * 80;
    const d0 = 6.1 + hash(i + 5) * 0.4;
    const cv = easeInOut(ss(d0, d0 + 0.75, t));
    const x = lerp(ex, tx, cv), y = lerp(ey, ty, cv);
    const rot = (hash(i + 29) - 0.5) * 760 * pe * (1 - cv);
    const s = (6 + hash(i + 31) * 18) * lerp(1, 0.35, cv);
    const col = side ? (i % 5 === 0 ? '#F04A5C' : 'rgba(190,200,215,0.95)') : (i % 6 === 0 ? '#F04A5C' : '#FFFFFF');
    const op = ss(5.52, 5.6, t) * (1 - ss(0.55, 1, cv));
    if (op <= 0.01) continue;
    out.push(<span key={i} style={{ position:'absolute', left:x, top:y, width:s, height:s * (0.6 + hash(i + 37) * 0.8), borderRadius:2, background:col, opacity:op, transform:`translate(-50%,-50%) rotate(${rot.toFixed(1)}deg)`, boxShadow: side ? 'none' : '0 0 8px rgba(255,255,255,0.35)' }}/>);
  }
  const flash = Math.max(0, 1 - Math.abs(t - 5.6) / 0.35);
  return <>{flash > 0 && <div style={{ position:'absolute', left:960, top:500, width:900, height:900, marginLeft:-450, marginTop:-450, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.35),transparent 60%)', opacity:flash }}/>}{out}</>;
}
function ColdOpen({ t }){
  const g = ss(4.6, 5.6, t), gE = g * g * g;
  const shatter = t >= 5.55;
  const lx = lerp(560, 890, gE), rx = lerp(1360, 1030, gE), gs = lerp(1, 0.5, gE);
  const mb = gE * 10;
  return (
    <div style={{ position:'absolute', inset:0 }}>
      {!shatter && <div style={{ position:'absolute', left:lx, top:500, transform:`scale(${gs.toFixed(4)})`, filter: mb > 0.3 ? `blur(${mb.toFixed(2)}px)` : 'none' }}><PaperStack t={t}/></div>}
      {!shatter && <div style={{ position:'absolute', left:rx, top:470, transform:`scale(${gs.toFixed(4)})`, filter: mb > 0.3 ? `blur(${mb.toFixed(2)}px)` : 'none' }}><PhoneRing t={t}/></div>}
      {t > 5.5 && t < 7.6 && <Shards t={t}/>}
      {t > 6.5 && <div style={{ position:'absolute', left:0, right:0, top:462 }}>
        <BlurLine t={t} t0={6.75} tOut={7.85} stagger={0.06} items={['One','in','three','dental','referrals', <span style={{ color:'#FF7B8B' }}>fails</span>, <span style={{ color:'#FF7B8B' }}>to</span>, <span style={{ color:'#FF7B8B' }}>close.</span>]}
          style={{ fontSize:76, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.1 }}/>
      </div>}
    </div>
  );
}
const STATS = [
  { t0:8.8, num:v => Math.round(34 * v) + '%', label:['of','referrals','go','missing'], bar:'#F04A5C' },
  { t0:12.6, pre:'Under', num:v => Math.round(2 * v) + '%', label:['of','practices','use','dedicated','tools'], bar:'#FFA940' },
  { t0:16.2, word:'Weeks', label:['of','lost','care,','lost','revenue,','lost','trust'], bar:'#3E8EFF' },
];
function StatWall({ t }){
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:64 }}>
      {STATS.map((s, i) => {
        const a = easeOutStrong(ss(s.t0, s.t0 + 0.85, t));
        const nx = STATS[i + 1];
        const dim = nx ? lerp(1, 0.42, easeInOut(ss(nx.t0, nx.t0 + 0.6, t))) * 1 : 1;
        const dimF = lerp(dim, 1, easeInOut(ss(19.4, 20.0, t)));
        const out = easeInOut(ss(21.1 + i * 0.08, 21.8 + i * 0.08, t));
        const v = eExpo(ss(s.t0 + 0.25, s.t0 + 2.1, t));
        const op = a * dimF * (1 - out);
        const bl = (1 - a) * 16 + out * 16;
        return (
          <div key={i} style={{ position:'relative', width:500, height:420, borderRadius:30, padding:'48px 46px', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'flex-end',
            background:'linear-gradient(160deg,rgba(255,255,255,0.10),rgba(255,255,255,0.025))', border:'1.5px solid rgba(255,255,255,0.14)',
            boxShadow:'inset 0 1.5px 1px rgba(255,255,255,0.2), 0 18px 27px rgba(0,0,0,0.35)', backdropFilter:'blur(24px) saturate(140%)', WebkitBackdropFilter:'blur(24px) saturate(140%)',
            opacity:op, filter: bl > 0.3 ? `blur(${bl.toFixed(2)}px)` : 'none', transform:`translateY(${((1 - a) * 34).toFixed(2)}px) scale(${(1 - out * 0.03).toFixed(4)})` }}>
            <LiquidSheen radius={30} period={9} phase={i * 0.3} strength={0.18}/>
            {s.pre && <div style={{ fontSize:40, fontWeight:500, color:'rgba(255,255,255,0.72)', marginBottom:-6 }}>{s.pre}</div>}
            <div style={{ fontSize: s.word ? 128 : 156, fontWeight:700, color:'#fff', letterSpacing:'-0.045em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
              {s.word ? <span style={{ display:'inline-block', ...bi(t, s.t0 + 0.2, 0.9) }}>{s.word}</span> : s.num(v)}
            </div>
            <div style={{ width:64, height:5, borderRadius:5, background:s.bar, margin:'26px 0 22px', transform:`scaleX(${easeOut(ss(s.t0 + 0.4, s.t0 + 1.1, t)).toFixed(4)})`, transformOrigin:'left' }}/>
            <BlurLine t={t} t0={s.t0 + 0.5} stagger={0.03} dur={0.6} items={s.label} style={{ justifyContent:'flex-start', fontSize:32, fontWeight:500, color:'rgba(255,255,255,0.86)', lineHeight:1.25, letterSpacing:'-0.01em' }}/>
          </div>
        );
      })}
    </div>
  );
}
function Navy({ t }){
  const split = easeInOut(ss(23.15, 24.35, t));
  const inner = <><NavyBack t={t}/>{t < 8.6 && <ColdOpen t={t}/>}{t > 8.6 && t < 22.2 && <StatWall t={t}/>}</>;
  const lineP = easeInOut(ss(22.0, 23.1, t));
  const lineA = 1 - ss(23.2, 23.7, t);
  const line = t >= 22 && lineA > 0 && (
    <div style={{ position:'absolute', left:0, top:538, width:1920, height:4, opacity:lineA, zIndex:3 }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:(lineP * 100) + '%', background:'#3E8EFF', boxShadow:'0 0 18px rgba(62,142,255,0.8)' }}/>
      {lineP < 1 && <div style={{ position:'absolute', left:`calc(${lineP * 100}% - 180px)`, top:0, width:190, height:4, background:'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95))' }}/>}
    </div>
  );
  if (split <= 0) return <div style={{ position:'absolute', inset:0 }}>{inner}{line}</div>;
  return (
    <>
      <div style={{ position:'absolute', inset:0, clipPath:'inset(0 0 540px 0)', transform:`translateY(${(-split * 620).toFixed(2)}px)` }}>{inner}</div>
      <div style={{ position:'absolute', inset:0, clipPath:'inset(540px 0 0 0)', transform:`translateY(${(split * 620).toFixed(2)}px)` }}>{inner}</div>
      {line}
    </>
  );
}

/* ---------- lockup (brand moment + end card) ---------- */
const MARK = 104, LGAP = 26, WORD_W = Math.round(68 * 800 / 158);
function LockupMark({ L, L0 }){
  const markIn = clamp((L - (L0 + 0.25)) / 0.95), mE = easeOut(markIn);
  const slide = easeInOut(clamp((L - (L0 + 1.15)) / 0.85));
  const shiftX = (MARK + LGAP + WORD_W) / 2 - MARK / 2;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:LGAP }}>
      <div style={{ position:'relative', zIndex:2, flexShrink:0, opacity:clamp(mE * 1.3), filter: mE < 0.99 ? `blur(${((1 - mE) * 14).toFixed(2)}px)` : 'none',
        transform:`translateX(${(shiftX * (1 - slide)).toFixed(2)}px) rotate(${((1 - mE) * -200).toFixed(2)}deg) scale(${(0.35 + 0.65 * easeOutBack(markIn)).toFixed(4)})` }}><Logo s={MARK}/></div>
      <div style={{ flexShrink:0 }}><WordmarkRise h={68} local={L} at={L0 + 1.45}/></div>
    </div>
  );
}
function BrandLockup({ t }){
  const L = t - 22, L0 = 1.9;
  const outA = easeInOut(ss(29.9, 30.5, t));
  const h = easeInOut(ss(30.2, 31.1, t));
  const fade = 1 - ss(31.0, 31.15, t);
  const cx = lerp(960, 324.5, h), cy = lerp(470, 108, h), sc = lerp(1, 0.323, h);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:30 }}>
      <div style={{ position:'absolute', left:cx, top:cy, transform:`translate(-50%,-50%) scale(${sc.toFixed(4)})`, opacity:fade }}>
        <LockupMark L={L} L0={L0}/>
      </div>
      {outA < 1 && <div style={{ position:'absolute', left:0, right:0, top:574, opacity:1 - outA }}><ForwardLine p={easeInOut(ss(L0 + 0.1, L0 + 1.8, L))} t={L}/></div>}
      {outA < 1 && <div style={{ position:'absolute', left:0, right:0, top:622 }}>
        <BlurLine t={L} t0={L0 + 2.3} tOut={7.9} stagger={0.1} items={['Your','Link','to','Better','Patient','Care']} style={{ fontSize:34, fontWeight:500, color:ONB.text, letterSpacing:'-0.01em' }}/>
      </div>}
    </div>
  );
}

/* ============================================================
   Maps — real geometry (world-atlas 110m, Albers)
   ============================================================ */
const GEO = { st:0, subs:new Set(), data:null };
// d3.geoAlbers re-implemented (conic equal-area, parallels 29.5/45.5, rotate 96°, center [-0.6, 38.7]) so the map needs no CDN.
function albers(scale, tr){
  const R = Math.PI / 180, p0 = 29.5 * R, p1 = 45.5 * R;
  const n = (Math.sin(p0) + Math.sin(p1)) / 2, c = 1 + Math.sin(p0) * (2 * n - Math.sin(p0)), r0 = Math.sqrt(c) / n;
  const raw = (l, p) => { const r = Math.sqrt(c - 2 * n * Math.sin(p)) / n; return [r * Math.sin(l * n), r0 - r * Math.cos(l * n)]; };
  const ctr = raw(-0.6 * R, 38.7 * R);
  return ll => { let l = (ll[0] + 96) * R; if (l > Math.PI) l -= 2 * Math.PI; if (l < -Math.PI) l += 2 * Math.PI; const q = raw(l, ll[1] * R); return [tr[0] + scale * (q[0] - ctr[0]), tr[1] - scale * (q[1] - ctr[1])]; };
}
function useGeo(){
  const [, f] = useState(0);
  useEffect(() => {
    if (GEO.data) return;
    const s = () => f(v => v + 1); GEO.subs.add(s);
    const go = () => {
      const g = window.CL_GEO;
      if (!g) { setTimeout(go, 100); return; }
      GEO.data = { proj: albers(g.scale, g.translate), paths: g.paths };
      GEO.subs.forEach(fn => fn());
    };
    if (!GEO.st) { GEO.st = 1; go(); }
    return () => GEO.subs.delete(s);
  }, []);
  return GEO.data;
}
const baseXY = ll => GEO.data ? (() => { const p = GEO.data.proj(ll); return { x:p[0], y:p[1] }; })() : { x:960 + (ll[0] + 96) * 26.6, y:640 - (ll[1] - 38) * 33 };
const HOME_P = { n:'Capital Root Canal Center', ll:[-77.0230, 38.8960] };
const DCP = [
  { n:'Georgetown Gum Specialists', ll:[-77.0654, 38.9097], s:'l' },
  { n:'Dupont Circle Family Dentistry', ll:[-77.0434, 38.9096], s:'t' },
  { n:'DC Precision Endodontics', ll:[-77.0217, 38.9127], s:'r' },
  { n:'Capitol Smile Orthodontics', ll:[-76.9905, 38.8899], s:'r' },
  { n:'Washington Surgical Oral Center', ll:[-77.0240, 38.8790], s:'l' },
  { n:'Little Smiles Pediatric Dentistry', ll:[-77.0950, 38.8870], s:'b' },
  { n:'Mosaic Dental Studio', ll:[-77.0327, 38.9283], s:'t' },
  { n:'District Braces Studio', ll:[-77.0035, 38.8765], s:'b' },
  { n:'My Bright Smile', ll:[-76.9940, 38.9330], s:'r' },
];
const METRO = [[-77.1003,38.9807],[-77.0261,38.9907],[-77.0469,38.8048],[-77.2311,38.9187],[-77.1528,39.0840],[-76.9369,38.9807],[-77.3570,38.9586],[-76.7302,38.9426],[-76.4922,38.9784],[-77.3064,38.8462],[-76.6122,39.2904],[-77.4360,38.3032]];
const CITIES = [['New York',-74.01,40.71,1],['Boston',-71.06,42.36,1],['Charlotte',-80.84,35.23,0],['Pittsburgh',-79.99,40.44,0],['Atlanta',-84.39,33.75,1],['Nashville',-86.78,36.16,0],['Detroit',-83.05,42.33,0],['Chicago',-87.63,41.88,1],['Orlando',-81.38,28.54,0],['Miami',-80.19,25.76,1],['St. Louis',-90.2,38.63,0],['Minneapolis',-93.27,44.98,0],['Dallas',-96.8,32.78,1],['Houston',-95.37,29.76,0],['Austin',-97.74,30.27,0],['Denver',-104.99,39.74,1],['Phoenix',-112.07,33.45,0],['Salt Lake City',-111.89,40.76,0],['Los Angeles',-118.24,34.05,1],['San Francisco',-122.42,37.77,1],['Portland',-122.68,45.52,0],['Seattle',-122.33,47.61,1]];
const LINKS = [['New York','Boston'],['Chicago','Minneapolis'],['Chicago','Denver'],['Dallas','Houston'],['Dallas','Austin'],['Denver','Salt Lake City'],['Salt Lake City','San Francisco'],['Los Angeles','San Francisco'],['San Francisco','Portland'],['Portland','Seattle'],['Phoenix','Los Angeles'],['Atlanta','Miami'],['Atlanta','Dallas'],['Nashville','St. Louis'],['Chicago','Detroit']];
function arcD(a, b, bend = 0.2){
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx + nx * len * bend).toFixed(1)} ${(my + ny * len * bend).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}
function qPoint(a, b, u, bend = 0.2){
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
  const cx = mx + nx * len * bend, cy = my + ny * len * bend;
  return { x:(1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x, y:(1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b.y };
}
function MapPin({ x, y, a, home, label, side, labelA, t, ph }){
  if (a <= 0.004) return null;
  const s = home ? 44 : 30;
  const pulse = ((t * 0.45 + ph) % 1);
  const lp = { l:{ right:s / 2 + 12, top:'50%', transform:'translateY(-50%)' }, r:{ left:s / 2 + 12, top:'50%', transform:'translateY(-50%)' }, t:{ bottom:s / 2 + 12, left:'50%', transform:'translateX(-50%)' }, b:{ top:s / 2 + 12, left:'50%', transform:'translateX(-50%)' } }[side || 'b'];
  return (
    <div style={{ position:'absolute', left:x, top:y, width:0, height:0, zIndex: home ? 4 : 3 }}>
      <span style={{ position:'absolute', left:-s, top:-s, width:s * 2, height:s * 2, boxSizing:'border-box', borderRadius:'50%', border:`2px solid rgba(62,142,255,${(0.5 * (1 - pulse)).toFixed(3)})`, transform:`scale(${(0.5 + pulse * 1.3).toFixed(3)})`, opacity:a }}/>
      <span style={{ position:'absolute', left:-s / 2, top:-s / 2, width:s, height:s, borderRadius:'50%', background:'linear-gradient(145deg,#FFFFFF 0%,#F1F4F9 100%)', boxShadow:'-6px -6px 14px rgba(255,255,255,0.95), 7px 8px 16px rgba(142,158,186,0.38), inset 1px 1px 1px rgba(255,255,255,1), inset -1px -1px 2px rgba(190,200,220,0.35)', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${easeOutBack(clamp(a)).toFixed(3)})` }}>
        {home ? <PracticeLogo s={36}/> : <span style={{ width:12, height:12, borderRadius:'50%', background:'linear-gradient(160deg,#6AA8FF,#2F7DF5)' }}/>}
      </span>
      {label && labelA > 0.01 && <span style={{ position:'absolute', ...lp, whiteSpace:'nowrap', padding: home ? '9px 16px' : '7px 13px', borderRadius:9999, background:'rgba(255,255,255,0.94)', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 4px 12px rgba(24,38,58,0.1)', fontSize: home ? 16 : 14, fontWeight: home ? 700 : 600, color:ONB.ink, opacity:labelA * a }}>{label}</span>}
    </div>
  );
}
function MapScene({ t, mode }){
  const geo = useGeo();
  const pH = baseXY(HOME_P.ll);
  const pts = DCP.map(p => baseXY(p.ll));
  const xs = pts.concat([pH]).map(p => p.x), ys = pts.concat([pH]).map(p => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs) || 1, spanY = Math.max(...ys) - Math.min(...ys) || 1;
  const K = Math.min(1180 / spanX, 700 / spanY);
  const F = mode === 'net' ? { x:960, y:600 } : { x:960, y:560 };
  let k, C, env, T0;
  if (mode === 'net') {
    T0 = 100.4;
    const mdx = Math.max(...pts.map(p => Math.abs(p.x - pH.x))) || 1, mdy = Math.max(...pts.map(p => Math.abs(p.y - pH.y))) || 1;
    k = Math.min(860 / mdx, 390 / mdy) * lerp(1, 1.05, ss(100.4, 105.2, t));
    C = pH;
    env = 1;
  } else {
    T0 = 134.0;
    const u = easeInOut(ss(134.3, 139.6, t));
    const K0 = K * 0.14;
    k = Math.exp(lerp(Math.log(K0), 0, u));
    const w = u * u / k;
    C = { x:pH.x + (F.x - pH.x) * w, y:pH.y + (F.y - pH.y) * w };
    env = win(t, 134.0, 142.3, 0.6, 0.6);
  }
  if (env <= 0.002) return null;
  const S = p => ({ x:F.x + (p.x - C.x) * k, y:F.y + (p.y - C.y) * k });
  const sh = S(pH);
  const net = mode === 'net';
  const T3 = !net, g3 = easeInOut(ss(134.3, 140.2, t));
  const tilt = T3 ? lerp(14, 50, g3) : 0, rz = T3 ? lerp(-12, -4, g3) : 0, sc3 = T3 ? lerp(1.04, 1.2, g3) : 1;
  const TOP = 24, EXT = [10];
  const usP = geo && geo.paths.find(p => p.id === '840');
  const gT = `translate(${F.x + 240} ${F.y + 210}) scale(${k}) translate(${-C.x} ${-C.y})`;
  const bill = T3 ? `translateZ(${TOP + 12}px) rotateZ(${-rz}deg) rotateX(${-tilt}deg)` : 'none';
  const SVB = { position:'absolute', left:-240, top:-210 };
  const partnerA = i => { const d = Math.hypot(S(pts[i]).x - sh.x, S(pts[i]).y - sh.y); const at = (net ? 101.0 : 134.6) + d / 1100; return easeOut(ss(at, at + 0.45, t)); };
  const labelA = 1;
  const grid = ss(12, 60, k);
  const blur = (1 - env) * 14;
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#FFFFFF', opacity:env }}>
      <div style={{ position:'absolute', inset:0, transformStyle:'preserve-3d', transformOrigin:`${F.x}px ${F.y}px`, transform: T3 ? `perspective(1700px) rotateX(${tilt.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${sc3.toFixed(4)})` : 'none' }}>
      <svg width="2400" height="1500" style={{ ...SVB, transform: T3 ? 'translateZ(-6px)' : 'none' }}>
        <g transform={gT}>
          {geo && geo.paths.map(p => (T3 && p.id === '840') ? null : <path key={p.id} d={p.d} fill={p.id === '840' ? '#EDF1F6' : '#F6F8FB'} stroke="rgba(255,255,255,0.95)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>)}
        </g>
      </svg>
      {T3 && usP && EXT.map(d => <svg key={'x' + d} width="2400" height="1500" style={{ ...SVB, transform:`translateZ(${d}px)` }}><g transform={gT}><path d={usP.d} fill="#CDD5E0" stroke="#CDD5E0" strokeWidth="14" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></g></svg>)}
      {T3 && usP && <svg width="2400" height="1500" style={{ ...SVB, transform:`translateZ(${TOP}px)` }}><defs><linearGradient id="usTop" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#FFFFFF"/><stop offset="1" stopColor="#EAEFF5"/></linearGradient></defs><g transform={gT}><path d={usP.d} fill="url(#usTop)" stroke="rgba(255,255,255,1)" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/></g></svg>}
      {grid > 0.01 && <div style={{ position:'absolute', inset:0, opacity:grid * 0.9, backgroundImage:'radial-gradient(rgba(62,142,255,0.16) 1.5px, transparent 1.6px)', backgroundSize:'28px 28px', backgroundPosition:`${(-C.x * 0.0).toFixed(1)}px 0px` }}/>}
      {!T3 && <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 70% at 50% 55%, transparent 55%, rgba(255,255,255,0.75) 100%)' }}/>}
      <svg width="1920" height="1080" style={{ position:'absolute', left:0, top:0, overflow:'visible', transform: T3 ? `translateZ(${TOP + 8}px)` : 'none' }}>
        <defs><linearGradient id="arcG" x1="0" x2="1"><stop stopColor="#3E8EFF"/><stop offset="0.6" stopColor="#5BC6E8"/><stop offset="1" stopColor="#90F0C5"/></linearGradient></defs>
        {net && pts.map((p, i) => { const s = S(p); const st = 101.5 + i * 0.12; const dp = easeInOut(ss(st, st + 0.8, t)); if (dp <= 0) return null; return <path key={'l' + i} d={arcD(sh, s, 0.18)} fill="none" stroke={net ? 'url(#arcG)' : '#3E8EFF'} strokeOpacity={net ? 0.75 : 0.55 * (1 - ss(137.5, 139, t) * 0.5)} strokeWidth={net ? 2 : 2.5} strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - dp}/>; })}
        {!net && CITIES.map((c, i) => { const s = S(baseXY([c[1], c[2]])); const st = 135.3 + i * 0.13; const dp = easeInOut(ss(st, st + 1.1, t)); if (dp <= 0) return null; return <path key={'c' + i} d={arcD(sh, s, 0.2)} fill="none" stroke="url(#arcG)" strokeOpacity="0.8" strokeWidth="2.2" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - dp}/>; })}
        {!net && LINKS.map((l, i) => { const a = CITIES.find(c => c[0] === l[0]), b = CITIES.find(c => c[0] === l[1]); const st = 139.0 + i * 0.09; const dp = easeInOut(ss(st, st + 0.8, t)); if (dp <= 0) return null; return <path key={'k' + i} d={arcD(S(baseXY([a[1], a[2]])), S(baseXY([b[1], b[2]])), 0.18)} fill="none" stroke="#90F0C5" strokeOpacity="0.75" strokeWidth="1.8" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - dp}/>; })}
        <defs><filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>
        {net && pts.map((p, i) => { const st = 102.3 + i * 0.23; if (t < st) return null; const u = ((t - st) / 2.4) % 1; const o = Math.sin(Math.PI * clamp(u * 1.25)); const d = arcD(sh, S(p), 0.18); const off = 0.12 - u * 1.25; return <g key={'d' + i} opacity={o}><path d={d} fill="none" stroke="#90F0C5" strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="0.12 1.2" strokeDashoffset={off} filter="url(#arcGlow)"/><path d={d} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="0.06 1.2" strokeDashoffset={off - 0.03}/></g>; })}
      </svg>
      {net && pts.map((p, i) => { const s = S(p); return <MapPin key={i} x={s.x} y={s.y} a={partnerA(i)} label={DCP[i].n} side={DCP[i].s} labelA={labelA} t={t} ph={i * 0.13}/>; })}
      {!net && CITIES.map((c, i) => { const s = S(baseXY([c[1], c[2]])); const st = 135.3 + i * 0.13 + 0.95; const a = easeOutStrong(ss(st, st + 0.45, t)); if (a <= 0.01) return null; const big = c[3] === 1; const z = big ? 46 : 34; return (
        <div key={'cp' + i} style={{ position:'absolute', left:s.x, top:s.y, width:0, height:0, zIndex:3, transformOrigin:'0 0', transform:bill }}>
          <span style={{ position:'absolute', left:-1, top:-(big ? 34 : 24), width:2, height:(big ? 34 : 24) * a, borderRadius:2, background:'linear-gradient(180deg,#3E8EFF,rgba(62,142,255,0.15))' }}/>
          <span style={{ position:'absolute', left:-z / 2, top:-z / 2 - (big ? 34 : 24), width:z, height:z, borderRadius:'50%', background:'linear-gradient(145deg,#FFFFFF 0%,#F1F4F9 100%)', boxShadow:'-6px -6px 14px rgba(255,255,255,0.95), 7px 8px 16px rgba(142,158,186,0.38), inset 1px 1px 1px rgba(255,255,255,1), inset -1px -1px 2px rgba(190,200,220,0.35)', display:'flex', alignItems:'center', justifyContent:'center', opacity:a, filter: a < 0.99 ? `blur(${((1 - a) * 6).toFixed(2)}px)` : 'none', transform:`scale(${(0.6 + 0.4 * easeOutBack(a)).toFixed(3)})` }}><Logo s={Math.round(z * 0.6)}/></span>
          {big && <span style={{ position:'absolute', left:z / 2 + 12, top:-14 - 34, padding:'4px 10px', borderRadius:9999, background:'rgba(255,255,255,0.94)', boxShadow:'0 4px 12px rgba(24,38,58,0.08)', fontSize:15, fontWeight:600, color:ONB.ink, whiteSpace:'nowrap', opacity:clamp(a) }}>{c[0]}</span>}
        </div>); })}
      {!net && (() => { const a = easeOutStrong(ss(134.2, 134.8, t)); return (
        <div style={{ position:'absolute', left:sh.x, top:sh.y, width:0, height:0, zIndex:10, transformOrigin:'0 0', transform: T3 ? `translateZ(${TOP + 14}px) rotateZ(${-rz}deg) rotateX(${-tilt}deg)` : 'none' }}>
          <span style={{ position:'absolute', left:-1.5, top:-48, width:3, height:48 * a, borderRadius:2, background:'linear-gradient(180deg,#3E8EFF,rgba(62,142,255,0.15))' }}/>
          <span style={{ position:'absolute', left:-40, top:-40 - 48, width:80, height:80, borderRadius:'50%', background:'linear-gradient(145deg,#FFFFFF 0%,#F1F4F9 100%)', boxShadow:'-6px -6px 14px rgba(255,255,255,0.95), 7px 8px 16px rgba(142,158,186,0.38), inset 1px 1px 1px rgba(255,255,255,1), inset -1px -1px 2px rgba(190,200,220,0.35)', display:'flex', alignItems:'center', justifyContent:'center', opacity:a, transform:`scale(${(0.6 + 0.4 * easeOutBack(a)).toFixed(3)})` }}><Logo s={44}/></span>
          <span style={{ position:'absolute', top:-18 - 48, left:50, transform:'none', whiteSpace:'nowrap', padding:'6px 14px', borderRadius:9999, background:'rgba(255,255,255,0.95)', boxShadow:'0 6px 16px rgba(24,38,58,0.1)', fontSize:17, fontWeight:700, color:ONB.ink, opacity:a }}>Washington, DC</span>
        </div>); })()}
      {net && <MapPin x={sh.x} y={sh.y} a={easeOut(ss(100.7, 101.1, t))} home label={HOME_P.n} side="b" labelA={1} t={t} ph={0}/>}
      </div>
      {T3 && <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 62% 58% at 50% 56%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.7) 72%, #FFFFFF 96%)' }}/>}
      {!net && <div style={{ position:'absolute', inset:0 }}>
        <Kin t={t} t0={134.6} t1={141.7} y={-380} size={88} same w={1300} eyebrow="Starting in" lines={[[E('Washington,'), E('DC.')]]}/>
        <div style={{ position:'absolute', left:0, right:0, top:262 }}><BlurLine t={t} t0={137.0} tOut={141.7} stagger={0.05} dur={0.6} items={'Growing to every practice that wants a simpler way to work together.'.split(' ')} style={{ fontSize:34, fontWeight:500, color:ONB.text, letterSpacing:'-0.01em' }}/></div>
      </div>}
    </div>
  );
}

/* ============================================================
   Act 3 — pricing and end card
   ============================================================ */
function Pricing({ t }){
  const L = t - 120;
  if (L < 0 || L > 14.2) return null;
  const out = easeInOut(ss(13.2, 13.9, L));
  const panel = (side, d, bg, children) => {
    const p = spring(ss(0.3 + d, 1.6 + d, L));
    const s = side === 'l' ? -1 : 1;
    return (
      <div style={{ position:'relative', width:700, height:540, borderRadius:34, overflow:'hidden', background:bg, border:'1.5px solid rgba(255,255,255,0.95)', padding:'58px 56px', boxSizing:'border-box', display:'flex', flexDirection:'column',
        boxShadow:'0 18px 30px rgba(24,38,58,0.12), inset 0 2px 1px rgba(255,255,255,0.98)',
        transform:`translateX(${(s * (1 - p) * 560).toFixed(2)}px) rotateY(${(-s * (1 - p) * 24).toFixed(2)}deg) scale(${(1 - out * 0.03).toFixed(4)})`,
        opacity:clamp(p * 1.8) * (1 - out), filter: out > 0.01 ? `blur(${(out * 14).toFixed(2)}px)` : 'none' }}>
        <LiquidSheen radius={34} period={8} phase={side === 'l' ? 0.1 : 0.55} strength={0.4}/>
        {children}
      </div>
    );
  };
  const freeP = easeOutBack(ss(1.2, 1.7, L));
  const pulse = 1 + 0.018 * Math.sin((L - 1.7) * 2.6) * ss(1.8, 2.4, L);
  const price = Math.round(299 * eQuint(ss(1.5, 3.0, L)));
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:56, perspective:1800 }}>
      {panel('l', 0, 'linear-gradient(150deg,#E6FAF1 0%,#F2FBF3 50%,#FFF4E6 100%)', <>
        <div style={{ fontSize:17, fontWeight:700, letterSpacing:'0.12em', color:'#12925A', ...fu(L, 0.9) }}>FOR GENERAL AND PEDIATRIC DENTISTS</div>
        <div style={{ marginTop:'auto' }}>
          <span style={{ display:'inline-flex', alignItems:'center', height:150, padding:'0 64px', borderRadius:9999, background:'linear-gradient(160deg,#3FD990,#1EB36B)', color:'#fff', fontSize:96, fontWeight:700, letterSpacing:'-0.03em',
            boxShadow:'0 11px 20px rgba(34,201,122,0.35), inset 0 2px 1px rgba(255,255,255,0.4)', transform:`scale(${(freeP * pulse).toFixed(4)})`, transformOrigin:'left center', opacity:clamp(freeP * 2) }}>Free</span>
        </div>
        <BlurLine t={L} t0={1.9} stagger={0.08} items={['Send','and','receive','referrals.']} style={{ justifyContent:'flex-start', fontSize:38, fontWeight:600, color:ONB.ink, letterSpacing:'-0.015em', marginTop:36 }}/>
      </>)}
      {panel('r', 0.15, 'linear-gradient(150deg,#EBF3FF 0%,#EEF6FF 45%,#E6FAF1 100%)', <>
        <div style={{ fontSize:17, fontWeight:700, letterSpacing:'0.12em', color:'#2F7DF5', ...fu(L, 1.05) }}>FOR SPECIALISTS</div>
        <div style={{ marginTop:'auto', display:'flex', alignItems:'baseline', gap:14, ...bi(L, 1.3, 0.6) }}>
          <span style={{ fontSize:140, fontWeight:700, color:ONB.ink, letterSpacing:'-0.05em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>${price}</span>
          <span style={{ fontSize:40, fontWeight:500, color:ONB.text }}>/ month</span>
        </div>
        <BlurLine t={L} t0={3.2} stagger={0.07} items={['One','additional','referral','pays','for','the','year.']} style={{ justifyContent:'flex-start', fontSize:38, fontWeight:600, color:ONB.ink, letterSpacing:'-0.015em', marginTop:36 }}/>
      </>)}
    </div>
  );
}
function EndScene({ t }){
  const L = t - 142, L0 = 0.2;
  if (L < -0.3) return null;
  const inA = ss(-0.2, 0.5, L);
  const cta = easeOutStrong(ss(3.6, 4.3, L));
  const url = easeOutStrong(ss(3.45, 4.1, L));
  const bp = ss(6.2, 6.9, L), bump = Math.sin(Math.PI * bp);
  return (
    <div style={{ position:'absolute', inset:0, opacity:inA }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 55% at 50% 48%, #FFFFFF 0%, rgba(255,255,255,0.95) 42%, rgba(255,255,255,0) 100%)' }}/>
      <div style={{ position:'absolute', left:960, top:392, transform:'translate(-50%,-50%)' }}><LockupMark L={L} L0={L0}/></div>
      <div style={{ position:'absolute', left:0, right:0, top:494 }}><ForwardLine p={easeInOut(ss(L0 + 0.1, L0 + 1.8, L))} t={L}/></div>
      <div style={{ position:'absolute', left:0, right:0, top:540 }}>
        <BlurLine t={L} t0={L0 + 2.3} stagger={0.1} items={['Your','Link','to','Better','Patient','Care']} style={{ fontSize:34, fontWeight:500, color:ONB.text, letterSpacing:'-0.01em' }}/>
      </div>
      <div style={{ position:'absolute', left:0, right:0, top:646, display:'flex', flexDirection:'column', alignItems:'center', gap:26 }}>
        <span style={{ fontSize:28, fontWeight:600, color:ONB.accent, letterSpacing:'-0.01em', opacity:url, filter: url < 0.99 ? `blur(${((1 - url) * 10).toFixed(2)}px)` : 'none' }}>caselink.net</span>
        <div style={{ position:'relative', opacity:cta, transform:`translateY(${((1 - cta) * 14).toFixed(2)}px) scale(${(1 + bump * 0.05).toFixed(4)})` }}>
          {bump > 0.01 && <span style={{ position:'absolute', left:'10%', right:'10%', bottom:-14, height:26, borderRadius:'50%', background:'linear-gradient(90deg,#3E8EFF,#90F0C5,#FFC794)', filter:'blur(18px)', opacity:bump * 0.7 }}/>}
          <span style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:12, padding:'22px 44px', borderRadius:9999, background:'linear-gradient(160deg,#2A3130,#141918)', color:'#fff', fontSize:24, fontWeight:600,
            boxShadow:'0 9px 18px rgba(26,31,30,0.28), inset 0 1.5px 1px rgba(255,255,255,0.3)', overflow:'hidden' }}>Start free today<Ic n="arrowR" s={20} c="#fff" w={2.2}/>
            <Sheen p={L > 6.1 && L < 7.1 ? ss(6.1, 7.1, L) : null} radius={9999} strength={0.45}/>
          </span>
        </div>
      </div>
    </div>
  );
}
function WhiteBg({ t }){
  const prod = ss(30.6, 32.0, t) * (1 - ss(119.8, 120.6, t));
  const wash = 1 - ss(30.6, 32.0, t);
  const blobs = [
    { c:'rgba(62,142,255,0.18)', s:1300, cx:14, cy:20, ax:10, ay:8, sp:0.05, ph:0 },
    { c:'rgba(144,240,197,0.22)', s:1400, cx:86, cy:78, ax:10, ay:8, sp:0.041, ph:1.9 },
    { c:'rgba(255,199,148,0.2)', s:1150, cx:80, cy:12, ax:9, ay:8, sp:0.058, ph:3.4 },
    { c:'rgba(62,142,255,0.1)', s:1000, cx:12, cy:88, ax:9, ay:7, sp:0.047, ph:5.1 },
  ];
  return (
    <div style={{ position:'absolute', inset:0, background:'#FFFFFF', overflow:'hidden' }}>
      {t < 22.8 ? null : <>
        {wash > 0.002 && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,#FFF4E6,#E6FAF1 50%,#EBF3FF)', opacity:wash * 0.8 }}/>}
        {blobs.map((b, i) => { const x = b.cx + b.ax * Math.sin(t * b.sp * 2 * Math.PI + b.ph), y = b.cy + b.ay * Math.cos(t * b.sp * 2 * Math.PI * 0.82 + b.ph * 1.3); return <div key={i} style={{ position:'absolute', left:x + '%', top:y + '%', width:b.s, height:b.s, marginLeft:-b.s / 2, marginTop:-b.s / 2, borderRadius:'50%', background:`radial-gradient(circle, ${b.c}, transparent 66%)` }}/>; })}
        {prod > 0.002 && <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 35%, #f4f8fd, #e8eef7 70%, #e1e8f2)', opacity:prod * 0.92 }}/>}
      </>}
    </div>
  );
}

/* ============================================================
   Captions (voiceover script, off by default)
   ============================================================ */
const SUBS = [[0.8,4.8,'One in two referred patients never see the specialist.'],[8.6,13.8,'Faxes. Emails. Phone tag. Guesswork.'],[13.9,20.8,'It costs practices patients, revenue, and the trust of the partners they rely on.'],[24.4,30,'CaseLink. Built for how dental practices actually refer.'],[33,39.2,'Every practice gets a home base. Referrals in. Referrals out.'],[39.4,46.5,'Cases to act on. Everything the team needs to move on today, in one view.'],[48.8,56,'Sending a referral takes ninety seconds. Pick a specialist. Add the patient.'],[56.2,64,'Attach the X-ray. Every specialist in the practice sees it the moment you send it.'],[71,77.6,'Both practices see the case move in real time.'],[77.8,86.5,'Add clinical notes, log fees privately, close the loop without a single phone call.'],[91,99.5,'Build a network of trusted partners. Every practice you connect with becomes one click away for referrals.'],[105.4,111.4,'See which team members drive the most referrals. Recognize their work.'],[111.8,119.4,'And keep everything HIPAA compliant, with a BAA on file from day one.'],[120.8,127.4,'Free forever for general and pediatric dentists. $299 a month for specialists.'],[127.6,133,'One extra referral covers the full year.'],[134.4,141.6,'Better referrals. Stronger partnerships. Continuity of care that finally works.'],[142.6,149.6,'CaseLink. Your Link to Better Patient Care. Start free at caselink.net.']];
function Captions({ t }){
  const s = SUBS.find(x => t >= x[0] - 0.2 && t <= x[1] + 0.2);
  if (!s) return null;
  const a = win(t, s[0] - 0.2, s[1] + 0.2, 0.3, 0.3);
  const dark = t < 23.4;
  return (
    <div style={{ position:'absolute', left:0, right:0, bottom:58, display:'flex', justifyContent:'center', zIndex:90, opacity:a }}>
      <span style={{ maxWidth:1300, textAlign:'center', padding:'14px 28px', borderRadius:18, fontSize:30, fontWeight:500, lineHeight:1.35, color: dark ? '#fff' : ONB.ink,
        background: dark ? 'rgba(10,15,30,0.55)' : 'rgba(255,255,255,0.86)', border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(232,238,248,0.95)',
        backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', boxShadow:'0 5px 20px rgba(0,0,0,0.12)' }}>{s[2]}</span>
    </div>
  );
}


/* ============================================================
   v2 — story cut: white, kinetic type, 3D UI pieces, laptop expansion
   ============================================================ */
const BLUE = '#3E8EFF';
const E = w => ({ w, c:BLUE });
function shotEnv(t, a, b, fi = 0.45, fo = 0.4){ const i = clamp((t - a) / fi), x = 1 - clamp((b - t) / fo); return easeInOut(i) * (1 - x * x * x); }

// layout-space centre of a registered element relative to a root (ignores 3D transforms above)
function lc(key, root){
  const el = focusReg[key];
  if (!el || !root || !el.isConnected) return lastPos[key] || null;
  let x = 0, y = 0, e = el;
  while (e && e !== root && !(e.dataset && e.dataset.proot)) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; }
  if (!e) return lastPos[key] || null;
  const p = { x:x + el.offsetWidth / 2, y:y + el.offsetHeight / 2 };
  lastPos[key] = p; return p;
}
function curAt(L, pts, root){
  const P = w => w.p ? { x:w.p[0], y:w.p[1] } : (lc(w.id, root) || { x:0, y:0 });
  if (L <= pts[0].t) return P(pts[0]);
  for (let i = 1; i < pts.length; i++) {
    const w = pts[i];
    if (L < w.t) {
      const st = w.t - (w.d || 0.6);
      const a = P(pts[i - 1]);
      if (L <= st) return a;
      const b = P(w), f = easeInOut(clamp((L - st) / (w.d || 0.6)));
      const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * f) * Math.min(70, dist * 0.15);
      return { x:lerp(a.x, b.x, f) - dy / dist * arc, y:lerp(a.y, b.y, f) + dx / dist * arc };
    }
  }
  return P(pts[pts.length - 1]);
}

// Brand-gradient bloom behind every floating pane, so edges melt into light instead of cutting.
function SoftEdge({ w, h, r }){
  const rt = useTime();
  const a = (rt * 24) % 360;
  return <div style={{ position:'absolute', left:-6, top:-6, width:w + 12, height:h + 12, borderRadius:r + 6, background:`conic-gradient(from ${a.toFixed(1)}deg at 50% 50%, rgba(62,142,255,0.55), rgba(144,240,197,0.5), rgba(255,199,148,0.5), rgba(62,142,255,0.55))`, filter:'blur(26px)', opacity:0.55 }}/>;
}
// Supersample 3D panes: lay out at 1x, paint at SS× inside the perspective layer, scale the layer down — keeps text crisp when scaled up.
const SS = 2;
const SSW = { position:'absolute', left:0, top:0, transform:`scale(${SS})`, transformOrigin:'0 0' };
// A 3D-tilted pane: content laid out in its own px space, focus point placed at stage centre.
function Tilt({ t, env = 1, w, h, fx, fy, z = 1, rx = 0, ry = 0, ox = 0, oy = 0, ns, lt, cur, children, shadow = true, radius = 22, fade = 1, soft = 0 }){
  const root = useRef(null);
  const [, bump] = useState(0);
  useEffect(() => { const a = setTimeout(() => bump(v => v + 1), 40); return () => clearTimeout(a); }, [Math.round(t * 10)]);
  if (env <= 0.003) return null;
  const blur = soft > 0.3 ? soft * 2 : 0;
  const de = 1 - env;
  let cp = null, cClk = null, cOp = 0;
  if (cur && root.current) { cp = curAt(cur.L, cur.pts, root.current); cClk = clickAt(cur.L, cur.clicks || []); cOp = cur.vis != null ? cur.vis : 1; }
  return (
    <div style={{ position:'absolute', inset:0, opacity:env * (soft > 0.3 ? 0.6 : fade), filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none', pointerEvents:'none' }}>
      <div style={{ position:'absolute', left:0, top:0, width:w * SS, height:h * SS, transformOrigin:'0 0', backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        transform:`translate(${960 + ox}px, ${540 + oy}px) perspective(2600px) rotateX(${(rx + de * 12).toFixed(3)}deg) rotateY(${(ry + de * (ry >= 0 ? 16 : -16)).toFixed(3)}deg) scale(${(z * (1 - de * 0.06) / SS).toFixed(5)}) translate(${-fx * SS}px, ${-fy * SS}px)` }}><div style={SSW}>
        <div ref={root} data-proot="1" style={{ position:'absolute', left:0, top:0, width:w, height:h, borderRadius:radius, boxShadow: shadow ? '0 23px 36px rgba(24,38,58,0.14)' : 'none', filter:'none', }}>
          <LtCtx.Provider value={lt != null ? lt : t}><RegCtx.Provider value={ns}>{children}</RegCtx.Provider></LtCtx.Provider>
          {cp && cOp > 0.01 && <GlowCursor x={cp.x} y={cp.y} z={z} click={cClk} opacity={cOp}/>}
        </div>
      </div></div>
    </div>
  );
}
// Full app (chrome + sidebar + page) at mapped time tm
function App({ tm, page, children }){
  const r = useRef(null);
  return (
    <AppWin t={tm} winRef={r} clipR={0} clipB={0} headLogoA={1} navA={1}>
      <RegCtx.Provider value="shell"><Sidebar t={tm}/></RegCtx.Provider>
      <div style={{ position:'absolute', left:SIDE_W, top:0, right:0, bottom:0 }}>{page}</div>
      {children}
    </AppWin>
  );
}

/* ---------- kinetic type ---------- */
// Big type: letters resolve left→right blur→sharp behind a leading caret, then the line eases back slightly while held.
function Kin({ t, t0, t1, lines, at, size = 84, sub = 0.46, y = 0, color = ONB.ink, align = 'center', x = 140, w = 640, note, eyebrow, same }){
  const rt = useTime();
  if (t < t0 - 0.1 || t > t1 + 0.8) return null;
  const left = align === 'left';
  const allOut = easeInOut(clamp((t - t1) / 0.6));
  const eb = easeOutStrong(clamp((t - t0 + 0.1) / 0.5)) * (1 - allOut);
  const CS = 0.024;
  const drift = 1;
  let start = t0;
  const rows = lines.map((ln, li) => {
    const words = ln.map(x => typeof x === 'string' ? { w:x, g:false } : { w:x.w, g:true });
    const total = words.reduce((n, w) => n + w.w.length, 0);
    if (at && at[li] != null) start = Math.max(start, t0 + at[li]);
    const r = { words, total, L0:start, li };
    start += total * CS * 0.8 + 0.08;
    return r;
  });
  return (
    <div style={{ position:'absolute', top:540 + y, ...(left ? { left:x, width:w, alignItems:'flex-start', transformOrigin:'0% 50%' } : { left:0, right:0, alignItems:'center' }), transform:`translateY(-50%) scale(${drift.toFixed(4)})`, display:'flex', flexDirection:'column', gap:size * 0.12, zIndex:80, pointerEvents:'none' }}>
      {eyebrow && <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:21, fontWeight:600, color:ONB.text, marginBottom:size * 0.12, opacity:eb, filter: eb < 0.99 ? `blur(${((1 - eb) * 8).toFixed(2)}px)` : 'none' }}><span style={{ width:10, height:10, borderRadius:'50%', background:'linear-gradient(135deg,#3E8EFF,#90F0C5)' }}/>{eyebrow}</div>}
      {rows.map(({ words, total, L0, li }) => {
        const fs = li === 0 || same ? size : size * (lines.length > 1 && sub ? (1 - sub * 0.5) : 1);
        const lo = easeInOut(clamp((t - (t1 - (lines.length - 1 - li) * 0.05)) / 0.6));
        const k = (t - L0) / CS;
        const cur = k >= 0 && k < total ? Math.floor(k) : -1;
        let ci = 0;
        return (
          <div key={li} style={{ display:'flex', flexWrap:'wrap', justifyContent: left ? 'flex-start' : 'center', columnGap:'0.26em', rowGap:'0.06em', fontSize:fs, fontWeight: li === 0 || same ? 700 : 500, color: li === 0 || same ? color : ONB.text, letterSpacing:'-0.035em', lineHeight:1.1 }}>
            {words.map((w, wi) => (
              <span key={wi} style={{ display:'inline-flex', whiteSpace:'nowrap' }}>
                {Array.from(w.w).map((ch, i) => {
                  const idx = ci++;
                  const a = easeOutStrong(clamp((t - L0 - idx * CS) / 0.45));
                  const v = a * (1 - lo);
                  const b = (1 - a) * 12 + lo * 16;
                  const el = <span key={i} style={{ display:'inline-block', opacity:v, filter: b > 0.2 ? `blur(${b.toFixed(2)}px)` : 'none', transform:`translateX(${((1 - a) * 0.14).toFixed(3)}em)`, ...(w.g ? { ...gradFill(idx * fs * 0.55, rt), padding:'0.14em 0.05em 0.22em', margin:'-0.14em -0.05em -0.22em' } : null) }}>{ch}</span>;
                  if (idx !== cur) return el;
                  return <React.Fragment key={i}>{el}<span style={{ position:'relative', width:0 }}><span style={{ position:'absolute', left:fs * 0.04, top:'14%', bottom:'14%', width:Math.max(3, fs * 0.03), borderRadius:2, background:ONB.ink }}/></span></React.Fragment>;
                })}
              </span>
            ))}
          </div>
        );
      })}
      {note && <BlurLine t={t} t0={start + 0.05} tOut={t1} stagger={0.035} dur={0.6} items={note.split(' ')} style={{ justifyContent: left ? 'flex-start' : 'center', fontSize:Math.round(size * 0.38), fontWeight:500, color:ONB.text, letterSpacing:'-0.01em', lineHeight:1.35, marginTop:size * 0.2, columnGap:'0.28em', maxWidth:w }}/>}
    </div>
  );
}
const Side = p => <Kin align="left" same size={72} {...p}/>;
function Slam({ t, t0, words, each = 0.85, size = 150 }){
  return words.map((w, i) => {
    const a = t0 + i * each, b = a + each;
    const e = easeOutStrong(ss(a, a + 0.32, t)), o = easeInOut(ss(b - 0.2, b + 0.15, t));
    const v = e * (1 - o);
    if (v <= 0.003) return null;
    return <div key={i} style={{ position:'absolute', left:0, right:0, top:540, transform:`translateY(-50%) scale(${(1.12 - 0.12 * e + o * 0.06).toFixed(4)})`, textAlign:'center', fontSize:size, fontWeight:700, letterSpacing:'-0.045em', color:ONB.ink, opacity:v, filter:`blur(${((1 - e) * 18 + o * 14).toFixed(2)}px)`, zIndex:80 }}>{i === words.length - 1 ? <GradText>{w}</GradText> : w}</div>;
  });
}

const CHAOS = ['Faxes.', 'Emails.', 'Phone tag.', 'Guesswork.'];
function ChaosLine({ t }){
  if (t < 9.3 || t > 12.3) return null;
  const conv = easeInOut(ss(11.45, 12.15, t));
  return (
    <div style={{ position:'absolute', left:0, right:0, top:540, transform:'translateY(-50%)', display:'flex', justifyContent:'center', alignItems:'baseline', gap:56, zIndex:80 }}>
      {CHAOS.map((w, i) => {
        const at = 9.35 + i * 0.4, a = easeOutStrong(ss(at, at + 0.22, t));
        const drift = Math.sin((t - at) * 1.7 + i * 1.3), haze = 0;
        const bl = (1 - a) * 14 + conv * 12;
        const dx = (1.5 - i) * 300 * conv;
        return (
          <span key={i} style={{ display:'inline-block', fontSize:96, fontWeight:700, letterSpacing:'-0.04em', color:ONB.ink, whiteSpace:'nowrap', opacity:clamp(a * 1.2) * (1 - conv), filter: bl > 0.3 ? `blur(${bl.toFixed(2)}px)` : 'none', transform:`translate(${dx.toFixed(1)}px, ${((1 - a) * 30 + drift * 10).toFixed(1)}px) scale(${(1 - conv * 0.3).toFixed(3)})` }}>{i === 3 ? <GradText>{w}</GradText> : w}</span>
        );
      })}
    </div>
  );
}

/* ---------- backgrounds ---------- */
const GLOWS = [[340,346,'b',0.6,0.6,0.6],[350,362,'b',0.7,0.8,0.8],[190.4,197.4,'bl',0.5,1.2,0.6],[320.2,329.6,'b',0.7,0.6,0.6],[200.4,268.4,'bl',0.5,1.2,0.6],[300,314.3,'bl',0.5,0.6,0.6],[251.6,259.6,'br',0.45,0.6,0.5],[12.2,19.6,'b',1,0.8,1.6],[35.7,38.5,'t',0.6],[44.3,46.4,'b',0.7],[54.8,58.4,'b',0.6,0.5,1.0],[60.1,62.3,'br',0.65],[71.6,74.2,'t',0.6],[80.5,82.6,'bl',0.65],[86.5,88.7,'b',0.6],[101.1,103.3,'t',0.6],[108.7,111.0,'br',0.6],[115.3,117.5,'b',0.7],[121.2,124.1,'t',0.6],[123.9,129.6,'b',0.85],[141.2,146.6,'b',1,0.8,2.0]];
function GlowField({ o, v, rt }){
  const dx = Math.sin(rt * 0.23) * 5, px = Math.sin(rt * 0.31 + 1.3) * 22;
  const box = { b:{ left:'-10%', right:'-10%', bottom:'-45%', height:'90%' }, t:{ left:'-10%', right:'-10%', top:'-50%', height:'90%' }, bl:{ left:'-35%', width:'95%', bottom:'-55%', height:'110%' }, br:{ right:'-35%', width:'95%', bottom:'-55%', height:'110%' } }[v];
  const at = v === 't' ? '50% 40%' : '50% 60%';
  return (
    <div style={{ position:'absolute', ...box, opacity:o, transform:`translateX(${dx.toFixed(2)}%)` }}>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:`radial-gradient(ellipse at ${at}, rgba(46,123,242,0.85), rgba(62,142,255,0.45) 38%, rgba(144,240,197,0.18) 60%, transparent 72%)` }}/>
      <div style={{ position:'absolute', left:`${30 + px}%`, width:'40%', top:'22%', height:'56%', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(144,240,197,0.5), rgba(255,199,148,0.28) 45%, transparent 70%)' }}/>
    </div>
  );
}
function Bg2({ t, rt }){
  const blobs = [
    { c:'rgba(62,142,255,0.20)', s:1400, cx:10, cy:16, ax:10, ay:8, sp:0.05, ph:0 },
    { c:'rgba(144,240,197,0.22)', s:1400, cx:90, cy:84, ax:10, ay:8, sp:0.041, ph:1.9 },
    { c:'rgba(255,199,148,0.2)', s:1100, cx:84, cy:10, ax:9, ay:8, sp:0.058, ph:3.4 },
  ];
  return (
    <div style={{ position:'absolute', inset:0, background:'#FFFFFF', overflow:'hidden' }}>
      {blobs.map((b, i) => { const x = b.cx + b.ax * Math.sin(rt * b.sp * 2 * Math.PI + b.ph), y = b.cy + b.ay * Math.cos(rt * b.sp * 2 * Math.PI * 0.82 + b.ph * 1.3); return <div key={i} style={{ position:'absolute', left:x + '%', top:y + '%', width:b.s, height:b.s, marginLeft:-b.s / 2, marginTop:-b.s / 2, borderRadius:'50%', background:`radial-gradient(circle, ${b.c}, transparent 66%)` }}/>; })}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 55% at 50% 50%, #FFFFFF 0%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0) 100%)' }}/>
      {GLOWS.map((g, i) => { const o = win(t, g[0], g[1], g[4] || 0.7, g[5] || 1.0) * g[3]; return o > 0.003 ? <GlowField key={'g' + i} o={o} v={g[2]} rt={rt}/> : null; })}
    </div>
  );
}

/* ---------- Act 1: the problem (0–15) ---------- */
function Scrap({ k }){
  const g = { position:'relative', background:'linear-gradient(150deg, rgba(255,255,255,0.42), rgba(235,243,255,0.22) 55%, rgba(230,250,241,0.2))', border:'1px solid rgba(255,255,255,0.75)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 18px rgba(144,240,197,0.22), 0 0 0 1px rgba(62,142,255,0.14), 0 0 26px rgba(62,142,255,0.22), 0 0 10px rgba(144,240,197,0.3)', borderRadius:16 };
  if (k === 0) return <div style={{ transform:'scale(0.7)', opacity:0.72, borderRadius:10, boxShadow:'0 0 0 1px rgba(62,142,255,0.18), 0 0 34px rgba(62,142,255,0.26), 0 0 12px rgba(144,240,197,0.34)' }}><PaperForm/></div>;
  if (k === 1) return <div style={{ ...g, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:12, padding:'14px 20px 14px 14px' }}><span style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(160deg,#FF7A8A,#F04A5C)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ix n="missed" s={20} c="#fff"/></span><span><span style={{ display:'block', fontSize:17, fontWeight:700, color:ONB.ink }}>Missed call</span><span style={{ display:'block', fontSize:14, color:ONB.mute }}>Georgetown Gum Specialists</span></span></div>;
  if (k === 2) return <div style={{ padding:'18px 20px', width:200, background:'linear-gradient(160deg, rgba(255,243,184,0.62), rgba(255,199,148,0.4))', border:'1px solid rgba(255,255,255,0.7)', borderRadius:6, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.85), 0 0 26px rgba(255,199,148,0.4), 0 0 10px rgba(255,255,255,0.6)', fontSize:19, fontWeight:600, color:'#5C4A00', transform:'rotate(-4deg)' }}>Call back re: X-rays?</div>;
  if (k === 3) return <div style={{ ...g, whiteSpace:'nowrap', padding:'14px 20px', fontSize:17, fontWeight:600, color:'#B8323F', display:'flex', alignItems:'center', gap:10 }}><Ic n="info" s={18} c="#F04A5C"/>Fax page 2 of 3 missing</div>;
  if (k === 4) return <div style={{ ...g, display:'flex', alignItems:'center', gap:12, padding:'14px 20px 14px 14px' }}><span style={{ width:40, height:40, borderRadius:'50%', background:'#EEF2F7', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="clock" s={20} c={ONB.mute}/></span><span><span style={{ display:'block', fontSize:17, fontWeight:700, color:ONB.ink }}>On hold</span><span style={{ display:'block', fontSize:14, color:ONB.mute }}>14 minutes</span></span></div>;
  return <div style={{ ...g, whiteSpace:'nowrap', padding:'14px 20px', fontSize:17, fontWeight:600, color:ONB.text, display:'flex', alignItems:'center', gap:10 }}><Ic n="mail" s={18} c={ONB.mute}/>Re: Re: Fwd: referral for Jane</div>;
}
const SCRAPS = Array.from({ length:16 }).map((_, i) => ({ k:i % 6, x:(hash(i + 3) - 0.5) * 1700, y:(hash(i + 9) - 0.5) * 900, d:i * 0.22, r:(hash(i + 5) - 0.5) * 40 }));
function Tunnel({ t }){
  if (t < 2.4 || t > 7.2) return null;
  return (
    <div style={{ position:'absolute', inset:0, perspective:1200, overflow:'hidden' }}>
      {SCRAPS.map((s, i) => {
        const p = ss(3.0 + s.d * 0.85, 6.3 + s.d * 0.4, t);
        if (p <= 0 || p >= 1) return null;
        const z = lerp(-2600, 900, easeInOut(p));
        const op = clamp(p * 5) * clamp((1 - p) * 5);
        const bl = Math.abs(z) > 400 ? Math.min(14, (Math.abs(z) - 400) / 120) : 0;
        return <div key={i} style={{ position:'absolute', left:960 + s.x, top:540 + s.y, transform:`translate(-50%,-50%) translateZ(${z.toFixed(1)}px) rotate(${(s.r * (1 - p)).toFixed(2)}deg)`, opacity:op, filter: bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none' }}><Scrap k={s.k}/></div>;
      })}
    </div>
  );
}
// v6.2: the first line gets a picture: patient card, your practice, a link of trust, then it breaks
function TrustScene({ t }){
  if (t < 0.5 || t > 3.3) return null;
  const pc = easeOutStrong(ss(0.7, 1.3, t)), oc = easeOutStrong(ss(1.45, 2.0, t));
  const ln = easeInOut(ss(1.7, 2.2, t)), chip = easeOutStrong(ss(2.05, 2.4, t));
  const br = ss(2.5, 3.0, t), fall = br * br * 0.4;
  const card = (a, x, extra) => ({ position:'absolute', left:x, top:640, width:400, transform:`translate(-50%,-50%) translateY(${((1 - a) * 60).toFixed(1)}px) ${extra || ''}`, opacity:clamp(a * 1.3), filter: a < 0.99 ? `blur(${((1 - a) * 14).toFixed(2)}px)` : 'none', display:'flex', alignItems:'center', gap:18, padding:'22px 26px', borderRadius:22, background:'rgba(255,255,255,0.92)', border:'1px solid #EEF3F2', boxShadow:'0 18px 44px rgba(26,54,110,0.12), inset 0 1px 0 #fff' });
  const pOut = 1 - easeInOut(ss(2.5, 3.0, t));
  return (
    <div style={{ position:'absolute', inset:0, zIndex:60 }}>
      <svg width="1920" height="1080" style={{ position:'absolute', left:0, top:0, opacity:1 - br }}>
        <defs><linearGradient id="trustLn" gradientUnits="userSpaceOnUse" x1="760" x2="1160" y1="0" y2="0"><stop stopColor="#3E8EFF"/><stop offset=".55" stopColor="#90F0C5"/><stop offset="1" stopColor="#FFC794"/></linearGradient></defs>
        <line x1="760" y1="640" x2={lerp(760, 1160, ln)} y2="640" stroke="url(#trustLn)" strokeWidth="4" strokeLinecap="round" strokeDasharray={br > 0 ? `${(60 - br * 50).toFixed(1)} ${(br * 40).toFixed(1)}` : 'none'}/>
      </svg>
      <div style={card(pc * pOut, 560, `translateY(${(fall * 260).toFixed(1)}px) rotate(${(fall * -9).toFixed(2)}deg)`)}>
        <Avatar init="JS" g={GR.violet} s={64}/>
        <div><div style={{ fontSize:26, fontWeight:700, color:ONB.ink }}>Jane Smith</div><div style={{ fontSize:18, color:ONB.mute, marginTop:4 }}>Patient · referred for care</div></div>
      </div>
      <div style={card(oc * pOut, 1360)}>
        <span style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(150deg,#6AA8FF,#2F7DF5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n="bldg" s={30} c="#fff" w={2}/></span>
        <div><div style={{ fontSize:26, fontWeight:700, color:ONB.ink }}>Their dentist</div><div style={{ fontSize:18, color:ONB.mute, marginTop:4 }}>General or specialist</div></div>
      </div>
      <div style={{ position:'absolute', left:960, top:640, transform:`translate(-50%,-50%) translateY(${((1 - chip) * 14 + fall * 40).toFixed(1)}px) scale(${(0.9 + 0.1 * chip).toFixed(3)})`, opacity:chip * (1 - br), filter: chip < 0.99 || br > 0 ? `blur(${((1 - chip) * 8 + br * 10).toFixed(2)}px)` : 'none', display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:9999, background:'#fff', boxShadow:'0 6px 18px rgba(62,142,255,0.22)', fontSize:18, fontWeight:600, color:'#2F7DF5', whiteSpace:'nowrap' }}><Ic n="check" s={18} c="#2F7DF5" w={2.6}/>Trusts you</div>
    </div>
  );
}
function ProblemAct({ t }){
  if (t > 15.2) return null;
  const n = Math.round(2 * eExpo(ss(6.4, 7.4, t)));
  const st = shotEnv(t, 6.3, 9.3, 0.4, 0.35);
  return (
    <>
      <Kin t={t} t0={0.3} t1={2.6} y={-250} lines={[['Every','referral','starts'],['with','a',E('patient.')]]} size={84}/>
      <TrustScene t={t}/>
      <Tunnel t={t}/>
      <Kin t={t} t0={3.2} t1={6.0} lines={[['They','slip','through'],[E('the'),E('cracks.')]]} size={110}/>
      {st > 0.003 && <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:st, filter: st < 0.99 ? `blur(${((1 - st) * 16).toFixed(2)}px)` : 'none', zIndex:80 }}>
        <div style={{ fontSize:260, fontWeight:700, letterSpacing:'-0.06em', lineHeight:0.9, color:ONB.ink }}>1 in <GradText>{Math.max(1, n)}</GradText></div>
        <BlurLine t={t} t0={6.9} stagger={0.05} items={['patients','never','see','the','specialist','they','were','referred','to.']} style={{ fontSize:52, fontWeight:500, color:ONB.text, letterSpacing:'-0.02em', marginTop:18 }}/>
      </div>}
      <ChaosLine t={t}/>
      <Kin t={t} t0={12.2} t1={14.6} lines={[['There’s','a','better',E('way.')]]} size={120}/>
    </>
  );
}

/* ---------- Act 2: brand + laptop (15–28) ---------- */
function BrandAct({ t }){
  if (t < 14.6 || t > 23.4) return null;
  const pin = ss(14.8, 15.4, t) * (1 - ss(17.6, 18.2, t));
  const lineP = easeInOut(ss(15.2, 16.0, t));
  const col = easeInOut(ss(16.0, 16.3, t));
  const spark = Math.sin(Math.PI * ss(15.95, 16.55, t));
  const bloom = ss(16.28, 17.3, t);
  const shrink = easeInOut(ss(17.5, 18.5, t));
  const bE = easeOut(bloom);
  const scaleMark = lerp(0.2, 3.2, easeOutBack(bloom)) * lerp(1, 1 / 3.2, shrink);
  const L = t - 16.4;
  const out = easeInOut(ss(22.3, 22.9, t));
  const slideX = lerp(-((104 + 26 + WORD_W) / 2 - 52), 0, easeInOut(ss(18.35, 19.0, t)));
  const chip = (side, label, sub, g, init) => (
    <div style={{ position:'absolute', top:500, [side]:lerp(-200, 170, easeOutStrong(ss(14.8, 15.5, t))), transform:'translateY(-50%)', opacity:pin, display:'flex', alignItems:'center', gap:14, padding:'12px 26px 12px 12px', borderRadius:9999, background:'rgba(255,255,255,0.95)', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 9px 20px rgba(24,38,58,0.12)' }}>
      <span style={{ width:56, height:56, borderRadius:'50%', background:g, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n={init === 'GP' ? 'users' : 'sparkle'} s={26} c="#fff" w={2}/></span><span><span style={{ display:'block', fontSize:22, fontWeight:700, color:ONB.ink }}>{label}</span>{sub ? <span style={{ display:'block', fontSize:16, color:ONB.mute }}>{sub}</span> : null}</span>
    </div>
  );
  return (
    <div style={{ position:'absolute', inset:0, zIndex:70, opacity:1 - out, filter: out > 0.01 ? `blur(${(out * 16).toFixed(2)}px)` : 'none' }}>
      {chip('left', 'General dentist', '', GR.blue, 'GP')}
      {chip('right', 'Specialist', '', GR.violet, 'SP')}
      {lineP > 0 && col < 1 && <div style={{ position:'absolute', left:0, right:0, top:498, height:4 }}>
        <div style={{ position:'absolute', left:lerp(560, 960, col), width:Math.max(0, lerp(560, 960, lineP) - lerp(560, 960, col)), top:0, bottom:0, borderRadius:4, background:'linear-gradient(90deg,#3E8EFF,#90F0C5)' }}/>
        <div style={{ position:'absolute', right:lerp(560, 960, col), width:Math.max(0, lerp(560, 960, lineP) - lerp(560, 960, col)), top:0, bottom:0, borderRadius:4, background:'linear-gradient(90deg,#90F0C5,#FFC794)' }}/>
      </div>}
      {spark > 0.01 && <div style={{ position:'absolute', left:960, top:500, width:90, height:90, marginLeft:-45, marginTop:-45, borderRadius:'50%', background:'radial-gradient(circle, #FFFFFF 0%, rgba(144,240,197,0.9) 30%, rgba(62,142,255,0.5) 55%, transparent 72%)', filter:'blur(6px)', opacity:spark, transform:`scale(${(0.4 + spark * 0.9).toFixed(3)})` }}/>}
      <div style={{ position:'absolute', left:960, top:500, transform:'translate(-50%,-50%)', display:'flex', alignItems:'center', gap:26 }}>
        <div style={{ width:104, height:104, transform:`translateX(${(-slideX).toFixed(2)}px) rotate(${((1 - bE) * -240).toFixed(2)}deg) scale(${scaleMark.toFixed(4)})`, opacity:clamp(bloom * 2), filter: bloom < 0.9 ? `blur(${((1 - bE) * 20).toFixed(2)}px)` : 'none' }}>{bloom > 0 && <LogoFlow s={104} flow={easeOut(ss(16.28, 17.9, t))} sheen={ss(17.3, 18.3, t)}/>}</div>
        <WordmarkRise h={68} local={t} at={19.0}/>
      </div>
      <div style={{ position:'absolute', left:0, right:0, top:600 }}><ForwardLine p={easeInOut(ss(18.2, 19.8, t))} t={t}/></div>
      <div style={{ position:'absolute', left:0, right:0, top:650 }}><BlurLine t={t} t0={20.0} stagger={0.14} items={'The link between general dentists, specialists, and the patients they share.'.split(' ')} style={{ fontSize:36, fontWeight:500, color:ONB.text }}/></div>
    </div>
  );
}
// Laptop: rises, lid opens, screen pushes in to full frame
function Laptop({ t }){
  if (t < 22.5 || t >= 27.9) return null;
  const rise = easeOutStrong(ss(22.6, 23.8, t));
  const open = easeInOut(ss(23.2, 24.6, t));
  const push = easeInOut(ss(25.9, 27.9, t));
  const out = 0;
  const SW = 1200, SH = 750, sc = SW / WIN_W, BZ = 16, BT = 18;
  const zoom = lerp(0.82, 1.64, push);
  const tm = 32 + (t - 24.5);
  const LW = SW + BZ * 2, LH = SH + BT + BZ;
  const BW = LW + 150;
  return (
    <div style={{ position:'absolute', inset:0, perspective:2400, zIndex:60, opacity:(1 - out) * clamp(rise * 1.5), filter: rise < 0.98 ? `blur(${((1 - rise) * 16).toFixed(2)}px)` : 'none' }}>
      <div style={{ position:'absolute', left:960, top:540, transformOrigin:'0 0', transform:`translate(0px, ${((1 - rise) * 360 + lerp(40, 0, push)).toFixed(2)}px) rotateX(${lerp(16, 0, Math.max(open * 0.6, push)).toFixed(2)}deg) scale(${(zoom / SS).toFixed(5)})` }}><div style={SSW}>
        <div style={{ position:'absolute', left:-BW / 2 + 40, width:BW - 80, top:LH / 2 + 4, height:60, borderRadius:'50%', background:'radial-gradient(ellipse, rgba(24,38,58,0.34), rgba(24,38,58,0.12) 45%, transparent 70%)', filter:'blur(14px)', opacity:1 - push }}/>
        <div style={{ position:'absolute', left:-LW / 2 - 3, top:-LH / 2 - 3, width:LW + 6, height:LH + 6, borderRadius:31, background:'linear-gradient(180deg,#E4E7EB 0%,#B5BBC3 55%,#8E949C 100%)', boxShadow:'0 23px 33px rgba(24,38,58,0.26), 0 5px 17px rgba(24,38,58,0.14)', transformOrigin:'50% 100%', transform:`rotateX(${lerp(-88, 0, open).toFixed(2)}deg)`, padding:3, boxSizing:'border-box' }}>
          <div style={{ position:'relative', width:LW, height:LH, borderRadius:28, background:'#050607', padding:`${BT}px ${BZ}px ${BZ}px`, boxSizing:'border-box', boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
            <div style={{ width:SW, height:SH, borderRadius:10, overflow:'hidden', background:'#fff', position:'relative' }}>
              <div style={{ position:'absolute', left:0, top:0, width:WIN_W, height:WIN_H, transform:`scale(${sc})`, transformOrigin:'0 0', opacity:ss(24.0, 24.6, t) }}>
                <LtCtx.Provider value={tm}><App tm={tm} page={<RegCtx.Provider value="lap"><HomePage t={tm} p0={32}/></RegCtx.Provider>}/></LtCtx.Provider>
              </div>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(115deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0.06) 32%,transparent 46%)', opacity:1 - push }}/>
              <div style={{ position:'absolute', inset:0, background:'#0A0C10', opacity:1 - ss(23.9, 24.5, t) }}/>
            </div>
            <div style={{ position:'absolute', left:'50%', top:0, width:190, height:BT + 8, marginLeft:-95, borderRadius:'0 0 14px 14px', background:'#050607', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ width:9, height:9, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, #3A4760, #0B0F18 70%)', boxShadow:'0 0 0 2px #111418' }}/>
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', left:-BW / 2, top:LH / 2 + 2, width:BW, height:26, opacity:1 - push }}>
          <div style={{ position:'absolute', left:0, right:0, top:0, height:10, borderRadius:'3px 3px 0 0', background:'linear-gradient(180deg,#F4F6F8,#DADEE3)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.9)' }}/>
          <div style={{ position:'absolute', left:'50%', top:0, width:230, height:7, marginLeft:-115, borderRadius:'0 0 9px 9px', background:'linear-gradient(180deg,#A9AFB7,#CDD2D8)' }}/>
          <div style={{ position:'absolute', left:6, right:6, top:10, height:16, borderRadius:'0 0 60px 60px / 0 0 16px 16px', background:'linear-gradient(180deg,#C6CBD2 0%,#9CA2AA 60%,#7D838B 100%)' }}/>
          <div style={{ position:'absolute', left:'8%', right:'8%', top:24, height:3, borderRadius:3, background:'rgba(60,66,74,0.5)', filter:'blur(1px)' }}/>
        </div>
      </div></div>
    </div>
  );
}

/* ---------- Act 3 pieces ---------- */
function FocusStack({ t, t0 }){
  const L = t - t0;
  const clk = L - 2.6;
  return (
    <div style={{ position:'absolute', inset:0, perspective:2000 }}>
      {FOCUS_CARDS.map((f, i) => {
        const a = spring(ss(0.2 + i * 0.12, 1.2 + i * 0.12, L));
        const y = (i - 1) * 150;
        const hot = i === 0 ? win(L, 2.2, 5.5, 0.4, 0.5) : 0;
        return (
          <div key={i} style={{ position:'absolute', left:960, top:560 + y, transform:`translate(-50%,-50%) translateZ(${((1 - a) * -900).toFixed(1)}px) rotateY(${lerp(-40, -14, a).toFixed(2)}deg) rotateX(8deg) scale(${(i === 0 ? 1 + 0.04 * hot : 1).toFixed(4)})`, opacity:clamp(a * 1.6) * (i === 0 ? 1 : lerp(1, 0.55, hot)) * (1 - ss(4.2, 4.6, L)), filter: (i !== 0 && hot > 0.1) || L > 4.2 ? `blur(${(hot * 3 + ss(4.2, 4.6, L) * 14).toFixed(2)}px)` : 'none' }}>
            {i === 0 && <GlowRim on={hot > 0.01} radius={22} spread={10} blur={24} opacity={0.6 * hot} pulse={t}/>}
            <div style={{ position:'relative', width:760, display:'flex', alignItems:'center', gap:24, padding:'26px 30px', borderRadius:22, background:'rgba(255,255,255,0.97)', border:'1px solid rgba(232,238,248,0.95)', borderLeft:`6px solid ${f[3]}`, boxShadow:'0 14px 24px rgba(24,38,58,0.14)', transform:`scale(${(i === 0 ? pressScale(clk) : 1).toFixed(4)})` }}>
              <span style={{ width:76, height:76, borderRadius:20, background:f[4], display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n={f[2]} s={34} c={f[3]} w={2.2}/></span>
              <span style={{ flex:1 }}><span style={{ display:'block', fontSize:34, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em' }}>{f[0]}</span><span style={{ display:'block', fontSize:22, color:ONB.mute, marginTop:4 }}>{f[1]}</span></span>
              <Ix n="chevR" s={30} c={ONB.faint}/>
            </div>
          </div>
        );
      })}
      <GlowCursor x={lerp(1500, 1180, easeInOut(ss(1.4, 2.2, L)))} y={lerp(900, 430, easeInOut(ss(1.4, 2.2, L)))} z={1} click={clk >= 0 && clk < 0.72 ? clk : null} opacity={win(L, 1.3, 4.8, 0.3, 0.3)}/>
      {L > 4.4 && <div style={{ position:'absolute', left:960, top:560, transform:`translate(-50%,-50%) rotateY(-14deg) rotateX(8deg) scale(${(0.9 + 0.1 * easeOutBack(ss(4.5, 5.1, L))).toFixed(4)})`, opacity:ss(4.5, 4.9, L) }}>
        <div style={{ width:760, padding:'30px 34px', borderRadius:24, background:'linear-gradient(135deg,#EBF3FF,#E6FAF1 60%,#FFF4E6)', border:'1.5px solid #fff', boxShadow:'0 18px 30px rgba(24,38,58,0.16)' }}>
          <div style={{ fontSize:16, fontWeight:700, letterSpacing:'0.12em', color:BLUE }}>PRO TIP</div>
          <div style={{ fontSize:34, fontWeight:700, color:ONB.ink, marginTop:10, letterSpacing:'-0.02em', lineHeight:1.2 }}>Invite the practices you already work with. Everything moves faster from there.</div>
        </div>
      </div>}
    </div>
  );
}
function SentBox({ L, t }){
  const a = easeOutStrong(ss(2.55, 3.25, L));
  if (a <= 0.001) return null;
  const ang = ((t * 40) % 360).toFixed(1);
  const rim = `conic-gradient(from ${ang}deg, #3E8EFF, #90F0C5, #FFC794, #3E8EFF)`;
  return (
    <div style={{ position:'relative', marginTop:48, opacity:a, filter: a < 0.99 ? `blur(${((1 - a) * 12).toFixed(2)}px)` : 'none', transform:`translateY(${((1 - a) * 18).toFixed(1)}px) scale(${(0.96 + 0.04 * a).toFixed(4)})` }}>
      <div style={{ position:'absolute', inset:-4, borderRadius:9999, background:rim, filter:'blur(18px)', opacity:0.55 }}/>
      <div style={{ position:'relative', padding:2, borderRadius:9999, background:rim }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 38px 18px 18px', borderRadius:9999, background:'rgba(255,255,255,0.97)' }}>
          <span style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(160deg,#6AA8FF,#2F7DF5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n="send" s={22} c="#fff" w={2.2}/></span>
          <span style={{ fontSize:36, fontWeight:700, letterSpacing:'-0.02em', whiteSpace:'nowrap' }}><span style={{ color:ONB.text, fontWeight:500 }}>Sent to </span><GradText>Capitol Smile Orthodontics</GradText></span>
        </div>
      </div>
    </div>
  );
}
function Hero({ t, t0, noBtn }){
  const L = t - t0;
  const clk = L - 1.2;
  const la = clamp((clk - 0.12) / 0.25) * (1 - ss(2.0, 2.2, L));
  const done = ss(2.1, 2.5, L);
  const ring = ss(2.2, 3.2, L);
  const a = easeOutStrong(ss(0, 0.5, L));
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40 }}>
      {!noBtn && done < 1 && <div style={{ position:'absolute', left:960, top:540, transform:`translate(-50%,-50%) scale(${(lerp(0.9, 1, a) * pressScale(clk) * (1 - done * 0.2)).toFixed(4)})`, opacity:a * (1 - done), filter: done > 0.01 ? `blur(${(done * 12).toFixed(2)}px)` : 'none' }}>
        <div style={{ padding:12, borderRadius:9999, background:'rgba(255,255,255,0.96)', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 10px 24px rgba(24,38,58,0.1)' }}>
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10, padding:'13px 30px', borderRadius:9999, background:'linear-gradient(160deg,#5BA0FF,#2F7DF5)', color:'#fff', fontSize:20, fontWeight:600, whiteSpace:'nowrap', boxShadow:'0 9px 20px rgba(62,142,255,0.4), inset 0 1.5px 1px rgba(255,255,255,0.4)', overflow:'hidden' }}>
          <span style={{ display:'grid' }}>
            <span style={{ gridArea:'1/1', opacity:1 - la, filter: la > 0.01 ? `blur(${la * 6}px)` : 'none' }}>Submit referral</span>
            <span style={{ gridArea:'1/1', opacity:la, display:'flex', alignItems:'center', gap:10, filter: la < 0.99 ? `blur(${(1 - la) * 6}px)` : 'none' }}><Spinner lt={t} c="#fff"/>Sending</span>
          </span>
          <ClickFX clk={clk}/>
        </div>
        </div>
        <GlowCursor x={lerp(200, 140, easeInOut(ss(0.3, 1.0, L)))} y={lerp(120, 44, easeInOut(ss(0.3, 1.0, L)))} z={1.4} click={clk >= 0 && clk < 0.72 ? clk : null} opacity={win(L, 0.2, 1.9, 0.2, 0.2)}/>
      </div>}
      {done > 0 && <div style={{ position:'absolute', left:960, top:520, transform:'translate(-50%,-50%) scale(0.58)', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ position:'relative', width:220, height:220 }}>
          {ring < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(34,201,122,0.6)', transform:`scale(${(1 + ring * 0.8).toFixed(3)})`, opacity:1 - ring }}/>}
          {Array.from({ length:14 }).map((_, i) => { const an = i / 14 * Math.PI * 2, d = 120 + easeOut(ring) * 120; return <span key={i} style={{ position:'absolute', left:110 + Math.cos(an) * d, top:110 + Math.sin(an) * d, width:12, height:5, borderRadius:3, background:[BLUE, '#90F0C5', '#FFC794'][i % 3], transform:`rotate(${(an * 57.3 + ring * 90).toFixed(1)}deg)`, opacity:(1 - ring) * clamp(ring * 6) }}/>; })}
          <div style={{ width:220, height:220, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 14px 21px rgba(34,201,122,0.4)', transform:`scale(${easeOutBack(done).toFixed(4)})` }}>
            <svg width="110" height="110" viewBox="0 0 24 24"><polyline points="5 12.5 10 17.5 19 7.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - ss(2.35, 2.8, L)}/></svg>
          </div>
        </div>
        <SentBox L={L} t={t}/>
      </div>}
    </div>
  );
}
function Bubble({ me, name, text, children, a, time, file }){
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: me ? 'flex-end' : 'flex-start', opacity:a, transform:`translateY(${((1 - a) * 20).toFixed(2)}px) scale(${(0.96 + 0.04 * a).toFixed(4)})`, transformOrigin: me ? 'right bottom' : 'left bottom' }}>
      <span style={{ fontSize:13, color:ONB.mute, marginBottom:6 }}>{name} · {time}</span>
      <span style={{ maxWidth:470, padding: file ? '10px 10px 14px' : '15px 20px', borderRadius: me ? '20px 20px 6px 20px' : '20px 20px 20px 6px', fontSize:18, lineHeight:1.4, color: me ? '#fff' : ONB.ink, background: me ? 'linear-gradient(160deg,#5BA0FF,#2F7DF5)' : '#F1F4F8', display:'flex', flexDirection:'column', gap:10 }}>
        {file && <FileChip up={file.up}/>}
        <span style={{ padding: file ? '0 10px' : 0 }}>{children || text}</span>
      </span>
    </div>
  );
}
function FileChip({ up }){
  const done = ss(0.95, 1, up);
  return (
    <span style={{ display:'flex', alignItems:'center', gap:14, width:390, padding:'10px 14px 10px 10px', borderRadius:14, background:'rgba(255,255,255,0.97)', boxSizing:'border-box' }}>
      <span style={{ width:64, height:52, borderRadius:10, background:'linear-gradient(160deg,#2A3342,#0E131B)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n="image" s={24} c="rgba(255,255,255,0.8)"/></span>
      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:'block', fontSize:15, fontWeight:600, color:ONB.ink }}>jane-smith-panoramic.png</span>
        <span style={{ display:'block', position:'relative', height:5, borderRadius:5, background:'#E8EEF8', marginTop:8, overflow:'hidden' }}><span style={{ position:'absolute', left:0, top:0, bottom:0, width:(up * 100) + '%', background:'linear-gradient(90deg,#3E8EFF,#90F0C5)', borderRadius:5 }}/></span>
        <span style={{ display:'grid', fontSize:13, marginTop:6 }}>
          <span style={{ gridArea:'1/1', color:ONB.mute, opacity:1 - done }}>Uploading · 2.4 MB</span>
          <span style={{ gridArea:'1/1', color:'#12925A', fontWeight:600, opacity:done, display:'flex', alignItems:'center', gap:5 }}><Ic n="check" s={13} c={ONB.green} w={3}/>Attached securely</span>
        </span>
      </span>
    </span>
  );
}
function ChatPanel({ L }){
  const reg = useReg();
  const typing = win(L, 2.75, 3.45, 0.2, 0.15);
  const up = easeInOut(ss(1.7, 2.5, L));
  return (
    <div style={{ width:820, height:720, ...glass(26, 0.94), padding:'24px 30px', boxSizing:'border-box', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:18, borderBottom:'1px solid rgba(216,224,222,0.7)' }}>
        <Avatar init="JS" g={GR.coral} s={46}/>
        <div style={{ flex:1 }}><div style={{ fontSize:20, fontWeight:700, color:ONB.ink }}>Jane Smith · Case messages</div><div style={{ fontSize:14, color:ONB.mute }}>Capital Root Canal Center and Capitol Smile Orthodontics</div></div>
        <Pill bg="rgba(34,201,122,0.14)" fg="#12925A"><Ix n="lock" s={12} c="#12925A"/>Secure</Pill>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', gap:16, paddingBottom:16 }}>
        <Bubble name="Dr. Emily Carter" time="9:18 AM" text="Thanks for the referral. Could you share Jane’s latest X-ray?" a={easeOut(ss(0.3, 0.8, L))}/>
        <Bubble me name="Melissa" time="9:19 AM" text="Here you go." file={{ up }} a={easeOut(ss(1.3, 1.8, L))}/>
        {L > 3.4 && <Bubble name="Dr. Emily Carter" time="9:20 AM" text="X-rays look great. Can we see Jane next Tuesday at 10?" a={easeOut(ss(3.45, 3.9, L))}/>}
        {L > 4.5 && <Bubble me name="Melissa" time="9:21 AM" text="Perfect. I’ll let her know today." a={easeOut(ss(4.55, 5.0, L))}/>}
        {typing > 0.01 && <span style={{ alignSelf:'flex-start', display:'flex', gap:6, padding:'14px 18px', borderRadius:18, background:'#F1F4F8', opacity:typing }}>{[0,1,2].map(i => <span key={i} style={{ width:8, height:8, borderRadius:'50%', background:ONB.mute, opacity:0.4 + 0.6 * Math.abs(Math.sin(L * 5 + i))}}/>)}</span>}
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ flex:1, height:54, borderRadius:14, border:'1.5px solid rgba(216,224,222,0.9)', background:'#fff', display:'flex', alignItems:'center', padding:'0 18px', fontSize:16, color:ONB.mute }}>Write a message</div>
        <span ref={reg('send')} style={{ width:54, height:54, borderRadius:14, background:'linear-gradient(160deg,#5BA0FF,#2F7DF5)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="send" s={22} c="#fff"/></span>
      </div>
    </div>
  );
}
function MiniModal({ title, sub, w = 820, children }){
  return (
    <div style={{ width:w, ...glass(26, 0.96), padding:'30px 36px 32px', boxSizing:'border-box' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><div style={{ fontSize:28, fontWeight:600, color:ONB.ink, letterSpacing:'-0.015em' }}>{title}</div>{sub && <div style={{ fontSize:16, color:ONB.mute, marginTop:6 }}>{sub}</div>}</div>
        <span style={{ width:40, height:40, borderRadius:12, border:'1px solid rgba(216,224,222,0.9)', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}><Ic n="x" s={16} c={ONB.text}/></span>
      </div>
      <div style={{ marginTop:22 }}>{children}</div>
    </div>
  );
}
function Swap({ L, at, a, b }){
  const p = easeOutStrong(ss(at, at + 0.4, L));
  return <span style={{ display:'grid' }}><span style={{ gridArea:'1/1', opacity:1 - p, filter: p > 0.01 ? `blur(${p * 6}px)` : 'none' }}>{a}</span>{p > 0 && <span style={{ gridArea:'1/1', opacity:p, filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : 'none' }}>{b}</span>}</span>;
}
function Field2({ label, children, focus = 0, fid }){
  const reg = useReg(); const t = useLt();
  return (
    <div><Label>{label}</Label>
      <div style={{ position:'relative' }}>
        <GlowRim on={focus > 0.01} radius={14} spread={6} blur={14} opacity={0.5 * focus} pulse={t}/>
        <div ref={reg(fid)} style={{ position:'relative', minHeight:50, borderRadius:14, padding:'13px 16px', boxSizing:'border-box', background:'#fff', ...focusStyle(focus), fontSize:15, color:ONB.ink, display:'flex', alignItems:'center', justifyContent:'space-between' }}>{children}</div>
      </div>
    </div>
  );
}
function EditPiece({ L }){
  return (
    <MiniModal title="Update Referral">
      <Field2 label="Note"><span>{NOTE_TXT}</span></Field2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
        <Field2 label="First Name">Jane</Field2><Field2 label="Last Name">Smith</Field2>
      </div>
      <div style={{ marginTop:16 }}><Field2 label="Insurance Company" fid="ins" focus={win(L, 0.7, 2.0, 0.25, 0.4)}><Swap L={L} at={1.3} a="Guardian Dental" b="Delta Dental"/><Ic n="chev" s={16} c={ONB.text}/></Field2></div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24 }}><GBtn label="Save" icon={null} tone="accent" clk={L - 2.4} fid="save" pad="14px 46px" loading="Saving" loadDur={0.8}/></div>
    </MiniModal>
  );
}
function InvitePiece({ L }){
  const r = (x) => easeOutStrong(ss(x, x + 0.4, L));
  const val = (x, v, ph) => { const p = r(x); return <span style={{ display:'grid' }}>{p < 1 && <span style={{ gridArea:'1/1', color:ONB.mute, opacity:1 - p }}>{ph}</span>}{p > 0 && <span style={{ gridArea:'1/1', opacity:p, filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : 'none' }}>{v}</span>}</span>; };
  return (
    <MiniModal title="Invite a practice" sub="Send a CaseLink invitation to your referral partner" w={840}>
      <Field2 label="Practice name" focus={win(L, 0.3, 1.0, 0.2, 0.3)}>{val(0.5, 'Georgetown Gum Specialists', 'e.g. Bright Smiles Dental')}</Field2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:14 }}>
        <Field2 label="First Name">{val(0.7, 'Olivia', 'Dr Franklin')}</Field2><Field2 label="Last Name">{val(0.8, 'Grant', 'Smith')}</Field2>
      </div>
      <div style={{ marginTop:14 }}><Field2 label="Email">{val(0.95, 'office@georgetowngum.com', 'contact@practice.com')}</Field2></div>
      <div style={{ display:'flex', gap:26, marginTop:18 }}><Radio label="General Dentist" t={L}/><Radio label="Specialist" at={1.3} t={L}/><Radio label="Pediatric Dentist" t={L}/></div>
      <div style={{ marginTop:18, padding:'14px 18px', borderRadius:14, background:ONB.accentSoft, color:'#2F7DF5', fontSize:15, lineHeight:1.45, display:'flex', gap:12 }}><Ic n="info" s={18} c="#2F7DF5"/>They’ll receive an email with a setup link, your message, and the Referral Partner Guide PDF. They can be set up in under 2 minutes.</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:16, marginTop:22 }}>
        <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, fontWeight:600, color:'#12925A', ...bi(L, 3.3, 0.5) }}><Ic n="check" s={16} c={ONB.green} w={3}/>Invite sent to Georgetown Gum Specialists</span>
        <GBtn label="Send invite" icon={null} tone="accent" clk={L - 2.3} fid="send" pad="14px 40px" loading="Sending" loadDur={0.8}/>
      </div>
    </MiniModal>
  );
}
function ExportPiece({ L }){
  return (
    <MiniModal title="Export referrals received" w={760}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Field2 label="Start Date *">09/01/2026<Ic n="cal" s={17} c={ONB.mute}/></Field2><Field2 label="End Date *">09/28/2026<Ic n="cal" s={17} c={ONB.mute}/></Field2>
      </div>
      <div style={{ marginTop:14 }}><Field2 label="Status">All statuses<Ic n="chev" s={16} c={ONB.text}/></Field2></div>
      <div style={{ marginTop:14 }}><Field2 label="Specialization">All specializations<Ic n="chev" s={16} c={ONB.text}/></Field2></div>
      <div style={{ marginTop:22 }}><GBtn label="Export" icon={null} tone="accent" clk={L - 1.3} fid="export" pad="15px 30px" full loading="Preparing" loadDur={0.8}/></div>
    </MiniModal>
  );
}
function CsvFly({ L }){
  const p = easeInOut(ss(2.2, 3.1, L));
  if (L < 2.1) return null;
  const done = easeOutBack(ss(3.1, 3.5, L));
  return (
    <div style={{ position:'absolute', left:lerp(960, 1420, p), top:lerp(600, 820, p), transform:`translate(-50%,-50%) scale(${lerp(0.6, 1.25, easeOut(ss(2.1, 2.5, L))).toFixed(4)}) rotate(${(-8 * (1 - p)).toFixed(2)}deg)`, zIndex:60, opacity:ss(2.1, 2.3, L) }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px 16px 16px', borderRadius:18, background:'#fff', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 14px 21px rgba(24,38,58,0.22)' }}>
        <span style={{ width:54, height:54, borderRadius:12, background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15 }}>CSV</span>
        <span><span style={{ display:'block', fontSize:19, fontWeight:700, color:ONB.ink }}>referrals-received-sep-2026.csv</span><span style={{ display:'flex', alignItems:'center', gap:6, fontSize:15, color:ONB.green, fontWeight:600, marginTop:3, opacity:done }}><Ic n="check" s={14} c={ONB.green} w={3}/>Downloaded</span></span>
      </div>
    </div>
  );
}
function Label3D({ text, sub, a }){
  return <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:9999, background:'rgba(255,255,255,0.95)', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 6px 19px rgba(24,38,58,0.1)', opacity:a, fontSize:20, fontWeight:700, color:ONB.ink }}>{text}<span style={{ fontWeight:500, color:ONB.mute }}>{sub}</span></div>;
}
function Drift({ t, t0, t1 }){
  const items = ['Referral sent to Capitol Smile Orthodontics','Status updated to Referral Received','Case note added','Invitation sent','Consultation scheduled'];
  const e = win(t, t0, t1, 0.8, 0.6);
  if (e <= 0.003) return null;
  return items.map((s, i) => {
    const x = [300, 1540, 420, 1480, 960][i], y = [230, 300, 820, 860, 150][i];
    const d = [0.35, 0.8, 0.55, 0.3, 0.2][i];
    return <div key={i} style={{ position:'absolute', left:x + Math.sin(t * 0.3 + i) * 30, top:y - (t - t0) * 12 * d, transform:`translate(-50%,-50%) scale(${(0.7 + d * 0.4).toFixed(3)})`, opacity:e * (0.4 + d * 0.6), filter:`blur(${((1 - d) * 6).toFixed(1)}px)`, display:'flex', alignItems:'center', gap:10, padding:'12px 20px 12px 12px', borderRadius:16, background:'rgba(255,255,255,0.95)', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 8px 18px rgba(24,38,58,0.12)', whiteSpace:'nowrap', fontSize:17, fontWeight:600, color:ONB.ink }}><span style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="check" s={14} c="#fff" w={3}/></span>{s}</div>;
  });
}

/* ---------- ending: network converges into the mark ---------- */
function Finale({ t }){
  const L = t - 141.4;
  if (L < 0 || t > 160) return null;
  const conv = easeInOut(ss(0, 1.1, L));
  const mk = ss(0.8, 1.8, L), mE = easeOut(mk);
  const shrink = easeInOut(ss(2.4, 3.3, L));
  const slide = easeInOut(ss(3.0, 3.8, L));
  const shiftX = (104 + 26 + WORD_W) / 2 - 52;
  const btn = easeOutStrong(ss(5.1, 5.8, L));
  const clk = L - 6.6;
  const cv = easeInOut(ss(6.65, 7.2, L));
  const sw = easeOutStrong(ss(6.75, 7.25, L));
  return (
    <div style={{ position:'absolute', inset:0, zIndex:75 }}>
      {conv < 1 && Array.from({ length:40 }).map((_, i) => { const a0 = hash(i + 41) * Math.PI * 2, r0 = 300 + hash(i + 43) * 700; const r = r0 * (1 - conv); return <span key={i} style={{ position:'absolute', left:960 + Math.cos(a0) * r * 1.4, top:520 + Math.sin(a0) * r * 0.8, width:10, height:10, marginLeft:-5, marginTop:-5, borderRadius:'50%', background:[BLUE, '#90F0C5', '#FFC794'][i % 3], opacity:(1 - conv) * clamp(L * 4), boxShadow:'0 0 12px rgba(62,142,255,0.5)' }}/>; })}
      <div style={{ position:'absolute', left:960, top:470, transform:'translate(-50%,-50%)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:26 }}>
          <div style={{ transform:`translateX(${(shiftX * (1 - slide)).toFixed(2)}px) rotate(${((1 - mE) * -220).toFixed(2)}deg) scale(${(lerp(0.3, 3.0, easeOutBack(mk)) * lerp(1, 1 / 3, shrink)).toFixed(4)})`, opacity:clamp(mk * 2), filter: mk < 0.95 ? `blur(${((1 - mE) * 18).toFixed(2)}px)` : 'none' }}><LogoFlow s={104} flow={easeOut(ss(0.8, 2.6, L))} sheen={ss(2.3, 3.3, L)}/></div>
          <WordmarkRise h={68} local={L} at={3.85}/>
        </div>
      </div>
      <div style={{ position:'absolute', left:0, right:0, top:556 }}><BlurLine t={L} t0={4.5} stagger={0.1} items={['Your','Link','to','Better','Patient','Care']} style={{ fontSize:36, fontWeight:500, color:ONB.text }}/></div>
      <div style={{ position:'absolute', left:960, top:700, transform:`translate(-50%,-50%) translateY(${((1 - btn) * 30).toFixed(2)}px) scale(${(pressScale(clk) * (1 + 0.04 * Math.sin(Math.PI * ss(6.9, 7.6, L)))).toFixed(4)})`, opacity:btn }}>
        <div style={{ position:'relative', display:'grid', padding:'24px 52px', borderRadius:9999, background:'linear-gradient(145deg,#FFFFFF 0%,#F1F4F9 100%)', boxShadow:'-6px -4px 13px rgba(255,255,255,0.95), 7px 6px 17px rgba(142,158,186,0.34), inset 1px 1px 1px rgba(255,255,255,1), inset -1px -1px 2px rgba(190,200,220,0.35)', fontSize:30, fontWeight:600, color:ONB.ink, whiteSpace:'nowrap', overflow:'hidden' }}>
          <span style={{ gridArea:'1/1', display:'flex', alignItems:'center', justifyContent:'center', gap:14, opacity:1 - sw, filter: sw > 0.01 ? `blur(${(sw * 10).toFixed(2)}px)` : 'none' }}>Start free today<Ic n="arrowR" s={24} c={ONB.ink} w={2.2}/></span>
          {sw > 0 && <span style={{ gridArea:'1/1', display:'flex', alignItems:'center', justifyContent:'center', gap:14, opacity:sw, filter: sw < 0.99 ? `blur(${((1 - sw) * 10).toFixed(2)}px)` : 'none' }}>caselink.net<Ic n="arrowR" s={24} c={ONB.ink} w={2.2}/></span>}
          <ClickFX clk={clk}/>
        </div>
        <GlowCursor x={lerp(470, 330, easeInOut(ss(5.6, 6.3, L)))} y={lerp(170, 56, easeInOut(ss(5.6, 6.3, L)))} z={1} click={clk >= 0 && clk < 0.72 ? clk : null} opacity={win(L, 5.5, 7.3, 0.3, 0.4)}/>
      </div>
    </div>
  );
}

/* ---------- gradient type, logo flow, sync card, pricing ---------- */
const GRAD = 'linear-gradient(90deg,#2F7DF5 0%,#3E8EFF 16%,#2DB0B2 36%,#E8904F 56%,#3E8EFF 78%,#2F7DF5 100%)';
const GP = 1600;
function gradFill(x, rt){ return { backgroundImage:GRAD, backgroundSize:`${GP}px 100%`, backgroundRepeat:'repeat-x', backgroundPosition:`${((rt * 170 - x) % GP).toFixed(1)}px 0`, WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', WebkitTextFillColor:'transparent' }; }
function GradText({ children, style }){ const rt = useTime(); return <span style={{ ...gradFill(0, rt), padding:'0.12em 0.05em 0.2em', margin:'0 -0.05em', ...style }}>{children}</span>; }

let LF_ID = 0;
// Mark with the brand gradient flowing through it as it lands, settling on the exact brand gradient.
function LogoFlow({ s = 104, flow = 1, sheen = 0 }){
  const id = useRef('lf' + (++LF_ID)).current;
  const ang = (1 - flow) * -300;
  const sx = lerp(-140, 400, sheen);
  const so = Math.sin(Math.PI * clamp(sheen)) * 0.8;
  return (
    <svg width={s} height={s} viewBox="-4 -4 264 264" fill="none" style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="127" x2="255" y2="127" gradientUnits="userSpaceOnUse" gradientTransform={`rotate(${ang.toFixed(2)} 127 127)`}>
          <stop stopColor="#3E8EFF"/><stop offset=".5" stopColor="#90F0C5"/><stop offset="1" stopColor="#FFC794"/>
        </linearGradient>
        <linearGradient id={id + 's'} x1={sx - 60} y1="0" x2={sx + 60} y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#fff" stopOpacity="1"/><stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={LOGO_D} fill={`url(#${id})`}/>
      {so > 0.01 && <path d={LOGO_D} fill={`url(#${id}s)`} opacity={so}/>}
    </svg>
  );
}

function FocusBackdrop({ t }){
  return <Tilt t={t} env={1} fade={0.42} soft={1.5} w={WIN_W} h={WIN_H} ns="fb" lt={46} fx={lerp(520, 600, ss(38.3, 44.4, t))} fy={470} z={0.92} rx={8} ry={-16} radius={20}><App tm={46} page={<RegCtx.Provider value="fb"><HomePage t={46} p0={32}/></RegCtx.Provider>}/></Tilt>;
}

// Referring practice's view: the status the specialist just saved lands here live.
function SyncCard({ t, tm, e }){
  const a = easeOutStrong(ss(64.2, 65.1, t));
  const v = a * e; if (v <= 0.003) return null;
  const sy = easeOutStrong(ss(75.3, 75.75, tm));
  const ring = ss(75.3, 76.2, tm);
  const glow = win(tm, 75.2, 77.4, 0.25, 0.8);
  const bl = (1 - a) * 16 + (1 - e) * 16;
  const pulse = (t * 0.8) % 1;
  return (
    <div style={{ position:'absolute', left:96, top:300, perspective:1600, zIndex:45, opacity:v, filter: bl > 0.3 ? `blur(${bl.toFixed(2)}px)` : 'none' }}>
      <div style={{ position:'relative', width:480, transform:`translateX(${((1 - a) * -140).toFixed(2)}px) rotateY(${lerp(34, 14, a).toFixed(2)}deg) rotateX(4deg)` }}>
        <GlowRim on={glow > 0.01} radius={26} spread={10} blur={26} opacity={0.6 * glow} pulse={t}/>
        <div style={{ position:'relative', ...glass(26, 0.95), padding:'24px 26px 26px' }}>
          <LiquidSheen radius={26} period={6} strength={0.35}/>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Avatar init="CR" g={GR.blue} s={44}/>
            <div style={{ flex:1 }}><div style={{ fontSize:17, fontWeight:700, color:ONB.ink }}>Capital Root Canal Center</div><div style={{ fontSize:14, color:ONB.mute, marginTop:2 }}>Endodontics</div></div>
          </div>
          <div style={{ height:1, background:'rgba(216,224,222,0.8)', margin:'18px 0' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Avatar init="JS" g={GR.coral} s={40}/>
            <div><div style={{ fontSize:19, fontWeight:700, color:ONB.ink }}>Jane Smith</div><div style={{ fontSize:14, color:ONB.mute, marginTop:2 }}>Sent to Capitol Smile Orthodontics</div></div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.1em', color:ONB.mute, marginTop:22 }}>STATUS</div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
            <span style={{ position:'relative', width:12, height:12, borderRadius:'50%', background:mixHex('#3E8EFF', '#22C97A', sy), flexShrink:0 }}>{ring > 0 && ring < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid ' + ONB.green, transform:`scale(${(1 + ring * 2.2).toFixed(3)})`, opacity:1 - ring }}/>}</span>
            <span style={{ fontSize:26, fontWeight:700, color:ONB.ink, letterSpacing:'-0.01em', display:'grid' }}>
              <span style={{ gridArea:'1/1', opacity:1 - sy, filter: sy > 0.01 ? `blur(${(sy * 8).toFixed(2)}px)` : 'none' }}>Created</span>
              {sy > 0 && <span style={{ gridArea:'1/1', opacity:sy, filter: sy < 0.99 ? `blur(${((1 - sy) * 8).toFixed(2)}px)` : 'none', whiteSpace:'nowrap' }}>Referral Received</span>}
            </span>
          </div>
          <div style={{ display:'flex', gap:6, marginTop:16 }}>{[0, 1, 2, 3].map(i => <span key={i} style={{ flex:1, height:6, borderRadius:6, background:'rgba(216,224,222,0.8)', overflow:'hidden' }}><span style={{ display:'block', height:'100%', width: i === 0 ? '100%' : i === 1 ? (sy * 100) + '%' : '0%', background: i === 0 ? ONB.accent : ONB.green }}/></span>)}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:18, fontSize:14, fontWeight:600, color:'#12925A', opacity:sy }}>
            <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:ONB.green, flexShrink:0 }}><span style={{ position:'absolute', inset:0, borderRadius:'50%', background:ONB.green, transform:`scale(${(1 + pulse * 1.8).toFixed(3)})`, opacity:1 - pulse }}/></span>Updated just now by Capitol Smile Orthodontics
          </div>
        </div>
      </div>
    </div>
  );
}

const PLANS = [
  { eyebrow:'GENERAL DENTIST', ec:'#12925A', cc:'linear-gradient(160deg,#3FD990,#1EB36B)', sub:'Free to get started. No card required', feats:['Unlimited referrals','Secure file sharing','Real-time updates','HIPAA compliance'] },
  { eyebrow:'SPECIALIST', ec:'#2F7DF5', cc:'linear-gradient(160deg,#6AA8FF,#2F7DF5)', sub:'First month free, then billed monthly', feats:['Everything in the General Dentist plan','Referral inbox','Analytics dashboard','Case timelines'] },
];
function Pricing2({ t }){
  const rt = useTime();
  const L = t - 123.8;
  if (L < -0.1 || L > 6.0) return null;
  const out = easeInOut(ss(5.1, 5.75, L));
  const price = Math.round(299 * eQuint(ss(2.9, 3.9, L)));
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:48, perspective:2000, zIndex:50 }}>
      {PLANS.map((p, i) => {
        const a = easeOutStrong(ss(0.1 + i * 0.16, 1.2 + i * 0.16, L));
        const d = i ? -1 : 1;
        const bl = (1 - a) * 18 + out * 16;
        const hl = i === 1;
        return (
          <div key={i} style={{ position:'relative', width:600, opacity:clamp(a * 1.4) * (1 - out), filter: bl > 0.3 ? `blur(${bl.toFixed(2)}px)` : 'none',
            transform:`translateY(${((1 - a) * 160).toFixed(2)}px) rotateX(${((1 - a) * 26).toFixed(2)}deg) rotateY(${(d * lerp(10, 5, ss(0.5, 5.8, L))).toFixed(2)}deg) scale(${(0.94 + 0.06 * a - out * 0.02).toFixed(4)})` }}>
            {hl && <div style={{ position:'absolute', inset:-2.5, borderRadius:36.5, background:`linear-gradient(${((rt * 60) % 360).toFixed(1)}deg,#3E8EFF,#90F0C5,#FFC794,#3E8EFF)` }}/>}
            <div style={{ position:'relative', ...glass(34, 0.94), ...(hl ? { border:'none', background:'linear-gradient(160deg,#FFFFFF,#F4F8FF)' } : {}), padding:'46px 48px 44px', boxSizing:'border-box', height:680, display:'flex', flexDirection:'column' }}>
              <LiquidSheen radius={34} period={7} phase={i * 0.4} strength={0.35}/>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:40, ...fu(L, 0.55 + i * 0.16) }}>
                <span style={{ fontSize:15, fontWeight:700, letterSpacing:'0.12em', color:p.ec }}>{p.eyebrow}</span>
                {hl && <span style={{ position:'relative', padding:2, borderRadius:9999, background:`linear-gradient(${((rt * 60) % 360).toFixed(1)}deg,#3E8EFF,#90F0C5,#FFC794,#3E8EFF)`, ...bi(L, 1.9, 0.6) }}><span style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:9999, background:'#fff', fontSize:16, fontWeight:700 }}><Ic n="sparkle" s={15} c={BLUE}/><GradText>Most popular</GradText></span></span>}
              </div>
              {i === 0
                ? <div style={{ display:'flex', alignItems:'baseline', gap:14, marginTop:22, ...bi(L, 0.7, 0.6) }}><span style={{ fontSize:128, fontWeight:700, letterSpacing:'-0.05em', lineHeight:1, color:ONB.ink }}>$0</span><span style={{ fontSize:30, fontWeight:500, color:ONB.text }}>per month</span></div>
                : <div style={{ display:'flex', alignItems:'baseline', gap:12, marginTop:22, ...bi(L, 0.85, 0.6) }}><span style={{ fontSize:128, fontWeight:700, letterSpacing:'-0.05em', lineHeight:1, color:ONB.ink, fontVariantNumeric:'tabular-nums' }}>${price}</span><span style={{ fontSize:30, fontWeight:500, color:ONB.text }}>per month</span></div>}
              <div style={{ fontSize:19, color:ONB.mute, marginTop:12, ...bi(L, 0.95 + i * 0.16, 0.5) }}>{p.sub}</div>
              <div style={{ height:1.5, marginTop:26, background:'linear-gradient(90deg,rgba(62,142,255,0.4),rgba(144,240,197,0.4),rgba(255,199,148,0.4))', transform:`scaleX(${easeInOut(ss(1.0 + i * 0.16, 1.7 + i * 0.16, L)).toFixed(4)})`, transformOrigin:'left' }}/>
              <div style={{ display:'flex', flexDirection:'column', gap:20, marginTop:30 }}>
                {p.feats.map((f, j) => {
                  const at = 1.35 + i * 0.12 + j * 0.2;
                  const c = easeOutBack(ss(at, at + 0.4, L)), ring = ss(at, at + 0.8, L);
                  return (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:16 }}>
                      <span style={{ position:'relative', width:34, height:34, flexShrink:0 }}>
                        {ring > 0 && ring < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid ' + p.ec, transform:`scale(${(1 + ring * 0.9).toFixed(3)})`, opacity:(1 - ring) * 0.7 }}/>}
                        <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:p.cc, display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${c.toFixed(4)})` }}><Ic n="check" s={17} c="#fff" w={3}/></span>
                      </span>
                      <span style={{ fontSize:24, fontWeight:500, color:ONB.ink, letterSpacing:'-0.01em', ...bi(L, at + 0.05, 0.5) }}>{f}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:'auto', ...bi(L, 2.4 + i * 0.15, 0.6) }}>
                {i === 0
                  ? <span style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'16px 30px', borderRadius:9999, background:'linear-gradient(160deg,#2A3130,#141918)', color:'#fff', fontSize:20, fontWeight:600 }}>Get started<Ic n="arrowR" s={18} c="#fff" w={2.2}/></span>
                  : <span style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'16px 26px', borderRadius:9999, background:'linear-gradient(90deg,#EBF3FF,#E6FAF1 55%,#FFF4E6)', border:'1px solid rgba(255,255,255,0.95)', color:ONB.ink, fontSize:20, fontWeight:600 }}><Ic n="sparkle" s={18} c={BLUE}/>Start 1 month free</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- v3: pop-out UI, split layout ---------- */
const LAPC = { fx:740, fy:470, z:1.33, ox:0, oy:0, rx:0, ry:0 };
const SIDE = { fx:740, fy:470, z:0.7, ox:330, oy:10, rx:5, ry:-13 };
const mixCam = (a, b, p) => { const o = {}; for (const k in b) o[k] = lerp(a[k] != null ? a[k] : b[k], b[k], p); return o; };
const liftAt = (t, a, b, fi = 0.7, fo = 0.6) => easeInOut(clamp((t - a) / fi)) * easeInOut(clamp((b - t) / fo));
const detScroll = tm => easeInOut(ss(76.8, 78.0, tm)) * 250 * (1 - easeInOut(ss(88.0, 88.7, tm)));
const Dim = ({ m }) => m > 0.003 ? <div style={{ position:'absolute', inset:0, background:`rgba(255,255,255,${(0.32 * m).toFixed(3)})`, zIndex:30 }}/> : null;
function lr(key){
  const el = focusReg[key], k = 'r:' + key;
  if (!el || !el.isConnected) return lastPos[k] || null;
  let x = 0, y = 0, e = el;
  while (e && !(e.dataset && e.dataset.proot)) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; }
  if (!e) return lastPos[k] || null;
  return (lastPos[k] = { x, y, w:el.offsetWidth, h:el.offsetHeight });
}
// The real UI, with one region lifting out of it toward the viewer while the rest softens behind.
function PopTilt({ t, env = 1, cam, lift = 0, region, extra, pad = [0,0,0,0], clipPad, sy = 0, tw = 900, th = 720, to, render, ns, lt, cur, soft = 0 }){
  const root = useRef(null), croot = useRef(null);
  const [, bump] = useState(0);
  useEffect(() => { const a = setTimeout(() => bump(v => v + 1), 40); return () => clearTimeout(a); }, [Math.round(t * 10)]);
  if (env <= 0.003) return null;
  const c0 = { fx:740, fy:470, z:1, ox:0, oy:0, rx:0, ry:0, ...cam };
  const de = 1 - env;
  const tf = c => `translate(${(960 + c.ox).toFixed(2)}px, ${(540 + c.oy).toFixed(2)}px) perspective(2600px) rotateX(${(c.rx + de * 12).toFixed(3)}deg) rotateY(${(c.ry + de * (c.ry >= 0 ? 16 : -16)).toFixed(3)}deg) scale(${(c.z * (1 - de * 0.06) / SS).toFixed(5)}) translate(${(-c.fx * SS).toFixed(2)}px, ${(-c.fy * SS).toFixed(2)}px)`;
  const R0 = region && lift > 0.001 ? lr(region) : null;
  let c1 = null, clip = null;
  if (R0) {
    const R = { x:R0.x - pad[3], y:R0.y - sy - pad[0], w:R0.w + pad[1] + pad[3], h:R0.h + pad[0] + pad[2] };
    const zt = Math.min(tw / R.w, th / R.h), W = R.w * zt;
    const tg = { fx:R.x + R.w / 2, fy:R.y + R.h / 2, z:zt, ox:Math.max(W / 2 - 100, 290), oy:0, rx:3, ry:-7, ...to };
    c1 = {}; for (const k in c0) c1[k] = lerp(c0[k], tg[k], lift);
    const cp = clipPad || [0,0,0,0];
    const rEl0 = focusReg[region]; const rad = rEl0 && rEl0.isConnected ? (parseFloat(getComputedStyle(rEl0).borderTopLeftRadius) || 0) : 18;
    clip = `inset(${(R.y - cp[0]).toFixed(1)}px ${(WIN_W - R.x - R.w - cp[1]).toFixed(1)}px ${(WIN_H - R.y - R.h - cp[2]).toFixed(1)}px ${(R.x - cp[3]).toFixed(1)}px round ${Math.min(rad, 40).toFixed(1)}px)`;
    if (rEl0 && rEl0.isConnected && rEl0.dataset && rEl0.dataset.stack) {
      const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
      const parts = [];
      for (const ch of rEl0.children) {
        const card = ch.firstElementChild && ch.firstElementChild.offsetHeight >= ch.offsetHeight - 2 ? (ch.querySelector('[style*="border-radius"]') || ch) : ch;
        let x = 0, y = 0, e = card; while (e && !(e.dataset && e.dataset.proot)) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; }
        const rad2 = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 14;
        parts.push(rr(x, y - sy, card.offsetWidth, card.offsetHeight, rad2));
      }
      if (parts.length) clip = `path('${parts.join(' ')}')`;
    }
    const xe = extra && focusReg[extra] && focusReg[extra].isConnected ? lr(extra) : null;
    if (xe) {
      const m = 18, Ex = xe.x - m, Er = xe.x + xe.w + m, Eb = xe.y - sy + xe.h + m, Rr = R.x + R.w, Rb = R.y + R.h;
      if (Eb > Rb) clip = `polygon(${[[R.x, R.y], [Rr, R.y], [Rr, Rb], [Er, Rb], [Er, Eb], [Ex, Eb], [Ex, Rb], [R.x, Rb]].map(p => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',')})`;
    }
  }
  const onClone = !!(cur && cur.clone);
  const rEl = onClone ? (c1 ? croot.current : null) : root.current;
  let cp = null, cClk = null, cOp = 0;
  if (cur && rEl) { cp = curAt(cur.L, cur.pts, rEl); cClk = clickAt(cur.L, cur.clicks || []); cOp = cur.vis != null ? cur.vis : 1; }
  const provide = n => <LtCtx.Provider value={lt != null ? lt : t}><RegCtx.Provider value={n}>{render(n)}</RegCtx.Provider></LtCtx.Provider>;
  const pk = Math.max(c1 ? lift : 0, clamp(soft / 3));
  const bs = pk > 0.02 ? 6 * pk : 0;
  const blur = 0;
  return (
    <div style={{ position:'absolute', inset:0, opacity:env, willChange:'opacity', pointerEvents:'none' }}>
      <div style={{ position:'absolute', left:0, top:0, width:WIN_W * SS, height:WIN_H * SS, transformOrigin:'0 0', backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:tf(c0), filter: bs > 0.3 ? `blur(${(bs * SS).toFixed(1)}px)` : 'none', opacity: 1 - 0.4 * pk }}><div style={SSW}>
        <div ref={root} data-proot="1" style={{ position:'absolute', left:0, top:0, width:WIN_W, height:WIN_H, borderRadius:20 }}>
          {provide(ns)}
          {cp && !onClone && cOp > 0.01 && <GlowCursor x={cp.x} y={cp.y} z={c0.z} click={cClk} opacity={cOp}/>}
        </div>
      </div></div>
      {c1 && <div style={{ position:'absolute', inset:0, filter:`drop-shadow(0 0 ${(12 * lift).toFixed(1)}px rgba(62,142,255,${(0.16 * lift).toFixed(3)})) drop-shadow(0 ${(30 * lift).toFixed(1)}px ${(46 * lift).toFixed(1)}px rgba(24,38,58,${(0.14 * lift).toFixed(3)}))` }}>
        <div style={{ position:'absolute', left:0, top:0, width:WIN_W * SS, height:WIN_H * SS, transformOrigin:'0 0', backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:tf(c1) }}><div style={SSW}>
          <div ref={croot} data-proot="1" style={{ position:'absolute', left:0, top:0, width:WIN_W, height:WIN_H, clipPath:clip }}>{provide(ns + 'c')}</div>
          {cp && onClone && cOp > 0.01 && <GlowCursor x={cp.x} y={cp.y} z={c1.z} click={cClk} opacity={cOp}/>}
        </div></div>
      </div>}
    </div>
  );
}

const REF_ROWS = [
  ['JS','Jane Smith','Capital Root Canal Center','Early interceptive',['Referral received','#12925A','rgba(34,201,122,0.14)'],'Sep 28',GR.coral],
  ['OF','Owen Fletcher','Dupont Circle Family Dentistry','Invisalign',['Consult booked','#2F7DF5','#EBF3FF'],'Sep 27',GR.violet],
  ['MS','Maya Sterling','Capitol Hill Dental Associates','Braces',['Treatment started','#B86E12','rgba(255,169,64,0.18)'],'Sep 26',GR.amber],
  ['LK','Lila Kensington','Mosaic Dental Studio','General ortho eval',['Consult booked','#2F7DF5','#EBF3FF'],'Sep 25',GR.teal],
  ['NA','Nolan Avery','Little Smiles Pediatric Dentistry','Habit correction',['Completed','#12925A','rgba(34,201,122,0.14)'],'Sep 24',GR.purple],
  ['BC','Brooke Callahan','Dupont Circle Family Dentistry','Impacted site',['Referral received','#12925A','rgba(34,201,122,0.14)'],'Sep 23',GR.blue],
  ['EW','Ethan Walsh','Capitol Hill Dental Associates','Invisalign',['Completed','#12925A','rgba(34,201,122,0.14)'],'Sep 22',GR.coral],
  ['MT','Mia Torres','Mosaic Dental Studio','Braces',['Treatment started','#B86E12','rgba(255,169,64,0.18)'],'Sep 21',GR.violet],
];
function ReferralsPage({ glow = 0 }){
  const reg = useReg();
  const cols = '1.3fr 1.6fr 1.1fr 1fr 0.6fr';
  return (
    <div style={{ position:'absolute', inset:0, padding:'24px 34px', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div><div style={{ fontSize:28, fontWeight:700, color:ONB.ink, letterSpacing:'-0.02em' }}>Referrals</div><div style={{ fontSize:15, color:ONB.text, marginTop:6 }}>48 received this quarter from 12 practices</div></div>
        <div style={{ position:'relative' }}>
          <GlowRim on={glow > 0.01} radius={9999} spread={7} blur={16} opacity={0.55 * glow} pulse={0}/>
          <span ref={reg('export')} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:9, padding:'12px 22px', borderRadius:9999, background:'#fff', border:'1.5px solid rgba(216,224,222,0.95)', fontSize:15, fontWeight:600, color:ONB.ink }}><Ix n="download" s={17} c={ONB.ink}/>Export</span>
        </div>
      </div>
      <div style={{ marginTop:18 }}><Tabs items={['Received','Sent']} active={0} size={14}/></div>
      <div style={{ ...card(20, '8px 22px'), marginTop:18 }}>
        <div style={{ display:'grid', gridTemplateColumns:cols, gap:16, padding:'14px 0', fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:ONB.mute, borderBottom:'1px solid rgba(232,238,248,0.9)' }}><span>PATIENT</span><span>REFERRING PRACTICE</span><span>REASON</span><span>STATUS</span><span>DATE</span></div>
        {REF_ROWS.map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:cols, gap:16, alignItems:'center', height:70, borderBottom: i < REF_ROWS.length - 1 ? '1px solid rgba(232,238,248,0.9)' : 'none' }}>
            <span style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar init={r[0]} g={r[6]} s={36}/><span style={{ fontSize:15.5, fontWeight:600, color:ONB.ink }}>{r[1]}</span></span>
            <span style={{ fontSize:14.5, color:ONB.text }}>{r[2]}</span>
            <span style={{ fontSize:14.5, color:ONB.text }}>{r[3]}</span>
            <span><Pill bg={r[4][2]} fg={r[4][1]}>{r[4][0]}</Pill></span>
            <span style={{ fontSize:14.5, color:ONB.mute }}>{r[5]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [['Pick the practice',210.4],['Add the patient',213.7],['Drop in the X-ray',215.8],['Send',218.4]];
function StepList({ t }){
  const t0 = 212.3, t1 = 220.9;
  if (t < t0 - 0.1 || t > t1 + 0.8) return null;
  const out = easeInOut(clamp((t - t1) / 0.6));
  const cur = STEPS.findIndex(s => t < s[1]);
  return (
    <div style={{ position:'absolute', left:140, width:620, top:540, transform:'translateY(-50%)', zIndex:80, opacity:1 - out, filter: out > 0.01 ? `blur(${(out * 16).toFixed(2)}px)` : 'none' }}>
      <BlurLine t={t} t0={t0} stagger={0.08} items={['Four','clicks.']} style={{ justifyContent:'flex-start', fontSize:76, fontWeight:700, color:ONB.ink, letterSpacing:'-0.035em' }}/>
      <div style={{ display:'flex', flexDirection:'column', gap:22, marginTop:36 }}>
        {STEPS.map((s, i) => {
          const a = easeOutStrong(ss(t0 + 0.35 + i * 0.12, t0 + 0.95 + i * 0.12, t));
          const d = easeOutBack(ss(s[1], s[1] + 0.35, t)), ring = ss(s[1], s[1] + 0.7, t);
          const done = t >= s[1], on = i === cur;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:20, opacity:a * (done || on ? 1 : 0.42), filter: a < 0.99 ? `blur(${((1 - a) * 10).toFixed(2)}px)` : 'none', transform:`translateX(${((1 - a) * -24).toFixed(2)}px)` }}>
              <span style={{ position:'relative', width:44, height:44, flexShrink:0 }}>
                {ring > 0 && ring < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid ' + ONB.green, transform:`scale(${(1 + ring * 0.9).toFixed(3)})`, opacity:(1 - ring) * 0.7 }}/>}
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid ${on ? BLUE : 'rgba(216,224,222,0.95)'}`, background:'#fff' }}/>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${d.toFixed(4)})` }}><Ic n="check" s={20} c="#fff" w={3}/></span>
              </span>
              <span style={{ fontSize:36, fontWeight:600, letterSpacing:'-0.02em', color:ONB.ink }}>{on ? <GradText>{s[0]}</GradText> : s[0]}</span>
            </div>);
        })}
      </div>
    </div>
  );
}

const PMS_PT = ['Adams, Leo','Brooks, Ava','Chen, Marcus','Smith, Jane','Torres, Mia','Walsh, Ethan','Young, Noah'];
const PMS_F = [['Name','Jane Smith','users'],['Insurance','Guardian Dental','shield'],['Imaging','Panoramic X-ray','image']];
function PMSScene({ t, a, b }){
  const rt = useTime();
  const e = shotEnv(t, a, b, 0.5, 0.45);
  if (e <= 0.003) return null;
  const L = t - a - 0.2;
  const inA = easeOutStrong(ss(0, 0.9, L)), inB = easeOutStrong(ss(0.25, 1.15, L));
  const line = easeInOut(ss(1.0, 1.8, L));
  const dep = i => 2.0 + i * 0.35, land = i => dep(i) + 0.85;
  const st = easeOutStrong(ss(3.9, 4.3, L));
  const back = ss(4.3, 5.2, L), appt = easeOutStrong(ss(5.2, 5.6, L));
  const PX = 780, PY = 262, CX = 1360, CY = 262, WW = 480, WH = 520;
  const winS = (p, ry) => ({ opacity:clamp(p * 1.4), filter: p < 0.99 ? `blur(${((1 - p) * 14).toFixed(2)}px)` : 'none', transform:`translateY(${((1 - p) * 60).toFixed(1)}px) rotateY(${(ry * (1 + (1 - p) * 1.5)).toFixed(2)}deg)` });
  const chip = (label, icon, green) => <span style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 16px 10px 10px', borderRadius:9999, background:'#fff', border:'1px solid rgba(232,238,248,0.95)', boxShadow:'0 7px 20px rgba(24,38,58,0.18)', fontSize:15, fontWeight:600, color:ONB.ink, whiteSpace:'nowrap' }}><span style={{ width:28, height:28, borderRadius:'50%', background: green ? ONB.greenSoft : ONB.accentSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n={icon} s={15} c={green ? ONB.green : ONB.accent}/></span>{label}</span>;
  const fly = (key, p, x0, y0, x1, y1, el) => { if (p <= 0 || p >= 1) return null; const q = easeInOut(p); const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(Math.PI * q) * 90; const o = clamp(p * 6) * clamp((1 - p) * 6); return <div key={key} style={{ position:'absolute', left:x, top:y, transform:`translate(-50%,-50%) scale(${(1 + Math.sin(Math.PI * q) * 0.1).toFixed(3)})`, opacity:o, zIndex:70 }}>{el}</div>; };
  const flow = (rt * 0.35) % 1;
  const sw = (p, A, B) => <span style={{ display:'grid' }}><span style={{ gridArea:'1/1', opacity:1 - p, filter: p > 0.01 ? `blur(${(p * 6).toFixed(2)}px)` : 'none' }}>{A}</span>{p > 0 && <span style={{ gridArea:'1/1', opacity:p, filter: p < 0.99 ? `blur(${((1 - p) * 6).toFixed(2)}px)` : 'none', whiteSpace:'nowrap' }}>{B}</span>}</span>;
  return (
    <div style={{ position:'absolute', inset:0, opacity:e, zIndex:40 }}>
      <div style={{ position:'absolute', left:PX, top:PY, width:WW, height:WH, perspective:1800 }}>
        <div style={{ position:'absolute', left:0, right:0, top:-66, display:'flex', justifyContent:'center', ...winS(inA, 8), transformOrigin:'50% 346px' }}><Label3D text="Your practice software" sub="" a={1}/></div>
        <div style={{ width:WW, height:WH, borderRadius:24, background:'#F4F6F8', border:'1px solid #D5DBE1', boxShadow:'0 18px 27px rgba(24,38,58,0.18)', overflow:'hidden', boxSizing:'border-box', ...winS(inA, 8) }}>
          <div style={{ height:40, background:'linear-gradient(180deg,#E9EDF1,#DDE3E8)', borderBottom:'1px solid #CCD3DA', display:'flex', alignItems:'center', gap:8, padding:'0 14px', boxSizing:'border-box' }}>
            {[0,1,2].map(i => <span key={i} style={{ width:11, height:11, borderRadius:'50%', background:'#C3CAD2' }}/>)}
            <span style={{ marginLeft:10, fontSize:13.5, fontWeight:600, color:'#56616D' }}>Practice management</span>
          </div>
          <div style={{ display:'flex', height:WH - 42 }}>
            <div style={{ width:170, borderRight:'1px solid #DDE2E7', background:'#EEF1F4', padding:'12px 0', boxSizing:'border-box' }}>
              <div style={{ padding:'0 14px 8px', fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'#8A94A0' }}>PATIENTS</div>
              {PMS_PT.map((n, i) => <div key={n} style={{ padding:'9px 14px', fontSize:13.5, background: i === 3 ? '#D6E6FF' : 'transparent', color: i === 3 ? '#1F4E9C' : '#4A5560', fontWeight: i === 3 ? 600 : 400 }}>{n}</div>)}
            </div>
            <div style={{ flex:1, padding:'16px 18px', boxSizing:'border-box' }}>
              <div style={{ height:16, marginBottom:12, fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'#8A94A0' }}>PATIENT CHART · #10482</div>
              {PMS_F.map((f, i) => { const hl = win(L, dep(i) - 0.1, dep(i) + 0.7, 0.15, 0.4); return (
                <div key={f[0]} style={{ height:52, marginBottom:10 }}>
                  <div style={{ height:16, marginBottom:4, fontSize:11.5, color:'#8A94A0' }}>{f[0]}</div>
                  <div style={{ height:32, borderRadius:4, background: hl > 0.01 ? mixHex('#FFFFFF', '#FFF3CF', hl) : '#fff', border:'1px solid #D5DBE1', display:'flex', alignItems:'center', padding:'0 10px', fontSize:14, color:'#2E3842', boxSizing:'border-box' }}>{f[1]}</div>
                </div>); })}
              <div style={{ height:16, margin:'8px 0 6px', fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'#8A94A0' }}>APPOINTMENTS</div>
              <div style={{ height:34, marginBottom:8, borderRadius:4, background:'#fff', border:'1px solid #D5DBE1', display:'flex', alignItems:'center', padding:'0 10px', fontSize:13.5, color:'#6A7480', boxSizing:'border-box' }}>Cleaning · Mar 3</div>
              <div style={{ height:34, borderRadius:4, background: mixHex('#FFFFFF', '#DDF7EA', appt), border:`1px solid ${appt > 0.5 ? 'rgba(34,201,122,0.5)' : '#D5DBE1'}`, display:'flex', alignItems:'center', gap:8, padding:'0 10px', fontSize:13.5, fontWeight:600, color:'#1E7A4E', boxSizing:'border-box', opacity:0.25 + 0.75 * appt, filter: appt < 0.99 && appt > 0 ? `blur(${((1 - appt) * 5).toFixed(2)}px)` : 'none' }}>{appt > 0 ? <><Ic n="check" s={13} c={ONB.green} w={3}/>Ortho consult · Tue 10:00 AM</> : ''}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', left:PX + WW, top:520, width:CX - PX - WW, height:2, opacity:line }}>
        <div style={{ position:'absolute', left:-10, right:-10, top:-10, height:22, borderRadius:20, background:'linear-gradient(90deg,rgba(62,142,255,0.35),rgba(144,240,197,0.35),rgba(255,199,148,0.3))', filter:'blur(10px)' }}/>
        <div style={{ position:'absolute', left:0, top:0, height:2, width:(line * 100) + '%', borderRadius:2, background:'linear-gradient(90deg,#3E8EFF,#90F0C5,#FFC794)' }}/>
        {line > 0.99 && <div style={{ position:'absolute', top:-6, left:`${(Math.sin(flow * Math.PI * 2) * 0.5 + 0.5) * 100}%`, width:30, height:14, marginLeft:-15, borderRadius:'50%', background:'radial-gradient(ellipse, #fff 0%, rgba(255,255,255,0.6) 40%, transparent 70%)', filter:'blur(2px)' }}/>}
      </div>
      <div style={{ position:'absolute', left:(PX + WW + CX) / 2, top:552, transform:'translate(-50%,0)', opacity:line, display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#12925A', whiteSpace:'nowrap', zIndex:5 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:ONB.green }}/>In sync
      </div>
      <div style={{ position:'absolute', left:CX, top:CY, width:WW, height:WH, perspective:1800 }}>
        <div style={{ position:'absolute', left:0, right:0, top:-66, display:'flex', justifyContent:'center', ...winS(inB, -8), transformOrigin:'50% 296px' }}><Label3D text="CaseLink" sub="" a={1}/></div>
        <div style={{ position:'relative', width:WW, height:WH, ...glass(24, 0.95), padding:24, boxSizing:'border-box', display:'flex', flexDirection:'column', ...winS(inB, -8) }}>
          <LiquidSheen radius={24} period={7} strength={0.3}/>
          <div style={{ display:'flex', alignItems:'center', gap:10, height:44 }}><Logo s={30}/><span style={{ fontSize:19, fontWeight:700, color:ONB.ink }}>New referral</span><span style={{ marginLeft:'auto' }}><Pill bg="rgba(34,201,122,0.14)" fg="#12925A"><Ix n="lock" s={12} c="#12925A"/>Secure</Pill></span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:18 }}>
            {PMS_F.map((f, i) => { const p = easeOutStrong(ss(land(i), land(i) + 0.42, L)); const g = win(L, land(i) - 0.3, land(i) + 0.8, 0.2, 0.4); return (
              <div key={f[0]}>
                <div style={{ fontSize:13, fontWeight:600, color:ONB.text, height:18 }}>{f[0] === 'Name' ? 'Patient' : f[0] === 'Imaging' ? 'Attachments' : f[0]}</div>
                <div style={{ position:'relative', marginTop:6 }}>
                  <GlowRim on={g > 0.01} radius={14} spread={5} blur={12} opacity={0.45 * g} pulse={rt}/>
                  <div style={{ position:'relative', height:50, borderRadius:14, background:'#fff', ...focusStyle(g), padding:'0 16px', display:'flex', alignItems:'center', fontSize:15.5, boxSizing:'border-box' }}>{sw(p, <span style={{ color:ONB.mute }}>Waiting for data</span>, <span style={{ color:ONB.ink, fontWeight:500 }}>{f[1]}</span>)}</div>
                </div>
              </div>); })}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, height:56, marginTop:'auto', padding:'0 16px', borderRadius:14, background: mixHex('#EBF3FF', '#E6FAF1', st), fontSize:15, fontWeight:600, color:ONB.ink }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:mixHex('#3E8EFF', '#22C97A', st), flexShrink:0 }}/>{sw(st, 'Referral sent', 'Consultation · Tue 10:00 AM')}
          </div>
        </div>
      </div>
      {PMS_F.map((f, i) => fly('c' + i, ss(dep(i), land(i), L), 1050, 380 + 62 * i, CX + 240, 397 + 86 * i, chip(f[1], f[2])))}
      {fly('back', back, CX + 240, CY + WH - 52, 1050, 619, chip('Consultation · Tue 10:00 AM', 'cal', true))}
    </div>
  );
}

const MAILS = [
  ['send','New referral received','Capital Root Canal Center sent you a referral for Jane Smith','Referral','#2F7DF5','#EBF3FF'],
  ['check','Case status updated','Owen Fletcher moved to Consultation scheduled','Case update','#12925A','rgba(34,201,122,0.14)'],
  ['users','New partner joined','Dupont Circle Family Dentistry accepted your invite','Network','#7A4FE0','rgba(122,79,224,0.12)'],
  ['bell','Your weekly summary is ready','12 new referrals and 3 completed cases this week','System','#B86E12','rgba(255,169,64,0.18)'],
];
function NotifyScene({ t, a, b }){
  const e = shotEnv(t, a, b, 0.5, 0.5);
  if (e <= 0.003) return null;
  const L = t - a;
  const arr = i => 1.3 + i * 1.25;
  const fan = easeInOut(ss(6.6, 7.5, L));
  const bellA = easeOutStrong(ss(0.5, 1.2, L)) * (1 - fan);
  const ring = Math.max(0, ...MAILS.map((_, i) => { const d = L - arr(i); return d > 0 && d < 1.1 ? Math.exp(-d * 3.2) : 0; }));
  const swing = Math.sin(L * 26) * 16 * ring;
  const waves = MAILS.map((_, i) => ss(arr(i), arr(i) + 1.1, L)).filter(p => p > 0 && p < 1);
  const n = MAILS.filter((_, i) => L >= arr(i)).length;
  return (
    <div style={{ position:'absolute', inset:0, opacity:e, zIndex:40 }}>
      {bellA > 0.01 && <div style={{ position:'absolute', left:960, top:360, width:0, height:0, opacity:bellA, filter: bellA < 0.99 ? `blur(${((1 - bellA) * 12).toFixed(2)}px)` : 'none' }}>
        {waves.map((p, k) => <span key={k} style={{ position:'absolute', left:-60, top:-60, width:120, height:120, borderRadius:'50%', border:'2px solid rgba(62,142,255,0.5)', transform:`scale(${(1 + p * 1.8).toFixed(3)})`, opacity:(1 - p) * 0.8 }}/>)}
        <span style={{ position:'absolute', left:-60, top:-60, width:120, height:120, borderRadius:'50%', background:'linear-gradient(150deg,#6AA8FF,#2F7DF5 55%,#3CC2B4)', boxShadow:'0 8px 16px rgba(62,142,255,0.35), inset 0 2px 1px rgba(255,255,255,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ display:'flex', transform:`rotate(${swing.toFixed(2)}deg)`, transformOrigin:'50% 10%' }}><Ic n="bell" s={52} c="#fff" w={2}/></span>
        </span>
        {n > 0 && <span style={{ position:'absolute', left:22, top:-66, minWidth:40, height:40, padding:'0 10px', boxSizing:'border-box', borderRadius:20, background:'#fff', color:'#2F7DF5', fontSize:22, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 11px rgba(24,38,58,0.12)', transform:`scale(${(1 + ring * 0.25).toFixed(3)})`, fontVariantNumeric:'tabular-nums' }}>{n}</span>}
      </div>}
      {MAILS.map((m, i) => {
        const p = easeOutStrong(ss(arr(i), arr(i) + 0.45, L));
        if (p <= 0.001) return null;
        const k = Math.max(0, n - 1 - i);
        const kk = lerp(k, 0, fan);
        const sy = 560 + kk * 26 - (1 - p) * 110;
        const fy = 400 + i * 132;
        const y = lerp(sy, fy, fan);
        const sc = lerp(1 - k * 0.05, 1, fan) * (0.94 + 0.06 * p);
        const op = p * lerp(Math.max(0, 1 - k * 0.28), 1, fan);
        const bl = (1 - p) * 6;
        const hot = win(L, arr(i), arr(i) + 1.5, 0.2, 0.7) * (1 - fan);
        return (
          <div key={i} style={{ position:'absolute', left:960, top:y, zIndex:10 - k, transform:`translate(-50%,-50%) scale(${sc.toFixed(4)})`, opacity:op, filter: bl > 0.4 ? `blur(${bl.toFixed(2)}px)` : 'none' }}>
            <div style={{ position:'relative', width:880, height:112, ...glass(26, 0.97), backdropFilter:'none', WebkitBackdropFilter:'none', boxShadow:`0 0 0 1px rgba(62,142,255,${(0.1 + 0.2 * hot).toFixed(3)}), 0 0 ${(18 + 22 * hot).toFixed(1)}px rgba(62,142,255,${(0.16 + 0.26 * hot).toFixed(3)}), 0 0 10px rgba(144,240,197,0.22), 0 8px 17px rgba(24,38,58,0.06)`, display:'flex', alignItems:'center', gap:20, padding:'0 26px', boxSizing:'border-box' }}>
              <LiquidSheen radius={26} period={7} phase={i * 0.2} strength={0.3}/>
              <span style={{ width:60, height:60, borderRadius:18, background:m[5], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Ic n={m[0]} s={28} c={m[4]} w={2.2}/></span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:ONB.mute }}><Ic n="mail" s={14} c={ONB.mute}/>CaseLink · Email · now</span>
                <span style={{ display:'block', fontSize:24, fontWeight:700, color:ONB.ink, letterSpacing:'-0.01em', marginTop:4 }}>{m[1]}</span>
                <span style={{ display:'block', fontSize:17, color:ONB.text, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m[2]}</span>
              </span>
              <Pill bg={m[5]} fg={m[4]}>{m[3]}</Pill>
            </div>
          </div>);
      })}
    </div>
  );
}

/* ---------- v6: patient confirmation email ---------- */
function EmailScene({ t }){
  const L = t - 340;
  if (L < -0.1 || L > 6.1) return null;
  const e = shotEnv(t, 340.05, 346, 0.5, 0.55);
  const a = easeOutStrong(ss(0.3, 1.2, L));
  const bl = (1 - a) * 16 + (1 - e) * 14;
  const btn = easeOutStrong(ss(2.0, 2.6, L));
  const bloom = win(L, 2.3, 5.6, 0.6, 0.6);
  const lbl = { fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase' };
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45 }}>
      <Side t={t} t0={340.4} t1={345.4} lines={[['Patient,'],[E('looped'),E('in.')]]} note="A confirmation from CaseLink, ready to book."/>
      <div style={{ position:'absolute', left:900, top:540, width:820, perspective:1800, opacity:e * clamp(a * 1.4), filter: bl > 0.3 ? `blur(${bl.toFixed(2)}px)` : 'none' }}>
        <div style={{ transform:`translateY(-50%) translateY(${((1 - a) * 80).toFixed(1)}px) rotateY(${lerp(-12, -6, easeInOut(ss(0, 6, L))).toFixed(2)}deg) rotateX(3deg)` }}>
          <div style={{ position:'relative', borderRadius:30, background:'#F1F5F9', padding:'0 34px 34px', boxShadow:'0 30px 70px rgba(26,54,110,0.16), inset 0 0 0 1px rgba(255,255,255,0.9)', overflow:'hidden' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 6px 0', fontSize:15, color:ONB.mute, ...bi(L, 0.7, 0.5) }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}><Ic n="mail" s={16} c={ONB.mute}/>From CaseLink · to Jane Smith</span><span>now</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, padding:'26px 0 24px', ...bi(L, 0.8, 0.5) }}><Logo s={44}/><Wordmark h={30} color={ONB.ink}/></div>
              <div style={{ position:'relative', background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 8px rgba(49,56,55,0.08)' }}>
                <div style={{ height:6, background:'linear-gradient(90deg,#3E8EFF,#90F0C5 55%,#FFC794)' }}></div>
                <div style={{ padding:'22px 48px', background:'linear-gradient(90deg,#FFF3E6,#F0FAF5)', ...lbl, color:'#9A5A12', ...bi(L, 1.0, 0.45) }}>Referral confirmation</div>
                <div style={{ padding:'38px 48px 44px', textAlign:'center' }}>
                  <div style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2, color:'#313837', ...bi(L, 1.15, 0.5) }}>Your referral has been received</div>
                  <div style={{ fontSize:18, color:'#313837', marginTop:22, ...bi(L, 1.3, 0.45) }}>Hi <span style={{ color:'#3E8EFF', fontWeight:700 }}>Jane</span>,</div>
                  <div style={{ fontSize:17, lineHeight:1.6, color:'#6E7A78', marginTop:10, textWrap:'pretty', ...bi(L, 1.45, 0.45) }}><b style={{ color:'#5A6664' }}>Capitol Smile Orthodontics</b> has received your referral from <b style={{ color:'#5A6664' }}>Capital Root Canal Center</b>.</div>
                  <div style={{ position:'relative', display:'inline-flex', marginTop:28, opacity:btn, transform:`translateY(${((1 - btn) * 14).toFixed(1)}px)`, filter: btn < 0.99 ? `blur(${((1 - btn) * 8).toFixed(2)}px)` : 'none' }}>
                    {bloom > 0.01 && <span style={{ position:'absolute', left:'8%', right:'8%', bottom:-12, height:22, borderRadius:'50%', background:'rgba(62,142,255,0.45)', filter:'blur(14px)', opacity:bloom }}></span>}
                    <LtCtx.Provider value={L}><GBtn label="Book your consultation" icon="arrowR" tone="accent" size={16} pad="15px 32px"/></LtCtx.Provider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- v6: security & compliance ---------- */
const SHIELD_D = 'M180 6 C 236 36, 292 48, 344 52 V 200 C 344 306, 272 376, 180 414 C 88 376, 16 306, 16 200 V 52 C 68 48, 124 36, 180 6 Z';
// HIPAA only on screen; the rest of the beat shows how the data is protected
const SEC = [['Business associate agreement on file','file',2.5],['Encrypted at rest and in transit','lock',3.3],['Access only for the offices on the case','users',4.1],['Two-factor sign-in','key',4.9],['Every view and edit logged','clock',5.7]];
const CIPH = 'x9#Qf2$Lk7@Wm4&Zr8!Tb3%Hn6*Vp1^Jc5';
function SecLine({ txt, L, a, b, seed }){
  return <>{txt.split('').map((ch, i) => { const at = a + (b - a) * ((i * 7 + seed) % txt.length) / txt.length, on = L >= at && ch !== ' '; return <span key={i}>{on ? CIPH[(i * 5 + seed + Math.floor(L * 14)) % CIPH.length] : ch}</span>; })}</>;
}
function SecurityScene({ t }){
  const rt = useTime();
  const L = t - 350;
  if (L < -0.1 || L > 12.1) return null;
  const e = shotEnv(t, 350.05, 362, 0.5, 0.6);
  const out = easeInOut(ss(11.2, 11.8, L));
  const sh = easeOutStrong(ss(0.9, 1.8, L)), seal = easeOutBack(ss(1.5, 1.9, L)), sRing = ss(1.5, 2.4, L);
  const draw = easeInOut(ss(1.0, 2.6, L)), refl = [ss(2.5, 3.5, L), ss(6.6, 7.6, L), ss(9.6, 10.6, L)].find(v => v > 0 && v < 1), fl = Math.sin(rt * 0.8) * 6 * sh;
  const lc = easeOutStrong(ss(2.0, 2.8, L)), rc = easeOutStrong(ss(2.6, 3.4, L));
  const enc = ss(3.6, 4.8, L), locked = easeOutBack(ss(4.7, 5.1, L));
  const trip = easeInOut(ss(5.3, 7.0, L)), done = easeOutBack(ss(7.0, 7.4, L));
  const sideBl = (p) => ({ opacity:clamp(p * 1.3) * (1 - out), filter: (1 - p) * 14 + out * 14 > 0.3 ? `blur(${((1 - p) * 14 + out * 14).toFixed(2)}px)` : 'none' });
  const mono = { fontFamily:"'SF Mono',ui-monospace,Menlo,monospace", letterSpacing:'0.02em' };
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, opacity:e }}>
      <Kin t={t} t0={350.7} t1={361.2} y={-350} size={80} same w={1500} lines={[['HIPAA','compliant','from',E('day'),E('one.')]]}/>
      <div style={{ position:'absolute', left:130, top:300, width:560, ...card(24, '30px 32px'), position:'absolute', transform:`translateY(${((1 - lc) * 50).toFixed(1)}px)`, ...sideBl(lc) }}>
        <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:ONB.mute }}>Built in for every office</div>
        <div style={{ display:'flex', flexDirection:'column', gap:20, marginTop:22 }}>
          {SEC.map((c, i) => { const a = easeOutStrong(ss(c[2], c[2] + 0.45, L)), tk = easeOutBack(ss(c[2] + 0.15, c[2] + 0.5, L)), rg = ss(c[2] + 0.15, c[2] + 0.9, L);
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, opacity:0.25 + 0.75 * a, filter: a < 0.99 ? `blur(${((1 - a) * 6).toFixed(2)}px)` : 'none' }}>
                <span style={{ position:'relative', width:44, height:44, borderRadius:12, flexShrink:0, background: tk > 0.01 ? 'linear-gradient(160deg,#3FD990,#1EB36B)' : 'rgba(122,136,134,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {rg > 0 && rg < 1 && <span style={{ position:'absolute', inset:0, borderRadius:12, border:'2px solid rgba(34,201,122,0.6)', transform:`scale(${(1 + rg * 0.7).toFixed(3)})`, opacity:1 - rg }}></span>}
                  <span style={{ transform:`scale(${Math.max(0.6, tk).toFixed(3)})`, display:'flex' }}><Ic n={tk > 0.01 ? 'check' : c[1]} s={20} c={tk > 0.01 ? '#fff' : ONB.mute} w={tk > 0.01 ? 3 : 2}/></span>
                </span>
                <span style={{ fontSize:22, fontWeight:600, color:ONB.ink, letterSpacing:'-0.01em' }}>{c[0]}</span>
              </div>);
          })}
        </div>
      </div>
      <div style={{ position:'absolute', left:780, top:330, width:360, height:420, opacity:clamp(sh * 1.3) * (1 - out), filter: (1 - sh) * 16 + out * 14 > 0.3 ? `blur(${((1 - sh) * 16 + out * 14).toFixed(2)}px)` : 'none', transform:`translateY(${((1 - sh) * 90 + fl).toFixed(1)}px) scale(${(0.92 + 0.08 * sh).toFixed(4)})` }}>
        <svg width="360" height="420" viewBox="0 0 360 420" style={{ position:'absolute', left:0, top:0, overflow:'visible', filter:'drop-shadow(7px 10px 16px rgba(142,158,186,0.34)) drop-shadow(-6px -6px 12px rgba(255,255,255,0.95))' }}>
          <defs>
            <linearGradient id="shfH" x1="0" y1="0" x2="0.4" y2="1"><stop stopColor="#FFFFFF"/><stop offset="1" stopColor="#EEF2F8"/></linearGradient>
            <linearGradient id="shrH" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFFFF"/><stop offset=".35" stopColor="#3E8EFF" stopOpacity="0.45"/><stop offset=".65" stopColor="#90F0C5" stopOpacity="0.5"/><stop offset="1" stopColor="#FFC794" stopOpacity="0.6"/></linearGradient>
            <linearGradient id="shsH" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#FFFFFF" stopOpacity="0"/><stop offset=".5" stopColor="#FFFFFF" stopOpacity="0.85"/><stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/></linearGradient>
            <linearGradient id="shdH" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3E8EFF"/><stop offset=".55" stopColor="#90F0C5"/><stop offset="1" stopColor="#FFC794"/></linearGradient>
            <clipPath id="shcH"><path d={SHIELD_D}/></clipPath>
          </defs>
          <path d={SHIELD_D} fill="url(#shfH)" stroke="url(#shrH)" strokeWidth="2.5"/>
          <path d={SHIELD_D} fill="none" stroke="url(#shdH)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={(1 - draw).toFixed(4)} opacity={draw > 0 ? 1 : 0}/>
          {refl != null && <g clipPath="url(#shcH)"><rect x={(-200 + easeInOut(refl) * 640).toFixed(1)} y="-40" width="110" height="500" fill="url(#shsH)" transform="skewX(-22)"/></g>}
        </svg>
        <div style={{ position:'absolute', left:0, right:0, top:88, textAlign:'center' }}>
          <div style={{ fontSize:58, fontWeight:700, letterSpacing:'-0.03em', color:ONB.ink, lineHeight:1 }}>HIPAA</div>
          <div style={{ fontSize:21, fontWeight:600, letterSpacing:'0.1em', color:ONB.text, marginTop:12, textTransform:'uppercase' }}>Compliant</div>
        </div>
        <div style={{ position:'absolute', left:124, top:222, width:112, height:112 }}>
          {sRing > 0 && sRing < 1 && <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(62,142,255,0.55)', transform:`scale(${(1 + sRing * 0.9).toFixed(3)})`, opacity:(1 - sRing) * 0.8 }}></span>}
          <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(150deg,#6AA8FF,#2F7DF5)', boxShadow:'0 10px 20px rgba(62,142,255,0.26), inset 0 2px 2px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic n="shield" s={48} c="#fff" w={2}/></span>
          <span style={{ position:'absolute', right:-6, bottom:-2, width:40, height:40, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${seal.toFixed(4)})` }}><Ic n="check" s={20} c="#fff" w={3}/></span>
        </div>
      </div>
      <div style={{ position:'absolute', left:1230, top:300, width:560, ...card(24, '30px 32px'), position:'absolute', transform:`translateY(${((1 - rc) * 50).toFixed(1)}px)`, ...sideBl(rc) }}>
        <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:ONB.mute }}>Referral in transit</div>
        <div style={{ marginTop:20, padding:'20px 22px', borderRadius:16, background:'rgba(238,243,251,0.9)', boxShadow:'inset 0 2px 6px rgba(24,38,58,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:20, fontWeight:700, color:ONB.ink, whiteSpace:'nowrap', ...(enc > 0 ? mono : {}) }}><SecLine txt="Jane Smith" L={L} a={3.6} b={4.6} seed={3}/></span>
            <span style={{ position:'relative', width:40, height:40, borderRadius:12, background: locked > 0.01 ? 'linear-gradient(160deg,#5BA0FF,#2F7DF5)' : 'rgba(122,136,134,0.12)', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${(0.85 + 0.15 * Math.max(locked, 0)).toFixed(3)})` }}><Ic n="lock" s={19} c={locked > 0.01 ? '#fff' : ONB.mute} w={2.2}/></span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12, fontSize:17, color:ONB.text, whiteSpace:'nowrap', ...(enc > 0 ? mono : {}) }}>
            <span><SecLine txt="DOB  Mar 14, 1988" L={L} a={3.8} b={4.8} seed={5}/></span>
            <span><SecLine txt="Panoramic X-ray, 2 files" L={L} a={3.9} b={4.8} seed={9}/></span>
            <span><SecLine txt="Guardian Dental" L={L} a={4.0} b={4.8} seed={2}/></span>
          </div>
        </div>
        <div style={{ position:'relative', marginTop:26, height:44, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:15, fontWeight:600, color:ONB.text }}>Sending office</span>
          <span style={{ fontSize:15, fontWeight:600, color:ONB.text }}>Receiving office</span>
          <div style={{ position:'absolute', left:132, right:146, top:21, height:3, borderRadius:3, background:'rgba(122,136,134,0.16)' }}>
            <div style={{ position:'absolute', left:0, top:0, bottom:0, width:(trip * 100).toFixed(2) + '%', borderRadius:3, background:'linear-gradient(90deg,#3E8EFF,#90F0C5)' }}></div>
            {trip > 0.001 && trip < 0.999 && <span style={{ position:'absolute', left:(trip * 100).toFixed(2) + '%', top:-12, width:26, height:26, marginLeft:-13, borderRadius:8, background:'linear-gradient(160deg,#5BA0FF,#2F7DF5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 14px rgba(62,142,255,0.35)' }}><Ic n="lock" s={13} c="#fff" w={2.4}/></span>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, height:28, opacity:clamp(done), filter: done < 0.99 ? `blur(${((1 - clamp(done)) * 6).toFixed(2)}px)` : 'none' }}>
          <span style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(160deg,#3FD990,#1EB36B)', display:'flex', alignItems:'center', justifyContent:'center', transform:`scale(${done.toFixed(3)})` }}><Ic n="check" s={14} c="#fff" w={3}/></span>
          <span style={{ fontSize:17, fontWeight:600, color:ONB.ink }}>Opened only by the receiving office</span>
        </div>
      </div>
      <div style={{ position:'absolute', left:0, right:0, top:872 }}><BlurLine t={t} t0={358.1} tOut={361.2} stagger={0.06} items={'Your patients’ data, protected at every step.'.split(' ')} style={{ fontSize:36, fontWeight:500, color:ONB.text }}/></div>
    </div>
  );
}

/* ---------- the story ---------- */
function Story({ t, cursor }){
  const S = [];
  // D1 — home base (27.6–35.8)
  {
    const e = t < 27.9 ? 0 : clamp((35.8 - t) / 0.45); const tm = 32 + (t - 24.5);
    if (e > 0.003) S.push(<Tilt key="d1" t={t} env={e} w={WIN_W} h={WIN_H} ns="d1" lt={tm} fx={lerp(740, 820, ss(27.9, 35.8, t))} fy={lerp(470, 330, ss(27.9, 35.8, t))} z={lerp(1.33, 1.62, easeInOut(ss(27.9, 35.8, t)))} rx={lerp(0, 8, ss(28.2, 35.8, t))} ry={lerp(0, -10, easeInOut(ss(28.2, 35.8, t)))} radius={20}><App tm={tm} page={<RegCtx.Provider value="home"><HomePage t={tm} p0={32}/></RegCtx.Provider>}/></Tilt>);
  }
  // D3 — referral pieces
  const cr = (key, a, b, mapA, fx, fy, z, rx, ry, pts, clicks, vis) => {
    const e = shotEnv(t, a, b, 0.4, 0.35); if (e <= 0.003) return;
    const tm = mapA + (t - a);
    S.push(<Tilt key={key} t={t} env={e} w={WIN_W} h={WIN_H} ns="shell" lt={tm} fx={fx} fy={fy} z={z} rx={rx} ry={ry} radius={20}
      cur={cursor && pts ? { L:tm, pts, clicks, vis:win(tm, vis[0], vis[1], 0.2, 0.2) } : null}>
      <App tm={tm} page={<RegCtx.Provider value="home"><HomePage t={tm} p0={0}/></RegCtx.Provider>}><RegCtx.Provider value="modal"><CreateModal t={tm}/></RegCtx.Provider></App>
    </Tilt>);
  };
  cr('r1', 46.0, 49.2, 48.1, 740, 430, lerp(1.2, 1.3, ss(46, 49.2, t)), 6, lerp(-12, -6, ss(46, 49.2, t)), [{ t:48.1, id:'shell:create' }, { t:50.0, id:'modal:row1', d:1.0 }, { t:51.2, id:'modal:next1', d:0.7 }], [48.3, 50.4, 51.6], [48.1, 51.3]);
  cr('r2', 49.0, 52.2, 58.9, 740, 520, lerp(1.34, 1.42, ss(49, 52.2, t)), 4, lerp(10, 5, ss(49, 52.2, t)), [{ t:58.9, id:'modal:guardian' }, { t:59.5, id:'modal:refby', d:0.4 }, { t:60.0, id:'modal:next2', d:0.45 }], [59.1, 60.4], [58.9, 60.9]);
  cr('r3', 52.0, 55.0, 64.9, 740, 640, 1.45, 8, -8, [{ t:64.9, p:[1330, 660] }, { t:66.0, id:'modal:drop', d:0.7 }], [65.3, 66.1], [64.9, 67.0]);
  if (t > 54.8 && t < 60.2) S.push(<div key="hero" style={{ position:'absolute', inset:0, opacity:shotEnv(t, 54.9, 60.2, 0.35, 0.5) }}><Hero t={t} t0={55.0}/></div>);
  // D4 — specialist updates, the referring practice sees it live (62–71.6)
  {
    const e = shotEnv(t, 61.8, 71.6, 0.45, 0.45); const tm = 71.2 + (t - 62.2);
    if (e > 0.003) {
      const p = easeInOut(ss(61.8, 71.6, t));
      S.push(<Tilt key="dR" t={t} env={e} w={WIN_W} h={WIN_H} ns="dR" lt={tm} fx={868} fy={lerp(400, 470, p)} z={lerp(0.9, 0.97, p)} ox={250} oy={40} ry={lerp(-14, -8, p)} rx={5} radius={20}
        cur={cursor ? { L:tm, pts:[{ t:71.3, p:[1200, 700] }, { t:71.8, id:'dR:status', d:0.5 }, { t:72.8, id:'dR:optRR', d:0.5 }, { t:73.6, id:'dR:save', d:0.4 }], clicks:[72.2, 73.2, 74.0], vis:win(tm, 71.3, 74.4, 0.2, 0.3) } : null}>
        <App tm={Math.min(tm, 89)} page={<RegCtx.Provider value="dR"><DetailPage t={Math.min(tm, 78.2)}/></RegCtx.Provider>}/>
      </Tilt>);
      S.push(<SyncCard key="sync" t={t} tm={tm} e={e}/>);
      S.push(<div key="lbl" style={{ position:'absolute', right:150, top:96, zIndex:50, opacity:e * easeOut(ss(62.0, 62.6, t)) }}><Label3D text="Capitol Smile Orthodontics" sub="Specialist" a={1}/></div>);
    }
  }
  // D5 chat, D6 edit, D7 invite, D9 export — standalone tilted pieces
  const piece = (key, a, b, w, h, el, ry, pts, clicks, zb = 1.36, bg) => {
    const e = shotEnv(t, a, b, 0.45, 0.4); if (e <= 0.003) return;
    const L = t - a;
    if (bg) { const p = easeInOut(ss(a, b, t)); S.push(<Tilt key={key + 'bg'} t={t} env={e} fade={0.5} soft={2.5} w={WIN_W} h={WIN_H} ns={key + 'bg'} lt={bg.tm} fx={740} fy={470} z={lerp(0.9, 0.95, p)} rx={6} ry={lerp(ry * 0.8, ry * 0.4, p)} radius={20}><App tm={bg.tm} page={<RegCtx.Provider value={key + 'bg'}>{bg.page}</RegCtx.Provider>}><div style={{ position:'absolute', inset:0, background:'rgba(22,32,52,0.08)' }}/></App></Tilt>); }
    S.push(<Tilt key={key} t={t} env={e} w={w} h={h} ns={key} lt={L} fx={w / 2} fy={h / 2} z={lerp(zb, zb * 1.1, ss(a, b, t))} rx={6} ry={lerp(ry, ry * 0.4, easeInOut(ss(a, b, t)))} radius={26} shadow={false}
      cur={cursor && pts ? { L, pts, clicks } : null}>{el(L)}</Tilt>);
  };
  piece('chat', 74.0, 80.6, 820, 720, L => <ChatPanel L={L}/>, -14, null, null, 1.2, { tm:80, page:<DetailPage t={77.9} noPop/> });
  piece('edit', 82.2, 86.4, 820, 560, L => <EditPiece L={L}/>, 12, [{ t:0.3, p:[700, 560] }, { t:0.9, id:'edit:ins', d:0.6 }, { t:2.0, id:'edit:save', d:0.7 }], [1.0, 2.4], 1.36, { tm:80, page:<DetailPage t={76.5} noPop/> });
  if (t > 84.8 && t < 87) S.push(<Toast key="fs" t={t} a={85.3} b={86.6} text="Form Submitted!" style={{ bottom:120 }}/>);
  piece('inv', 88.4, 92.4, 840, 800, L => <InvitePiece L={L}/>, -12, [{ t:0.2, p:[760, 480] }, { t:1.3, id:'inv:send', d:1.0 }], [2.3], 1.12, { tm:99, page:<NetworkPage t={99}/> });
  {
    const e = shotEnv(t, 92.2, 96.6, 0.4, 0.5); const tm = 90.0 + (t - 92.2) * 1.2;
    if (e > 0.003) S.push(<Tilt key="net" t={t} env={e} w={WIN_W} h={WIN_H} ns="network" lt={tm} fx={880} fy={lerp(420, 560, ss(92.2, 96.6, t))} z={1.28} rx={10} ry={lerp(14, 6, ss(92.2, 96.6, t))} radius={20}><App tm={tm} page={<RegCtx.Provider value="network"><NetworkPage t={tm}/></RegCtx.Provider>}/></Tilt>);
  }
  {
    const e = shotEnv(t, 103.0, 108.8, 0.45, 0.45); const tm = 104.4 + (t - 103.0);
    if (e > 0.003) S.push(<Tilt key="lb" t={t} env={e} w={WIN_W} h={WIN_H} ns="home" lt={tm} fx={1240} fy={690} z={lerp(1.7, 1.9, ss(103, 108.8, t))} rx={8} ry={lerp(-14, -6, ss(103, 108.8, t))} radius={20}><App tm={tm} page={<RegCtx.Provider value="home"><HomePage t={tm} p0={80} lbT={104.4}/></RegCtx.Provider>}/></Tilt>);
  }
  piece('exp', 110.8, 115.4, 760, 560, L => <ExportPiece L={L}/>, 12, [{ t:0.2, p:[620, 560] }, { t:0.9, id:'exp:export', d:0.7 }], [1.3], 1.36, { tm:20, page:<HomePage t={20} p0={0}/> });
  if (t > 112.8 && t < 115.6) S.push(<div key="csv" style={{ position:'absolute', inset:0, opacity:shotEnv(t, 112.8, 115.4, 0.2, 0.4) }}><CsvFly L={t - 110.8}/></div>);
  {
    const e = shotEnv(t, 117.2, 121.4, 0.45, 0.45); const tm = 118.2 + (t - 117.2) * 0.9;
    if (e > 0.003) S.push(<Tilt key="baa" t={t} env={e} w={WIN_W} h={WIN_H} ns="settings" lt={tm} fx={1180} fy={390} z={lerp(1.75, 1.95, ss(117.2, 121.4, t))} rx={8} ry={lerp(-16, -8, ss(117.2, 121.4, t))} radius={20}><App tm={tm} page={<RegCtx.Provider value="settings"><SettingsPage t={tm}/></RegCtx.Provider>}/></Tilt>);
  }
  return <>{S}</>;
}

function Story3({ t, cursor }){
  const S = [];
  const cu = o => cursor ? o : null;
  const piece = (key, a, b, w, h, el, origin, cam, cur) => {
    const e = shotEnv(t, a, b, 0.45, 0.4); if (e <= 0.003) return;
    const L = t - a, g = easeOutStrong(ss(0, 0.75, L));
    S.push(<Tilt key={key} t={t} env={e} w={w} h={h} ns={key} lt={L} fx={w / 2} fy={h / 2} z={cam.z * lerp(0.22, 1, g)} ox={lerp(origin[0], cam.ox, g)} oy={lerp(origin[1], cam.oy, g)} rx={cam.rx} ry={cam.ry} radius={26} shadow={false} cur={cu(cur ? { L, ...cur } : null)}>{el(L)}</Tilt>);
  };
  const MC = { ox:330, oy:10, z:0.95, rx:4, ry:-10 };
  const modal = tm => <RegCtx.Provider value="modal"><CreateModal t={tm}/></RegCtx.Provider>;
  const homeR = (tm, extra, lbT) => ns => <App tm={tm} page={<RegCtx.Provider value={ns}><HomePage t={tm} p0={0} lbT={lbT}/></RegCtx.Provider>}>{extra}</App>;
  // Melissa's morning: laptop screen settles right, Focus lifts out, then Create referral
  if (t >= 190 && t < 197.7) {
    const tm = t - 150;
    S.push(<PopTilt key="h0" t={t} env={1} cam={mixCam(LAPC, SIDE, easeInOut(ss(190.1, 191.7, t)))} ns="home" lt={tm}
      lift={liftAt(t, 193.3, 196.5)} region="shell:focus" tw={380} th={470} render={homeR(tm)}/>);
  }
  if (t >= 206 && t < 212.7) {
    const tm = t - 160;
    S.push(<PopTilt key="h1" t={t} env={shotEnv(t, 205.95, 212.6, 0.7, 0.4)} cam={SIDE} ns="home" lt={tm}
      cur={cu({ L:tm, pts:[{ t:46.6, p:[1000, 760] }, { t:47.9, id:'shell:create', d:1.0 }, { t:50.0, id:'modal:row1', d:1.0 }, { t:51.2, id:'modal:next1', d:0.7 }], clicks:[48.3, 50.4, 51.6], vis:win(tm, 46.6, 51.9, 0.25, 0.25) })}
      render={homeR(tm, modal(tm))}/>);
  }
  if (t > 212.0 && t < 215.0) { const tm = 58.9 + (t - 212.2);
    S.push(<PopTilt key="r2" t={t} env={shotEnv(t, 212.2, 214.9, 0.4, 0.35)} cam={SIDE} ns="home" lt={tm}
      cur={cu({ L:tm, pts:[{ t:58.9, id:'modal:guardian' }, { t:59.5, id:'modal:refby', d:0.4 }, { t:60.0, id:'modal:next2', d:0.45 }], clicks:[59.1, 60.4], vis:win(tm, 58.9, 60.9, 0.2, 0.2) })} render={homeR(tm, modal(tm))}/>); }
  if (t > 214.4 && t < 221.4) { const tm = Math.min(64.9 + (t - 214.6), 68.95);
    S.push(<PopTilt key="r3" t={t} env={shotEnv(t, 214.6, 221.2, 0.4, 0.45)} cam={SIDE} ns="home" lt={tm} soft={3 * easeInOut(ss(218.3, 218.8, t))}
      cur={cu({ L:tm, pts:[{ t:64.9, p:[1330, 660] }, { t:66.0, id:'modal:drop', d:0.7 }, { t:66.9, id:'modal:submit', d:0.6 }], clicks:[65.3, 66.1, 67.7], vis:win(tm, 64.9, 68.1, 0.2, 0.2) })} render={homeR(tm, modal(tm))}/>); }
  if (t > 218.4 && t < 221.6) S.push(<div key="hero" style={{ position:'absolute', inset:0, transform:'translateX(330px)', opacity:shotEnv(t, 218.45, 221.3, 0.05, 0.5), zIndex:40 }}><Hero t={t} t0={216.4} noBtn/></div>);
  // The specialist's case page: each feature lifts out of the real page
  if (t > 221.2 && t < 252.2) {
    const e = shotEnv(t, 221.4, 251.9, 0.45, 0.45);
    const tm = t < 240.05 ? t - 152 : 88.0;
    const lifts = [['det:prog', 223.2, 228.8, 940], ['det:notes', 229.9, 233.3, 640], ['det:fees', 233.3, 236.8, 520], ['det:timeline', 236.8, 239.9, 520]];
    let lf = null; for (const x of lifts) { const v = liftAt(t, x[1], x[2]); if (v > 0.001) { lf = { region:x[0], lift:v, tw:x[3] }; break; } }
    const m = win(t, 245.3, 251.9, 0.4, 0.4);
    const curs = [
      [71.3, 74.4, { clone:true, pts:[{ t:71.3, p:[1250, 420] }, { t:71.8, id:'detc:status', d:0.5 }, { t:72.8, id:'detc:optRR', d:0.5 }, { t:73.6, id:'detc:save', d:0.4 }], clicks:[72.2, 73.2, 74.0] }],
      [77.9, 80.2, { clone:true, pts:[{ t:77.9, p:[1300, 760] }, { t:78.3, id:'detc:noteIn', d:0.4 }, { t:79.3, id:'detc:addNote', d:0.5 }], clicks:[78.4, 79.7] }],
      [82.2, 83.6, { clone:true, pts:[{ t:82.2, p:[700, 760] }, { t:82.8, id:'detc:addFee', d:0.6 }], clicks:[83.0] }],
    ];
    const c = curs.find(x => tm >= x[0] - 0.3 && tm <= x[1] + 0.35);
    S.push(<PopTilt key="det" t={t} env={e} cam={SIDE} ns="det" lt={tm} lift={lf ? lf.lift : 0} region={lf && lf.region} tw={lf ? lf.tw : 900}
      extra={lf && lf.region === 'det:prog' ? 'det:pop' : null} sy={detScroll(tm)} soft={3 * m}
      cur={c ? cu({ L:tm, ...c[2], vis:win(tm, c[0], c[1], 0.25, 0.3) }) : null}
      render={ns => <App tm={Math.min(tm, 89)} page={<RegCtx.Provider value={ns}><DetailPage t={tm}/></RegCtx.Provider>}><Dim m={m}/></App>}/>);
  }
  piece('chat', 245.4, 251.8, 820, 720, L => <ChatPanel L={L}/>, [649, 73], MC, null);
  if (t < 259.3) S.push(<PMSScene key="pms" t={t} a={251.6} b={259.6}/>);
  // Invite + network
  if (t > 259.4 && t < 268.6) {
    const m = win(t, 259.9, 264.4, 0.4, 0.4);
    const cam = mixCam(SIDE, { fx:800, fy:440, z:0.76, ox:340, oy:20, rx:6, ry:-10 }, easeInOut(ss(264.2, 268.4, t)));
    S.push(<PopTilt key="net" t={t} env={1} cam={cam} ns="network" lt={99} soft={3 * m}
      render={ns => <App tm={99} page={<RegCtx.Provider value={ns}><NetworkPage t={99} live={t - 264.3}/></RegCtx.Provider>}><Dim m={m}/></App>}/>);
  }
  piece('inv', 259.9, 264.3, 840, 800, L => <InvitePiece L={L}/>, [-98, -186], { ...MC, z:0.9 }, { pts:[{ t:0.2, p:[760, 480] }, { t:1.3, id:'inv:send', d:1.0 }], clicks:[2.3] });
  // Leaderboard, export, BAA
  if (t >= 299.9 && t < 305.6) { const tm = 105.2 + (t - 300);
    S.push(<PopTilt key="lb" t={t} env={shotEnv(t, 300.0, 305.3, 0.45, 0.45)} cam={SIDE} ns="lbh" lt={tm} lift={liftAt(t, 300.4, 305.0)} region="lbh:lb" tw={640} th={720} render={homeR(tm, null, 105.9)}/>); }
  if (t > 305.0 && t < 309.4) { const m = win(t, 305.3, 309.9, 0.4, 0.4);
    S.push(<PopTilt key="exh" t={t} env={shotEnv(t, 305.1, 309.8, 0.45, 0.45)} cam={SIDE} ns="exh" lt={110} soft={3 * m} render={ns => <App tm={80} page={<RegCtx.Provider value={ns}><ReferralsPage glow={win(t, 305.1, 305.6, 0.2, 0.3)}/></RegCtx.Provider>}><Dim m={m}/></App>}/>); }
  if (t < 309.4) piece('exp', 305.3, 309.8, 760, 560, L => <ExportPiece L={L}/>, [806, -235], { ...MC, z:1.0 }, { pts:[{ t:0.2, p:[620, 560] }, { t:0.9, id:'exp:export', d:0.7 }], clicks:[1.3] });
  if (t > 307.3 && t < 309.4) S.push(<div key="csv" style={{ position:'absolute', inset:0, transform:'translateX(150px)', opacity:shotEnv(t, 307.3, 309.8, 0.2, 0.4), zIndex:60 }}><CsvFly L={t - 305.3}/></div>);
  if (t > 309.4 && t < 314.6) { const tm = 117.6 + (t - 309.6) * 0.9;
    S.push(<PopTilt key="set" t={t} env={shotEnv(t, 309.6, 314.3, 0.45, 0.45)} cam={SIDE} ns="set" lt={tm} lift={liftAt(t, 310.3, 314.0)} region="set:hipaa" tw={620} th={700}
      render={ns => <App tm={tm} page={<RegCtx.Provider value={ns}><SettingsPage t={tm}/></RegCtx.Provider>}/>}/>); }
  if (t > 314.2 && t < 319.8) { const tm = 113 + (t - 314.3);
    S.push(<PopTilt key="mem" t={t} env={shotEnv(t, 314.3, 319.6, 0.45, 0.45)} cam={SIDE} ns="mem" lt={tm} lift={liftAt(t, 314.6, 319.3)} region="mem:members" tw={760} th={720}
      cur={cu({ clone:true, L:tm, pts:[{ t:113.9, p:[900, 600] }, { t:114.6, id:'memc:add', d:0.6 }], clicks:[114.8, 115.6, 116.4], vis:win(tm, 113.9, 117.2, 0.25, 0.3) })}
      render={ns => <App tm={tm} page={<RegCtx.Provider value={ns}><SettingsPage t={tm} adds={[0, 1, 2].map(i => ss(115.0 + i * 0.8, 115.6 + i * 0.8, tm))}/></RegCtx.Provider>}/>}/>); }
  // left-column story text
  S.push(<Side key="A" t={t} t0={190.9} t1={193.2} lines={[['Your','day,'],[E('already'),E('sorted.')]]} note="Cases waiting on a decision. Referrals that need a follow-up."/>);
  S.push(<Side key="B" t={t} t0={193.4} t1={196.0} lines={[['What','needs','you,'],[E('first.')]]} note="Focus lines up every case waiting on a next step."/>);
  S.push(<Side key="C" t={t} t0={207.3} t1={211.8} lines={[['A','patient','needs','a'],[E('specialist?')]]} note="Refer them right from your dashboard."/>);
  S.push(<StepList key="steps" t={t}/>);
  S.push(<Side key="E" t={t} t0={221.6} t1={225.3} lines={[['Every','case,'],['one',E('clear'),E('view.')]]} note="Open the case page to see exactly where it stands."/>);
  S.push(<Side key="F" t={t} t0={225.9} t1={228.7} lines={[['Update','the','status.'],[E('Everyone'),E('knows.')]]} note="The other office sees it the moment you save."/>);
  S.push(<Side key="G" t={t} t0={229.2} t1={232.9} lines={[['Notes','that','stay'],['with',E('the'),E('case.')]]} note="Not on a sticky note on someone’s monitor."/>);
  S.push(<Side key="H" t={t} t0={233.4} t1={236.6} lines={[['Fees,','private'],['to',E('your'),E('practice.')]]} note="Log treatment fees privately. Referring offices never see them."/>);
  S.push(<Side key="I" t={t} t0={237.1} t1={239.15} lines={[['Every','step,'],['on',E('the'),E('record.')]]} note="The activity timeline writes itself."/>);
  S.push(<Side key="K" t={t} t0={245.9} t1={251.4} lines={[['Talk','on','the','case.'],['Not',E('on'),E('hold.')]]} note="Messages and X-rays stay attached to the case."/>);
  if (t < 259.3) S.push(<Side key="L" t={t} t0={251.9} t1={259.4} eyebrow="Integrations" lines={[['Integrates','with'],['your',E('practice')],[E('software.')]]} note="Details come in. Updates go back."/>);
  S.push(<Side key="M" t={t} t0={259.9} t1={264.0} lines={[['Bring','your'],[E('partners'),E('in.')]]} note="Invite the practices you already work with."/>);
  S.push(<Side key="N" t={t} t0={264.5} t1={268.2} lines={[['Every','partner.'],['Every',E('specialty.')]]} note="All in one place. And it keeps growing."/>);
  S.push(<Side key="Q" t={t} t0={310.1} t1={314.1} lines={[['HIPAA'],['compliant','from'],[E('day'),E('one.')]]} note="Your BAA is built in and on file."/>);
  S.push(<NotifyScene key="notify" t={t} a={320.0} b={329.6}/>);
  S.push(<Kin key="S" t={t} t0={320.2} t1={329.1} y={-400} size={80} same w={1400} lines={[['Never','miss',E('a'),E('thing.')]]} note="Email alerts for referrals, case updates, your network and system news."/>);
  return <>{S}</>;
}

/* ---------- SFX ---------- */
function INTRO_SFX(add0, f){
  const add = (x, fn) => { const r = unwarp(x); if (r != null) add0(r, fn); };
  const { click, key, whoosh, chime, pop, swell, glass, bubble, mallet, shimmer, thud, riser, appear, rustle, notifyS, scrollS, typing } = f;
  [241.0, 259.9, 305.3].forEach(x => add(x, w => rustle(w, 0.16)));
  add(228.8, w => scrollS(w, 1.1)); add(240.1, w => scrollS(w, 0.8));
  add(260.35, w => typing(w, 0.8));

  [0, 1, 2, 3].forEach(i => { const x = 320 + 1.3 + i * 1.25; add(x, w => notifyS(w, [1, 1.06, 1.12, 1.19][i], 0.42)); });
  add(320.5, w => bubble(w, 520, 0.05)); add(326.6, w => whoosh(w, 0.7, 0.04, 600, 3000)); add(327.4, w => shimmer(w, 0.016));
  for (let j = 0; j < 16; j += 2) add(264.3 + 0.35 + j * 0.2, w => click(w));
  const W = (x, d = 0.6, v = 0.05, lo, hi) => add(x, w => whoosh(w, d, v, lo, hi));
  add(0.3, w => swell(w, 1.2, 0.03)); [0.5, 0.9, 1.3].forEach(x => add(x, w => pop(w, 700)));
  W(2.5, 3.6, 0.07, 300, 3000); [3.2, 3.9, 4.6, 5.3].forEach(x => add(x, w => pop(w, 420)));
  W(6.3, 0.5, 0.05, 600, 2400); add(7.4, w => pop(w, 900));
  [9.35, 9.75, 10.15, 10.55].forEach(x => add(x, w => pop(w, 420))); W(11.45, 0.6, 0.04, 2400, 700);
  add(12.2, w => swell(w, 2.2, 0.05)); W(14.6, 1.0, 0.07, 300, 4200);
  add(15.2, w => swell(w, 0.9, 0.04)); add(16.05, w => chime(w, [1046.5, 1568], 0.05)); W(17.5, 0.7, 0.05, 2000, 500);
  for (let j = 0; j < 8; j++) add(19.0 + j * 0.065, w => key(w)); add(20.0, w => pop(w, 760));
  W(22.4, 0.9, 0.06, 2400, 400); W(22.8, 1.4, 0.06, 300, 2600); add(24.4, w => pop(w, 520)); W(25.9, 2.0, 0.06, 300, 5200);
  [27.9, 35.8, 44.4, 46.0, 49.0, 52.0, 54.9, 61.8, 74.0, 82.2, 88.4, 92.2, 96.6, 103.0, 110.8, 117.2, 123.9, 132.0].forEach(x => W(x - 0.1, 0.7, 0.05));
  [40.9, 50.4 - 2.1, 51.6 - 2.1, 59.1 - 9.9, 60.4 - 9.9, 65.3 - 12.9, 66.1 - 12.9, 56.2].forEach(x => add(x, w => click(w)));
  add(57.1, w => chime(w, [1318.5, 1760], 0.055));
  [63.2, 64.2, 65.0].forEach(x => add(x, w => click(w))); add(66.3, w => { pop(w, 900); chime(w + 0.05, [1567.98, 2093], 0.045); });
  [74.3, 75.3, 77.45, 78.55].forEach(x => add(x, w => pop(w, 820))); add(76.45, w => chime(w, [1318.5, 1760], 0.03));
  add(83.2, w => click(w)); add(83.5, w => key(w)); add(84.6, w => click(w)); add(85.3, w => chime(w, [1760, 2349.3], 0.035));
  [88.9, 89.1, 89.2, 89.35].forEach(x => add(x, w => key(w))); add(90.7, w => click(w)); add(91.6, w => chime(w, [1318.5, 1760], 0.04));
  for (let j = 0; j < 9; j++) add(97.8 + j * 0.14, w => pop(w, 600 + j * 40));
  for (let j = 0; j < 12; j++) add(103.6 + j * 0.12, w => key(w));
  add(112.1, w => click(w)); add(113.2, w => whoosh(w, 0.8, 0.05, 500, 2600)); add(114.0, w => chime(w, [1318.5, 1760], 0.04));
  add(118.8, w => chime(w, [1567.98, 2093], 0.035));
  for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) add(123.8 + 1.35 + i * 0.12 + j * 0.2, w => pop(w, 680 + j * 50 + i * 30));
  add(126.25, w => chime(w, [1046.5, 1318.5], 0.045));
  add(132.3, w => swell(w, 6.0, 0.05)); for (let j = 0; j < 10; j++) add(135.2 + j * 0.24, w => pop(w, 760 + j * 30));
  add(141.4, w => swell(w, 1.2, 0.05)); add(142.3, w => chime(w, [1046.5, 1568], 0.05)); for (let j = 0; j < 8; j++) add(145.25 + j * 0.065, w => key(w));
  add(145.9, w => pop(w, 760)); add(148.0, w => click(w)); add(148.1, w => chime(w, [1318.5, 1760], 0.045));
  [206.05, 221.4, 251.6, 245.35, 259.65, 309.45].forEach(x => W(x, 0.7, 0.035));
  [193.3, 223.2].forEach(x => add(x, w => appear(w, 0.16)));
  [208.3, 210.4, 211.6, 212.4, 213.7, 215.0, 215.8, 218.4, 224.2, 225.2, 226.0, 230.4, 231.7, 235.0, 240.9, 242.0, 243.4, 262.2, 306.6].forEach(x => add(x, w => click(w)));
  add(219.4, w => chime(w, [1318.5, 1760], 0.055)); add(226.8, w => chime(w, [1567.98, 2093], 0.045));
  [231.9, 234.2, 235.3, 237.6, 237.95, 245.7, 246.7, 248.85, 249.95].forEach(x => add(x, w => pop(w, 820)));
  add(244.2, w => chime(w, [1760, 2349.3], 0.035)); add(247.9, w => chime(w, [1318.5, 1760], 0.03));
  add(252.8, w => swell(w, 0.9, 0.035)); [254.65, 255.0, 255.35].forEach(x => add(x, w => pop(w, 760))); add(255.7, w => key(w)); W(256.0, 0.8, 0.04, 2600, 600); add(256.9, w => chime(w, [1318.5, 1760], 0.04));
  add(263.0, w => chime(w, [1318.5, 1760], 0.04));
  for (let j = 0; j < 5; j++) add(300.7 + j * 0.1, w => pop(w, 640 + j * 40));
  add(307.5, w => whoosh(w, 0.8, 0.05, 500, 2600)); add(308.4, w => chime(w, [1318.5, 1760], 0.04)); add(310.9, w => chime(w, [1567.98, 2093], 0.035));
  W(314.3, 0.7, 0.05); W(320.0, 0.7, 0.05);
  W(340.1, 0.7, 0.04); add(340.8, w => notifyS(w, 1.05, 0.42)); add(343.0, w => chime(w, [1318.5, 1760], 0.04));
  W(350.1, 0.7, 0.04); add(350.9, w => appear(w, 0.16)); add(351.5, w => chime(w, [1318.5, 1760], 0.04)); SEC.forEach(c => add(350 + c[2] + 0.15, w => pop(w, 820))); for (let j = 0; j < 6; j++) add(353.6 + j * 0.18, w => key(w)); add(354.7, w => click(w)); W(355.3, 1.7, 0.035, 500, 2600); add(357.0, w => chime(w, [1567.98, 2093], 0.035)); add(358.1, w => shimmer(w, 0.014));
  [316.1, 316.9, 317.7].forEach((x, i) => { add(x, w => click(w)); add(x + 0.3, w => pop(w, 760 + i * 60)); });
}

/* ---------- composition ---------- */
const HOLDS = { 96.6:267.88, 206.0:100.18, 340:221.28, 221.7:345.95, 350:259.13, 320:361.95 };
function Film2({ opts }){
  const rt = useTime();
  const t = warp(rt);
  let hold = null, ho = 0;
  let inA = 1;
  for (const g of WSEG) { const h = HOLDS[g.s0]; if (h != null && rt >= g.r0 && rt < g.r0 + 0.8) { const u = rt - g.r0; hold = u < 0.45 ? h : null; ho = 1 - easeInOut(clamp(u / 0.45)); inA = easeOutStrong(clamp((u - 0.22) / 0.55)); } }
  return (
    <>
      <Bg2 t={t} rt={rt}/>
      {hold != null && <div key="hold" style={{ position:'absolute', inset:0, opacity:ho, filter:`blur(${((1 - ho) * 16).toFixed(2)}px)`, pointerEvents:'none' }}><FilmLayer t={hold} opts={{ ...opts, cursor:false }}/></div>}
      {inA > 0.001 && <div key="live" style={{ position:'absolute', inset:0, opacity:inA, filter: inA < 0.99 ? `blur(${((1 - inA) * 14).toFixed(2)}px)` : 'none' }}><FilmLayer t={t} opts={opts}/></div>}
    </>
  );
}
function FilmLayer({ t, opts }){
  const mapT = t >= 96.6 && t <= 100.25 ? 101.0 + (t - 96.6) : null;
  const visT = t >= 131.9 && t <= 141.6 ? 134 + (t - 131.9) * (8.3 / 9.7) : null;
  return (
    <>
      <ProblemAct t={t}/>
      <BrandAct t={t}/>
      <Laptop t={t}/>
      {t >= 189 && t < 330 && <Story3 t={t} cursor={opts.cursor}/>}
      <Kin t={t} t0={35.9} t1={38.2} lines={[['CaseLink','tells','you'],['what',E('needs'),E('you'),E('today.')]]} size={88}/>
      {t > 38.2 && t < 44.8 && <div style={{ position:'absolute', inset:0, opacity:shotEnv(t, 38.3, 44.4, 0.4, 0.45) }}><FocusBackdrop t={t}/><FocusStack t={t} t0={38.3}/></div>}
      <Kin t={t} t0={44.5} t1={45.95} lines={[['Send','a','referral'],['in',E('ninety'),E('seconds.')]]} size={100}/>
      <Kin t={t} t0={60.2} t1={62.0} lines={[['Both','practices.'],['Same','case.',E('Same'),E('moment.')]]} size={96}/>
      <Kin t={t} t0={71.8} t1={74.0} lines={[['Talk','on','the','case.'],['Not',E('the'),E('phone.')]]} size={100}/>
      <Kin t={t} t0={80.6} t1={82.4} lines={[['Details','change?'],[E('Edit'),E('in'),E('place.')]]} size={100}/>
      <Kin t={t} t0={86.6} t1={88.5} lines={[['Bring','your',E('partners'),E('in.')]]} size={104}/>
      {mapT != null && <MapScene t={mapT} mode="net"/>}
      <Kin t={t} t0={108.8} t1={110.8} lines={[['Your','data.'],['Ready',E('when'),E('you'),E('are.')]]} size={100}/>
      <Kin t={t} t0={115.4} t1={117.3} lines={[['HIPAA'],['compliant','from'],[E('day'),E('one.')]]} size={104}/>
      <Drift t={t} t0={121.2} t1={124.0}/>
      <Kin t={t} t0={121.3} t1={123.9} at={[0.1, 1.24]} lines={[['Less','chasing.'],[E('More'),E('time'),E('for'),E('your'),E('patients.')]]} size={110}/>
      <Pricing2 t={t}/>
      {visT != null && <MapScene t={visT} mode="vision"/>}
      <Finale t={t}/>
      <EmailScene t={t}/>
      <SecurityScene t={t}/>
    </>
  );
}
function CaseLinkIntro2(props){
  const p = props || {};
  const flag = (v, d) => v === undefined || v === null ? d : !(v === false || v === 'false');
  return <Stage width={1920} height={1080} duration={DURATION} background="#FFFFFF"><Film2 opts={{ cursor:flag(p.showCursor, true) }}/></Stage>;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { CaseLinkIntro6: CaseLinkIntro2 };
window.CaseLinkIntro6 = CaseLinkIntro2;
