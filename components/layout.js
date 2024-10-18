import Head from 'next/head';
import Link from 'next/link';
import { UserProvider } from '../lib/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SettingsIcon, LogOutIcon, UserIcon, AppWindowIcon, LayoutDashboardIcon, SunIcon, MoonIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AppLayout = ({ user, loading = false, children }) => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode === 'true');
    if (savedMode === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboardIcon className="mr-2 h-4 w-4" />,
    },
    {
      key: 'services',
      label: 'Services',
      href: '/',
      icon: <AppWindowIcon className="mr-2 h-4 w-4" />,
    },
    {
      key: 'users',
      label: 'Users',
      href: '/users',
      icon: <UserIcon className="mr-2 h-4 w-4" />,
    }, 
    {
      key: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <UserProvider value={{ user, loading }}>
      <Head>
        <title>Dashboard - StatusPage</title>
      </Head>

      <div className="flex h-screen">
        <div className="w-64 bg-background border-r flex flex-col">
          <div className="p-4">
            <Link href="/" className="text-2xl font-bold">StatusPage</Link>
          </div>
          <nav className="mt-4 flex-grow">
            {menuItems.map((item) => (
              <Link key={item.key} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    router.pathname === item.href ? 'bg-accent' : ''
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user?.name || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center justify-between mt-4">
              <span className="flex items-center">
                {isDarkMode ? <MoonIcon className="mr-2 h-4 w-4" /> : <SunIcon className="mr-2 h-4 w-4" />}
                Dark mode
              </span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
};

export default AppLayout;