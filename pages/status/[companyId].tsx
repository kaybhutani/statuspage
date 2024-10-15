import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Tag, Spin, message, Card, Row, Col, Empty, Alert, Tooltip } from 'antd';
import { ServiceStatus } from '../../interfaces/service';
import moment from 'moment';
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
    }
  }, [companyId]);

  const fetchServicesAndCompany = async () => {
    try {
      const response = await fetch(`/api/services/public?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
        setCompanyName(data.company.name);
        setEvents(data.events);
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

  if (loading) {
    return <Spin size="large" />;
  }

  const allServicesOperational = services.every(service => service.status === ServiceStatus.ACTIVE);

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className='p-16 px-64 bg-gray-100 min-h-screen'>
      <Title level={2}>{companyName}</Title>
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

      <Title level={3} className='mt-16'>Services</Title>
      <Row gutter={[0, 16]} className='mt-8'>
        {services.map((service) => {
          const serviceEvents = events.filter(event => event.service_id === service._id);
          
          const getBarColor = (time) => {
            for (const event of serviceEvents) {
              const startTime = new Date(event.started_at);
              const endTime = event.finished_at ? new Date(event.finished_at) : new Date();
              if (time >= startTime && time <= endTime) {
                return 'red';
              }
            }
            return 'green';
          };

          return (
            <Col span={24} key={service._id}>
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{service.name}</span>
                    <Tag size='large' color={service.status === ServiceStatus.ACTIVE ? 'green' : 'red'}>
                      {service.status?.toUpperCase()}
                    </Tag>
                  </div>
                } 
                hoverable
              >
                <Paragraph>{service.description}</Paragraph>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>Uptime Status (Last 24 hours)</div>
                  <div style={{ display: 'flex', height: '20px', width: '100%' }}>
                    {[...Array(240)].map((_, index) => {
                      const time = new Date();
                      time.setMinutes(time.getMinutes() - (239 - index) * 10);
                      const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const barColor = getBarColor(time);
                      return (
                        <Tooltip key={index} title={`${formattedTime} - Service was ${barColor === 'green' ? 'active' : 'inactive'}`}>
                          <div
                            style={{
                              width: '0.416%',
                              height: '100%',
                              backgroundColor: barColor,
                              marginRight: '1px',
                              cursor: 'pointer'
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Title level={3} className='mt-16'>Past Events</Title>
      {events.length > 0 ? (
        <Row gutter={[0, 16]}>
          {events.map((event) => (
            <Col span={24} key={event._id}>
              <Card
                hoverable
                style={{ borderLeft: `4px solid ${event.status === ServiceStatus.ACTIVE ? 'green' : 'red'}` }}
              >
                <Row justify="space-between" align="top">
                  <Col>
                    <Paragraph strong>
                      Affected Service: {event.service?.name}
                      {event.finished_at ? (
                        <Tooltip title={`This issue was fixed at ${moment(event.finished_at).format('MMM D, YYYY h:mm A')}`}>
                          <Tag color="green" style={{ marginLeft: '8px' }}>Fixed ✅</Tag>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Our team is currently working on resolving this issue">
                          <Tag color="orange" style={{ marginLeft: '8px' }}>Being fixed ⏱️</Tag>
                        </Tooltip>
                      )}
                    </Paragraph>
                    <Paragraph>Reason: {event.reason}</Paragraph>
                  </Col>
                  <Col style={{ textAlign: 'right' }}>
                    <Paragraph>
                      <strong>{moment(event.started_at).format('MMM D, YYYY h:mm A')}</strong>
                      {' '}
                      ({calculateDuration(event.started_at, event.finished_at)})
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No past events" />
      )}
    </div>
  );
};

export default StatusPage;
