import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Space, Tag, message, Spin, Select } from 'antd';
import Sidebar from '../../components/Sidebar';
import { Trophy, Star, Edit2, Trash2 } from 'lucide-react';

export default function GamificationPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
    const [isTrophyModalVisible, setIsTrophyModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [aForm] = Form.useForm();
    const [tForm] = Form.useForm();

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gamification');
            const json = await res.json();
            if (json.success) setConfig(json.data);
        } catch (error) {
            message.error('Failed to load gamification config');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const saveConfig = async (updatedConfig: any) => {
        try {
            const res = await fetch('/api/gamification', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedConfig),
            });
            const json = await res.json();
            if (json.success) {
                message.success('Rules updated successfully');
                setConfig(updatedConfig);
            }
        } catch (error) {
            message.error('Failed to save rules');
        }
    };

    // --- Avatar Tiers ---
    const showAvatarModal = (index: number | null = null) => {
        setEditingIndex(index);
        if (index !== null) {
            aForm.setFieldsValue({
                ...config.avatarTiers[index],
                paths: config.avatarTiers[index].paths.join('\n')
            });
        } else {
            aForm.resetFields();
        }
        setIsAvatarModalVisible(true);
    };

    const handleAvatarOk = async () => {
        const values = await aForm.validateFields();
        values.paths = values.paths.split('\n').map((p: string) => p.trim()).filter(Boolean);

        const updated = { ...config };
        if (editingIndex !== null) {
            updated.avatarTiers[editingIndex] = values;
        } else {
            updated.avatarTiers.push(values);
        }
        await saveConfig(updated);
        setIsAvatarModalVisible(false);
    };

    const deleteAvatar = async (index: number) => {
        if (!confirm('Delete this Avatar Tier?')) return;
        const updated = { ...config };
        updated.avatarTiers.splice(index, 1);
        await saveConfig(updated);
    };


    // --- Trophies ---
    const showTrophyModal = (index: number | null = null) => {
        setEditingIndex(index);
        if (index !== null) {
            tForm.setFieldsValue(config.trophies[index]);
        } else {
            tForm.resetFields();
            tForm.setFieldsValue({ unlockRuleType: 'karma', unlockThreshold: 100 });
        }
        setIsTrophyModalVisible(true);
    };

    const handleTrophyOk = async () => {
        const values = await tForm.validateFields();
        const updated = { ...config };
        if (editingIndex !== null) {
            updated.trophies[editingIndex] = values;
        } else {
            updated.trophies.push(values);
        }
        await saveConfig(updated);
        setIsTrophyModalVisible(false);
    };

    const deleteTrophy = async (index: number) => {
        if (!confirm('Delete this Trophy rule?')) return;
        const updated = { ...config };
        updated.trophies.splice(index, 1);
        await saveConfig(updated);
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Gamification Rules</h1>
                            <p className="text-sm text-slate-400 mt-0.5">Manage Karma, Avatars &amp; Trophies</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !config ? (
                        <div className="text-center py-16 text-slate-500">
                            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No gamification config found</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <span className="text-2xl">🧬</span> Avatar Evolution Tiers
                                    </h2>
                                    <button
                                        onClick={() => showAvatarModal()}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-yellow-500/20"
                                    >
                                        Add Tier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {config.avatarTiers.map((tier: any, i: number) => (
                                        <div key={tier.name} className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">{tier.name}</h3>
                                                    <p className="text-yellow-500 text-sm font-semibold mt-1">⭐ {tier.baseKarma} Karma Required</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => showAvatarModal(i)} className="p-2 bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteAvatar(i)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                                                <p className="text-sm font-medium text-slate-400 mb-2">Mapped Assets ({tier.paths.length})</p>
                                                <div className="space-y-1">
                                                    {tier.paths.slice(0, 3).map((p: string, idx: number) => (
                                                        <p key={idx} className="text-xs text-slate-500 truncate font-mono">{p}</p>
                                                    ))}
                                                    {tier.paths.length > 3 && (
                                                        <p className="text-xs text-slate-400 italic mt-2">+{tier.paths.length - 3} more paths</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <span className="text-2xl">🏆</span> Trophy Rules
                                    </h2>
                                    <button
                                        onClick={() => showTrophyModal()}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-yellow-500/20"
                                    >
                                        Add Trophy
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {config.trophies.map((trophy: any, i: number) => (
                                        <div key={trophy.name} className="group flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-colors">
                                            <div className="w-16 h-16 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-slate-700/50 group-hover:scale-110 transition-transform">
                                                {trophy.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white truncate">{trophy.name}</h3>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{trophy.description}</p>
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                                                    {trophy.unlockRuleType} &gt;= {trophy.unlockThreshold}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => showTrophyModal(i)} className="p-1.5 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 rounded-md transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteTrophy(i)} className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <Modal
                title={editingIndex !== null ? 'Edit Avatar Tier' : 'Add Avatar Tier'}
                open={isAvatarModalVisible}
                onOk={handleAvatarOk}
                onCancel={() => setIsAvatarModalVisible(false)}
            >
                <Form form={aForm} layout="vertical">
                    <div className="flex gap-4">
                        <Form.Item name="name" label="Tier Name (e.g., Novice)" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="baseKarma" label="Karma Required" rules={[{ required: true }]}>
                            <InputNumber min={0} />
                        </Form.Item>
                    </div>
                    <Form.Item name="paths" label="Asset Paths (one per line)" rules={[{ required: true }]}>
                        <Input.TextArea rows={6} placeholder={'assets/icon/avatar_tier1_1.png\nassets/icon/avatar_tier1_2.png'} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingIndex !== null ? 'Edit Trophy' : 'Add Trophy'}
                open={isTrophyModalVisible}
                onOk={handleTrophyOk}
                onCancel={() => setIsTrophyModalVisible(false)}
            >
                <Form form={tForm} layout="vertical">
                    <div className="flex gap-4">
                        <Form.Item name="name" label="Trophy Name" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input placeholder="Master Explorer" />
                        </Form.Item>
                        <Form.Item name="icon" label="Emoji Icon" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item name="description" label="Unlock Description" rules={[{ required: true }]}>
                        <Input placeholder="Explore 50 festivals" />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item name="unlockRuleType" label="Unlock Metric" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                <Select.Option value="karma">Karma Points</Select.Option>
                                <Select.Option value="explore">Festivals Explored</Select.Option>
                                <Select.Option value="share">Total Shares</Select.Option>
                                <Select.Option value="streak">Daily Streak</Select.Option>
                                <Select.Option value="signup">Sign Up</Select.Option>
                                <Select.Option value="time">Specific Time</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="unlockThreshold" label="Threshold Value" rules={[{ required: true }]}>
                            <InputNumber min={0} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
