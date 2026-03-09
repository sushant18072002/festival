import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, message, Spin, Space, Flex } from 'antd';
import Sidebar from '../../components/Sidebar';
import { Lightbulb, Plus, Edit2, Trash2 } from 'lucide-react';

export default function TriviaPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [form] = Form.useForm();

    const fetchTrivia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/trivia');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            message.error('Failed to load trivia');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrivia();
    }, []);

    const showModal = (record: any = null) => {
        setIsEditing(!!record);
        if (record) {
            setCurrentId(record._id);
            form.setFieldsValue({
                question: record.question,
                options: record.options,
                correctAnswerIndex: record.correctAnswerIndex,
                karmaReward: record.karmaReward,
                tags: record.tags ? record.tags.join(', ') : '',
                isActive: record.isActive ? 'true' : 'false',
                translationsRaw: record.translations ? JSON.stringify(record.translations, null, 2) : ''
            });
        } else {
            setCurrentId(null);
            form.resetFields();
            form.setFieldsValue({
                karmaReward: 10,
                isActive: 'true',
                options: ['', '', '', ''],
                translationsRaw: '{\n  "hi": {\n    "question": "",\n    "options": ["", "", "", ""]\n  }\n}'
            });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            let parsedTranslations = {};
            if (values.translationsRaw) {
                try {
                    parsedTranslations = JSON.parse(values.translationsRaw);
                } catch (e) {
                    message.error('Invalid JSON format in Translations field');
                    return;
                }
            }

            const payload = {
                ...values,
                tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
                isActive: values.isActive === 'true',
                translations: parsedTranslations
            };
            delete payload.translationsRaw;

            try {
                if (isEditing) {
                    const res = await fetch(`/api/trivia?id=${currentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    if ((await res.json()).success) message.success('Trivia updated');
                } else {
                    const res = await fetch('/api/trivia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    if ((await res.json()).success) message.success('Trivia created');
                }
                setIsModalVisible(false);
                fetchTrivia();
            } catch {
                message.error('Failed to save trivia');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trivia question?')) return;
        try {
            const res = await fetch(`/api/trivia?id=${id}`, { method: 'DELETE' });
            if ((await res.json()).success) message.success('Trivia deleted');
            fetchTrivia();
        } catch {
            message.error('Failed to delete trivia');
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
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Daily Trivia</h1>
                                <p className="text-sm text-slate-400 mt-0.5">Manage trivia questions and answers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => showModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Plus className="w-4 h-4" /> Add Trivia
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No trivia questions found.</p>
                            <p className="text-sm mt-1">Click "Add Trivia" or run the seed script to populate.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {data.map((item) => (
                                <div key={item._id} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all flex flex-col">
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {item.isActive ? (
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></span>
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0"></span>
                                                )}
                                                <h3 className="font-semibold text-lg text-white group-hover:text-emerald-400 transition-colors leading-tight">{item.question}</h3>
                                            </div>

                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2 ml-4">
                                                    {item.tags.map((tag: string, i: number) => (
                                                        <span key={i} className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={() => showModal(item)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Info">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 ml-4 mt-2">
                                        {item.options.map((opt: string, i: number) => {
                                            const isCorrect = i === item.correctAnswerIndex;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`px-4 py-2.5 rounded-xl border text-sm flex items-center gap-3 transition-colors ${isCorrect
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                        : 'bg-slate-950/50 border-slate-800/50 text-slate-400 group-hover:border-slate-700/50'
                                                        }`}
                                                >
                                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                        }`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    {opt || <span className="italic opacity-50">Empty option</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center ml-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                                            +{item.karmaReward} Karma
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Modal title={isEditing ? 'Edit Trivia' : 'Add Trivia'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={600}>
                    <Form form={form} layout="vertical">
                        <Form.Item name="question" label="Question" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} />
                        </Form.Item>

                        <Flex gap="middle">
                            <Form.Item name={['options', 0]} label="Option A" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <Input />
                            </Form.Item>
                            <Form.Item name={['options', 1]} label="Option B" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <Input />
                            </Form.Item>
                        </Flex>
                        <Flex gap="middle">
                            <Form.Item name={['options', 2]} label="Option C" style={{ flex: 1 }}>
                                <Input />
                            </Form.Item>
                            <Form.Item name={['options', 3]} label="Option D" style={{ flex: 1 }}>
                                <Input />
                            </Form.Item>
                        </Flex>

                        <Flex gap="middle">
                            <Form.Item name="correctAnswerIndex" label="Correct Answer" rules={[{ required: true }]}>
                                <Select style={{ width: 150 }}>
                                    <Select.Option value={0}>Option A</Select.Option>
                                    <Select.Option value={1}>Option B</Select.Option>
                                    <Select.Option value={2}>Option C</Select.Option>
                                    <Select.Option value={3}>Option D</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="karmaReward" label="Karma Reward" rules={[{ required: true }]}>
                                <InputNumber min={0} />
                            </Form.Item>
                            <Form.Item name="isActive" label="Status" rules={[{ required: true }]}>
                                <Select style={{ width: 120 }}>
                                    <Select.Option value="true">Active</Select.Option>
                                    <Select.Option value="false">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Flex>

                        <Form.Item name="tags" label="Tags (comma separated)">
                            <Input placeholder="holi, colors, spring" />
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
