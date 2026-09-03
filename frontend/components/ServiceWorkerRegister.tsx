'use client';

import { initAutoSync, registerBackgroundSync } from '@/services/sync';
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // 1. Đăng ký Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker đăng ký thành công với scope:', registration.scope);
          // Đăng ký Background Sync nếu hỗ trợ
          registerBackgroundSync();
        })
        .catch((error) => {
          console.error('[PWA] Lỗi đăng ký Service Worker:', error);
        });
    }

    // 2. Khởi tạo cơ chế tự động đồng bộ khi có mạng
    const cleanupSync = initAutoSync();

    return () => {
      cleanupSync();
    };
  }, []);

  return null;
}

