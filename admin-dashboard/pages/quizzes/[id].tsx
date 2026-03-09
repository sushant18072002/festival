import React, { useState, useEffect } from 'react';
import { Flex, Button, Table, Modal, Form, Input, InputNumber, Space, Tag, message, Spin, Tabs, Card, Select, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/router';

const { Text } = Typography;

export default function QuizEditorPage() {
    const router = useRouter();
    const { id } = router.query;

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [qForm] = Form.useForm();
    const [rForm] = Form.useForm();

    const fetchQuiz = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quizzes?id=${id}`);
            const json = await res.json();
            if (json.success) setQuiz(json.data);
        } catch {
            message.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const saveQuiz = async (updatedQuiz: any) => {
        try {
            const r = await fetch(`/api/quizzes?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedQuiz) });
            if ((await r.json()).success) { message.success('Saved successfully'); setQuiz(updatedQuiz); }
        } catch {
            message.error('Failed to save');
        }
    };

    // --- Questions logic ---

    const showQuestionModal = (index: number | null = null) => {
        setEditingIndex(index);
        if (index !== null) {
            const q = quiz.questions[index];
            qForm.setFieldsValue({
                ...q,
                options: q.options.map((opt: any) => ({
                    ...opt,
                    scores: opt.scores ? JSON.stringify(opt.scores) : '{}'
                }))
            });
        } else {
            qForm.resetFields();
            qForm.setFieldsValue({ options: [{}, {}, {}, {}] });
        }
        setIsQuestionModalVisible(true);
    };

    const handleQuestionOk = async () => {
        const values = await qForm.validateFields();
        // The scores are a JSON string in the form, parse it back to an object
        values.options = values.options.map((opt: any) => ({
            label: opt.label,
            scores: typeof opt.scores === 'string' ? JSON.parse(opt.scores) : opt.scores
        }));

        const updatedQuiz = { ...quiz };
        if (editingIndex !== null) {
            updatedQuiz.questions[editingIndex] = values;
        } else {
            updatedQuiz.questions.push(values);
        }
        await saveQuiz(updatedQuiz);
        setIsQuestionModalVisible(false);
    };

    const deleteQuestion = async (index: number) => {
        if (!confirm('Delete this question?')) return;
        const updatedQuiz = { ...quiz };
        updatedQuiz.questions.splice(index, 1);
        await saveQuiz(updatedQuiz);
    };

    // --- Results Logic ---

    const showResultModal = (index: number | null = null) => {
        setEditingIndex(index);
        if (index !== null) {
            rForm.setFieldsValue(quiz.results[index]);
        } else {
            rForm.resetFields();
        }
        setIsResultModalVisible(true);
    };

    const handleResultOk = async () => {
        const values = await rForm.validateFields();
        const updatedQuiz = { ...quiz };
        if (editingIndex !== null) {
            updatedQuiz.results[editingIndex] = values;
        } else {
            updatedQuiz.results.push(values);
        }
        await saveQuiz(updatedQuiz);
        setIsResultModalVisible(false);
    };

    const deleteResult = async (index: number) => {
        if (!confirm('Delete this result outcome?')) return;
        const updatedQuiz = { ...quiz };
        updatedQuiz.results.splice(index, 1);
        await saveQuiz(updatedQuiz);
    };

    if (loading) return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center"><Spin size="large" /></main>
        </div>
    );
    if (!quiz) return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center"><Text>Quiz not found</Text></main>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Flex align="center" style={{ marginBottom: 24, marginTop: 10, gap: 16 }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/quizzes')} />
                    <Text style={{ fontSize: 24, fontWeight: 600 }}>Editing: {quiz.title}</Text>
                </Flex>

                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'Questions',
                        children: (
                            <>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => showQuestionModal()} style={{ marginBottom: 16 }}>Add Question</Button>
                                {quiz.questions.map((q: any, i: number) => (
                                    <Card key={i} size="small" style={{ marginBottom: 16 }} title={<Space><Text>{q.emoji}</Text><Text strong>{q.question}</Text></Space>}
                                        extra={
                                            <Space>
                                                <Button size="small" onClick={() => showQuestionModal(i)}>Edit</Button>
                                                <Button size="small" danger onClick={() => deleteQuestion(i)}>Delete</Button>
                                            </Space>
                                        }
                                    >
                                        {q.options.map((opt: any, optIdx: number) => (
                                            <div key={optIdx} style={{ marginBottom: 8 }}>
                                                <Text strong>{String.fromCharCode(65 + optIdx)}: </Text>
                                                <Text>{opt.label}</Text>
                                                <div style={{ marginLeft: 24 }}>
                                                    {Object.entries(opt.scores || {}).map(([key, val]) => (
                                                        <Tag color="cyan" key={key}>{key}: +{String(val)}</Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </Card>
                                ))}
                            </>
                        )
                    },
                    {
                        key: '2',
                        label: 'Result Outcomes',
                        children: (
                            <>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => showResultModal()} style={{ marginBottom: 16 }}>Add Result</Button>
                                <Table dataSource={quiz.results} rowKey="code" pagination={false}>
                                    <Table.Column title="Emoji" dataIndex="emoji" render={(val) => <Text style={{ fontSize: 20 }}>{val}</Text>} />
                                    <Table.Column title="Code" dataIndex="code" render={(val) => <Tag color="blue">{val}</Tag>} />
                                    <Table.Column title="Festival Name" dataIndex="name" />
                                    <Table.Column title="Archetype" dataIndex="personality" />
                                    <Table.Column title="Colors" render={(r) => (
                                        <Space>
                                            <div style={{ width: 16, height: 16, backgroundColor: r.primaryColor.replace('0xFF', '#') }} />
                                            <div style={{ width: 16, height: 16, backgroundColor: r.secondaryColor.replace('0xFF', '#') }} />
                                        </Space>
                                    )} />
                                    <Table.Column title="Actions" render={(_, r: any, i) => (
                                        <Space>
                                            <Button icon={<EditOutlined />} size="small" onClick={() => showResultModal(i)} />
                                            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => deleteResult(i)} />
                                        </Space>
                                    )} />
                                </Table>
                            </>
                        )
                    }
                ]} />

                {/* Question Editor Modal */}
                <Modal title={editingIndex !== null ? "Edit Question" : "Add Question"} open={isQuestionModalVisible} onOk={handleQuestionOk} onCancel={() => setIsQuestionModalVisible(false)} width={800}>
                    <Form form={qForm} layout="vertical">
                        <Flex gap="middle">
                            <Form.Item name="question" label="Question Text" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="emoji" label="Emoji" rules={[{ required: true }]}>
                                <Input style={{ width: 80 }} />
                            </Form.Item>
                        </Flex>

                        <Text strong>Options (Provide JSON for scores e.g. {"{"}\"holi\": 3, \"diwali\": 1{"}"})</Text>
                        {[0, 1, 2, 3].map(i => (
                            <Flex gap="middle" key={i} style={{ marginTop: 8 }}>
                                <Form.Item name={['options', i, 'label']} style={{ flex: 1, marginBottom: 0 }}>
                                    <Input placeholder={`Option ${String.fromCharCode(65 + i)} Text`} />
                                </Form.Item>
                                <Form.Item name={['options', i, 'scores']} style={{ flex: 1, marginBottom: 0 }}>
                                    <Input placeholder="Score JSON Map" />
                                </Form.Item>
                            </Flex>
                        ))}
                    </Form>
                </Modal>

                {/* Result Editor Modal */}
                <Modal title={editingIndex !== null ? "Edit Outcome" : "Add Outcome"} open={isResultModalVisible} onOk={handleResultOk} onCancel={() => setIsResultModalVisible(false)}>
                    <Form form={rForm} layout="vertical">
                        <Flex gap="middle">
                            <Form.Item name="code" label="Code (e.g. ganesh)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="name" label="Display Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="emoji" label="Emoji" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Flex>
                        <Flex gap="middle">
                            <Form.Item name="primaryColor" label="Primary Hex (0xFF...)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="secondaryColor" label="Secondary Hex (0xFF...)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Flex>
                        <Form.Item name="personality" label="Archetype Title" rules={[{ required: true }]}>
                            <Input placeholder="The Wise Leader" />
                        </Form.Item>
                        <Form.Item name="description" label="Result Description" rules={[{ required: true }]}>
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>

            </main>
        </div>
    );
}
