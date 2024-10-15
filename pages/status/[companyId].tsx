import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Tag, Spin, message, Card, Row, Col, Timeline, Empty, Alert } from 'antd';
import { ServiceStatus } from '../../interfaces/service';

const { Title, Paragraph } = Typography;

const StatusPage = () => {
  const router = useRouter();
  const { companyId } = router.query;
  const [services, setServices] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchServicesAndCompany();
      fetchEvents();
    }
  }, [companyId]);

  const fetchServicesAndCompany = async () => {
    try {
      const response = await fetch(`/api/services/public?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
        setCompanyName(data.company.name);
      } else {
        message.error('Failed to fetch services and company information');
      }
    } catch (error) {
      console.error('Error fetching services and company:', error);
      message.error('An error occurred while fetching services and company information');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/services/events/public?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        message.error('Failed to fetch service events');
      }
    } catch (error) {
      console.error('Error fetching service events:', error);
      message.error('An error occurred while fetching service events');
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  const allServicesOperational = services.every(service => service.status === ServiceStatus.ACTIVE);

  return (
    <div className='p-16 px-64 bg-gray-100 min-h-screen'>
      <Title level={2}>{companyName} - Service Status</Title>
      <Paragraph>Current status of services for {companyName}</Paragraph>
      {allServicesOperational ? (
        <Card style={{ backgroundColor: '#e6ffe6', marginBottom: '16px', border: '1px solid #52c41a' }}>
          <Paragraph style={{ color: '#389e0d', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            🎉 Hooray! All services are operational 🚀
          </Paragraph>
        </Card>
      ) : (
        <Alert
          message="Some services are facing issues. Our devs are doing their best to fix it!"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Row gutter={[0, 16]} className='mt-8'>
        {services.map((service) => (
          <Col span={24} key={service._id}>
            <Card title={service.name} hoverable>
              <Tag color={service.status === ServiceStatus.ACTIVE ? 'green' : 'red'}>
                {service.status.toUpperCase()}
              </Tag>
              <Paragraph>{service.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
      <Title level={3} className='mt-16'>Past Events</Title>
      {events.length > 0 ? (
        <Timeline>
          {events.map((event) => (
            <Timeline.Item key={event.id} color={event.status === ServiceStatus.ACTIVE ? 'green' : 'red'}>
              <p>{new Date(event.timestamp).toLocaleString()}: {event.reason}</p>
              <p>Service: {services.find(s => s._id === event.serviceId)?.name}</p>
              {/* <p>Status: {event.status.toUpperCase()}</p> */}
              {event.finishedAt && <p>Resolved: {new Date(event.finishedAt).toLocaleString()}</p>}
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No past events" />
      )}
    </div>
  );
};

export default StatusPage;
