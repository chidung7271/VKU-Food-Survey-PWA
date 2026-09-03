import { SurveyData } from '@/lib/types';
import { reportNetworkFailure, reportNetworkSuccess, getIsOnline } from '@/lib/network';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Gửi dữ liệu khảo sát lên NestJS backend
 */
export async function submitSurveyToApi(survey: SurveyData): Promise<{
  success: boolean;
  message: string;
  data?: any;
  isDuplicate?: boolean;
}> {
  // Nếu đang ở chế độ offline, ném lỗi mạng ngay lập tức để chuyển sang IndexedDB
  if (!getIsOnline()) {
    throw new Error('Thiết bị đang ở chế độ Offline.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(survey),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Lỗi server HTTP status: ${response.status}`,
      );
    }

    reportNetworkSuccess();
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Báo hiệu mất mạng để cập nhật badge Offline ngay
    reportNetworkFailure();

    if (error.name === 'AbortError') {
      throw new Error('Hết thời gian chờ phản hồi từ máy chủ (Timeout).');
    }
    throw error;
  }
}

/**
 * Lấy danh sách toàn bộ khảo sát từ server
 */
export async function fetchSurveysFromApi(): Promise<SurveyData[]> {
  if (!getIsOnline()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    reportNetworkSuccess();
    return json.data || [];
  } catch (error) {
    reportNetworkFailure();
    console.warn('Không thể tải khảo sát từ server:', error);
    return [];
  }
}
