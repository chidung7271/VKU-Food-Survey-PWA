import {
  getPendingSurveys,
  markAsSynced,
  markAsFailed,
} from '@/lib/db';
import { getIsOnline } from '@/lib/network';
import { submitSurveyToApi } from './api';

let isSyncing = false;

export interface SyncResult {
  total: number;
  synced: number;
  failed: number;
  details: { clientId: string; foodName: string; success: boolean; error?: string }[];
}

/**
 * Đồng bộ hóa toàn bộ khảo sát đang chờ (pending / failed) trong IndexedDB lên Backend
 */
export async function syncPendingSurveys(): Promise<SyncResult> {
  if (isSyncing) {
    console.log('Đang trong quá trình đồng bộ, vui lòng chờ...');
    return { total: 0, synced: 0, failed: 0, details: [] };
  }

  if (!getIsOnline()) {
    console.log('Thiết bị đang Offline, không thể đồng bộ.');
    return { total: 0, synced: 0, failed: 0, details: [] };
  }

  isSyncing = true;
  notifySyncStatus(true);

  const pendingList = await getPendingSurveys();
  const result: SyncResult = {
    total: pendingList.length,
    synced: 0,
    failed: 0,
    details: [],
  };

  if (pendingList.length === 0) {
    isSyncing = false;
    notifySyncStatus(false);
    return result;
  }

  console.log(`Bắt đầu đồng bộ ${pendingList.length} khảo sát...`);

  for (const item of pendingList) {
    try {
      await submitSurveyToApi(item.data);
      await markAsSynced(item.clientId);
      result.synced += 1;
      result.details.push({
        clientId: item.clientId,
        foodName: item.data.foodName,
        success: true,
      });
      console.log(`Đã đồng bộ thành công survey: ${item.data.foodName} (${item.clientId})`);
    } catch (err: any) {
      console.error(`Lỗi khi đồng bộ survey ${item.clientId}:`, err.message);
      await markAsFailed(item.clientId, err.message);
      result.failed += 1;
      result.details.push({
        clientId: item.clientId,
        foodName: item.data.foodName,
        success: false,
        error: err.message,
      });
    }
  }

  isSyncing = false;
  notifySyncStatus(false);

  // Phát sự kiện để cập nhật UI danh sách và số lượng pending
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('surveys-synced', {
        detail: result,
      }),
    );
  }

  return result;
}

function notifySyncStatus(syncing: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sync-status-changed', {
        detail: { isSyncing: syncing },
      }),
    );
  }
}

/**
 * Đăng ký Background Sync nếu trình duyệt hỗ trợ
 */
export async function registerBackgroundSync(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'SyncManager' in window
  ) {
    try {
      const reg = await navigator.serviceWorker.ready;
      // @ts-ignore - TypeScript có thể chưa có kiểu SyncManager
      await reg.sync.register('vku-food-sync');
      console.log('Đã đăng ký Background Sync API thành công');
      return true;
    } catch (error) {
      console.warn('Background Sync không khả dụng:', error);
      return false;
    }
  }
  return false;
}

/**
 * Khởi tạo tự động đồng bộ khi người dùng online
 */
export function initAutoSync(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    console.log('Phát hiện kết nối Internet (online) -> Kích hoạt tự động đồng bộ...');
    syncPendingSurveys();
  };

  const handleNetworkChange = (e: any) => {
    if (e.detail?.isOnline) {
      console.log('Network change: Online -> Kích hoạt tự động đồng bộ...');
      syncPendingSurveys();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('vku-network-change', handleNetworkChange);

  // Lắng nghe message từ Service Worker (khi Background Sync kích hoạt)
  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SYNC_NOW') {
      console.log('Nhận tín hiệu đồng bộ từ Service Worker...');
      syncPendingSurveys();
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  }

  // Nếu lúc mở app đang online, thử đồng bộ ngay
  if (getIsOnline()) {
    syncPendingSurveys();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('vku-network-change', handleNetworkChange);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    }
  };
}
