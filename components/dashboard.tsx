import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, AlertTriangle, XCircle, Users, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import Layout from '../../components/layout'
import { useFetchUser } from '../../lib/user'
import { IServiceModel, ServiceStatus } from '../../interfaces/service'

export function Dashboard() {
  const { user, loading } = useFetchUser()
  const [services, setServices] = useState<{ data: Array<IServiceModel> }>({ data: [] })
  const [events, setEvents] = useState([])
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    if (user && user.companyId) {
      fetch(`/api/services?companyId=${user.companyId}`)
        .then(res => res.json())
        .then(data => {
          setServices({ data: data.data })
        })

      fetch(`/api/events?companyId=${user.companyId}&limit=5`)
        .then(res => res.json())
        .then(data => setEvents(data.data))

      fetch(`/api/users?companyId=${user.companyId}`)
        .then(res => res.json())
        .then(data => setUserCount(data.total))
    }
  }, [user])

  const getServiceName = (serviceId) => {
    const service = services.data.find(s => s._id === serviceId)
    return service ? service.name : 'Unknown Service'
  }

  const getServiceStatusCount = (status) => {
    return services.data.filter(service => service.status === status).length
  }

  return (
    <Layout user={user} loading={loading}>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Operational Services
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getServiceStatusCount(ServiceStatus.OPERATIONAL)}</div>
          </CardContent>
          <CardFooter>
            <Link href="/" className="text-xs text-muted-foreground">
              View all
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Degraded Performance
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getServiceStatusCount(ServiceStatus.DEGRADED_PERFORMANCE)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Partial Outage
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getServiceStatusCount(ServiceStatus.PARTIAL_OUTAGE)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Major Outage
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getServiceStatusCount(ServiceStatus.MAJOR_OUTAGE)}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{getServiceName(event.service_id)}</TableCell>
                    <TableCell>
                      <Badge variant={event.event_type === 'UP' ? 'success' : event.event_type === 'DOWN' ? 'destructive' : 'default'}>
                        {event.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(event.created).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/events">View all <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Company Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{userCount}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/users">View all <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  )
}