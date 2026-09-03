'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      // Ngăn chặn thanh cài đặt mặc định của browser để hiển thị nút tùy biến
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Ứng dụng VKU Food Survey PWA đã được cài đặt thành công!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Lựa chọn người dùng với cài đặt PWA: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-vku-orange text-white hover:bg-orange-700 transition shadow-sm"
      title="Cài đặt PWA lên màn hình chính"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Cài App</span>
    </button>
  );
}

