'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNetwork } from '@/lib/network';

interface NetworkStatusProps {
  compact?: boolean;
}

export default function NetworkStatus({ compact = false }: NetworkStatusProps) {
  const [mounted, setMounted] = useState(false);
  const { isOnline, isManualOffline, toggleOffline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    const handleSyncStatus = (e: any) => {
      if (e.detail && typeof e.detail.isSyncing === 'boolean') {
        setIsSyncing(e.detail.isSyncing);
      }
    };

    window.addEventListener('sync-status-changed', handleSyncStatus);
    return () => {
      window.removeEventListener('sync-status-changed', handleSyncStatus);
    };
  }, []);

  // Tránh lỗi Hydration Mismatch giữa Server (SSR) và Client khi mới tải trang
  if (!mounted) {
    if (compact) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Online</span>
        </span>
      );
    }
    return (
      <div className="p-3.5 rounded-xl border flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-900">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Đã kết nối Internet (Online)</div>
            <div className="text-xs opacity-80">Dữ liệu sẽ được gửi trực tiếp lên MongoDB</div>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện thu gọn trên Header (Navbar)
  if (compact) {
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Đang đồng bộ...</span>
        </span>
      );
    }
    if (isOnline) {
      return (
        <button
          type="button"
          onClick={() => toggleOffline()}
          title="Đang Online. Bấm để thử chế độ Offline (Demo)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => toggleOffline()}
        title="Đang Offline. Bấm để chuyển lại Online"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse hover:bg-amber-200 transition"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>Offline</span>
      </button>
    );
  }

  // Giao diện đầy đủ trên Trang chủ
  return (
    <div
      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
        isSyncing
          ? 'bg-blue-50 border-blue-200 text-blue-900'
          : isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSyncing ? (
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : isOnline ? (
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Wifi className="w-5 h-5" />
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <WifiOff className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="font-bold text-sm flex items-center gap-2">
            <span>
              {isSyncing
                ? 'Đang đồng bộ dữ liệu...'
                : isOnline
                ? 'Đã kết nối Internet (Online)'
                : 'Ngoại tuyến (Offline)'}
            </span>
            {isManualOffline && (
              <span className="text-[10px] font-normal px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">
                (Chế độ test giả lập)
              </span>
            )}
          </div>
          <div className="text-xs opacity-80">
            {isSyncing
              ? 'Hệ thống đang tự động đẩy các khảo sát lên server'
              : isOnline
              ? 'Dữ liệu sẽ được gửi trực tiếp lên MongoDB'
              : 'Dữ liệu được lưu an toàn trong IndexedDB trên thiết bị'}
          </div>
        </div>
      </div>

      {/* Nút bật/tắt nhanh cho demo */}
      <button
        type="button"
        onClick={() => toggleOffline()}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition text-slate-700 font-medium ml-2 flex-shrink-0"
        title="Chuyển đổi nhanh trạng thái để demo"
      >
        {isOnline ? (
          <>
            <ToggleRight className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Giả lập Offline</span>
          </>
        ) : (
          <>
            <ToggleLeft className="w-4 h-4 text-amber-600" />
            <span className="text-[11px]">Về Online</span>
          </>
        )}
      </button>
    </div>
  );
}
