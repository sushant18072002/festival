import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Calendar, Image as ImageIcon, Upload, Activity,
  ArrowUpRight, Plus, Rocket, CheckCircle, AlertCircle,
  Clock, Server, Smartphone, MessageCircle, Quote, Sparkles,
  ShieldCheck, BarChart2, GitMerge, TriangleAlert, Music, Layers, BookOpen,
  RefreshCw, ChevronRight, Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import ConfirmationModal from '../components/ConfirmationModal';
import { getImageUrl } from '../lib/getImageUrl';

export default function Home() {
  const [stats, setStats] = useState({ events: 0, images: 0, greetings: 0, quotes: 0, mantras: 0, optimizedImages: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLocked, setDeployLocked] = useState(false);
  const [isPipelining, setIsPipelining] = useState(false);
  const [contentCoverage, setContentCoverage] = useState<any>(null);
  const [dataHealth, setDataHealth] = useState<any>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false
  });

  const [backups, setBackups] = useState<any[]>([]);
  const [systemState, setSystemState] = useState<any>(null);
  const [mobileConfig, setMobileConfig] = useState<any>(null);
  const [env, setEnv] = useState('LOCAL');

  useEffect(() => {
    fetchDashboardData();
    setEnv(window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION');
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsRes, imagesRes, imagesOptimizedRes, backupsRes, stateRes, configRes, greetRes, quoteRes, mantraRes] = await Promise.all([
        fetch('/api/events?limit=5'),
        fetch('/api/images?limit=8'),
        fetch('/api/images?is_optimized=true&limit=1'),
        fetch('/api/backups'),
        fetch('/api/system/state'),
        fetch('/api/system/config'),
        fetch('/api/greetings?limit=1'),
        fetch('/api/quotes?limit=1'),
        fetch('/api/mantras?limit=1')
      ]);

      const eventsData = await eventsRes.json();
      const imagesData = await imagesRes.json();
      const imagesOptimizedData = await imagesOptimizedRes.json();
      const backupsData = await backupsRes.json();
      const stateData = await stateRes.json();
      const configData = await configRes.json();

      const greetData = await greetRes.json();
      const quoteData = await quoteRes.json();
      const mantraData = await mantraRes.json();

      if (eventsData.success) {
        setStats(prev => ({ ...prev, events: eventsData.pagination?.total ?? eventsData.data?.length ?? 0 }));
        setRecentEvents(eventsData.data);
      }

      if (imagesData.success) {
        const total = imagesData.pagination?.total ?? imagesData.data?.length ?? 0;
        const optimized = imagesOptimizedData?.pagination?.total ?? 0;
        setStats(prev => ({ ...prev, images: total, optimizedImages: optimized }));
        setRecentImages(imagesData.data);
      }

      if (greetData.success) setStats(prev => ({ ...prev, greetings: greetData.pagination?.total ?? greetData.data?.length ?? 0 }));
      if (quoteData.success) setStats(prev => ({ ...prev, quotes: quoteData.pagination?.total ?? quoteData.data?.length ?? 0 }));
      if (mantraData.success) setStats(prev => ({ ...prev, mantras: mantraData.pagination?.total ?? mantraData.data?.length ?? 0 }));

      // Fetch coverage & health 
      try {
        const coverageRes = await fetch('/api/analytics/coverage');
        const healthRes = await fetch('/api/analytics/health');
        const coverageData = await coverageRes.json();
        const healthData = await healthRes.json();
        if (coverageData.success) setContentCoverage(coverageData.coverage);
        if (healthData.success) setDataHealth(healthData.health);
      } catch (e) {}

      if (backupsData.success) setBackups(backupsData.backups);
      if (stateData.success) setSystemState(stateData.state);
      if (configData.success) setMobileConfig(configData.config);

    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
    setLoading(false);
  };

  const toggleMaintenance = async () => {
    const newState = !systemState?.is_maintenance_mode;
    const toastId = toast.loading(`${newState ? 'Enabling' : 'Disabling'} maintenance mode...`);
    try {
      const res = await fetch('/api/system/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_maintenance_mode: newState })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Maintenance mode ${newState ? 'ON' : 'OFF'}`, { id: toastId });
        setSystemState(data.state);
      }
    } catch (err) { toast.error('Error toggling state', { id: toastId }); }
  };

  const handleRunPipeline = async (action: string) => {
    const toastId = toast.loading(`Triggering ${action}...`);
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) toast.success(data.message, { id: toastId });
      else toast.error(data.error || 'Pipeline failed', { id: toastId });
    } catch (e) { toast.error('Pipeline error', { id: toastId }); }
  };

  const triggerDeploy = () => {
    setModalConfig({
        title: "Initialize Production Push",
        message: "This will push all current assets, feed data, and configurations to the production environment. Are you sure you wish to proceed with the synchronization?",
        onConfirm: () => handleRunPipeline('deploy'),
        isDestructive: true
    });
    setModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
      <Sidebar />
      <ConfirmationModal
        isOpen={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={() => {
            modalConfig.onConfirm();
            setModalOpen(false);
        }}
        isDestructive={modalConfig.isDestructive}
      />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner group">
              <Activity className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-400">
                    Mission Control
                </h1>
                <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                    Utsav Pro Admin · System Status: <span className="text-emerald-500">Live</span>
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end pr-5 border-r border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-0.5">Runtime Env</span>
                <span className={clsx(
                    "text-xs font-black px-2 py-0.5 rounded-md border",
                    env === 'DEVELOPMENT' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-rose-500 border-rose-500/20 bg-rose-500/5"
                )}>{env}</span>
             </div>
             <button onClick={() => fetchDashboardData()} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <RefreshCw size={18} className={clsx(loading && "animate-spin text-blue-400")} />
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Events" value={stats.events} icon={<Calendar size={20} />} color="blue" />
          <StatCard title="Media" value={stats.images} icon={<ImageIcon size={20} />} color="purple" />
          <StatCard title="Optimized" value={stats.optimizedImages} icon={<CheckCircle size={20} />} color="emerald" />
          <StatCard 
            title="S-Mode" 
            value={systemState?.is_maintenance_mode ? "BLOCK" : "READY"} 
            icon={<ShieldCheck size={20} />} 
            color={systemState?.is_maintenance_mode ? "amber" : "slate"}
            action={<button onClick={toggleMaintenance} className="text-[10px] font-black uppercase text-white/30 hover:text-amber-500 transition-colors">Toggle</button>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT: MAIN OPERATIONS (2/3) ────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mission Control: Pipeline center */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group border-t-rose-500/30">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-rose-500/10 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                    <Rocket className="text-rose-500" size={28} />
                    Pipeline Operations
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">Encapsulated Deployment & Integrity Engine</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-[9px] font-black text-slate-400 shadow-inner">
                  <ActivityIcon size={12} className="animate-pulse text-rose-500" /> V3.2 SECTOR READY
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <PipelineButton 
                  label="Deep Health" 
                  desc="Sync S3 & MongoDB" 
                  icon={<ShieldCheck size={32} />} 
                  color="emerald" 
                  onClick={() => handleRunPipeline('health_deep')} 
                />
                <PipelineButton 
                  label="Archive" 
                  desc="Snap Daily Snapshot" 
                  icon={<Server size={32} />} 
                  color="blue" 
                  onClick={() => handleRunPipeline('backup')} 
                />
                <PipelineButton 
                  label="Push Live" 
                  desc="Synchronize Global Feed" 
                  icon={<Rocket size={32} />} 
                  color="rose" 
                  primary 
                  onClick={triggerDeploy} 
                />
              </div>
            </div>

            {/* Middle Section: Coverage + Recent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Health Coverage mini view */}
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <BarChart2 size={16} className="text-blue-500" /> Integrity Coverage
                       </h4>
                       <span className="text-[9px] font-black text-slate-700 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">SYNCED</span>
                    </div>
                    <div className="space-y-6">
                        <HealthBar label="Events & Media" got={contentCoverage?.eventsWithImages} total={stats.events} color="bg-blue-600" />
                        <HealthBar label="Audio Channels" got={contentCoverage?.eventsWithAudio} total={stats.events} color="bg-indigo-600" />
                        <HealthBar label="Sacred Rituals" got={contentCoverage?.eventsWithRituals} total={stats.events} color="bg-purple-600" />
                    </div>
                </div>

                {/* Recent Events shortcut */}
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={16} className="text-amber-500" /> Delta Content
                       </h4>
                       <Link href="/events" className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest">Archive</Link>
                    </div>
                    <div className="flex-1 space-y-2">
                        {recentEvents.slice(0, 4).map(evt => (
                            <Link key={evt._id} href={`/events?edit=${evt._id}`} className="group flex items-center justify-between p-3 rounded-[1rem] hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all">
                                <span className="text-sm text-slate-300 font-bold truncate group-hover:text-white transition-colors uppercase tracking-tight">{evt.title}</span>
                                <ArrowUpRight size={14} className="text-slate-700 group-hover:text-blue-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Gallery Grid */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <ImageIcon size={18} className="text-purple-500" /> Visual Frequency Stream
                    </h3>
                    <Link href="/images" className="text-[10px] font-black text-purple-500 hover:text-purple-400 uppercase tracking-widest">Access Vault</Link>
                </div>
                <div className="p-8 grid grid-cols-4 md:grid-cols-8 gap-4">
                    {recentImages.map(img => (
                        <div key={img._id} className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group/img relative">
                            <img src={getImageUrl(img.s3_key)} className="w-full h-full object-cover opacity-40 group-hover/img:opacity-100 transition-all duration-700 group-hover/img:scale-125 group-hover/img:rotate-3" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* ── RIGHT: TOOLS & CONFIG (1/3) ────────────────── */}
          <div className="space-y-8">
            {/* Quick Navigation Hub */}
            <div className="grid grid-cols-1 gap-4">
              <QuickActionLink href="/audio" title="Acoustic Library" sub="Ambient Layers" icon={<Music size={24} />} color="purple" />
              <QuickActionLink href="/lotties" title="Lottie Overlays" sub="Kinetic Media" icon={<Layers size={24} />} color="indigo" />
              <QuickActionLink href="/mantras" title="Vocal Registry" sub="Sacred Scripts" icon={<BookOpen size={24} />} color="amber" />
            </div>

            {/* Quick Add Bar */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-inner">
               <h4 className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] mb-6 text-center">Protocol Shortcuts</h4>
               <div className="grid grid-cols-2 gap-4">
                  <Link href="/events" className="flex flex-col items-center justify-center p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/30 group/btn transition-all gap-2 shadow-xl hover:-translate-y-1">
                    <Plus size={20} className="text-slate-700 group-hover/btn:text-blue-500 transition-colors" />
                    <span className="text-[9px] font-black text-slate-600 group-hover/btn:text-white uppercase tracking-widest">Event</span>
                  </Link>
                  <Link href="/images" className="flex flex-col items-center justify-center p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-500/30 group/btn transition-all gap-2 shadow-xl hover:-translate-y-1">
                    <Upload size={20} className="text-slate-700 group-hover/btn:text-purple-500 transition-colors" />
                    <span className="text-[9px] font-black text-slate-600 group-hover/btn:text-white uppercase tracking-widest">Media</span>
                  </Link>
               </div>
            </div>

            {/* Version & Environment Control */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/50 to-indigo-600/50" />
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Variables</h4>
                  <Server size={14} className="text-slate-800" />
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Legacy App Threshold</label>
                    <input 
                      type="text" 
                      value={systemState?.min_app_version || ''} 
                      onChange={(e) => setSystemState({ ...systemState, min_app_version: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-blue-400 font-mono focus:border-blue-500/50 transition-all outline-none shadow-inner" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Social Feed Connector</label>
                    <input 
                      type="text" 
                      placeholder="https://instagram.com/utsavpro"
                      value={mobileConfig?.social_links?.instagram || ''} 
                      onChange={(e) => setMobileConfig({ ...mobileConfig, social_links: { ...mobileConfig.social_links, instagram: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-blue-500/50 transition-all outline-none shadow-inner" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                        const tid = toast.loading('Syncing Core Parameters...');
                        try {
                            const res = await fetch('/api/system/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(systemState) });
                            const data = await res.json();
                            if (data.success) toast.success('Core Synchronized', { id: tid });
                        } catch(e) { toast.error('Sync Error: Terminal Failure', { id: tid }); }
                    }}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-[10px] font-black text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-[0.2em]"
                  >
                    Commit Parameters
                  </button>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, color, action }: any) {
  const colorMap: any = {
    blue: "from-blue-600 to-blue-700 bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "from-purple-600 to-purple-700 bg-purple-500/10 text-purple-400 border-purple-500/20",
    emerald: "from-emerald-600 to-emerald-700 bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-600 to-amber-700 bg-amber-500/10 text-amber-500 border-amber-500/20",
    slate: "from-slate-600 to-slate-700 bg-slate-800 text-slate-400 border-slate-700/50"
  };

  return (
    <div className="relative group bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all overflow-hidden shadow-2xl flex flex-col justify-between">
      <div className={clsx("absolute -top-12 -right-12 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-30 transition-all rounded-full bg-gradient-to-br", colorMap[color])} />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={clsx("p-3 rounded-2xl border", colorMap[color])}>{icon}</div>
        {action}
      </div>
      <div className="relative z-10">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
         <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
      </div>
    </div>
  );
}

function PipelineButton({ label, desc, icon, color, primary, onClick }: any) {
    const colorClasses: any = {
        emerald: "text-emerald-500 group-hover:text-emerald-400",
        blue: "text-blue-500 group-hover:text-blue-400",
        rose: "text-rose-500 group-hover:text-rose-400"
    };

    return (
        <button 
          onClick={onClick}
          className={clsx(
            "flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all active:scale-95 group/p shadow-xl",
            primary 
                ? "bg-rose-600 border-rose-500 text-white hover:bg-rose-500" 
                : "bg-slate-950 border-slate-800 text-white hover:bg-slate-900 hover:border-slate-700"
          )}
        >
            <div className={clsx("mb-4 transition-transform group-hover/p:scale-110", primary ? "text-white" : colorClasses[color])}>
                {icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
            <span className={clsx("text-[9px] font-bold mt-2 uppercase tracking-tight", primary ? "text-white/60" : "text-slate-700")}>{desc}</span>
        </button>
    );
}

function HealthBar({ label, got, total, color }: any) {
    const pct = (got && total) ? Math.round((got/total) * 100) : 0;
    return (
        <div className="group">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 ml-1 group-hover:text-slate-400 transition-colors">
                <span>{label}</span>
                <span className="text-white/70">{got || 0}/{total || 0}</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full p-0.5 border border-slate-800 shadow-inner overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={clsx("h-full rounded-full shadow-lg", color)} 
                />
            </div>
        </div>
    );
}

function QuickActionLink({ href, title, sub, icon, color }: any) {
    const colorMap: any = {
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    };

    return (
        <Link href={href} className="flex items-center gap-5 p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-slate-600 transition-all group shadow-xl hover:-translate-y-1">
            <div className={clsx("p-4 rounded-2xl border transition-transform group-hover:scale-110 shadow-lg", colorMap[color])}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all uppercase tracking-tight">{title}</h4>
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">{sub}</p>
            </div>
        </Link>
    );
}

