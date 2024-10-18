import React, { useState, useEffect } from 'react';
import { useFetchUser } from '../lib/user';
import Layout from '../components/layout';
import { Copy, Link, Pencil } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
})

const SettingsPage = () => {
  const { user, loading } = useFetchUser();
  const [companyName, setCompanyName] = useState('');
  const [statusPageUrl, setStatusPageUrl] = useState('');
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
    },
  })

  useEffect(() => {
    if (user && user.company) {
      setCompanyName(user.company.name);
      form.setValue("companyName", user.company.name);
    }
    if (typeof window !== 'undefined' && user && user.companyId) {
      setStatusPageUrl(`${window.location.origin}/status/${user.companyId}`);
    }
  }, [user, form]);

  const handlePasswordChange = async () => {
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
        toast({
          title: "Success",
          description: "Password change email sent. Please check your inbox.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to initiate password change.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "An error occurred while changing password.",
        variant: "destructive",
      })
    }
  };

  const copyStatusPageUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(statusPageUrl).then(() => {
        toast({
          title: "Success",
          description: "Status page URL copied to clipboard!",
        })
      }, (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy URL.",
          variant: "destructive",
        })
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
        toast({
          title: "Success",
          description: "Company name updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update company name.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating company name:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating company name.",
        variant: "destructive",
      })
    }
  };

  if (loading) {
    return <Layout user={null} loading={loading}>Loading...</Layout>;
  }

  return (
    <Layout user={user} loading={loading}>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingCompanyName ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCompanyNameChange)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save</Button>
                  <Button variant="outline" onClick={() => setIsEditingCompanyName(false)} className="ml-2">Cancel</Button>
                </form>
              </Form>
            ) : (
              <div className="flex items-center justify-between">
                <p><strong>Company Name:</strong> {companyName}</p>
                <Button variant="outline" size="icon" onClick={() => setIsEditingCompanyName(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePasswordChange}>
              Send Password Reset Email
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Public Status Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Your public status page URL:</p>
            <div className="flex">
              <Input
                className="flex-grow"
                value={statusPageUrl}
                readOnly
                icon={<Link className="h-4 w-4" />}
              />
              <Button variant="outline" size="icon" onClick={copyStatusPageUrl} className="ml-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
