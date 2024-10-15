import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, message, Row, Col, Card } from 'antd';
import { useFetchUser, useUser } from '../lib/user';
import Layout from '../components/layout';
import { CopyOutlined, LinkOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SettingsPage = () => {
  const { user, loading } = useFetchUser();
  const [form] = Form.useForm();
  const [companyName, setCompanyName] = useState('');
  const [statusPageUrl, setStatusPageUrl] = useState('');
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);

  useEffect(() => {
    if (user && user.company) {
      setCompanyName(user.company.name);
    }
    if (typeof window !== 'undefined' && user && user.companyId) {
      setStatusPageUrl(`${window.location.origin}/status/${user.companyId}`);
    }
  }, [user]);

  const handlePasswordChange = async (values) => {
    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
          email: user?.email,
          connection: 'Username-Password-Authentication'
        }),
      });

      if (response.ok) {
        message.success('Password change email sent. Please check your inbox.');
      } else {
        message.error('Failed to initiate password change.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('An error occurred while changing password.');
    }
  };

  const copyStatusPageUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(statusPageUrl).then(() => {
        message.success('Status page URL copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
        message.error('Failed to copy URL.');
      });
    }
  };

  const handleCompanyNameChange = async (values) => {
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.companyName }),
      });

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompanyName(updatedCompany.name);
        setIsEditingCompanyName(false);
        message.success('Company name updated successfully.');
      } else {
        message.error('Failed to update company name.');
      }
    } catch (error) {
      console.error('Error updating company name:', error);
      message.error('An error occurred while updating company name.');
    }
  };

  if (loading) {
    return <Layout user={null} loading={loading}>Loading...</Layout>;
  }

  return (
    <Layout user={user} loading={loading}>
      <Title level={2}>Settings</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Company Information" style={{ height: '200px' }}>
            {isEditingCompanyName ? (
              <Form onFinish={handleCompanyNameChange} initialValues={{ companyName }}>
                <Form.Item name="companyName" rules={[{ required: true, message: 'Please input company name!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Save</Button>
                  <Button onClick={() => setIsEditingCompanyName(false)} style={{ marginLeft: 8 }}>Cancel</Button>
                </Form.Item>
              </Form>
            ) : (
              <Paragraph>
                <strong>Company Name:</strong> {companyName}
                <Button icon={<EditOutlined />} type="link" onClick={() => setIsEditingCompanyName(true)} />
              </Paragraph>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Change Password" style={{ height: '200px' }}>
            <Form form={form} onFinish={handlePasswordChange}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Send Password Reset Email
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Public Status Page" style={{ height: '200px' }}>
            <Paragraph>
              Your public status page URL:
            </Paragraph>
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 64px)' }}
                prefix={<LinkOutlined />}
                value={statusPageUrl}
                readOnly
              />
              <Button icon={<CopyOutlined />} onClick={copyStatusPageUrl} />
            </Input.Group>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default SettingsPage;
