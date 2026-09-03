'use client';

import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import NetworkStatus from './NetworkStatus';
import PwaInstallPrompt from './PwaInstallPrompt';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vku-blue to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base leading-tight text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>VKU Food Survey</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-vku-orange">
                PWA
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Khảo sát căng tin sinh viên
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <PwaInstallPrompt />
          <NetworkStatus compact />
        </div>
      </div>
    </header>
  );
}

