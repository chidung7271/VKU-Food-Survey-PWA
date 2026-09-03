import BottomNav from '@/components/BottomNav';
import Navbar from '@/components/Navbar';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VKU Food Survey PWA | Khảo sát ẩm thực VKU',
  description:
    'Ứng dụng khảo sát đồ ăn và căng tin sinh viên Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VKU Food',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-slate-100 text-slate-900 min-h-screen flex flex-col antialiased">
        <ServiceWorkerRegister />
        <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl pb-20 relative">
          <Navbar />
          <main className="flex-1 px-4 py-5">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

