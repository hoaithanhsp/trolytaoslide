import React, { useState } from 'react';
import { GeneratedLesson } from '../types';
import { FileDown, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { generateDocx, MathMode } from '../services/docxGenerator';
import { cn } from '../lib/utils';

interface LessonItemProps {
  lesson: GeneratedLesson;
  onRegenerate: () => void;
  mathMode?: MathMode;
}

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, onRegenerate, mathMode = 'omml' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const isWholeLesson = !lesson.info.tiet || lesson.info.tiet <= 0;
  const wordCount = lesson.content.match(/[\p{L}\p{N}]+/gu)?.length || 0;
  const formulaCount = lesson.content.match(/\$\$[\s\S]*?\$\$|\$(?!\$)[^$\n]+\$/g)?.length || 0;
  const outputName = isWholeLesson
    ? `Giao_an_${lesson.info.noi_dung.replace(/[<>:"/\\|?*]+/g, '_').slice(0, 80)}`
    : `Giao_an_tiet_${String(lesson.info.tiet).padStart(2, '0')}`;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">
              {isWholeLesson ? 'Theo bài' : `Tiết ${lesson.info.tiet}`}
            </span>
            <h5 className="font-bold text-gray-900 dark:text-white truncate">
              {lesson.info.noi_dung}
            </h5>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.info.tuan > 0 ? `Tuần ${lesson.info.tuan} • ` : ''}
            {lesson.info.ngay_day || 'Chưa đặt ngày dạy'}
            {lesson.status === 'completed' && wordCount > 0 ? ` • ${wordCount.toLocaleString('vi-VN')} từ` : ''}
            {lesson.status === 'completed' && formulaCount > 0 ? ` • ${formulaCount} công thức` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lesson.status === 'generating' && (
            <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Đang soạn...</span>
            </div>
          )}
          
          {lesson.status === 'completed' && (
            <>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showPreview 
                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-teal-600"
                )}
                title={showPreview ? "Ẩn preview" : "Xem preview"}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={onRegenerate}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-teal-600 transition-colors"
                title="Soạn lại"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => generateDocx(lesson.content, outputName, mathMode as MathMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Tải DOCX</span>
              </button>
            </>
          )}

          {lesson.status === 'error' && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Lỗi
              <button onClick={onRegenerate} className="underline ml-1">Thử lại</button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      {showPreview && lesson.status === 'completed' && lesson.content && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview nội dung
            </h6>
            <button 
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Đóng
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
            <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 font-[Inter,sans-serif] leading-relaxed">
              {lesson.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
