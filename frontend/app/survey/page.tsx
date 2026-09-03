'use client';

import StarRating from '@/components/StarRating';
import { addSurvey } from '@/lib/db';
import { getIsOnline } from '@/lib/network';
import { SurveyData } from '@/lib/types';
import { submitSurveyToApi } from '@/services/api';
import { registerBackgroundSync } from '@/services/sync';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    DollarSign,
    HardDriveDownload,
    MapPin,
    MessageSquare,
    Send,
    Tag,
    Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Danh sách căng tin / địa điểm tại VKU
const LOCATIONS = [
  'Căng tin Khu A (Tòa nhà đa năng)',
  'Căng tin Khu V',
  'Căng tin Ký túc xá VKU',
  'Cổng trường VKU (Cổng chính)',
  'Quán ăn đối diện trường VKU',
  'Khác',
];

// Danh mục loại món ăn
const CATEGORIES = [
  'Cơm (Cơm tấm, cơm sườn, cơm phần)',
  'Bún / Phở / Mì / Hủ tiếu',
  'Bánh mì / Bánh bao / Xôi',
  'Đồ ăn vặt / Chiên rán',
  'Nước giải khát / Trà sữa / Cà phê',
  'Tráng miệng / Chè / Trái cây',
  'Khác',
];

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return (
    'vku-' +
    Math.random().toString(36).substring(2, 10) +
    '-' +
    Date.now().toString(36)
  );
}

export default function SurveyPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    foodName: '',
    location: LOCATIONS[0],
    category: CATEGORIES[0],
    tasteRating: 5,
    priceRating: 4,
    hygieneRating: 5,
    qualityRating: 5,
    overallRating: 5,
    price: '',
    comment: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'online' | 'offline';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmissionFeedback(null);

    // Validation cơ bản
    if (!formData.foodName.trim()) {
      setErrorMessage('Vui lòng nhập tên món ăn.');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Giá món ăn không hợp lệ (phải >= 0 đ).');
      return;
    }

    setIsSubmitting(true);

    const surveyPayload: SurveyData = {
      clientId: generateUuid(),
      foodName: formData.foodName.trim(),
      location: formData.location,
      category: formData.category,
      tasteRating: formData.tasteRating,
      priceRating: formData.priceRating,
      hygieneRating: formData.hygieneRating,
      qualityRating: formData.qualityRating,
      overallRating: formData.overallRating,
      price: priceNum,
      comment: formData.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const isOnline = getIsOnline();

    if (isOnline) {
      // 1. ONLINE FLOW: Thử gửi trực tiếp lên NestJS Backend
      try {
        await submitSurveyToApi(surveyPayload);
        // Lưu lại bản sao đã đồng bộ vào IndexedDB
        await addSurvey(surveyPayload, 'synced');

        setSubmissionFeedback({
          type: 'online',
          message: 'Đã gửi khảo sát thành công.',
        });

        // Reset form
        resetForm();
      } catch (apiError: any) {
        console.warn(
          'Gửi online thất bại (mạng chập chờn), chuyển sang lưu offline IndexedDB:',
          apiError,
        );
        // Fallback: Lưu vào IndexedDB dạng pending
        await addSurvey(surveyPayload, 'pending', apiError.message);
        registerBackgroundSync();

        setSubmissionFeedback({
          type: 'offline',
          message:
            'Đã lưu khảo sát trên thiết bị. Khảo sát sẽ được đồng bộ khi có mạng.',
        });
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 2. OFFLINE FLOW: Lưu vào IndexedDB
      try {
        await addSurvey(surveyPayload, 'pending');
        registerBackgroundSync();

        setSubmissionFeedback({
          type: 'offline',
          message:
            'Đã lưu khảo sát trên thiết bị. Khảo sát sẽ được đồng bộ khi có mạng.',
        });
        resetForm();
      } catch (dbError: any) {
        console.error('Lỗi khi lưu vào IndexedDB:', dbError);
        setErrorMessage('Không thể lưu vào IndexedDB: ' + dbError.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      foodName: '',
      location: LOCATIONS[0],
      category: CATEGORIES[0],
      tasteRating: 5,
      priceRating: 4,
      hygieneRating: 5,
      qualityRating: 5,
      overallRating: 5,
      price: '',
      comment: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Form */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">
            Khảo sát món ăn VKU
          </h1>
          <p className="text-xs text-slate-500">
            Đánh giá bữa ăn hôm nay của bạn tại trường
          </p>
        </div>
      </div>

      {/* Thông báo kết quả gửi thành công */}
      {submissionFeedback && (
        <div
          className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 transition-all ${
            submissionFeedback.type === 'online'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {submissionFeedback.type === 'online' ? (
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <HardDriveDownload className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-bold text-sm">
              {submissionFeedback.type === 'online'
                ? 'Gửi trực tuyến thành công!'
                : 'Đã lưu ngoại tuyến (Offline)!'}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed">
              {submissionFeedback.message}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => setSubmissionFeedback(null)}
                className="text-xs font-semibold underline"
              >
                Gửi tiếp khảo sát khác
              </button>
              <span className="text-xs opacity-50">•</span>
              <Link
                href="/history"
                className="text-xs font-semibold text-vku-blue underline"
              >
                Xem trong Lịch sử
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo lỗi validation */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form khảo sát */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Tên món ăn */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-vku-blue" />
            <span>Tên món ăn</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Cơm sườn nướng, Bún chả cá..."
            value={formData.foodName}
            onChange={(e) =>
              setFormData({ ...formData, foodName: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vku-blue/30 focus:border-vku-blue transition"
          />
        </div>

        {/* 2. Địa điểm / Căng tin */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-vku-blue" />
            <span>Địa điểm / Căng tin</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vku-blue/30 focus:border-vku-blue transition"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Loại món ăn */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-vku-blue" />
            <span>Loại món ăn</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vku-blue/30 focus:border-vku-blue transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Các mục đánh giá (1-5 sao) */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Đánh giá chất lượng (1 – 5 sao)
          </div>

          <StarRating
            label="1. Đánh giá Hương vị"
            value={formData.tasteRating}
            onChange={(val) => setFormData({ ...formData, tasteRating: val })}
            required
          />

          <StarRating
            label="2. Đánh giá Giá cả"
            value={formData.priceRating}
            onChange={(val) => setFormData({ ...formData, priceRating: val })}
            required
          />

          <StarRating
            label="3. Đánh giá Vệ sinh an toàn"
            value={formData.hygieneRating}
            onChange={(val) => setFormData({ ...formData, hygieneRating: val })}
            required
          />

          <StarRating
            label="4. Đánh giá Phục vụ & Chất lượng"
            value={formData.qualityRating}
            onChange={(val) => setFormData({ ...formData, qualityRating: val })}
            required
          />

          <StarRating
            label="5. Đánh giá Tổng thể"
            value={formData.overallRating}
            onChange={(val) => setFormData({ ...formData, overallRating: val })}
            required
          />
        </div>

        {/* 5. Giá món ăn */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-vku-blue" />
            <span>Giá món ăn (VNĐ)</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              step="1000"
              placeholder="Ví dụ: 25000"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vku-blue/30 focus:border-vku-blue transition pr-12"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
              VNĐ
            </span>
          </div>
        </div>

        {/* 6. Nhận xét */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-vku-blue" />
            <span>Nhận xét chi tiết (Góp ý)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Bạn có góp ý gì về khẩu phần, độ nóng, thái độ phục vụ...?"
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vku-blue/30 focus:border-vku-blue transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-vku-blue hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Đang xử lý khảo sát...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Gửi khảo sát ngay</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

