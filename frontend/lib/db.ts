import Dexie, { type Table } from 'dexie';
import { LocalSurvey, SurveyData, SurveySyncStatus } from './types';

export class SurveyDatabase extends Dexie {
  surveys!: Table<LocalSurvey, number>;

  constructor() {
    super('surveyDB');
    this.version(1).stores({
      surveys: '++id, clientId, status, createdAt',
    });
  }
}

export const db = new SurveyDatabase();

/**
 * Thêm một khảo sát mới vào IndexedDB
 */
export async function addSurvey(
  data: SurveyData,
  status: SurveySyncStatus = 'pending',
  errorMessage?: string,
): Promise<LocalSurvey> {
  const localRecord: LocalSurvey = {
    clientId: data.clientId,
    data,
    status,
    createdAt: data.createdAt || new Date().toISOString(),
    errorMessage,
  };

  // Kiểm tra xem đã tồn tại clientId này trong IndexedDB chưa
  const existing = await db.surveys.where('clientId').equals(data.clientId).first();
  if (existing && existing.id) {
    await db.surveys.update(existing.id, {
      status,
      data,
      errorMessage,
    });
    return { ...existing, status, data, errorMessage };
  }

  const id = await db.surveys.add(localRecord);
  return { ...localRecord, id };
}

/**
 * Lấy danh sách các khảo sát đang chờ đồng bộ (status = pending hoặc failed)
 */
export async function getPendingSurveys(): Promise<LocalSurvey[]> {
  return db.surveys
    .where('status')
    .anyOf(['pending', 'failed'])
    .toArray();
}

/**
 * Lấy tất cả các khảo sát đã lưu trong IndexedDB cục bộ (mới nhất lên đầu)
 */
export async function getAllSurveys(): Promise<LocalSurvey[]> {
  const list = await db.surveys.toArray();
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Đánh dấu khảo sát là đã đồng bộ thành công lên server
 */
export async function markAsSynced(clientId: string): Promise<void> {
  const item = await db.surveys.where('clientId').equals(clientId).first();
  if (item && item.id) {
    await db.surveys.update(item.id, {
      status: 'synced',
      errorMessage: undefined,
    });
  }
}

/**
 * Đánh dấu khảo sát đồng bộ thất bại (để thử lại lần sau)
 */
export async function markAsFailed(clientId: string, errorMessage?: string): Promise<void> {
  const item = await db.surveys.where('clientId').equals(clientId).first();
  if (item && item.id) {
    await db.surveys.update(item.id, {
      status: 'failed',
      errorMessage: errorMessage || 'Lỗi kết nối máy chủ',
    });
  }
}

/**
 * Đếm số lượng khảo sát đang chờ đồng bộ
 */
export async function countPendingSurveys(): Promise<number> {
  return db.surveys.where('status').equals('pending').count();
}

