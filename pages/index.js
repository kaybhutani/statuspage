import React, { useEffect } from 'react';
import { Spin } from 'antd';
import Layout from '../components/layout';
import { useFetchUser } from '../lib/user';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, loading } = useFetchUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout user={user} loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <Layout user={user} loading={loading}>
      
    </Layout>
  );
}
