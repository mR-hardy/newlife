import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  Fingerprint, LayoutDashboard, Utensils, Dumbbell, Wallet, Mic, 
  Plus, X, Settings, Camera, Activity, Loader2, Trash2, 
  Calendar, ChevronLeft, ChevronRight, ScanLine, Check,
  Bus, ShoppingBag, Coffee, Gamepad2, MoreHorizontal,
  ListTodo, CheckSquare, Square, Droplet, Thermometer, Clock
} from 'lucide-react';

// ==========================================
// ⚠️ 設定區
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwK2CYeD2-30vHm0c3K1FSHUpvj7svWRR5sC5O_T7F8WJzxwY0Qp95sESlr8fMHflCx/exec"; 


// --- Helper ---
const normalizeDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
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
        const cleanData = (list) => Array.isArray(list) ? list.map(item => ({
          ...item,
          date: item.date ? normalizeDate(item.date) : normalizeDate(new Date())
        })) : [];
        return {
          diet: cleanData(json.data.diet),
          workout: cleanData(json.data.workout),
          finance: cleanData(json.data.finance),
          coffee: cleanData(json.data.coffee),
          memo: cleanData(json.data.memo),
          settings: json.data.settings || {}
        };
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },
  post: async (action, sheet, data, userId) => {
    if (!GOOGLE_SCRIPT_URL.startsWith("http")) return;
    const payload = { ...data };
    if (payload.date) payload.date = normalizeDate(payload.date);
    try { fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action, sheet, data: payload, userId }) }); } catch (e) {}
  },
  analyze: async (base64Image, type) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: 'analyzeImage', image: base64Image, type: type }) });
      const json = await response.json();
      return json.status === 'success' ? json.data : null;
    } catch (e) { return null; }
  }
};

// --- Icon Component ---
const IconMap = {
  Fingerprint, LayoutDashboard, Utensils, Dumbbell, Wallet, Mic, Plus, X, Settings, 
  Camera, Activity, Loader2, Trash2, Calendar, ChevronLeft, ChevronRight, ScanLine, 
  Check, Bus, ShoppingBag, Coffee, Gamepad2, MoreHorizontal, ListTodo, CheckSquare, Square,
  Droplet, Thermometer, Clock
};
const Icon = ({ name, size = 24, className, onClick }) => {
  const LucideIcon = IconMap[name] || LayoutDashboard;
  return <LucideIcon size={size} className={className} onClick={onClick} />;
};

// --- Components ---

