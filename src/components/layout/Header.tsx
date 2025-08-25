'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'jamaah':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-heading-3 text-gray-900 dark:text-white font-semibold">
              Sistem Infaq
            </h1>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-body-small text-gray-900 dark:text-white font-medium">
                {user.full_name}
              </span>
            </div>
            
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 h-auto"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}