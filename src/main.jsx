import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// ==========================================
// ⚠️ 設定區：請填入你的 Google Script URL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzd7jbWacz3z8oM22VWCP_RgtuvgGF-eSTsG_ZC3FG_jRloxWXiDnsZeNK4I8RmaW9w/exec"; 


// ==========================================
// 0. Icons (內建 SVG，確保不依賴外部庫導致崩潰)
// ==========================================
const Icon = ({ name, size = 24, className = "", onClick }) => {
  const icons = {
    Fingerprint: <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10v.5c0 1.38-1.12 2.5-2.5 2.5S17 13.88 17 12.5V12c0-2.76-2.24-5-5-5s-5 2.24-5 5v2.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-3" />,
    LayoutDashboard: <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>,
    Utensils: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>,
    Dumbbell: <path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>,
    Wallet: <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M16 12h6"/><path d="M22 12v5"/><path d="M22 12v-5"/>,
    Mic: <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>,
    Plus: <path d="M12 5v14"/><path d="M5 12h14"/>,
    X: <path d="M18 6 6 18"/><path d="M6 6l12 12"/>,
    Settings: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>,
    Camera: <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>,
    Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    Loader2: <path d="M21 12a9 9 0 1 1-6.219-8.56"/>,
    Trash2: <path d="M3 6h18"/><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>,
    Calendar: <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>,
    Clock: <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>,
    MapPin: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>,
    Flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.31.58.6 1.15.9 1.8z"/>,
    Droplet: <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.31 0z"/>,
    ArrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    ScanLine: <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />,
  };
  return (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

// ==========================================
// 1. API Service
// ==========================================
const api = {
  fetchAll: async (userId) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return null;
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData&userId=${userId}`);
      const json = await response.json();
      return json.status === 'success' ? {
        diet: Array.isArray(json.data.diet) ? json.data.diet : [],
        workout: Array.isArray(json.data.workout) ? json.data.workout : [],
        finance: Array.isArray(json.data.finance) ? json.data.finance : [],
        settings: json.data.settings || {}
      } : null;
    } catch (e) { console.error(e); return null; }
  },
  post: async (action, sheet, data, userId) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return;
    // 確保日期格式
    if (data.date) {
      const d = new Date(data.date);
      data.date = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
    }
    try { fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action, sheet, data, userId }) }); } catch (e) {}
  },
  analyze: async (base64Image, type) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return null;
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: 'analyzeImage', image: base64Image, type: type }) });
      const json = await response.json();
      return json.status === 'success' ? json.data : null;
    } catch (e) { return null; }
  }
};

// Helper: 格式化日期
const formatDate = (dateObj) => {
  return `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`;
};

// ==========================================
// 2. Components
// ==========================================

const DateScroller = ({ date, setDate }) => {
  const dates = useMemo(() => {
    const arr = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [date]);

  return (
    <div className="pt-4 pb-2 px-4 bg-dark-bg z-10">
      <div className="flex gap-3 overflow-x-auto" style={{scrollbarWidth:'none'}}>
        {dates.map((d, i) => {
          const isSelected = d.toDateString() === date.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <button 
              key={i} 
              onClick={() => setDate(d)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all active:scale-95 ${isSelected ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-dark-card text-dark-sub border border-dark-border'}`}
            >
              <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={`text-xl font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{d.getDate()}</span>
              {isToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-black' : 'bg-accent-green'}`}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimelineCard = ({ icon, color, title, subtitle, value, time }) => (
  <div className="flex gap-4 relative group active:scale-95 transition-transform cursor-pointer">
    <div className="absolute left-[19px] top-10 bottom-[-20px] w-0.5 bg-dark-border z-0 group-last:hidden"></div>
    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-dark-bg ${color} text-white shadow-lg`}>
      <Icon name={icon} size={18} />
    </div>
    <div className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-dark-text text-lg">{title}</h4>
        <span className="text-xs font-mono text-dark-sub bg-dark-bg px-2 py-1 rounded-md">{time}</span>
      </div>
      <div className="flex justify-between items-end">
        <p className="text-sm text-dark-sub">{subtitle}</p>
        <span className={`text-xl font-bold ${color.replace('bg-', 'text-')}`}>{value}</span>
      </div>
    </div>
  </div>
);

const BottomSheet = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"/>
        <motion.div 
          initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} 
          transition={{type:"spring", damping:25, stiffness:300}} 
          className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50 rounded-t-[32px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
        >
          <div className="flex justify-center pt-3 pb-1" onClick={onClose}><div className="w-12 h-1.5 bg-dark-border rounded-full"/></div>
          <div className="px-6 pb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 bg-dark-bg rounded-full text-dark-sub"><Icon name="X" size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pb-safe-bottom">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Modals ---

const ExpenseModal = ({ isOpen, onClose, onSave, date }) => {
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('');
  const num = (n) => { if(amt.length<7) setAmt(amt+n); };
  useEffect(() => { if(!isOpen) { setAmt(''); setNote(''); } }, [isOpen]);
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="記一筆">
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl font-bold text-white flex items-baseline mb-4"><span className="text-2xl text-dark-sub mr-1">$</span>{amt||'0'}</div>
        <input placeholder="輸入備註..." value={note} onChange={e=>setNote(e.target.value)} className="dark-input text-center font-bold"/>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1,2,3,4,5,6,7,8,9,'.',0].map(n=><button key={n} onClick={()=>num(n)} className="py-4 bg-dark-bg rounded-2xl text-xl font-bold text-white active:bg-dark-border transition">{n}</button>)}
        <button onClick={()=>setAmt(amt.slice(0,-1))} className="py-4 bg-accent-red/20 text-accent-red rounded-2xl flex justify-center items-center active:bg-accent-red/30"><Icon name="Trash2"/></button>
      </div>
      <button onClick={()=>{if(amt) onSave({amount:parseInt(amt),note:note||'消費',categoryId:'gen',date:date, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg active:scale-95 transition">確認</button>
    </BottomSheet>
  );
};

const DietModal = ({ isOpen, onClose, onSave, date }) => {
  const [mode, setMode] = useState('text');
  const [data, setData] = useState({ name: '', calories: '', protein: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { if(!isOpen) { setMode('text'); setData({ name: '', calories: '', protein: '' }); } }, [isOpen]);
  
  const handleFile = (e) => {
    const f = e.target.files[0]; if(!f) return;
    setLoading(true);
    const r = new FileReader();
    r.onloadend = async () => {
      const res = await api.analyze(r.result, 'food');
      if(res) { setData({...data, ...res}); setMode('result'); } else { alert('分析失敗'); setMode('text'); }
      setLoading(false);
    };
    r.readAsDataURL(f);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="飲食紀錄">
      {mode === 'text' || mode === 'camera' ? (
        <div className="space-y-4">
          <div className="flex bg-dark-bg p-1 rounded-xl mb-4 border border-dark-border">
            <button onClick={()=>setMode('text')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='text'?'bg-dark-card text-white shadow':'text-dark-sub'}`}>手動</button>
            <button onClick={()=>setMode('camera')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='camera'?'bg-dark-card text-white shadow':'text-dark-sub'}`}>拍照</button>
          </div>
          {mode === 'camera' ? (
            <div className="relative h-48 bg-dark-bg border-2 border-dashed border-dark-border rounded-2xl flex flex-col items-center justify-center text-dark-sub">
              {loading ? <div className="animate-pulse flex flex-col items-center"><Icon name="Loader2" className="animate-spin mb-2"/><span>AI 分析中...</span></div> : <><Icon name="Camera" size={32} className="mb-2"/><span>點擊上傳</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
            </div>
          ) : (
            <div className="space-y-3">
              <input placeholder="食物名稱" value={data.name} onChange={e=>setData({...data,name:e.target.value})} className="dark-input"/>
              <div className="flex gap-3">
                <input type="number" placeholder="熱量 (kcal)" value={data.calories} onChange={e=>setData({...data,calories:e.target.value})} className="dark-input"/>
                <input type="number" placeholder="蛋白質 (g)" value={data.protein} onChange={e=>setData({...data,protein:e.target.value})} className="dark-input"/>
              </div>
              <button onClick={()=>{onSave({...data, date:date, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-accent-orange text-white rounded-2xl font-bold mt-2">儲存</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-accent-green/20 p-4 rounded-2xl text-center mb-4 border border-accent-green/30"><div className="text-sm text-accent-green font-bold">AI 識別成功</div><div className="text-2xl font-bold text-white">{data.name}</div></div>
          <div className="flex gap-3">
            <div className="flex-1 bg-dark-bg p-3 rounded-2xl text-center"><div className="text-xs text-dark-sub font-bold">熱量</div><div className="text-xl font-bold text-accent-orange">{data.calories}</div></div>
            <div className="flex-1 bg-dark-bg p-3 rounded-2xl text-center"><div className="text-xs text-dark-sub font-bold">蛋白質</div><div className="text-xl font-bold text-accent-blue">{data.protein}g</div></div>
          </div>
          <button onClick={()=>{onSave({...data, date:date, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold">確認儲存</button>
        </div>
      )}
    </BottomSheet>
  );
};

const WorkoutModal = ({ isOpen, onClose, onSave, date }) => {
  const [data, setData] = useState({ title: '', duration: 60, calories: 300 });
  useEffect(() => { if(!isOpen) setData({ title: '', duration: 60, calories: 300 }); }, [isOpen]);
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="新增運動">
      <div className="space-y-4">
        <input placeholder="運動項目 (如: 跑步)" value={data.title} onChange={e=>setData({...data,title:e.target.value})} className="dark-input"/>
        <div className="flex gap-3">
          <input type="number" placeholder="時長 (分)" value={data.duration} onChange={e=>setData({...data,duration:Number(e.target.value)})} className="dark-input"/>
          <input type="number" placeholder="消耗 (kcal)" value={data.calories} onChange={e=>setData({...data,calories:Number(e.target.value)})} className="dark-input"/>
        </div>
        <button onClick={()=>{onSave({...data, date:date, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-accent-blue text-white rounded-2xl font-bold mt-4">儲存紀錄</button>
      </div>
    </BottomSheet>
  );
};

const InBodyModal = ({ isOpen, onClose, onSaveProfile }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ weight: 70, bodyFat: 20 });
  const [result, setResult] = useState(null);
  useEffect(() => { if(!isOpen) { setResult(null); setLoading(false); } }, [isOpen]);
  const handleFile = (e) => {
    const f = e.target.files[0]; if(!f) return;
    setLoading(true);
    const r = new FileReader();
    r.onloadend = async () => {
      const res = await api.analyze(r.result, 'inbody');
      if(res) { setData({weight:res.weight, bodyFat:res.pbf}); setResult({target: Math.round(res.weight*24)}); }
      else alert('分析失敗');
      setLoading(false);
    };
    r.readAsDataURL(f);
  };
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="InBody 分析">
      {!result ? (
        <div className="relative h-48 bg-dark-bg border-2 border-dashed border-dark-border rounded-2xl flex flex-col items-center justify-center text-dark-sub">
          {loading ? <div className="animate-pulse flex flex-col items-center"><Icon name="Loader2" className="animate-spin mb-2"/><span>AI 讀取中...</span></div> : <><Icon name="ScanLine" size={40} className="mb-2"/><span className="font-bold">上傳報告</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
        </div>
      ) : (
        <div className="text-center space-y-6 w-full">
          <div className="bg-accent-purple/20 p-8 rounded-3xl border border-accent-purple/30"><div className="text-sm text-accent-purple font-bold mb-2">建議每日攝取</div><div className="text-6xl font-bold text-white">{result.target} <span className="text-lg text-dark-sub">kcal</span></div></div>
          <div className="flex gap-4 justify-center text-dark-sub font-bold">
            <span className="bg-dark-bg px-4 py-2 rounded-xl border border-dark-border">體重: {data.weight}kg</span>
            <span className="bg-dark-bg px-4 py-2 rounded-xl border border-dark-border">體脂: {data.bodyFat}%</span>
          </div>
          <button onClick={()=>{onSaveProfile({dailyCalories: result.target}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold">應用此目標</button>
        </div>
      )}
    </BottomSheet>
  );
};

// --- Main App ---
const App = () => {
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState({ finance: [], diet: [], workout: [] });
  const [settings, setSettings] = useState({ name: 'User', dailyCalories: 2000, dailyWater: 2000 });
  const [modals, setModals] = useState({ expense: false, diet: false, workout: false, inbody: false, settings: false });
  const toggle = (k, v) => setModals(p => ({...p, [k]: v}));

  const handleLogin = (id) => {
    setUserId(id);
    api.fetchAll(id).then(res => { if(res) { setData({ finance: res.finance||[], diet: res.diet||[], workout: res.workout||[] }); if(res.settings) setSettings(res.settings); } });
  };

  const addData = (type, item) => {
    const key = type.toLowerCase();
    setData(p => ({...p, [key]: [...p[key], item]}));
    api.post('add', type, item, userId);
  };

  const dateStr = formatDate(date);
  const todayData = {
    finance: data.finance.filter(i => i.date === dateStr),
    diet: data.diet.filter(i => i.date === dateStr),
    workout: data.workout.filter(i => i.date === dateStr)
  };

  const timelineItems = [
    ...todayData.diet.map(i => ({ ...i, type: 'diet', icon: 'Utensils', color: 'bg-accent-orange' })),
    ...todayData.workout.map(i => ({ ...i, type: 'workout', icon: 'Dumbbell', color: 'bg-accent-blue' })),
    ...todayData.finance.map(i => ({ ...i, type: 'finance', icon: 'Wallet', color: 'bg-accent-green' }))
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  if (!userId) return (
    <div className="h-full flex items-center justify-center bg-dark-bg p-6">
      <div className="w-full max-w-sm p-8 text-center">
        <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-8 text-white border border-dark-border shadow-2xl shadow-accent-purple/20"><Icon name="Fingerprint" size={48}/></div>
        <h1 className="text-3xl font-bold mb-2 text-white">LifeOS</h1>
        <p className="text-dark-sub mb-8 text-sm">量化生活，掌握自我</p>
        <form onSubmit={e=>{e.preventDefault(); handleLogin(e.target.elements.uid.value)}}>
          <input name="uid" placeholder="輸入用戶 ID" className="dark-input text-center font-bold mb-4" required />
          <button className="w-full py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition">進入系統</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-dark-bg">
      <div className="flex justify-between items-center px-6 pt-6 pb-2">
        <div><div className="text-xs font-bold text-accent-green uppercase tracking-wider mb-1">ONLINE</div><h1 className="text-2xl font-bold text-white">早安，{settings.name}</h1></div>
        <button onClick={()=>toggle('settings',true)} className="p-2 bg-dark-card rounded-full border border-dark-border text-dark-sub"><Icon name="Settings"/></button>
      </div>

      <DateScroller date={date} setDate={setDate} />
      
      <main className="px-6 pt-4 space-y-6">
        {activeTab === 'home' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl">
                <div className="text-xs text-dark-sub font-bold mb-1">熱量攝取</div>
                <div className="text-2xl font-bold text-white">{todayData.diet.reduce((a,c)=>a+(Number(c.calories)||0),0)} <span className="text-xs text-dark-sub">/ {settings.dailyCalories}</span></div>
                <div className="h-1 bg-dark-bg mt-2 rounded-full overflow-hidden"><div className="h-full bg-accent-orange w-1/2"></div></div>
              </div>
              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl">
                <div className="text-xs text-dark-sub font-bold mb-1">今日花費</div>
                <div className="text-2xl font-bold text-white">${todayData.finance.reduce((a,c)=>a+(Number(c.amount)||0),0)}</div>
                <div className="h-1 bg-dark-bg mt-2 rounded-full overflow-hidden"><div className="h-full bg-accent-green w-1/3"></div></div>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border p-4 rounded-2xl">
              <div className="text-xs text-dark-sub font-bold mb-4 uppercase tracking-wider">本週熱量趨勢</div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const s=formatDate(d);return{name:i,v:data.diet.filter(x=>x.date===s).reduce((a,c)=>a+(Number(c.calories)||0),0)}})}>
                    <Area type="monotone" dataKey="v" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">今日行程</h3>
                <div className="flex gap-2">
                  <button onClick={()=>toggle('diet',true)} className="p-2 bg-accent-orange/20 text-accent-orange rounded-xl"><Icon name="Utensils" size={18}/></button>
                  <button onClick={()=>toggle('workout',true)} className="p-2 bg-accent-blue/20 text-accent-blue rounded-xl"><Icon name="Dumbbell" size={18}/></button>
                  <button onClick={()=>toggle('expense',true)} className="p-2 bg-accent-green/20 text-accent-green rounded-xl"><Icon name="Wallet" size={18}/></button>
                </div>
              </div>

              <div className="pb-8">
                {timelineItems.length === 0 ? (
                  <div className="text-center py-12 text-dark-sub border-2 border-dashed border-dark-card rounded-3xl">
                    <Icon name="LayoutDashboard" size={40} className="mx-auto mb-2 opacity-20"/>
                    <p>今天還沒有紀錄</p>
                  </div>
                ) : (
                  timelineItems.map((item, i) => (
                    <TimelineCard 
                      key={i}
                      icon={item.icon}
                      color={item.color}
                      title={item.name || item.title || item.note}
                      time={item.time || '剛剛'}
                      subtitle={item.type === 'finance' ? '支出' : item.type === 'diet' ? '攝取' : '消耗'}
                      value={item.amount ? `-$${item.amount}` : item.calories ? `${item.calories} kcal` : ''}
                    />
                  ))
                )}
              </div>
            </div>
            
            <div onClick={()=>toggle('inbody',true)} className="bg-gradient-to-r from-accent-purple to-indigo-600 p-5 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-accent-purple/20 active:scale-95 transition cursor-pointer">
              <div><div className="font-bold text-lg">InBody 分析</div><div className="text-xs opacity-80">點擊上傳報告，AI 自動計算</div></div>
              <Icon name="Activity" size={32} className="opacity-80"/>
            </div>
          </>
        )}
        {activeTab === 'diet' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">飲食紀錄</h2><button onClick={()=>toggle('diet',true)} className="text-accent-orange font-bold">+ 新增</button></div>
            {todayData.diet.length===0 ? <div className="text-center text-dark-sub py-10">無紀錄</div> : todayData.diet.map((i,k)=><TimelineCard key={k} icon="Utensils" color="bg-accent-orange" title={i.name} time={i.time} subtitle="攝取" value={`${i.calories} kcal`} />)}
          </div>
        )}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">運動紀錄</h2><button onClick={()=>toggle('workout',true)} className="text-accent-blue font-bold">+ 新增</button></div>
            {todayData.workout.length===0 ? <div className="text-center text-dark-sub py-10">無紀錄</div> : todayData.workout.map((i,k)=><TimelineCard key={k} icon="Dumbbell" color="bg-accent-blue" title={i.title} time={i.time} subtitle="消耗" value={`${i.calories} kcal`} />)}
          </div>
        )}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">財務紀錄</h2><button onClick={()=>toggle('expense',true)} className="text-accent-green font-bold">+ 新增</button></div>
            {todayData.finance.length===0 ? <div className="text-center text-dark-sub py-10">無紀錄</div> : todayData.finance.map((i,k)=><TimelineCard key={k} icon="Wallet" color="bg-accent-green" title={i.note} time={i.time} subtitle="支出" value={`$${i.amount}`} />)}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass pb-safe-bottom pt-3 px-6 flex justify-between items-end z-40 max-w-md mx-auto">
        {['home','diet','workout','finance'].map(t => (
          <button key={t} onClick={()=>setActiveTab(t)} className={`flex flex-col items-center p-2 transition ${activeTab===t?'text-white':'text-dark-sub'}`}>
            <Icon name={t==='home'?'LayoutDashboard':t==='diet'?'Utensils':t==='workout'?'Dumbbell':t==='finance'?'Wallet':'Mic'} size={24} strokeWidth={activeTab===t?2.5:2} />
            <span className="text-[10px] font-medium mt-1 capitalize">{t}</span>
          </button>
        ))}
      </div>

      <ExpenseModal isOpen={modals.expense} onClose={()=>toggle('expense',false)} onSave={i=>addData('Finance',i)} date={date} />
      <DietModal isOpen={modals.diet} onClose={()=>toggle('diet',false)} onSave={i=>addData('Diet',i)} date={date} />
      <WorkoutModal isOpen={modals.workout} onClose={()=>toggle('workout',false)} onSave={i=>addData('Workout',i)} date={date} />
      <InBodyModal isOpen={modals.inbody} onClose={()=>toggle('inbody',false)} onSaveProfile={s=>{setSettings(p=>({...p,...s})); api.post('saveSettings',null,s,userId);}} />
      
      <BottomSheet isOpen={modals.settings} onClose={()=>toggle('settings',false)} title="設定">
        <div className="space-y-4">
          <div><label className="text-xs text-dark-sub font-bold ml-1">暱稱</label><input value={settings.name} onChange={e=>setSettings({...settings,name:e.target.value})} className="dark-input"/></div>
          <div><label className="text-xs text-dark-sub font-bold ml-1">每日熱量 (kcal)</label><input type="number" value={settings.dailyCalories} onChange={e=>setSettings({...settings,dailyCalories:e.target.value})} className="dark-input"/></div>
          <button onClick={()=>{api.post('saveSettings',null,settings,userId); toggle('settings',false);}} className="w-full py-4 bg-white text-black rounded-2xl font-bold">儲存設定</button>
        </div>
      </BottomSheet>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
