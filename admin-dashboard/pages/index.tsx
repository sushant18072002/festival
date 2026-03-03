import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Calendar, Image as ImageIcon, Upload, Activity,
  ArrowUpRight, Plus, Rocket, CheckCircle, AlertCircle,
  Clock, Server, Smartphone, MessageCircle, Quote, Sparkles,
  ShieldCheck, BarChart2, GitMerge, TriangleAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, imagesRes, imagesOptimizedRes, backupsRes, stateRes, configRes, greetRes, quoteRes, mantraRes] = await Promise.all([
        fetch('/api/events?limit=5'),
        fetch('/api/images?limit=4'),
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

      // Fetch coverage & health (best-effort, non-blocking)
      try {
        const coverageRes = await fetch('/api/analytics/coverage');
        const healthRes = await fetch('/api/analytics/health');
        const coverageData = await coverageRes.json();
        const healthData = await healthRes.json();
        if (coverageData.success) setContentCoverage(coverageData.coverage);
        if (healthData.success) setDataHealth(healthData.health);
      } catch (e) {
        // analytics endpoints optional — ignore failure
      }

      if (backupsData.success) {
        setBackups(backupsData.backups);
      }

      if (stateData.success) {
        setSystemState(stateData.state);
      }

      if (configData.success) {
        setMobileConfig(configData.config);
      }
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const executeRestore = async (backupId: string, mode: 'wipe' | 'merge') => {
    setModalOpen(false);
    const toastId = toast.loading('Restoring backup...');
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, mode })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Restore successful!', { id: toastId });
        fetchDashboardData();
      } else {
        toast.error(`Restore failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleRestore = (backupId: string, mode: 'wipe' | 'merge') => {
    const isWipe = mode === 'wipe';
    setModalConfig({
      title: isWipe ? 'Wipe & Restore?' : 'Merge Backup?',
      message: isWipe
        ? 'WARNING: This will DELETE all current data and replace it with the backup.'
        : 'This will merge the backup data into your current database.',
      onConfirm: () => executeRestore(backupId, mode),
      isDestructive: isWipe
    });
    setModalOpen(true);
  };



  const toggleMaintenance = async () => {
    const newState = !systemState?.is_maintenance_mode;
    const toastId = toast.loading(newState ? 'Entering maintenance mode...' : 'Going live...');
    try {
      const res = await fetch('/api/system/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_maintenance_mode: newState })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newState ? 'Maintenance mode active' : 'System is live!', { id: toastId });
        setSystemState(data.state);
      } else {
        toast.error(`Failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const executeScript = async (scriptName: string, label: string) => {
    setModalOpen(false);
    const toastId = toast.loading(`Running ${label}...`);
    try {
      const res = await fetch('/api/run-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${label} completed!`, { id: toastId });
      } else {
        toast.error(`Failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const executeDeploy = async () => {
    setModalOpen(false);
    setIsDeploying(true);
    setDeployLocked(false);
    const toastId = toast.loading('Initiating deployment...');

    try {
      const res = await fetch('/api/deploy', { method: 'POST' });
      const data = await res.json();
      if (res.status === 423) {
        setDeployLocked(true);
        toast.error('Deploy already running. Use "Clear Lock" if it got stuck.', { id: toastId });
      } else if (data.success) {
        toast.success('Deployment completed successfully!', { id: toastId });
        setDeployLocked(false);
        fetchDashboardData();
      } else {
        toast.error('Deployment failed: ' + data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to trigger deployment', { id: toastId });
    } finally {
      setIsDeploying(false);
    }
  };

  const clearDeployLock = async () => {
    const toastId = toast.loading('Clearing deploy lock...');
    try {
      const res = await fetch('/api/deploy', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeployLocked(false);
        toast.success('Lock cleared! You can deploy again.', { id: toastId });
      }
    } catch (e) {
      toast.error('Failed to clear lock', { id: toastId });
    }
  };

  const handleRunScript = (scriptName: string, label: string) => {
    setModalConfig({
      title: `Run ${label}?`,
      message: `Are you sure you want to run the ${label} script?`,
      onConfirm: () => executeScript(scriptName, label),
      isDestructive: scriptName === 'seed-taxonomy'
    });
    setModalOpen(true);
  };

  const handleDeploy = () => {
    setModalConfig({
      title: 'Deploy to Production?',
      message: 'This will publish all recent changes to S3 and invalidate CloudFront.',
      onConfirm: () => executeDeploy(),
      isDestructive: false
    });
    setModalOpen(true);
  };

  const handleRunPipeline = () => {
    setModalConfig({
      title: 'Run Full Pipeline?',
      message: 'This will run: Seed → Optimize → Generate Feeds → Deploy to Production in one shot. It may take a minute.',
      onConfirm: async () => {
        setModalOpen(false);
        setIsPipelining(true);
        const toastId = toast.loading('Running full pipeline...');
        const scripts = ['seed-events', 'optimize', 'generate-feed'];
        for (const script of scripts) {
          const res = await fetch('/api/run-script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script }) });
          const d = await res.json();
          if (!d.success) { toast.error(`Pipeline failed at: ${script}`, { id: toastId }); setIsPipelining(false); return; }
        }
        // Finally sync
        const deployRes = await fetch('/api/deploy', { method: 'POST' });
        const deployData = await deployRes.json();
        if (deployData.success) {
          toast.success('Full pipeline complete!', { id: toastId });
          fetchDashboardData();
        } else {
          toast.error('Pipeline failed at deploy step', { id: toastId });
        }
        setIsPipelining(false);
      },
      isDestructive: false
    });
    setModalOpen(true);
  };

  const handleSaveVersioning = async () => {
    const toastId = toast.loading('Updating app versioning...');
    try {
      const res = await fetch('/api/system/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min_app_version: systemState.min_app_version,
          update_url: systemState.update_url
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Versioning updated!', { id: toastId });
        setSystemState(data.state);
      } else {
        toast.error('Failed to update', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };



  return (
    <div className="flex h-screen bg-slate-950 font-sans text-white">
      <Sidebar />
      <ConfirmationModal
        isOpen={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        isDestructive={modalConfig.isDestructive}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your festival content and system status.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Events" value={stats.events} icon={<Calendar className="w-5 h-5 text-blue-400" />} color="bg-blue-950" />
          <StatCard title="Total Images" value={stats.images} icon={<ImageIcon className="w-5 h-5 text-purple-400" />} color="bg-purple-950" subValue={`${stats.optimizedImages} optimized`} />
          <StatCard title="Total Greetings" value={stats.greetings} icon={<MessageCircle className="w-5 h-5 text-green-400" />} color="bg-green-950" />
          <StatCard title="Total Quotes" value={stats.quotes} icon={<Quote className="w-5 h-5 text-amber-400" />} color="bg-amber-950" />
          <StatCard title="Total Mantras" value={stats.mantras} icon={<Sparkles className="w-5 h-5 text-indigo-400" />} color="bg-indigo-950" />
          <StatCard
            title="System Status"
            value={systemState?.is_maintenance_mode ? "Maintenance" : "Operational"}
            icon={<Activity className={clsx("w-5 h-5", systemState?.is_maintenance_mode ? "text-amber-400" : "text-green-400")} />}
            color={systemState?.is_maintenance_mode ? "bg-amber-950" : "bg-green-950"}
            action={
              <button
                onClick={() => toggleMaintenance()}
                className={clsx(
                  "text-[10px] px-2 py-1 rounded-md font-bold text-white",
                  systemState?.is_maintenance_mode ? "bg-green-600" : "bg-amber-600"
                )}
              >
                {systemState?.is_maintenance_mode ? "Go Live" : "Maintenance"}
              </button>
            }
          />
          <StatCard title="Last Deployed" value={systemState?.last_deployed_at ? new Date(systemState.last_deployed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} icon={<Rocket className="w-5 h-5 text-sky-400" />} color="bg-sky-950" subValue={systemState?.last_deployed_at ? new Date(systemState.last_deployed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Never deployed'} />
          <StatCard title="Last Modified" value={systemState?.last_modified_at ? new Date(systemState.last_modified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} icon={<GitMerge className="w-5 h-5 text-rose-400" />} color="bg-rose-950" subValue={systemState?.last_modified_at ? new Date(systemState.last_modified_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'No edits yet'} />
        </div>

        {/* ── V2: Content Coverage + Data Health ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Content Coverage */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-white">Content Coverage</h2>
              <span className="ml-auto text-xs text-slate-500">{stats.events} total events</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Events with Images', got: contentCoverage?.eventsWithImages ?? '—', total: stats.events, color: 'bg-blue-500' },
                { label: 'Events with Greetings', got: contentCoverage?.eventsWithGreetings ?? '—', total: stats.events, color: 'bg-green-500' },
                { label: 'Events with Ritual Guide', got: contentCoverage?.eventsWithRituals ?? '—', total: stats.events, color: 'bg-purple-500' },
                { label: 'Events with Muhurat', got: contentCoverage?.eventsWithMuhurat ?? '—', total: stats.events, color: 'bg-amber-500' },
                { label: 'Events with Ambient Audio', got: contentCoverage?.eventsWithAudio ?? '—', total: stats.events, color: 'bg-indigo-500' },
              ].map(item => {
                const pct = typeof item.got === 'number' && item.total > 0 ? Math.round((item.got / item.total) * 100) : null;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{item.label}</span>
                      <span className="font-semibold text-white">{item.got}/{item.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: pct !== null ? `${pct}%` : '0%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Health */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-white">Data Health</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Orphaned Images (no event)', count: dataHealth?.orphanedImages ?? '—', ok: dataHealth?.orphanedImages === 0, icon: TriangleAlert },
                { label: 'Events Missing Images', count: dataHealth?.eventsMissingImages ?? '—', ok: dataHealth?.eventsMissingImages === 0, icon: TriangleAlert },
                { label: 'Events Missing Translations', count: dataHealth?.eventsMissingTranslations ?? '—', ok: dataHealth?.eventsMissingTranslations === 0, icon: TriangleAlert },
                { label: 'Quotes Missing Author', count: dataHealth?.quotesMissingAuthor ?? '—', ok: dataHealth?.quotesMissingAuthor === 0, icon: AlertCircle },
                { label: 'Images Missing Caption', count: dataHealth?.imagesMissingCaption ?? '—', ok: dataHealth?.imagesMissingCaption === 0, icon: AlertCircle },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <item.icon className={`w-4 h-4 ${item.ok ? 'text-green-500' : 'text-amber-400'}`} />
                    {item.label}
                  </div>
                  <span className={`text-sm font-bold ${item.ok ? 'text-green-400' : 'text-amber-400'}`}>
                    {item.ok ? '✓' : item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Events */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Recent Events
                </h2>
                <Link href="/events" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-800">
                {loading ? (
                  <div className="p-6 text-center text-slate-400">Loading...</div>
                ) : recentEvents.map(evt => (
                  <div key={evt._id} className="p-4 hover:bg-slate-950 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {new Date(evt.date || Date.now()).getDate()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{evt.title}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(evt.date || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <Link href={`/events?edit=${evt._id}`} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Images */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Recent Uploads
                </h2>
                <Link href="/images" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentImages.map(img => (
                  <div key={img._id} className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800 hover:border-slate-500 transition-colors">
                    <div className="aspect-square relative">
                      <img src={getImageUrl(img.s3_key)} className="w-full h-full object-cover" alt={img.caption || ''} />
                    </div>
                    <div className="px-2 py-1.5 bg-slate-800">
                      <p className="text-[11px] text-slate-300 font-medium truncate">{img.caption || img.filename || 'Untitled'}</p>
                      {img.event_id && <p className="text-[10px] text-slate-500 truncate">{img.is_s3_uploaded ? '🟢 On CDN' : '⚫ Local'}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 p-6">
              <h2 className="font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/events" className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-blue-50 transition-all group">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Plus className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Add New Event</div>
                </Link>
                <Link href="/images" className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-purple-50 transition-all group">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Upload className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Upload Image</div>
                </Link>
                <Link href="/greetings" className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-green-900 transition-all group">
                  <div className="p-2 bg-green-900 text-green-400 rounded-lg"><MessageCircle className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Add Greeting</div>
                </Link>
                <Link href="/quotes" className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-amber-900 transition-all group">
                  <div className="p-2 bg-amber-900 text-amber-400 rounded-lg"><Quote className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Add Quote</div>
                </Link>
                <Link href="/mantras" className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-indigo-900 transition-all group">
                  <div className="p-2 bg-indigo-900 text-indigo-400 rounded-lg"><Sparkles className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Add Mantra</div>
                </Link>
              </div>
            </div>

            {/* System Scripts */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 p-6">
              <h2 className="font-bold text-white mb-4">System Scripts</h2>
              <div className="space-y-3">
                <button onClick={() => handleRunScript('optimize', 'Image Optimization')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-green-50 transition-all text-left">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ImageIcon className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Optimize Images</div>
                </button>
                <button onClick={() => handleRunScript('generate-feed', 'Generate Feed')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-blue-50 transition-all text-left">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                  <div className="font-medium text-white">Generate Feed</div>
                </button>
              </div>
            </div>

            {/* App Versioning */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 p-6">
              <h2 className="font-bold text-white mb-4">App Versioning</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min App Version</label>
                  <input
                    type="text"
                    className="w-full border border-slate-800 p-2 rounded-lg text-sm"
                    value={systemState?.min_app_version || ''}
                    onChange={(e) => setSystemState({ ...systemState, min_app_version: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Update URL</label>
                  <input
                    type="text"
                    className="w-full border border-slate-800 p-2 rounded-lg text-sm"
                    value={systemState?.update_url || ''}
                    onChange={(e) => setSystemState({ ...systemState, update_url: e.target.value })}
                  />
                </div>
                <button onClick={handleSaveVersioning} className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                  Save Versioning
                </button>
              </div>
            </div>

            {/* Mobile Configuration */}
            <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 p-6">
              <h2 className="font-bold text-white mb-4">Mobile Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Support Email</label>
                  <input
                    type="text"
                    className="w-full border border-slate-800 p-2 rounded-lg text-sm"
                    placeholder="support@example.com"
                    value={mobileConfig?.support_email || ''}
                    onChange={(e) => setMobileConfig({ ...mobileConfig, support_email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    className="w-full border border-slate-800 p-2 rounded-lg text-sm"
                    placeholder="https://instagram.com/..."
                    value={mobileConfig?.social_links?.instagram || ''}
                    onChange={(e) => setMobileConfig({ ...mobileConfig, social_links: { ...mobileConfig.social_links, instagram: e.target.value } })}
                  />
                </div>
                <button
                  onClick={async () => {
                    const toastId = toast.loading('Updating mobile config...');
                    try {
                      const res = await fetch('/api/system/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(mobileConfig)
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Config updated!', { id: toastId });
                        setMobileConfig(data.config);
                      } else {
                        toast.error('Failed to update', { id: toastId });
                      }
                    } catch (error) {
                      toast.error('Network error', { id: toastId });
                    }
                  }}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Save Config
                </button>
              </div>
            </div>

            {/* Deployment Card */}
            <div className="rounded-2xl p-6 text-white transition-colors bg-blue-900 border border-blue-800 shadow-md shadow-black/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-800 rounded-lg">
                  <Server className="w-5 h-5 text-blue-300" />
                </div>
                <h2 className="font-bold text-lg">Production Deploy</h2>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-blue-200 mb-4">
                  Publish changes to AWS S3 and serve via CDN.
                </p>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className={clsx(
                    "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                    isDeploying ? "bg-slate-700 text-slate-400" : "bg-blue-600 hover:bg-blue-500"
                  )}
                >
                  {isDeploying ? "Deploying..." : "Deploy to Production"}
                </button>
                {deployLocked && (
                  <button
                    onClick={clearDeployLock}
                    className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    <TriangleAlert className="w-4 h-4" />
                    Clear Stale Lock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}

function StatCard({ title, value, icon, color, subValue, action }: any) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-md shadow-black/20 border border-slate-800">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx("p-3 rounded-xl", color)}>{icon}</div>
        {action}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}
