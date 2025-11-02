'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  UserCheck, 
  Stethoscope, 
  FileText, 
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Pacientes',
    href: '/patients',
    icon: Users,
  },
  {
    title: 'Especialidades',
    href: '/specialties',
    icon: Stethoscope,
  },
  {
    title: 'Especialistas',
    href: '/professionals',
    icon: UserCheck,
  },
  {
    title: 'Consultas',
    href: '/medical-records',
    icon: FileText,
  },
  {
    title: 'Historias Clínicas',
    href: '/consultations',
    icon: Search,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">SYSMEDIC</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
