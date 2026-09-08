import React, { useState } from 'react';
import { PenLine, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ManualLessonEntry {
  loai: 'tiet' | 'bai';
  tiet: string;           // Số tiết (cho loại 'tiet')
  tenBai: string;         // Tên bài (cho loại 'bai')
  noiDung: string;        // Nội dung chi tiết
  chuDe: string;
  thoiLuong: string;      // Thời lượng: "1", "2", "3"... (cho loại 'bai')
}

interface ManualLessonInputProps {
  entries: ManualLessonEntry[];
  onChange: (entries: ManualLessonEntry[]) => void;
}

export const ManualLessonInput: React.FC<ManualLessonInputProps> = ({
  entries,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'bai' | 'tiet'>(() => {
    // Detect mode from existing entries
    if (entries.length > 0) return entries[0].loai;
    return 'bai';
  });

  const addEntry = () => {
    onChange([...entries, { loai: mode, tiet: '', tenBai: '', noiDung: '', chuDe: '', thoiLuong: '2' }]);
    setIsExpanded(true);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ManualLessonEntry, value: string) => {
    const updated = entries.map((e, i) => i === index ? { ...e, [field]: value } : e);
    onChange(updated);
  };

  const handleModeChange = (newMode: 'bai' | 'tiet') => {
    if (newMode === mode) return;
    setMode(newMode);
    // Clear entries when switching mode
    onChange([]);
  };

  const validCount = entries.filter(e =>
    e.loai === 'bai' ? e.tenBai?.trim() : e.tiet?.trim()
  ).length;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-violet-500" />
          <span className="font-black text-base" style={{ color: '#e53e3e', textShadow: '1px 1px 0 #feb2b2, 2px 2px 0 #fc8181, 3px 3px 6px rgba(229,62,62,0.3)' }}>Khai báo bài học / tiết học</span>
          {validCount > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs font-bold">
              {validCount} mục
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">Tùy chọn — ưu tiên hơn file kế hoạch</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
            <button
              onClick={() => handleModeChange('bai')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all",
                mode === 'bai'
                  ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              📖 Soạn theo bài
            </button>
            <button
              onClick={() => handleModeChange('tiet')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all",
                mode === 'tiet'
                  ? "bg-white dark:bg-gray-900 text-violet-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              📋 Soạn theo tiết
            </button>
          </div>

          {/* Mode Description */}
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2.5 border border-violet-100 dark:border-violet-800">
            {mode === 'bai' ? (
              <>
                💡 <strong>Soạn theo bài:</strong> Khai báo tên bài học, nội dung chi tiết, và thời lượng.
                Thời lượng càng nhiều thì giáo án càng cụ thể, dài hơn, nhiều hoạt động hơn.
              </>
            ) : (
              <>
                💡 <strong>Soạn theo tiết:</strong> Khai báo số tiết và nội dung cho từng tiết cụ thể.
                Mỗi tiết sẽ được soạn thành 1 giáo án riêng.
              </>
            )}
          </p>

          {/* Entries */}
          {entries.map((entry, idx) => (
            <div key={idx} className={cn(
              "bg-white dark:bg-gray-900 rounded-xl border p-3 space-y-2",
              mode === 'bai'
                ? "border-emerald-200 dark:border-emerald-800"
                : "border-violet-200 dark:border-violet-800"
            )}>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-bold",
                  mode === 'bai'
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-violet-600 dark:text-violet-400"
                )}>
                  {mode === 'bai' ? `📖 Bài học #${idx + 1}` : `📋 Tiết học #${idx + 1}`}
                </span>
                <button
                  onClick={() => removeEntry(idx)}
                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {mode === 'bai' ? (
                /* === CHẾ ĐỘ SOẠN THEO BÀI === */
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">
                      Tên bài <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.tenBai}
                      onChange={(e) => updateEntry(idx, 'tenBai', e.target.value)}
                      placeholder="VD: Bài 1: Tính đơn điệu và cực trị của hàm số"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Nội dung chi tiết (tùy chọn)</label>
                    <textarea
                      value={entry.noiDung}
                      onChange={(e) => updateEntry(idx, 'noiDung', e.target.value)}
                      placeholder="VD: Khái niệm hàm số đơn điệu, cực trị. Cách tìm cực trị bằng đạo hàm..."
                      rows={3}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y",
                        entry.noiDung.trim()
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Thời lượng</label>
                    <select
                      value={entry.thoiLuong || '2'}
                      onChange={(e) => updateEntry(idx, 'thoiLuong', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="1">1 tiết</option>
                      <option value="2">2 tiết</option>
                      <option value="3">3 tiết</option>
                      <option value="4">4 tiết</option>
                      <option value="5">5 tiết</option>
                      <option value="6">6 tiết</option>
                      <option value="7">7 tiết</option>
                      <option value="8">8 tiết</option>
                      <option value="9">9 tiết</option>
                      <option value="10">10 tiết</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* === CHẾ ĐỘ SOẠN THEO TIẾT === */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">
                      Tiết học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.tiet}
                      onChange={(e) => updateEntry(idx, 'tiet', e.target.value)}
                      placeholder="VD: 30, 31"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Nội dung tiết học</label>
                    <input
                      type="text"
                      value={entry.noiDung}
                      onChange={(e) => updateEntry(idx, 'noiDung', e.target.value)}
                      placeholder="VD: Chạy cự ly ngắn 100m"
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-violet-500",
                        entry.noiDung.trim()
                          ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={addEntry}
            className={cn(
              "w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === 'bai'
                ? "border-emerald-200 dark:border-emerald-800 text-gray-500 hover:text-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-700"
                : "border-violet-200 dark:border-violet-700 text-gray-500 hover:text-violet-600 hover:border-violet-300 dark:hover:border-violet-600"
            )}
          >
            <Plus className="w-4 h-4" />
            {mode === 'bai' ? 'Thêm bài học' : 'Thêm tiết học'}
          </button>
        </div>
      )}
    </div>
  );
};
