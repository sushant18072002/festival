import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, message, Spin } from 'antd';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/router';
import { Brain, Plus, Edit2, Trash2, Settings, Target, Zap, Clock } from 'lucide-react';

export default function QuizzesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [form] = Form.useForm();
    const router = useRouter();

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/quizzes');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            message.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const showModal = (record: any = null) => {
        if (record) {
            setCurrentId(record._id);
            form.setFieldsValue({
                ...record,
                translationsRaw: record.translations ? JSON.stringify(record.translations, null, 2) : ''
            });
        } else {
            setCurrentId(null);
            form.resetFields();
            form.setFieldsValue({
                karmaReward: 25,
                isActive: true,
                translationsRaw: '{\n  "hi": {\n    "title": "",\n    "description": ""\n  }\n}'
            });
        }
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            let parsedTranslations = {};
            if (values.translationsRaw) {
                try {
                    parsedTranslations = JSON.parse(values.translationsRaw);
                } catch (e) {
                    message.error('Invalid JSON in Translations field');
                    return;
                }
            }

            const payload = { ...values, translations: parsedTranslations };
            delete payload.translationsRaw;

            try {
                if (currentId) {
                    const r = await fetch(`/api/quizzes?id=${currentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if ((await r.json()).success) message.success('Quiz updated');
                } else {
                    payload.questions = [];
                    payload.results = [];
                    const r = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if ((await r.json()).success) message.success('Quiz created');
                }
                setIsModalVisible(false);
                fetchQuizzes();
            } catch {
                message.error('Failed to save quiz');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const r = await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
            if ((await r.json()).success) message.success('Quiz deleted');
            fetchQuizzes();
        } catch {
            message.error('Failed to delete quiz');
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Personality Quizzes</h1>
                                <p className="text-sm text-slate-400 mt-0.5">Manage interactive festival quizzes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => showModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" /> Create Quiz
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No quizzes found.</p>
                            <p className="text-sm mt-1">Click "Create Quiz" or run the seed script to populate.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.map((quiz) => (
                                <div key={quiz._id} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{quiz.title}</h3>
                                                {quiz.isActive ? (
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                )}
                                            </div>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                                                {quiz.slug}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => showModal(quiz)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Info">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(quiz._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
                                        {quiz.description || "No description provided."}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 text-center">
                                            <span className="block text-xl font-bold text-white mb-0.5">{quiz.questions?.length || 0}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Questions</span>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 text-center">
                                            <span className="block text-xl font-bold text-white mb-0.5">{quiz.results?.length || 0}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Results</span>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 text-center">
                                            <span className="block text-xl font-bold text-yellow-400 mb-0.5">+{quiz.karmaReward}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Karma</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/quizzes/${quiz._id}`)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-700 group-hover:border-indigo-500/30"
                                    >
                                        <Settings className="w-4 h-4 text-indigo-400" /> Manage Q&A and Results
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Modal title={currentId ? 'Edit Quiz Info' : 'Create Quiz'} open={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)}>
                    <Form form={form} layout="vertical">
                        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="slug" label="Slug (unique identifier)" rules={[{ required: true }]}>
                            <Input placeholder="diwali-personality" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item name="karmaReward" label="Karma Reward for Completion" rules={[{ required: true }]}>
                            <InputNumber min={0} />
                        </Form.Item>
                        <Form.Item name="translationsRaw" label="Translations (JSON format)" extra="Use valid JSON for 'hi', 'gu', etc.">
                            <Input.TextArea rows={4} className="font-mono text-xs bg-slate-900 border-slate-700 text-slate-300" />
                        </Form.Item>
                    </Form>
                </Modal>
            </main>
        </div>
    );
}
