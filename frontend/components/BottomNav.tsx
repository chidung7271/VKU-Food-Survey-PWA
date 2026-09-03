'use client';

import { countPendingSurveys } from '@/lib/db';
import { ClipboardPenLine, History, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const updateCount = async () => {
    try {
      const cnt = await countPendingSurveys();
      setPendingCount(cnt);
    } catch (e) {
      // IndexedDB may not be initialized yet
    }
  };

  useEffect(() => {
    updateCount();
    const handleSyncEvent = () => updateCount();
    window.addEventListener('surveys-synced', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);
    const interval = setInterval(updateCount, 4000);

    return () => {
      window.removeEventListener('surveys-synced', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    {
      href: '/',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      href: '/survey',
      label: 'Khảo sát',
      icon: ClipboardPenLine,
    },
    {
      href: '/history',
      label: 'Lịch sử',
      icon: History,
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-vku-blue font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

