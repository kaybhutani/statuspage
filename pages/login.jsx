import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spin } from 'antd';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/api/login');
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" tip="Redirecting to login..." />
    </div>
  );
};

export default LoginPage;
