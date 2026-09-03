'use client';

import NetworkStatus from '@/components/NetworkStatus';
import { getAllSurveys, getPendingSurveys } from '@/lib/db';
import { syncPendingSurveys } from '@/services/sync';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardPenLine,
    Clock,
    History,
    Layers,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const loadDataStats = async () => {
    try {
      const all = await getAllSurveys();
      const pending = await getPendingSurveys();
      setTotalCount(all.length);
      setPendingCount(pending.length);
      setSyncedCount(all.filter((s) => s.status === 'synced').length);
    } catch (err) {
      console.error('Lỗi khi đọc IndexedDB:', err);
    }
  };

  useEffect(() => {
    loadDataStats();

    const handleSyncFinished = (e: any) => {
      loadDataStats();
      if (e.detail && e.detail.total > 0) {
        setSyncToast(
          `✅ Đã đồng bộ thành công ${e.detail.synced}/${e.detail.total} khảo sát!`,
        );
        setTimeout(() => setSyncToast(null), 4000);
      }
    };

    const handleSyncStatus = (e: any) => {
      if (e.detail) {
        setIsSyncing(e.detail.isSyncing);
      }
    };

    window.addEventListener('surveys-synced', handleSyncFinished);
    window.addEventListener('sync-status-changed', handleSyncStatus);

    return () => {
      window.removeEventListener('surveys-synced', handleSyncFinished);
      window.removeEventListener('sync-status-changed', handleSyncStatus);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncPendingSurveys();
      if (res.total === 0) {
        setSyncToast('ℹ️ Không có khảo sát nào đang chờ đồng bộ.');
        setTimeout(() => setSyncToast(null), 3000);
      }
    } finally {
      setIsSyncing(false);
      loadDataStats();
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast thông báo đồng bộ */}
      {syncToast && (
        <div className="p-3 bg-slate-900 text-white text-sm rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>{syncToast}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="text-xs text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-vku-blue via-blue-700 to-blue-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-2 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>VKU Mini-Project PWA</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight leading-snug mb-2">
          VKU Food Survey PWA
        </h1>
        <p className="text-blue-100 text-xs leading-relaxed opacity-90 mb-4">
          Khảo sát chất lượng món ăn & căng tin sinh viên VKU. Hoạt động mượt mà
          ngay cả khi mất mạng (Offline-first) và tự động đồng bộ khi có Internet.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/survey"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-vku-orange hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95"
          >
            <ClipboardPenLine className="w-4 h-4" />
            <span>Khảo sát ngay</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition border border-white/20 active:scale-95"
          >
            <History className="w-4 h-4" />
            <span>Lịch sử ({totalCount})</span>
          </Link>
        </div>
      </div>

      {/* Card Trạng thái mạng */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Trạng thái kết nối
        </div>
        <NetworkStatus />
      </div>

      {/* Thẻ thống kê Khảo sát */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bộ nhớ cục bộ (IndexedDB)
          </span>
          {pendingCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="text-xs font-semibold text-vku-blue flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span>Đồng bộ ngay</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card Đang chờ */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                Đang chờ đồng bộ
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  pendingCount > 0
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  pendingCount > 0 ? 'text-amber-600' : 'text-slate-800'
                }`}
              >
                {pendingCount}
              </span>
              <span className="text-[11px] text-slate-500">khảo sát</span>
            </div>
          </div>

          {/* Card Đã đồng bộ */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                Đã đồng bộ
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">
                {syncedCount}
              </span>
              <span className="text-[11px] text-slate-500">khảo sát</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tính năng nổi bật của PWA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-vku-blue" />
          <span>Đặc điểm đồ án PWA</span>
        </div>
        <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <div>
              <strong className="text-slate-800">Cài đặt dễ dàng:</strong> Cài
              đặt trực tiếp lên màn hình chính (Standalone app).
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <div>
              <strong className="text-slate-800">Offline-first:</strong> Mất mạng
              vẫn điền khảo sát bình thường, dữ liệu lưu an toàn trong IndexedDB
              (Dexie).
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <div>
              <strong className="text-slate-800">Tự động đồng bộ:</strong> Khi
              có mạng trở lại, hệ thống tự động đẩy dữ liệu lên NestJS và
              MongoDB.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <div>
              <strong className="text-slate-800">Chống trùng lặp:</strong> Định
              danh mỗi khảo sát bằng UUID <code className="text-blue-600 font-mono">clientId</code> duy nhất.
            </div>
          </div>
        </div>

        <Link
          href="/survey"
          className="mt-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
        >
          <span>Bắt đầu khảo sát một món ăn</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </div>
    </div>
  );
}

