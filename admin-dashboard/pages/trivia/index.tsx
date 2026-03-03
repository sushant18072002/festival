import React, { useState, useEffect } from 'react';
import { Flex, Text, Button, Table, Badge, Modal, Form, Input, InputNumber, Select, message, Spin, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Layout from '../../components/Layout';
import axios from 'axios';

const { Column } = Table;

export default function TriviaPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [form] = Form.useForm();

    const fetchTrivia = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/trivia');
            setData(res.data.data);
        } catch (error) {
            message.error('Failed to load trivia');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrivia();
    }, []);

    const showModal = (record = null) => {
        setIsEditing(!!record);
        if (record) {
            setCurrentId(record._id);
            form.setFieldsValue({
                question: record.question,
                options: record.options,
                correctAnswerIndex: record.correctAnswerIndex,
                karmaReward: record.karmaReward,
                tags: record.tags ? record.tags.join(', ') : '',
                isActive: record.isActive ? 'true' : 'false'
            });
        } else {
            setCurrentId(null);
            form.resetFields();
            form.setFieldsValue({ karmaReward: 10, isActive: 'true', options: ['', '', '', ''] });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            const payload = {
                ...values,
                tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
                isActive: values.isActive === 'true'
            };

            try {
                if (isEditing) {
                    await axios.put(`/api/trivia?id=${currentId}`, payload);
                    message.success('Trivia updated');
                } else {
                    await axios.post('/api/trivia', payload);
                    message.success('Trivia created');
                }
                setIsModalVisible(false);
                fetchTrivia();
            } catch (error) {
                message.error('Failed to save trivia');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trivia question?')) return;
        try {
            await axios.delete(`/api/trivia?id=${id}`);
            message.success('Trivia deleted');
            fetchTrivia();
        } catch (error) {
            message.error('Failed to delete trivia');
        }
    };

    return (
        <Layout>
            <Flex justify="space-between" align="center" style={{ marginBottom: 24, marginTop: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>Daily Trivia</Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Add Trivia
                </Button>
            </Flex>

            {loading ? <Spin /> : (
                <Table dataSource={data} rowKey="_id" pagination={{ pageSize: 20 }}>
                    <Column title="Question" dataIndex="question" key="question" />
                    <Column title="Options" key="options" render={(record) => (
                        <Space direction="vertical" size="small">
                            {record.options.map((opt: string, i: number) => (
                                <Text key={i} keyboard={i === record.correctAnswerIndex} type={i === record.correctAnswerIndex ? 'success' : undefined}>
                                    {String.fromCharCode(65 + i)}: {opt}
                                </Text>
                            ))}
                        </Space>
                    )} />
                    <Column title="Reward" dataIndex="karmaReward" key="karmaReward" render={(val) => <Tag color="gold">+{val} Karma</Tag>} />
                    <Column title="Status" dataIndex="isActive" key="isActive" render={(val) => (
                        <Badge status={val ? 'success' : 'default'} text={val ? 'Active' : 'Inactive'} />
                    )} />
                    <Column title="Actions" key="actions" render={(record) => (
                        <Space>
                            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
                        </Space>
                    )} />
                </Table>
            )}

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
                </Form>
            </Modal>
        </Layout>
    );
}
