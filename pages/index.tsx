import React, { useState, useEffect } from 'react';
import { useFetchUser } from '../lib/user';
import Layout from '../components/layout';
import { ServiceStatus, operationalStatus, inactiveStatus } from '../interfaces/service';
import { useRouter } from 'next/router';
import { MoreVertical, Plus } from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
})

const statusFormSchema = z.object({
  status: z.string(),
  reason: z.string().min(1, {
    message: "Reason is required.",
  }),
})

const ServicesPage = () => {
  const { user, loading } = useFetchUser();
  const [services, setServices] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const statusForm = useForm({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: "",
      reason: "",
    },
  })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchServices();
      }
    }
  }, [user, loading, router]);

  const fetchServices = async () => {
    if (!user?.companyId) return;
    setFetchingServices(true);
    try {
      const response = await fetch(`/api/services?companyId=${user.companyId}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching services",
        variant: "destructive",
      })
    } finally {
      setFetchingServices(false);
    }
  };

  const handleCreateService = async (values) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values }),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Service created successfully",
        })
        fetchServices();
        form.reset();
        setIsCreateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create service",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating service",
        variant: "destructive",
      })
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
        toast({
          title: "Success",
          description: "Service status updated successfully",
        })
        fetchServices();
        statusForm.reset();
        setSelectedService(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update service status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating service status",
        variant: "destructive",
      })
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        })
        fetchServices();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting service",
        variant: "destructive",
      })
    }
  };

  if (loading) {
    return <Layout user={null} loading={loading}><Skeleton className="w-[100px] h-[20px] rounded-full" /></Layout>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout user={user} loading={loading}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Manage services in your company</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateService)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Create Service</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service._id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    service.status === ServiceStatus.OPERATIONAL ? 'success' :
                    service.status === ServiceStatus.MAJOR_OUTAGE ? 'destructive' : 'warning'
                  }
                  className={
                    service.status === ServiceStatus.OPERATIONAL ? 'bg-green-500' :
                    service.status === ServiceStatus.MAJOR_OUTAGE ? 'bg-red-500' : 'bg-yellow-500'
                  }
                >
                  {service.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{service.description}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setSelectedService(service)}>
                      Change Status
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the service.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteService(service._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Service Status</DialogTitle>
          </DialogHeader>
          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(handleStatusChange)} className="space-y-8">
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(operationalStatus.includes(selectedService?.status)
                          ? inactiveStatus
                          : [ServiceStatus.OPERATIONAL]
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={statusForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Status</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServicesPage;
