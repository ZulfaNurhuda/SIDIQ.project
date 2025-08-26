'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import packageJson from '../../../package.json';
import {
  LayoutDashboard,
  Users,
  FileText,
  Download,
  History,
  Settings,
  PlusCircle,
  Heart,
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
    <aside className="w-64 glass-card h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
      <nav className="p-4 space-y-2 flex-1">
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
      
      {/* Footer Section */}
      <div className="p-4 border-t border-white/20 dark:border-white/10 mt-auto">
        <div className="text-center mb-2">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              SIDIQ
            </h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Sistem Informasi Pengelolaan Data Infaq
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Kelompok 3 - Jatiluhur
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            © {new Date().getFullYear()} • v{packageJson.version}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            Built with <Heart className="h-3 w-3 mx-1 text-red-500 fill-current" /> for Jamaah
          </p>
        </div>
      </div>
    </aside>
  );
}