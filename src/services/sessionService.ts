/**
 * Session & History Storage Service
 * Lưu phiên làm việc + lịch sử sinh giáo án vào localStorage
 */

import { GeneratedLesson, LessonInfo, GenerationStep, StandardStructure } from '../types';

export interface SessionData {
  /** Timestamp tạo phiên */
  createdAt: string;
  /** Timestamp cập nhật cuối */
  updatedAt: string;
  /** Cấu trúc giáo án mẫu đã phân tích */
  sampleStructure: string;
  /** Danh sách tiết đã trích xuất */
  extractedLessons: LessonInfo[];
  /** Danh sách giáo án đã sinh (content + status) */
  lessons: GeneratedLesson[];
  /** Trạng thái các bước */
  steps: GenerationStep[];
  /** Các index đã chọn */
  selectedIndices: number[];
  /** Cấu trúc 5512 đã chọn (nếu có) */
  standardStructure?: StandardStructure;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  /** Thông tin cấu hình */
  subject: string;
  schoolLevel: string;
  classLevel: string;
  lessonType: string;
  standardStructure?: StandardStructure;
  /** Tổng số tiết */
  totalLessons: number;
  /** Số tiết đã hoàn thành */
  completedLessons: number;
  /** Danh sách tiết (chỉ lưu info + content, không lưu file) */
  lessons: GeneratedLesson[];
}

const SESSION_KEY = 'current_session';
const HISTORY_KEY = 'generation_history';
const MAX_HISTORY = 20;

// ============ SESSION ============

/**
 * Lưu phiên làm việc hiện tại
 */
export function saveSession(data: Partial<SessionData>): void {
  try {
    const existing = loadSession();
    const merged: SessionData = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    } as SessionData;
    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
}

/**
 * Tải phiên làm việc đã lưu
 */
export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Xóa phiên làm việc hiện tại
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ============ HISTORY ============

/**
 * Lưu kết quả vào lịch sử
 */
export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): void {
  try {
    const history = loadHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    // Prepend (newest first), cap at MAX_HISTORY
    history.unshift(newEntry);
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

/**
 * Tải lịch sử
 */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Xóa 1 mục trong lịch sử
 */
export function removeFromHistory(id: string): void {
  const history = loadHistory().filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Xóa toàn bộ lịch sử
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Format thời gian tương đối (vd: "5 phút trước", "hôm qua")
 */
export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Lấy tên loại giáo án hiển thị
 */
export function getLessonTypeName(type: string, standardStructure?: string): string {
  switch (type) {
    case 'ncbh': return 'NCBH';
    case 'stem': return 'STEM';
    default:
      if (standardStructure === 'structure2') return 'KHBD 5512 (Cấu trúc 2)';
      if (standardStructure === 'structure1') return 'KHBD 5512 (Cấu trúc 1)';
      return 'KHBD 5512';
  }
}
