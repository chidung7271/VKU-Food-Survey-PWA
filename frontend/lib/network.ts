'use client';

import { useEffect, useState } from 'react';

// Trạng thái lưu trữ module-level để đồng bộ giữa các component
let globalIsOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let globalIsManualOffline = false;
const listeners = new Set<(online: boolean) => void>();

function notifyAll() {
  const currentStatus = globalIsManualOffline ? false : globalIsOnline;
  listeners.forEach((fn) => fn(currentStatus));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vku-network-change', {
        detail: { isOnline: currentStatus },
      }),
    );
  }
}

/**
 * Thử nghiệm kết nối mạng thực tế bằng ping probe (Network-Only)
 */
export async function probeConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (globalIsManualOffline) return false;

  // Nếu navigator báo offline thì chắc chắn offline
  if (!navigator.onLine) {
    if (globalIsOnline !== false) {
      globalIsOnline = false;
      notifyAll();
    }
    return false;
  }

  // Probe kết nối thực tế tới /api/ping (bỏ qua Service Worker cache)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`/api/ping?_t=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);

    const isSuccess = res.status >= 200 && res.status < 400;
    if (globalIsOnline !== isSuccess) {
      globalIsOnline = isSuccess;
      notifyAll();
    }
    return isSuccess;
  } catch (err) {
    // Khi DevTools Network chuyển sang Offline, request này sẽ bị chặn ngay lập tức
    if (globalIsOnline !== false) {
      globalIsOnline = false;
      notifyAll();
    }
    return false;
  }
}

/**
 * Báo hiệu mất mạng từ các tác vụ khác (như API gọi thất bại)
 */
export function reportNetworkFailure() {
  if (globalIsOnline !== false) {
    globalIsOnline = false;
    notifyAll();
  }
}

/**
 * Báo hiệu có mạng trở lại từ các tác vụ khác (như API gọi thành công)
 */
export function reportNetworkSuccess() {
  if (!globalIsManualOffline && globalIsOnline !== true) {
    globalIsOnline = true;
    notifyAll();
  }
}

/**
 * Bật/tắt chế độ Offline giả lập để test nhanh không cần DevTools
 */
export function toggleManualOffline(): boolean {
  globalIsManualOffline = !globalIsManualOffline;
  notifyAll();
  return globalIsManualOffline;
}

export function getIsOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return globalIsManualOffline ? false : globalIsOnline;
}

/**
 * React Hook theo dõi trạng thái mạng theo thời gian thực (hỗ trợ cả DevTools Offline & mất mạng thật)
 */
export function useNetwork() {
  const [online, setOnline] = useState<boolean>(getIsOnline());
  const [isManual, setIsManual] = useState<boolean>(globalIsManualOffline);

  useEffect(() => {
    const update = (status: boolean) => {
      setOnline(status);
      setIsManual(globalIsManualOffline);
    };

    listeners.add(update);

    // Lắng nghe sự kiện chuẩn từ trình duyệt
    const handleBrowserOnline = () => {
      globalIsOnline = true;
      notifyAll();
      probeConnection();
    };

    const handleBrowserOffline = () => {
      globalIsOnline = false;
      notifyAll();
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Chạy probe ngay lập tức khi mount
    probeConnection();

    // Heartbeat ping định kỳ mỗi 2.5 giây để phát hiện ngay khi bật/tắt DevTools Network Offline
    const interval = setInterval(() => {
      probeConnection();
    }, 2500);

    return () => {
      listeners.delete(update);
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline: online,
    isManualOffline: isManual,
    toggleOffline: toggleManualOffline,
    checkNow: probeConnection,
  };
}

