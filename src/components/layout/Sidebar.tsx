'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Download,
  History,
  Settings,
  PlusCircle,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Manajemen User',
    href: '/admin/users',
    icon: Users,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Data Iuran',
    href: '/admin/iuran',
    icon: FileText,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Export Data',
    href: '/admin/export',
    icon: Download,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Form Iuran',
    href: '/jamaah/form',
    icon: PlusCircle,
    roles: ['jamaah'],
  },
  {
    name: 'Riwayat Iuran',
    href: '/jamaah/history',
    icon: History,
    roles: ['jamaah'],
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    roles: ['superadmin', 'admin', 'jamaah'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 glass-card h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/20 text-primary-900 dark:text-primary-100 border border-primary-300/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-500/10 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}