const DateScroller = ({ date, setDate }) => {
  const dates = useMemo(() => {
    const arr = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [date]);

  return (
    <div className="pt-2 pb-2 px-4 bg-dark-bg z-10 border-b border-white/5">
      <div className="flex justify-between items-center">
        {dates.map((d, i) => {
          const isSelected = normalizeDate(d) === normalizeDate(date);
          const isToday = normalizeDate(d) === normalizeDate(new Date());
          return (
            <button 
              key={i} 
              onClick={() => setDate(d)}
              className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all ${isSelected ? 'bg-white text-black' : 'text-gray-500'}`}
            >
              <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={`text-lg font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{d.getDate()}</span>
              {isToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-black' : 'bg-accent-green'}`}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimelineCard = ({ icon, color, title, subtitle, value, time }) => (
  <div className="flex gap-4 relative group mb-4">
    <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-white/10 z-0 group-last:hidden"></div>
    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-dark-bg ${color} text-white shadow-lg shrink-0`}>
      <Icon name={icon} size={18} />
    </div>
    <div className="flex-1 bg-dark-card border border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-white text-base line-clamp-1">{title}</h4>
        <span className="text-xs font-mono text-gray-500 shrink-0 ml-2">{time}</span>
      </div>
      <div className="flex justify-between items-end">
        <p className="text-sm text-gray-400">{subtitle}</p>
        <span className={`text-lg font-bold ${color.replace('bg-', 'text-')}`}>{value}</span>
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
          className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-white/10 z-50 rounded-t-[32px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
        >
          <div className="flex justify-center pt-3 pb-1" onClick={onClose}><div className="w-12 h-1.5 bg-white/20 rounded-full"/></div>
          <div className="px-6 pb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-gray-400"><X size={18}/></button>
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
  const categories = [{id:'food', icon:'Utensils', label:'餐飲'},{id:'transport', icon:'Bus', label:'交通'},{id:'shopping', icon:'ShoppingBag', label:'購物'},{id:'ent', icon:'Gamepad2', label:'娛樂'},{id:'drink', icon:'Coffee', label:'飲料'},{id:'other', icon:'MoreHorizontal', label:'其他'}];
  const num = (n) => { if(amt.length<7) setAmt(amt+n); };
  useEffect(() => { if(!isOpen) { setAmt(''); setNote(''); setCat('food'); } }, [isOpen]);
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="記一筆">
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl font-bold text-white flex items-baseline mb-4"><span className="text-2xl text-gray-500 mr-1">$</span>{amt||'0'}</div>
        <input placeholder="輸入備註..." value={note} onChange={e=>setNote(e.target.value)} className="dark-input text-center font-bold bg-transparent border-none text-white"/>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-2" style={{scrollbarWidth:'none'}}>{categories.map(c => (<button key={c.id} onClick={()=>setCat(c.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] transition ${cat===c.id?'bg-accent-blue text-white':'bg-white/5 text-gray-400'}`}><Icon name={c.icon} size={20}/><span className="text-xs mt-1 font-bold">{c.label}</span></button>))}</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1,2,3,4,5,6,7,8,9,'.',0].map(n=><button key={n} onClick={()=>num(n)} className="py-4 bg-white/5 rounded-2xl text-xl font-bold text-white active:bg-white/10 transition">{n}</button>)}
        <button onClick={()=>setAmt(amt.slice(0,-1))} className="py-4 bg-accent-red/20 text-accent-red rounded-2xl flex justify-center items-center active:bg-accent-red/30"><Trash2/></button>
      </div>
      <button onClick={()=>{if(amt) onSave({amount:parseInt(amt),note:note||categories.find(c=>c.id===cat).label,categoryId:cat,date:normalizeDate(date), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg active:scale-95 transition">確認</button>
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
          <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/10">
            <button onClick={()=>setMode('text')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='text'?'bg-white text-black shadow':'text-gray-400'}`}>手動</button>
            <button onClick={()=>setMode('camera')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='camera'?'bg-white text-black shadow':'text-gray-400'}`}>拍照</button>
          </div>
          {mode === 'camera' ? (
            <div className="relative h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400">
              {loading ? <div className="animate-pulse flex flex-col items-center"><Loader2 className="animate-spin mb-2"/><span>AI 分析中...</span></div> : <><Camera size={32} className="mb-2"/><span>點擊上傳</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
            </div>
          ) : (
            <div className="space-y-3">
              <input placeholder="食物名稱" value={data.name} onChange={e=>setData({...data,name:e.target.value})} className="dark-input"/>
              <div className="flex gap-3">
                <input type="number" placeholder="熱量 (kcal)" value={data.calories} onChange={e=>setData({...data,calories:e.target.value})} className="dark-input"/>
                <input type="number" placeholder="蛋白質 (g)" value={data.protein} onChange={e=>setData({...data,protein:e.target.value})} className="dark-input"/>
              </div>
              <button onClick={()=>{onSave({...data, date:normalizeDate(date), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-accent-orange text-white rounded-2xl font-bold mt-2">儲存</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-accent-green/20 p-4 rounded-2xl text-center mb-4 border border-accent-green/30"><div className="text-sm text-accent-green font-bold">AI 識別成功</div><div className="text-2xl font-bold text-white">{data.name}</div></div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 p-3 rounded-2xl text-center"><div className="text-xs text-gray-400 font-bold">熱量</div><div className="text-xl font-bold text-accent-orange">{data.calories}</div></div>
            <div className="flex-1 bg-white/5 p-3 rounded-2xl text-center"><div className="text-xs text-gray-400 font-bold">蛋白質</div><div className="text-xl font-bold text-accent-blue">{data.protein}g</div></div>
          </div>
          <button onClick={()=>{onSave({...data, date:normalizeDate(date), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-white text-black rounded-2xl font-bold">確認儲存</button>
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
        <button onClick={()=>{onSave({...data, date:normalizeDate(date), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-accent-blue text-white rounded-2xl font-bold mt-4">儲存紀錄</button>
      </div>
    </BottomSheet>
  );
};

const CoffeeModal = ({ isOpen, onClose, onSave, date }) => {
  const [mode, setMode] = useState('hand');
  const [data, setData] = useState({ bean: '', ratio: '', water: '', temp: '', time: '', taste: '' });
  useEffect(() => { if(!isOpen) setData({ bean: '', ratio: '', water: '', temp: '', time: '', taste: '' }); }, [isOpen]);
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="咖啡紀錄">
      <div className="space-y-4">
        <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/10">
          <button onClick={()=>setMode('hand')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='hand'?'bg-white text-black shadow':'text-gray-400'}`}>手沖</button>
          <button onClick={()=>setMode('shop')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode==='shop'?'bg-white text-black shadow':'text-gray-400'}`}>店鋪</button>
        </div>
        <input placeholder="豆子種類 / 店名" value={data.bean} onChange={e=>setData({...data,bean:e.target.value})} className="dark-input"/>
        {mode === 'hand' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="relative"><Icon name="Droplet" size={16} className="absolute left-3 top-4 text-gray-500"/><input placeholder="粉水比 (1:15)" value={data.ratio} onChange={e=>setData({...data,ratio:e.target.value})} className="dark-input pl-10"/></div>
            <div className="relative"><Icon name="Thermometer" size={16} className="absolute left-3 top-4 text-gray-500"/><input placeholder="水溫 (92°C)" value={data.temp} onChange={e=>setData({...data,temp:e.target.value})} className="dark-input pl-10"/></div>
            <div className="relative"><Icon name="Clock" size={16} className="absolute left-3 top-4 text-gray-500"/><input placeholder="時間 (2:30)" value={data.time} onChange={e=>setData({...data,time:e.target.value})} className="dark-input pl-10"/></div>
            <div className="relative"><Icon name="Coffee" size={16} className="absolute left-3 top-4 text-gray-500"/><input placeholder="水量 (250ml)" value={data.water} onChange={e=>setData({...data,water:e.target.value})} className="dark-input pl-10"/></div>
          </div>
        )}
        <textarea placeholder="口感描述..." value={data.taste} onChange={e=>setData({...data,taste:e.target.value})} className="dark-input h-24 resize-none"/>
        <button onClick={()=>{onSave({...data, method: mode, date:normalizeDate(date), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}); onClose();}} className="w-full py-4 bg-yellow-600 text-white rounded-2xl font-bold mt-2">儲存紀錄</button>
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
        <div className="relative h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400">
          {loading ? <div className="animate-pulse flex flex-col items-center"><Loader2 className="animate-spin mb-2"/><span>AI 讀取中...</span></div> : <><ScanLine size={40} className="mb-2"/><span className="font-bold">上傳報告</span><input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0"/></>}
        </div>
      ) : (
        <div className="text-center space-y-6 w-full">
          <div className="bg-accent-purple/20 p-8 rounded-3xl border border-accent-purple/30"><div className="text-sm text-accent-purple font-bold mb-2">建議每日攝取</div><div className="text-6xl font-bold text-white">{result.target} <span className="text-lg text-gray-400">kcal</span></div></div>
          <div className="flex gap-4 justify-center text-gray-400 font-bold">
            <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">體重: {data.weight}kg</span>
            <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">體脂: {data.bodyFat}%</span>
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
  const [activeTab, setActiveTab] = useState('home');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState({ finance: [], diet: [], workout: [], coffee: [], memo: [] });
  const [settings, setSettings] = useState({ name: 'User', dailyCalories: 2000, dailyWater: 2000 });
  const [modals, setModals] = useState({ expense: false, diet: false, workout: false, inbody: false, settings: false, coffee: false, menu: false });
  const [loading, setLoading] = useState(false);

  const toggle = (k, v) => setModals(p => ({...p, [k]: v}));

  const handleLogin = async (id) => {
    setLoading(true);
    const res = await api.fetchAll(id);
    if(res) {
        setData({ 
            finance: res.finance || [], 
            diet: res.diet || [], 
            workout: res.workout || [],
            coffee: res.coffee || [],
            memo: res.memo || []
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

  const toggleMemo = (id, currentStatus) => {
    const newStatus = !currentStatus;
    setData(prev => ({ ...prev, memo: prev.memo.map(m => m.id === id ? { ...m, isDone: newStatus } : m) }));
    api.post('update', 'Memo', { id, isDone: newStatus }, userId);
  };

  const deleteMemo = (id) => {
      setData(prev => ({...prev, memo: prev.memo.filter(m => m.id !== id)}));
      api.post('delete', 'Memo', { id }, userId);
  };

  const addMemo = (content) => {
      const newItem = { id: new Date().getTime(), content, isDone: false, date: normalizeDate(date) };
      addData('Memo', newItem);
  };

  const dateStr = normalizeDate(date);
  const todayData = {
    finance: data.finance.filter(i => normalizeDate(i.date) === dateStr),
    diet: data.diet.filter(i => normalizeDate(i.date) === dateStr),
    workout: data.workout.filter(i => normalizeDate(i.date) === dateStr),
    coffee: data.coffee.filter(i => normalizeDate(i.date) === dateStr),
    memo: data.memo.filter(i => normalizeDate(i.date) === dateStr)
  };

  const timelineItems = [
    ...todayData.diet.map(i => ({ ...i, type: 'diet', icon: 'Utensils', color: 'bg-accent-orange' })),
    ...todayData.workout.map(i => ({ ...i, type: 'workout', icon: 'Dumbbell', color: 'bg-accent-blue' })),
    ...todayData.finance.map(i => ({ ...i, type: 'finance', icon: 'Wallet', color: 'bg-accent-green' })),
    ...todayData.coffee.map(i => ({ ...i, type: 'coffee', icon: 'Coffee', color: 'bg-yellow-600' }))
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  if (!userId) return (
    <div className="h-[100dvh] w-screen flex items-center justify-center bg-dark-bg p-6 overflow-hidden">
      <div className="w-full max-w-sm p-8 text-center">
        <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-8 text-white border border-white/10 shadow-2xl shadow-accent-purple/20"><Icon name="Fingerprint" size={48}/></div>
        <h1 className="text-3xl font-bold mb-2 text-white">LifeOS</h1>
        <p className="text-gray-500 mb-8 text-sm">量化生活，掌握自我</p>
        <form onSubmit={e=>{e.preventDefault(); handleLogin(e.target.elements.uid.value)}}>
          <input name="uid" placeholder="輸入用戶 ID" className="dark-input text-center font-bold mb-4" required />
          <button disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : '進入系統'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-dark-bg overflow-hidden">
      <div className="flex justify-between items-center px-6 pt-safe-top pb-2 mt-4">
        <div><div className="text-xs font-bold text-accent-green uppercase tracking-wider mb-1">ONLINE</div><h1 className="text-2xl font-bold text-white">早安，{settings.name}</h1></div>
        <button onClick={()=>toggle('settings',true)} className="p-2 bg-dark-card rounded-full border border-white/10 text-gray-400"><Icon name="Settings"/></button>
      </div>

      <DateScroller date={date} setDate={setDate} />
      
      <main className="px-6 pt-4 space-y-6 flex-1 overflow-y-auto pb-32">
        {activeTab === 'home' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-card border border-white/10 p-4 rounded-2xl">
                <div className="text-xs text-gray-500 font-bold mb-1">熱量攝取</div>
                <div className="text-2xl font-bold text-white">{todayData.diet.reduce((a,c)=>a+(Number(c.calories)||0),0)} <span className="text-xs text-gray-500">/ {settings.dailyCalories}</span></div>
                <div className="h-1 bg-white/5 mt-2 rounded-full overflow-hidden"><div className="h-full bg-accent-orange w-1/2"></div></div>
              </div>
              <div className="bg-dark-card border border-white/10 p-4 rounded-2xl">
                <div className="text-xs text-gray-500 font-bold mb-1">今日花費</div>
                <div className="text-2xl font-bold text-white">${todayData.finance.reduce((a,c)=>a+(Number(c.amount)||0),0)}</div>
                <div className="h-1 bg-white/5 mt-2 rounded-full overflow-hidden"><div className="h-full bg-accent-green w-1/3"></div></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">今日行程</h3>
              </div>
              <div className="pb-8">
                {timelineItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 border-2 border-dashed border-white/5 rounded-3xl">
                    <Icon name="LayoutDashboard" size={40} className="mx-auto mb-2 opacity-20"/>
                    <p>今天還沒有紀錄</p>
                  </div>
                ) : (
                  timelineItems.map((item, i) => (
                    <TimelineCard 
                      key={i}
                      icon={item.icon}
                      color={item.color}
                      title={item.name || item.title || item.note || item.bean}
                      time={item.time || ''}
                      subtitle={item.type}
                      value={item.amount ? `-$${item.amount}` : item.calories ? `${item.calories} kcal` : item.method}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'coffee' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">咖啡日誌</h2><button onClick={()=>toggle('coffee',true)} className="text-yellow-500 font-bold">+ 新增</button></div>
                {todayData.coffee.length===0 ? <div className="text-center text-gray-600 py-10">無紀錄</div> : todayData.coffee.map((i,k)=>(
                    <div key={k} className="bg-dark-card border border-white/10 p-4 rounded-2xl shadow-sm">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-white">{i.bean}</span>
                            <span className="text-xs bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded">{i.method}</span>
                        </div>
                        {i.method === 'hand' && (
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
                                <div><Icon name="Droplet" size={12}/> {i.ratio}</div>
                                <div><Icon name="Thermometer" size={12}/> {i.temp}</div>
                                <div><Icon name="Clock" size={12}/> {i.time}</div>
                                <div><Icon name="Coffee" size={12}/> {i.water}</div>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 italic">"{i.taste}"</p>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'memo' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">待辦事項</h2></div>
                <div className="flex gap-2">
                    <input id="new-memo" placeholder="新增待辦..." className="dark-input flex-1" onKeyDown={e=>{if(e.key==='Enter'){addMemo(e.target.value); e.target.value='';}}}/>
                    <button onClick={()=>{const el=document.getElementById('new-memo'); if(el.value) {addMemo(el.value); el.value='';}}} className="bg-accent-purple p-3 rounded-xl text-white"><Icon name="Plus"/></button>
                </div>
                <div className="space-y-2">
                    {todayData.memo.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 bg-dark-card border border-white/10 p-4 rounded-2xl">
                            <button onClick={()=>toggleMemo(m.id, m.isDone === 'true' || m.isDone === true)}>
                                {String(m.isDone) === 'true' ? <Icon name="CheckSquare" className="text-accent-green"/> : <Icon name="Square" className="text-gray-500"/>}
                            </button>
                            <span className={`flex-1 ${String(m.isDone) === 'true' ? 'text-gray-600 line-through' : 'text-white'}`}>{m.content}</span>
                            <button onClick={()=>deleteMemo(m.id)} className="text-accent-red opacity-50 hover:opacity-100"><Icon name="Trash2" size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">財務紀錄</h2><button onClick={()=>toggle('expense',true)} className="text-accent-green font-bold">+ 新增</button></div>
            {todayData.finance.length===0 ? <div className="text-center text-gray-600 py-10">無紀錄</div> : todayData.finance.map((i,k)=><TimelineCard key={k} icon="Wallet" color="bg-accent-green" title={i.note} time={i.time} subtitle="支出" value={`$${i.amount}`} />)}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass pb-safe-bottom pt-2 px-2 flex justify-around items-end z-40 w-full">
        <button onClick={()=>setActiveTab('home')} className={`flex flex-col items-center p-2 w-1/5 ${activeTab==='home'?'text-white':'text-gray-500'}`}><Icon name="LayoutDashboard" size={24} strokeWidth={activeTab==='home'?2.5:2}/><span className="text-[10px] mt-1">首頁</span></button>
        <button onClick={()=>setActiveTab('coffee')} className={`flex flex-col items-center p-2 w-1/5 ${activeTab==='coffee'?'text-white':'text-gray-500'}`}><Icon name="Coffee" size={24} strokeWidth={activeTab==='coffee'?2.5:2}/><span className="text-[10px] mt-1">咖啡</span></button>
        
        <div className="relative -top-5 w-1/5 flex justify-center">
            <button onClick={()=>toggle('menu',true)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg shadow-white/20 active:scale-90 transition-transform">
                <Icon name="Plus" size={28} />
            </button>
        </div>

        <button onClick={()=>setActiveTab('memo')} className={`flex flex-col items-center p-2 w-1/5 ${activeTab==='memo'?'text-white':'text-gray-500'}`}><Icon name="ListTodo" size={24} strokeWidth={activeTab==='memo'?2.5:2}/><span className="text-[10px] mt-1">待辦</span></button>
        <button onClick={()=>setActiveTab('finance')} className={`flex flex-col items-center p-2 w-1/5 ${activeTab==='finance'?'text-white':'text-gray-500'}`}><Icon name="Wallet" size={24} strokeWidth={activeTab==='finance'?2.5:2}/><span className="text-[10px] mt-1">財務</span></button>
      </div>

      {/* Action Menu Modal */}
      <AnimatePresence>
        {modals.menu && (
            <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>toggle('menu',false)} className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"/>
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="fixed bottom-24 left-4 right-4 z-50">
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={()=>{toggle('menu',false); toggle('diet',true);}} className="flex flex-col items-center gap-2 p-4 bg-dark-card rounded-2xl border border-white/10 active:scale-95 transition"><div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center text-white"><Icon name="Utensils"/></div><span className="text-xs font-bold text-white">記飲食</span></button>
                        <button onClick={()=>{toggle('menu',false); toggle('workout',true);}} className="flex flex-col items-center gap-2 p-4 bg-dark-card rounded-2xl border border-white/10 active:scale-95 transition"><div className="w-12 h-12 rounded-full bg-accent-blue flex items-center justify-center text-white"><Icon name="Dumbbell"/></div><span className="text-xs font-bold text-white">記運動</span></button>
                        <button onClick={()=>{toggle('menu',false); toggle('expense',true);}} className="flex flex-col items-center gap-2 p-4 bg-dark-card rounded-2xl border border-white/10 active:scale-95 transition"><div className="w-12 h-12 rounded-full bg-accent-green flex items-center justify-center text-white"><Icon name="Wallet"/></div><span className="text-xs font-bold text-white">記一筆</span></button>
                        <button onClick={()=>{toggle('menu',false); toggle('coffee',true);}} className="flex flex-col items-center gap-2 p-4 bg-dark-card rounded-2xl border border-white/10 active:scale-95 transition"><div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-white"><Icon name="Coffee"/></div><span className="text-xs font-bold text-white">記咖啡</span></button>
                        <button onClick={()=>{toggle('menu',false); toggle('inbody',true);}} className="flex flex-col items-center gap-2 p-4 bg-dark-card rounded-2xl border border-white/10 active:scale-95 transition"><div className="w-12 h-12 rounded-full bg-accent-purple flex items-center justify-center text-white"><Icon name="Activity"/></div><span className="text-xs font-bold text-white">InBody</span></button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <ExpenseModal isOpen={modals.expense} onClose={()=>toggle('expense',false)} onSave={i=>addData('Finance',i)} date={date} />
      <DietModal isOpen={modals.diet} onClose={()=>toggle('diet',false)} onSave={i=>addData('Diet',i)} date={date} />
      <WorkoutModal isOpen={modals.workout} onClose={()=>toggle('workout',false)} onSave={i=>addData('Workout',i)} date={date} />
      <InBodyModal isOpen={modals.inbody} onClose={()=>toggle('inbody',false)} onSaveProfile={s=>{setSettings(p=>({...p,...s})); api.post('saveSettings',null,s,userId);}} />
      <CoffeeModal isOpen={modals.coffee} onClose={()=>toggle('coffee',false)} onSave={i=>addData('Coffee',i)} date={date} />
      
      <BottomSheet isOpen={modals.settings} onClose={()=>toggle('settings',false)} title="設定">
        <div className="space-y-4">
          <div><label className="text-xs text-gray-500 font-bold ml-1">暱稱</label><input value={settings.name} onChange={e=>setSettings({...settings,name:e.target.value})} className="dark-input"/></div>
          <div><label className="text-xs text-gray-500 font-bold ml-1">每日熱量 (kcal)</label><input type="number" value={settings.dailyCalories} onChange={e=>setSettings({...settings,dailyCalories:e.target.value})} className="dark-input"/></div>
          <button onClick={()=>{api.post('saveSettings',null,settings,userId); toggle('settings',false);}} className="w-full py-4 bg-white text-black rounded-2xl font-bold">儲存設定</button>
        </div>
      </BottomSheet>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
