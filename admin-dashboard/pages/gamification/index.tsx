import React, { useState, useEffect } from 'react';
import { Flex, Text, Button, Table, Modal, Form, Input, InputNumber, Space, Tag, message, Spin, Tabs, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import Layout from '../../components/Layout';
import axios from 'axios';

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
            const res = await axios.get('/api/gamification');
            setConfig(res.data.data);
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
            await axios.put('/api/gamification', updatedConfig);
            message.success('Rules updated successfully');
            setConfig(updatedConfig);
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
                paths: config.avatarTiers[index].paths.join('\n') // Convert array to newline separated
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


    if (loading) return <Layout><Spin /></Layout>;

    return (
        <Layout>
            <Flex align="center" style={{ marginBottom: 24, marginTop: 10, gap: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>Gamification Rules</Text>
            </Flex>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Avatar Evolution Tiers',
                    children: (
                        <>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showAvatarModal()} style={{ marginBottom: 16 }}>Add Evolution Tier</Button>
                            <Table dataSource={config.avatarTiers} rowKey="name" pagination={false}>
                                <Table.Column title="Tier Name" dataIndex="name" key="name" render={(val) => <Text strong>{val}</Text>} />
                                <Table.Column title="Karma Required" dataIndex="baseKarma" key="baseKarma" render={(val) => <Tag color="gold">{val}</Tag>} />
                                <Table.Column title="Assets Configuration" dataIndex="paths" render={(p: string[]) => (
                                    <Text type="secondary">{p.length} assets mapped</Text>
                                )} />
                                <Table.Column title="Actions" render={(_, r: any, i) => (
                                    <Space>
                                        <Button icon={<EditOutlined />} size="small" onClick={() => showAvatarModal(i)} />
                                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => deleteAvatar(i)} />
                                    </Space>
                                )} />
                            </Table>
                        </>
                    )
                },
                {
                    key: '2',
                    label: 'Trophy Unlock Rules',
                    children: (
                        <>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showTrophyModal()} style={{ marginBottom: 16 }}>Add Trophy</Button>
                            <Table dataSource={config.trophies} rowKey="name" pagination={false}>
                                <Table.Column title="Icon" dataIndex="icon" render={(val) => <Text style={{ fontSize: 20 }}>{val}</Text>} />
                                <Table.Column title="Trophy Name" dataIndex="name" />
                                <Table.Column title="Description" dataIndex="description" />
                                <Table.Column title="Type" dataIndex="unlockRuleType" render={(val) => <Tag color="blue">{val.toUpperCase()}</Tag>} />
                                <Table.Column title="Threshold" dataIndex="unlockThreshold" render={(val) => <Tag>{val}</Tag>} />
                                <Table.Column title="Actions" render={(_, r: any, i) => (
                                    <Space>
                                        <Button icon={<EditOutlined />} size="small" onClick={() => showTrophyModal(i)} />
                                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => deleteTrophy(i)} />
                                    </Space>
                                )} />
                            </Table>
                        </>
                    )
                }
            ]} />


            {/* Avatar Tier Modal */}
            <Modal title={editingIndex !== null ? "Edit Avatar Tier" : "Add Avatar Tier"} open={isAvatarModalVisible} onOk={handleAvatarOk} onCancel={() => setIsAvatarModalVisible(false)} width={600}>
                <Form form={aForm} layout="vertical">
                    <Flex gap="middle">
                        <Form.Item name="name" label="Tier Display Name" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input placeholder="🌱 Seedling (Starter)" />
                        </Form.Item>
                        <Form.Item name="baseKarma" label="Karma Required" rules={[{ required: true }]}>
                            <InputNumber min={0} />
                        </Form.Item>
                    </Flex>
                    <Form.Item name="paths" label="Asset Paths (one per line)" rules={[{ required: true }]}>
                        <Input.TextArea rows={6} placeholder="assets/icon/avatar_tier1_1.png&#13;&#10;assets/icon/avatar_tier1_2.png" />
                    </Form.Item>
                </Form>
            </Modal>


            {/* Trophy Modal */}
            <Modal title={editingIndex !== null ? "Edit Trophy" : "Add Trophy"} open={isTrophyModalVisible} onOk={handleTrophyOk} onCancel={() => setIsTrophyModalVisible(false)}>
                <Form form={tForm} layout="vertical">
                    <Flex gap="middle">
                        <Form.Item name="name" label="Trophy Name" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input placeholder="Master Explorer" />
                        </Form.Item>
                        <Form.Item name="icon" label="Emoji Icon" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Flex>
                    <Form.Item name="description" label="Unlock Description" rules={[{ required: true }]}>
                        <Input placeholder="Explore 50 festivals" />
                    </Form.Item>
                    <Flex gap="middle">
                        <Form.Item name="unlockRuleType" label="Unlock Metric" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                <Select.Option value="karma">Karma Points (karma)</Select.Option>
                                <Select.Option value="explore">Festivals Explored (explore)</Select.Option>
                                <Select.Option value="share">Total Shares (share)</Select.Option>
                                <Select.Option value="streak">Daily Streak (streak)</Select.Option>
                                <Select.Option value="signup">Sign Up (signup)</Select.Option>
                                <Select.Option value="time">Specific Time (time)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="unlockThreshold" label="Constraint Value" rules={[{ required: true }]}>
                            <InputNumber min={0} />
                        </Form.Item>
                    </Flex>
                </Form>
            </Modal>

        </Layout>
    );
}
