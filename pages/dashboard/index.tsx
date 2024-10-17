import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined, CloseCircleOutlined, TeamOutlined, RightOutlined } from '@ant-design/icons';
import Layout from '../../components/layout';
import { useFetchUser } from '../../lib/user';
import Link from 'next/link';
import { ServiceStatus } from '../../interfaces/service';

const { Title } = Typography;

const DashboardPage = () => {
  const { user, loading } = useFetchUser();
  const [services, setServices] = useState({ data: [] });
  const [events, setEvents] = useState([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (user && user.companyId) {
      fetch(`/api/services?companyId=${user.companyId}`)
        .then(res => res.json())
        .then(data => {
          setServices({ data: data.data });
        });

      // Fetch events data
      fetch(`/api/events?companyId=${user.companyId}&limit=5`)
        .then(res => res.json())
        .then(data => setEvents(data.data));

      // Fetch user count
      fetch(`/api/users?companyId=${user.companyId}`)
        .then(res => res.json())
        .then(data => setUserCount(data.total));
    }
  }, [user]);

  const getServiceName = (serviceId) => {
    const service = services.data.find(s => s._id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service_id',
      key: 'service',
      render: serviceId => <span>{getServiceName(serviceId)}</span>,
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type) => (
        <Tag color={type === 'UP' ? 'green' : type === 'DOWN' ? 'red' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'created',
      key: 'createdAt',
      render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
      },
    },
  ];

  const getServiceStatusCount = (status) => {
    return services.data.filter(service => service.status === status).length;
  };

  return (
    <Layout user={user} loading={loading}>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card 
            title="Operational Services" 
            style={{ height: '100%' }}
            extra={
              <Link href="/">
                <Button type="link">
                  View all <RightOutlined />
                </Button>
              </Link>
            }
          >
            <Statistic
              value={getServiceStatusCount(ServiceStatus.OPERATIONAL)}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card 
            title="Degraded Performance" 
            style={{ height: '100%' }}
          >
            <Statistic
              value={getServiceStatusCount(ServiceStatus.DEGRADED_PERFORMANCE)}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12}>
          <Card 
            title="Partial Outage" 
            style={{ height: '100%' }}
          >
            <Statistic
              value={getServiceStatusCount(ServiceStatus.PARTIAL_OUTAGE)}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card 
            title="Major Outage" 
            style={{ height: '100%' }}
          >
            <Statistic
              value={getServiceStatusCount(ServiceStatus.MAJOR_OUTAGE)}
              prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12}>
          <Card 
            title="Recent Events" 
            style={{ height: '100%' }}
            extra={
              <Link href="/events">
                <Button type="link">
                  View all <RightOutlined />
                </Button>
              </Link>
            }
          >
            <Table 
              dataSource={events} 
              columns={columns} 
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card 
            title="Company Users" 
            style={{ height: '100%' }}
            extra={
              <Link href="/users">
                <Button type="link">
                  View all <RightOutlined />
                </Button>
              </Link>
            }
          >
            <Statistic
              title="Total Users"
              value={userCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default DashboardPage;
