'use client';

import { db, getAllSurveys } from '@/lib/db';
import { LocalSurvey, SurveySyncStatus } from '@/lib/types';
import { syncPendingSurveys } from '@/services/sync';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Inbox,
    MapPin,
    RefreshCw,
    Sparkles,
    Star,
    Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [surveys, setSurveys] = useState<LocalSurvey[]>([]);
  const [filter, setFilter] = useState<'all' | SurveySyncStatus>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadSurveys = async () => {
    try {
      const list = await getAllSurveys();
      setSurveys(list);
    } catch (e) {
      console.error('Lỗi khi tải lịch sử khảo sát:', e);
    }
  };

  useEffect(() => {
    loadSurveys();

    const handleSyncFinished = (e: any) => {
      loadSurveys();
      if (e.detail) {
        setToastMessage(
          `Đã đồng bộ thành công ${e.detail.synced}/${e.detail.total} khảo sát!`,
        );
        setTimeout(() => setToastMessage(null), 4000);
      }
    };

    window.addEventListener('surveys-synced', handleSyncFinished);
    return () => {
      window.removeEventListener('surveys-synced', handleSyncFinished);
    };
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingSurveys();
      if (res.total === 0) {
        setToastMessage('Không có khảo sát nào cần đồng bộ.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } finally {
      setIsSyncing(false);
      loadSurveys();
    }
  };

  const handleClearDemoData = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu khảo sát local để demo lại?')) {
      await db.surveys.clear();
      loadSurveys();
      setToastMessage('Đã làm trống cơ sở dữ liệu IndexedDB local!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const pendingCount = surveys.filter((s) => s.status === 'pending').length;

  const renderStatusBadge = (status: SurveySyncStatus) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã đồng bộ</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Đang chờ đồng bộ</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Đồng bộ thất bại</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              Lịch sử khảo sát
            </h1>
            <p className="text-xs text-slate-500">
              Tổng số: {surveys.length} bản ghi trên thiết bị
            </p>
          </div>
        </div>

        {/* Nút Đồng bộ ngay */}
        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-1.5 py-2 px-3 bg-vku-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50 shadow-sm"
          title="Đồng bộ ngay lên Backend"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
          />
          <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ'}</span>
        </button>
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          Tất cả ({surveys.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
            filter === 'pending'
              ? 'bg-white text-amber-700 shadow-sm font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <span>Chờ gửi</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('synced')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === 'synced'
              ? 'bg-white text-emerald-700 shadow-sm font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          Đã đồng bộ
        </button>
      </div>

      {/* Danh sách khảo sát */}
      {filteredSurveys.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-700">
            Chưa có khảo sát nào
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Hãy thực hiện khảo sát món ăn đầu tiên của bạn để xem dữ liệu tại đây.
          </p>
          <Link
            href="/survey"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-vku-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khảo sát ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSurveys.map((item) => {
            const isExpanded = expandedId === item.id;
            const dateStr = new Date(item.createdAt).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <div
                key={item.clientId}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <div
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id ?? null)
                  }
                  className="p-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.data.foodName}
                    </h3>
                    {renderStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.data.overallRating}/5 sao</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {item.data.price?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-0.5 text-vku-blue font-semibold">
                      {isExpanded ? (
                        <>
                          <span>Thu gọn</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Chi tiết</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Chi tiết khảo sát khi mở rộng */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 bg-slate-50/80 border-t border-slate-100 text-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-vku-blue" />
                      <span>
                        <strong>Địa điểm:</strong> {item.data.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Tag className="w-3.5 h-3.5 text-vku-blue" />
                      <span>
                        <strong>Loại món:</strong> {item.data.category}
                      </span>
                    </div>

                    {/* Bảng điểm chi tiết 5 tiêu chí */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        Hương vị:{' '}
                        <strong className="text-amber-600">
                          {item.data.tasteRating}★
                        </strong>
                      </div>
                      <div>
                        Giá cả:{' '}
                        <strong className="text-amber-600">
                          {item.data.priceRating}★
                        </strong>
                      </div>
                      <div>
                        Vệ sinh:{' '}
                        <strong className="text-amber-600">
                          {item.data.hygieneRating}★
                        </strong>
                      </div>
                      <div>
                        Chất lượng:{' '}
                        <strong className="text-amber-600">
                          {item.data.qualityRating}★
                        </strong>
                      </div>
                    </div>

                    {item.data.comment && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 italic">
                        &quot;{item.data.comment}&quot;
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono break-all pt-1">
                      clientId: {item.clientId}
                    </div>

                    {item.errorMessage && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                        Lỗi: {item.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Nút dọn dẹp data để demo */}
      {surveys.length > 0 && (
        <div className="pt-4 text-center">
          <button
            onClick={handleClearDemoData}
            className="text-[11px] text-slate-400 hover:text-red-500 transition underline"
          >
            Làm trống dữ liệu trên thiết bị (Reset Demo)
          </button>
        </div>
      )}
    </div>
  );
}

