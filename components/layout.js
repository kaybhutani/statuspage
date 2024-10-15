import Head from 'next/head';
import Link from 'next/link';
import { Menu, Popover, theme, ConfigProvider } from 'antd';
import { UserProvider } from '../lib/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DatabaseOutlined, CaretRightOutlined, SettingOutlined, LogoutOutlined, UserOutlined, PlusOutlined, RightSquareOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const AppLayout = ({ user, loading = false, children }) => {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const {  darkAlgorithm } = theme;
  const menuItems = [
    {
      key: 'logo',
      label: (
        <Link href="/">
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>StatusPage</Typography.Title>
        </Link>
      ),
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
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => window.location.href = '/api/logout',
      style: { position: 'absolute', bottom: 0, width: 'auto' },
    },
  ];

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
  <UserProvider value={{ user, loading }}>
    <ConfigProvider
      // theme={{
      //   token: {
      //     // colorPrimary: "#FA8C16",
      //     colorTextHeading: "#595959",
      //     colorTextBase: "#595959",
      //     colorText: "#595959",
      //     // colorLink: "#FA8C16",
      //     // colorLinkHover: "#FA8C16",
      //   },
      // }}
      theme={{algorithm: darkAlgorithm}}
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
        theme="dark"
        defaultOpenKeys={['tasks']}
        items={menuItems}
      >
        
      </Menu>
      <div className="bg-gray-700" style={{ 
        flex: 1, 
        height: '100vh', 
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 200,
      }}>
        <div className="m-1.5 bg-gray-900 rounded-lg shadow-lg h-full p-6" style={{
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
