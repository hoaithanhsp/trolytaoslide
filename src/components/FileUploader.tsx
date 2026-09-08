import React, { useRef } from 'react';
import { Upload, FileText, Check, X, Files } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  label: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  required?: boolean;
  /** Enable multi-file mode */
  multiple?: boolean;
  files?: File[];
  onFilesSelect?: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label, description, file, onFileSelect, required,
  multiple, files, onFilesSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Multi-file mode
  if (multiple && onFilesSelect) {
    const fileList = files || [];
    return (
      <div className="space-y-2">
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
            fileList.length > 0
              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10"
              : "border-gray-200 dark:border-gray-800 hover:border-teal-400 dark:hover:border-teal-700"
          )}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept=".docx,.pdf,.png,.jpg,.jpeg,.webp"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              if (selected.length > 0) {
                onFilesSelect([...fileList, ...selected]);
              }
              // Reset input so same files can be re-selected
              if (inputRef.current) inputRef.current.value = '';
            }}
          />

          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              fileList.length > 0
                ? "bg-teal-100 text-teal-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500"
            )}>
              {fileList.length > 0
                ? <Files className="w-6 h-6" />
                : <Upload className="w-6 h-6" />
              }
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {label}
                {required && fileList.length === 0 && <span className="text-red-500 text-xs font-normal">* Bắt buộc</span>}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fileList.length > 0
                  ? `${fileList.length} file đã chọn — bấm để thêm`
                  : description
                }
              </p>
            </div>
          </div>
        </div>

        {/* File list with remove buttons */}
        {fileList.length > 0 && (
          <div className="space-y-1.5 pl-2">
            {fileList.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group/item">
                <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="truncate flex-1">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilesSelect(fileList.filter((_, i) => i !== idx));
                  }}
                  className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single-file mode (original behavior)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
        file
          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10"
          : "border-gray-200 dark:border-gray-800 hover:border-teal-400 dark:hover:border-teal-700"
      )}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".docx,.pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
        }}
      />

      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          file ? "bg-teal-100 text-teal-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500"
        )}>
          {file ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {label}
            {required && !file && <span className="text-red-500 text-xs font-normal">* Bắt buộc</span>}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{file ? file.name : description}</p>
        </div>

        {file && (
          <div className="text-teal-600">
            <FileText className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
