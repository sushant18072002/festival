import React, { useState, useEffect } from 'react';
import { Flex, Text, Button, Table, Badge, Modal, Form, Input, InputNumber, Space, Tag, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileSearchOutlined } from '@ant-design/icons';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';

const { Column } = Table;

export default function QuizzesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [form] = Form.useForm();
    const router = useRouter();

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/quizzes');
            setData(res.data.data);
        } catch (error) {
            message.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const showModal = (record = null) => {
        if (record) {
            setCurrentId(record._id);
            form.setFieldsValue(record);
        } else {
            setCurrentId(null);
            form.resetFields();
            form.setFieldsValue({ karmaReward: 25, isActive: true });
        }
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (currentId) {
                    await axios.put(`/api/quizzes?id=${currentId}`, values);
                    message.success('Quiz updated');
                } else {
                    // Initialize empty Qs/Rs arrays
                    values.questions = [];
                    values.results = [];
                    await axios.post('/api/quizzes', values);
                    message.success('Quiz created');
                }
                setIsModalVisible(false);
                fetchQuizzes();
            } catch (error) {
                message.error('Failed to save quiz');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await axios.delete(`/api/quizzes?id=${id}`);
            message.success('Quiz deleted');
            fetchQuizzes();
        } catch (error) {
            message.error('Failed to delete quiz');
        }
    };

    return (
        <Layout>
            <Flex justify="space-between" align="center" style={{ marginBottom: 24, marginTop: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>Personality Quizzes</Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Create Quiz
                </Button>
            </Flex>

            {loading ? <Spin /> : (
                <Table dataSource={data} rowKey="_id" pagination={{ pageSize: 15 }}>
                    <Column title="Title" dataIndex="title" key="title" />
                    <Column title="Slug" dataIndex="slug" key="slug" render={(val) => <Tag>{val}</Tag>} />
                    <Column title="Questions" dataIndex="questions" key="questions" render={(q) => q?.length || 0} />
                    <Column title="Results Configured" dataIndex="results" key="results" render={(r) => r?.length || 0} />
                    <Column title="Reward" dataIndex="karmaReward" key="karmaReward" render={(val) => <Tag color="gold">+{val} Karma</Tag>} />
                    <Column title="Status" dataIndex="isActive" key="isActive" render={(val) => (
                        <Badge status={val ? 'success' : 'default'} text={val ? 'Active' : 'Inactive'} />
                    )} />
                    <Column title="Actions" key="actions" render={(record) => (
                        <Space>
                            <Button icon={<FileSearchOutlined />} onClick={() => router.push(`/quizzes/${record._id}`)}>Manage Q&A</Button>
                            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
                        </Space>
                    )} />
                </Table>
            )}

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
                </Form>
            </Modal>
        </Layout>
    );
}
