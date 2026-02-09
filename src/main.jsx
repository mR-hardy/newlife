import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  Fingerprint, LayoutDashboard, Utensils, Dumbbell, Wallet, Mic, 
  Plus, X, Settings, Camera, Activity, Loader2, Trash2, 
  Calendar, ChevronLeft, ChevronRight, ScanLine, Check,
  Bus, ShoppingBag, Coffee, Gamepad2, MoreHorizontal
} from 'lucide-react';

// ==========================================
// ⚠️ 設定區：請填入你的 Google Script URL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/library/d/1j7-86yWn5faEvNCRug6Guigw9F79_wrq87id5qDGJGqHbZQLvYIRMzGP/3"; 


// --- Helper: 強力日期格式化 (關鍵修正！) ---
// 無論後端傳來什麼怪格式，通通轉成 YYYY/MM/DD
// 解決 iPhone 與 Google Sheet 日期格式不一致導致資料消失的問題
const normalizeDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput; // 如果轉失敗，回傳原值
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

// --- API Service ---
const api = {
  fetchAll: async (userId) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return null;
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData&userId=${userId}`);
      const json = await response.json();
      
      if (json.status === 'success') {
        // 收到資料後，立刻清洗日期格式
        const cleanData = (list) => Array.isArray(list) ? list.map(item => ({
          ...item,
          // 如果有日期，就清洗它，否則保留原樣
          date: item.date ? normalizeDate(item.date) : normalizeDate(new Date())
        })) : [];

        return {
          diet: cleanData(json.data.diet),
          workout: cleanData(json.data.workout),
          finance: cleanData(json.data.finance),
          settings: json.data.settings || {}
        };
      }
      return null;
    } catch (e) { console.error("API Error:", e); return null; }
  },
  post: async (action, sheet, data, userId) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return;
    // 寫入前也確保格式正確
    const payload = { ...data };
    if (payload.date) payload.date = normalizeDate(payload.date);
    
    try { fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action, sheet, data: payload, userId }) }); } catch (e) {}
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

// --- Icon Helper ---
const IconMap = {
  Fingerprint, LayoutDashboard, Utensils, Dumbbell, Wallet, Mic, Plus, X, Settings, 
  Camera, Activity, Loader2, Trash2, Calendar, ChevronLeft, ChevronRight, ScanLine, 
  Check, Bus, ShoppingBag, Coffee, Gamepad2, MoreHorizontal
};

const Icon = ({ name, size = 24, className, onClick }) => {
  const LucideIcon = IconMap[name] || LayoutDashboard;
  return <LucideIcon size={size} className={className} onClick={onClick} />;
};

// --- Components ---

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
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2" style={{scrollbarWidth:'none'}}>
        {dates.map((d, i) => {
          // 使用 normalizeDate 進行比對，確保選中正確日期
          const isSelected = normalizeDate(d) === normalizeDate(date);
          const isToday = normalizeDate(d) === normalizeDate(new Date());
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

const TimelineCard = ({ icon, color, title, subtitle, value, time, onClick }) => (
  <div onClick={onClick} className="flex gap-4 relative group active:scale-95 transition-transform cursor-pointer">
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
            <button onClick={onClose} className="p-2 bg-dark-bg rounded-full text-dark-sub"><X size={18}/></button>
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
  const [cat, setCat] = useState('food');
  
  const categories = [
      {id:'food', icon:'Utensils', label:'餐飲'},
      {id:'transport', icon:'Bus', label:'交通'},
      {id:'shopping', icon:'ShoppingBag', label:'購物'},
      {id:'ent', icon:'Gamepad2', label:'娛樂'},
      {id:'drink', icon:'Coffee', label:'飲料'},
      {id:'other', icon:'MoreHorizontal', label:'其他'}
  ];

  const num = (n) => { if(amt.length<7) setAmt(amt+n); };
  
  useEffect(() => { if(!isOpen) { setAmt(''); setNote(''); setCat('food'); } }, [isOpen]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="記一筆">
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl font-bold text-white flex items-baseline mb-4"><span className="text-2xl text-dark-sub mr-1">$</span>{amt||'0'}</div>
        <input placeholder="輸入備註..." value={note} onChange={e=>setNote(e.target.value)} className="dark-input text-center font-bold bg-dark-bg border-none"/>
      </div>
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-2" style={{scrollbarWidth:'none'}}>
          {categories.map(c => (
              <button key={c.id} onClick={()=>setCat(c.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] transition ${cat===c.id?'bg-accent-blue text-white':'bg-dark-bg text-dark-sub'}`}>
                  <Icon name={c.icon} size={20}/>
                  <span className="text-xs mt-1 font-bold">{c.label}</span>
              </button>
          ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1,2,3,4,5,6,7,8,9,'.',0].map(n=><button key={n} onClick={()=>num(n)} className="py-4 bg-dark-bg rounded-2xl text-xl font-bold text-white active:bg-dark-border transition">{n}</button>)}
        <button onClick={()=>setAmt(amt.slice(0,-1))} className="py-4 bg-accent-red/20 text-accent-red rounded-2xl flex justify-center items-center active:bg-accent-red/30"><Trash2/></button>
      </div>
      <button onClick={()=>{if(amt) onSave({amount:parseInt(amt),note:note||categories.find(c=>c.id===cat).label,categoryId:cat,date:date, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg active:scale-95 transition">確認</button>
    </BottomSheet>
  );
};

const DietModal = ({ isOpen, onClose, onSave, date }) => {
  const [mode, setMode] = useState('text');
  const [data, setData] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { if(!isOpen) { setMode('text'); setData({ name: '', calories: '', protein: '', carbs: '', fat: '' }); } }, [isOpen]);

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
              {loading ? <div className="animate-pulse flex flex-col items-center"><Loader2 className="animate-spin mb-2"/><span>AI 分析中...</span></div> : <><Camera size={32} className="mb-2"/><span>點擊上傳</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
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
          {loading ? <div className="animate-pulse flex flex-col items-center"><Loader2 className="animate-spin mb-2"/><span>AI 讀取中...</span></div> : <><ScanLine size={40} className="mb-2"/><span className="font-bold">上傳報告</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
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

// --- App ---
const App = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState({ finance: [], diet: [], workout: [] });
  const [settings, setSettings] = useState({ name: 'User', dailyCalories: 2000, dailyWater: 2000 });
  const [modals, setModals] = useState({ expense: false, diet: false, workout: false, inbody: false, settings: false });
  const toggle = (k, v) => setModals(p => ({...p, [k]: v}));

  // 登入邏輯：加入 Loading 狀態，確保資料抓完才顯示主畫面
  const handleLogin = async (id) => {
    setLoading(true);
    const res = await api.fetchAll(id);
    if(res) {
        setData({ 
            finance: res.finance || [], 
            diet: res.diet || [], 
            workout: res.workout || [] 
        });
        if(res.settings && res.settings.name) setSettings(res.settings);
        else setSettings(prev => ({ ...prev, name: id }));
    }
    setUserId(id);
    setLoading(false);
  };

  const addData = (type, item) => {
    const key = type.toLowerCase();
    setData(p => ({...p, [key]: [...p[key], item]}));
    api.post('add', type, item, userId);
  };

  // 統一使用 YYYY/MM/DD 進行篩選
  const dateStr = normalizeDate(date);
  
  const todayData = {
    finance: data.finance.filter(i => normalizeDate(i.date) === dateStr),
    diet: data.diet.filter(i => normalizeDate(i.date) === dateStr),
    workout: data.workout.filter(i => normalizeDate(i.date) === dateStr)
  };

  const timelineItems = [
    ...todayData.diet.map(i => ({ ...i, type: 'diet', icon: 'Utensils', color: 'bg-accent-orange' })),
    ...todayData.workout.map(i => ({ ...i, type: 'workout', icon: 'Dumbbell', color: 'bg-accent-blue' })),
    ...todayData.finance.map(i => ({ ...i, type: 'finance', icon: 'Wallet', color: 'bg-accent-green' }))
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  if (!userId) return (
    <div className="h-full flex items-center justify-center bg-dark-bg p-6">
      <div className="w-full max-w-sm p-8 text-center">
        <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-8 text-white border border-dark-border shadow-2xl shadow-accent-purple/20"><Fingerprint size={48}/></div>
        <h1 className="text-3xl font-bold mb-2 text-white">LifeOS</h1>
        <p className="text-dark-sub mb-8 text-sm">量化生活，掌握自我</p>
        <form onSubmit={e=>{e.preventDefault(); handleLogin(e.target.elements.uid.value)}}>
          <input name="uid" placeholder="輸入用戶 ID" className="dark-input text-center font-bold mb-4" required />
          <button disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : '進入系統'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-dark-bg">
      <div className="flex justify-between items-center px-6 pt-6 pb-2">
        <div><div className="text-xs font-bold text-accent-green uppercase tracking-wider mb-1">ONLINE</div><h1 className="text-2xl font-bold text-white">早安，{settings.name}</h1></div>
        <button onClick={()=>toggle('settings',true)} className="p-2 bg-dark-card rounded-full border border-dark-border text-dark-sub"><Settings/></button>
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
                  <AreaChart data={[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const s=normalizeDate(d);return{name:i,v:data.diet.filter(x=>normalizeDate(x.date)===s).reduce((a,c)=>a+(Number(c.calories)||0),0)}})}>
                    <Area type="monotone" dataKey="v" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">今日行程</h3>
                <div className="flex gap-2">
                  <button onClick={()=>toggle('diet',true)} className="p-2 bg-accent-orange/20 text-accent-orange rounded-xl"><Utensils size={18}/></button>
                  <button onClick={()=>toggle('workout',true)} className="p-2 bg-accent-blue/20 text-accent-blue rounded-xl"><Dumbbell size={18}/></button>
                  <button onClick={()=>toggle('expense',true)} className="p-2 bg-accent-green/20 text-accent-green rounded-xl"><Wallet size={18}/></button>
                </div>
              </div>

              <div className="pb-8">
                {timelineItems.length === 0 ? (
                  <div className="text-center py-12 text-dark-sub border-2 border-dashed border-dark-card rounded-3xl">
                    <LayoutDashboard size={40} className="mx-auto mb-2 opacity-20"/>
                    <p>今天還沒有紀錄</p>
                  </div>
                ) : (
                  timelineItems.map((item, i) => (
                    <TimelineCard 
                      key={i}
                      icon={item.icon}
                      color={item.color}
                      title={item.name || item.title || item.note}
                      time={item.time || ''}
                      subtitle={item.type === 'finance' ? '支出' : item.type === 'diet' ? '攝取' : '消耗'}
                      value={item.amount ? `-$${item.amount}` : item.calories ? `${item.calories} kcal` : ''}
                    />
                  ))
                )}
              </div>
            </div>
            
            <div onClick={()=>toggle('inbody',true)} className="bg-gradient-to-r from-accent-purple to-indigo-600 p-5 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-accent-purple/20 active:scale-95 transition cursor-pointer">
              <div><div className="font-bold text-lg">InBody 分析</div><div className="text-xs opacity-80">點擊上傳報告，AI 自動計算</div></div>
              <Activity size={32} className="opacity-80"/>
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
            <div onClick={()=>toggle('inbody',true)} className="bg-gradient-to-r from-accent-purple to-indigo-600 p-5 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-accent-purple/20 active:scale-95 transition cursor-pointer mb-4">
              <div><div className="font-bold text-lg">InBody 分析</div><div className="text-xs opacity-80">點擊上傳報告</div></div><Activity size={32} className="opacity-80"/>
            </div>
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
      
      {/* 數據除錯指示器 (確認是否真的有抓到資料) */}
      {settings.name !== 'User' && (
        <div className="fixed top-0 left-0 bg-accent-green text-black text-[10px] px-2 py-1 z-50 rounded-br-lg opacity-50">
          D:{data.diet.length} W:{data.workout.length} F:{data.finance.length}
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

