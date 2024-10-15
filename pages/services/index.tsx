import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Row, Col, Modal, Form, Input, Select, Tag, Popconfirm, Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useUser } from '../../lib/user';
import Layout from '../../components/layout';
import { ServiceStatus } from '../../interfaces/service';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ServicesPage = () => {
  const { user, loading } = useUser();
  const [services, setServices] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  useEffect(() => {
      fetchServices();
  }, [user]);

  const fetchServices = async () => {
    setFetchingServices(true);
    try {
      const response = await fetch(`/api/services?companyId=${user?.companyId}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.data);
      } else {
        message.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('An error occurred while fetching services');
    } finally {
      setFetchingServices(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === ServiceStatus.ACTIVE ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Dropdown overlay={
          <Menu>
            <Menu.Item key="1" onClick={() => showStatusModal(record)}>
              Change Status
            </Menu.Item>
            <Menu.Item key="2" className="text-red-500">
              <Popconfirm
                title="Are you sure you want to delete this service?"
                onConfirm={() => handleDeleteService(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Typography.Text className="text-red-500">Delete</Typography.Text>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        } trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showStatusModal = (service) => {
    setSelectedService(service);
    setIsStatusModalVisible(true);
    statusForm.setFieldsValue({ status: service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    statusForm.resetFields();
    setSelectedService(null);
  };

  const handleCreateService = async (values) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values }),
      });
      if (response.ok) {
        message.success('Service created successfully');
        fetchServices();  // Refresh the service list
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      message.error('An error occurred while creating service');
    }
  };

  const handleStatusChange = async (values) => {
    try {
      const response = await fetch(`/api/services/${selectedService?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: values.status,
          reason: values.reason
        }),
      });
      if (response.ok) {
        message.success('Service status updated successfully');
        fetchServices();  // Refresh the service list
        setIsStatusModalVisible(false);
        statusForm.resetFields();
        setSelectedService(null);
      } else {
        message.error('Failed to update service status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      message.error('An error occurred while updating service status');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Service deleted successfully');
        fetchServices();  // Refresh the service list
      } else {
        message.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error('An error occurred while deleting service');
    }
  };

  if (loading) {
    return <Layout user={null} loading={loading}>Loading...</Layout>;
  }

  return (
    <Layout user={user} loading={loading}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Services</Title>
          <Paragraph>Manage services in your company</Paragraph>
        </Col>
        <Col>
          <Button 
            type="primary" 
            onClick={showModal}
          >
            Create New Service
          </Button>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={services} 
        rowKey="_id"
        loading={fetchingServices}
      />

      <Modal
        title="Create New Service"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateService}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the service name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the service description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Service
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Service Status"
        visible={isStatusModalVisible}
        onCancel={handleStatusCancel}
        footer={null}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleStatusChange}
        >
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select the new status!' }]}
          >
            <Select>
              {Object.values(ServiceStatus)
                .filter(status => status !== selectedService?.status)
                .map((status) => (
                  <Option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: statusForm.getFieldValue('status') === ServiceStatus.INACTIVE, message: 'Please provide a reason for deactivation!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Status
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ServicesPage;
