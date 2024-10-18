import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ServiceStatus } from '../../interfaces/service';
import moment from 'moment';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tooltip as AntTooltip } from 'antd';

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
        console.error('Failed to fetch services and company information');
      }
    } catch (error) {
      console.error('Error fetching services and company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="w-[100px] h-[20px] rounded-full" />;
  }

  const allServicesOperational = services.every(service => service.status === ServiceStatus.OPERATIONAL);

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const calculateUptime = (serviceEvents) => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const totalHours = 240;
    let downHours = 0;

    serviceEvents.forEach(event => {
      const startTime = new Date(event.started_at);
      const endTime = event.finished_at ? new Date(event.finished_at) : new Date();
      
      if (startTime < tenDaysAgo) {
        startTime.setTime(tenDaysAgo.getTime());
      }
      
      if (endTime > new Date()) {
        endTime.setTime(new Date().getTime());
      }
      
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      downHours += duration;
    });

    const uptimePercentage = ((totalHours - downHours) / totalHours) * 100;
    return uptimePercentage.toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return 'green';
      case ServiceStatus.MAJOR_OUTAGE:
        return 'red';
      case ServiceStatus.PARTIAL_OUTAGE:
      case ServiceStatus.DEGRADED_PERFORMANCE:
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <div className='p-8 md:p-16 lg:px-32 xl:px-64 bg-background min-h-screen'>
      <h2 className="text-4xl font-bold tracking-tight mb-2 text-primary">{companyName}</h2>
      <p className="text-muted-foreground mb-6">Current status of services for {companyName}</p>
      {allServicesOperational ? (
        <Card className="bg-green-100 mb-8 border-green-500 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardContent className="py-4">
            <p className="text-green-800 font-bold">
              🎉 Hooray! All services are operational 🚀
            </p>
          </CardContent>
        </Card>
      ) : (
        <Alert variant="warning" className="mb-8 bg-yellow-50 border-yellow-400 shadow-lg transition-all duration-300 hover:shadow-xl">
          <AlertDescription className="text-yellow-800">
            ⚠️ Some services are facing issues. Our devs are doing their best to fix it!
          </AlertDescription>
        </Alert>
      )}

      <h3 className="text-2xl font-bold tracking-tight mt-16 mb-4 text-primary">Services</h3>
      <div className="grid gap-6 mt-8">
        {services.map((service) => {
          const serviceEvents = events.filter(event => event.service_id === service._id);
          
          const getBarColor = (time) => {
            for (const event of serviceEvents) {
              const startTime = new Date(event.started_at);
              const endTime = event.finished_at ? new Date(event.finished_at) : new Date();
              if (time >= startTime && time <= endTime) {
                return getStatusColor(event.status);
              }
            }
            return 'green';
          };

          const uptimePercentage = calculateUptime(serviceEvents);

          return (
            <Card key={service._id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-primary">{service.name}</span>
                  <Badge variant={getStatusColor(service.status)} className={`text-${getStatusColor(service.status)}-700 bg-${getStatusColor(service.status)}-100`}>
                    {service.status?.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <div className="mt-4">
                  <div className="text-sm mb-1 font-semibold">Uptime Status (Last 10 days)</div>
                  <div style={{ display: 'flex', height: '20px', width: '100%' }}>
                    {Array.from({ length: 240 }, (_, index) => {
                      const time = new Date();
                      time.setHours(time.getHours() - (239 - index));
                      const barColor = getBarColor(time);
                      return (
                        <div
                          key={index}
                          style={{
                            width: '0.416%',
                            height: '100%',
                            backgroundColor: barColor,
                            marginRight: '1px',
                          }}
                          title={`${time.toLocaleString()} - Service was ${barColor === 'green' ? 'operational' : 'experiencing issues'}`}
                        />
                      );
                    })}
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 days ago</span>
                    <span className="font-semibold">{uptimePercentage}% uptime</span>
                    <span>Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <h3 className="text-2xl font-bold tracking-tight mt-16 mb-8 text-primary">Past Events</h3>
      {events.length > 0 ? (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event._id} className={`border-l-4 border-l-${getStatusColor(event.status)} transition-all duration-300 hover:shadow-lg`}>
              <CardContent className="flex justify-between items-start pt-6">
                <div>
                  <p className="font-bold text-primary">
                    Affected Service: {event.service?.name}
                    <Badge variant={getStatusColor(event.status)} className={`ml-2 text-${getStatusColor(event.status) === 'red' ? 'red-700' : `${getStatusColor(event.status)}-700`} bg-${getStatusColor(event.status)}-100`}>
                      {event.status}
                    </Badge>
                    {event.finished_at ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="ml-2 c text-green-700 bg-green-100">Fixed ✅</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            This issue was fixed at {new Date(event.finished_at).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="ml-2 cursor-help text-yellow-700 bg-yellow-100">Being fixed ⏱️</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Our team is currently working on resolving this issue
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-2">Reason: {event.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    <strong>{new Date(event.started_at).toLocaleString()}</strong>
                    {' '}
                    <span className="text-primary">({calculateDuration(event.started_at, event.finished_at)})</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No past events</p>
      )}
    </div>
  );
};

export default StatusPage;
