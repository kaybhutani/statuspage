import Head from 'next/head';
import Link from 'next/link';
import { Menu, Popover, theme, ConfigProvider, Divider, Switch } from 'antd';
import { UserProvider } from '../lib/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DatabaseOutlined, CaretRightOutlined, SettingOutlined, LogoutOutlined, UserOutlined, PlusOutlined, RightSquareOutlined, AppstoreOutlined, DashboardOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const AppLayout = ({ user, loading = false, children }) => {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const { darkAlgorithm, defaultAlgorithm } = theme;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode === 'true');
  }, []);

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
    localStorage.setItem('darkMode', checked);
  };

  const menuItems = [
    {
      key: 'logo',
      label: (
        <Link href="/">
          <Typography.Title level={4} style={{ margin: 0 }}>StatusPage</Typography.Title>
        </Link>
      ),
    },
    {
      key: 'dashboard',
      label: <Link href="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: 'services',
      label: <Link href="/">Services</Link>,
      icon: <AppstoreOutlined />,
    },
    {
      key: 'users',
      label: <Link href="/users">Users</Link>,
      icon: <UserOutlined />,
    }, 
    {
      key: 'settings',
      label: <Link href="/settings">Settings</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: 'divider',
      label: <Divider style={{ margin: '10px 0' }} />,
    },
    {
      key: 'user',
      label: (
        <span>
          Hi, {user?.name || 'User'}
        </span>
      ),
      icon: <UserOutlined />,
      style: { position: 'absolute', bottom: 80, width: '100%' },
    },
    {
      key: 'darkMode',
      label: (
        <span>
          Dark Mode
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            style={{ marginLeft: '10px' }}
          />
        </span>
      ),
      style: { position: 'absolute', bottom: 40, width: '100%' },
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => window.location.href = '/api/logout',
      style: { position: 'absolute', bottom: 0, width: '100%' },
    },
  ];

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
  <UserProvider value={{ user, loading }}>
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
    <Head>
      <title>Dashboard - StatusPage</title>
    </Head>

    <div style={{ display: 'flex' }}>
    <Menu
        onClick={handleClick}
        selectedKeys={[current]}
        mode="inline"
        style={{width: 200, height: '100vh'}}
        theme={isDarkMode ? "dark" : "light"}
        defaultOpenKeys={['tasks']}
        items={menuItems}
      >
        
      </Menu>
      <div className={isDarkMode ? "bg-gray-700" : "bg-gray-100"} style={{ 
        flex: 1, 
        height: '100vh', 
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 200,
      }}>
        <div className={`m-1.5 ${isDarkMode ? "bg-gray-900" : "bg-white"} rounded-lg shadow-lg h-full p-6`} style={{
          height: '100%',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </div>
      </div>
      </ConfigProvider>
  </UserProvider>
)};

export default AppLayout;
