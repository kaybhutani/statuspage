import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Row, Col, Modal, Form, Input } from 'antd';
import { useUser } from '../../lib/user';
import Layout from '../../components/layout';

const { Title, Paragraph } = Typography;

const UsersPage = () => {
  const { user, loading } = useUser();
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    
      fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await fetch(`/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        message.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('An error occurred while fetching users');
    } finally {
      setFetchingUsers(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (text) => new Date(text).toLocaleDateString(),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleInviteUser = async (values) => {
    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('User invited successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to invite user');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      message.error('An error occurred while inviting user');
    }
  };

  if (loading) {
    return <Layout user={null} loading={loading}>Loading...</Layout>;
  }

  return (
    <Layout user={user} loading={loading}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Users</Title>
          <Paragraph>Manage users in your company</Paragraph>
        </Col>
        <Col>
          <Button 
            type="primary" 
            onClick={showModal}
          >
            Invite New User
          </Button>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        loading={fetchingUsers}
      />

      <Modal
        title="Invite New User"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInviteUser}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input the password!' },
              { min: 8, message: 'Password must be at least 8 characters long!' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Invite
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UsersPage;
