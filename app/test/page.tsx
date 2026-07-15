"use client";

import { useCallback, useState } from "react";
import { UploadCloud, FileImage, X, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
const MAX_MB = 10;

export default function UploadZone({
  onFileSelect,
  disabled,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!ALLOWED.includes(file.type))
      return `Unsupported format. Please upload a JPEG, PNG, WebP or TIFF.`;
    if (file.size > MAX_MB * 1024 * 1024)
      return `File too large. Maximum size is ${MAX_MB}MB.`;
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setFileError(err);
        return;
      }
      setFileError(null);
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    setFileError(null);
  };

  return (
    <div className="w-full">
      {/* Preview state */}
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-300 bg-gray-50">
          <img
            src={preview}
            alt="Certificate preview"
            className="w-full max-h-[420px] object-contain bg-gray-100"
          />
          {!disabled && (
            <button
              onClick={clear}
              className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-red-50 hover:border-red-300 transition"
              title="Remove"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          {fileName && (
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
              <FileImage className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">{fileName}</span>
            </div>
          )}
        </div>
      ) : (
        // Drop zone
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            flex flex-col items-center justify-center gap-4 w-full min-h-[280px]
            rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
            ${
              disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : dragging
                ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40"
            }
          `}
        >
          <input
            type="file"
            accept={ALLOWED.join(",")}
            className="sr-only"
            onChange={onInputChange}
            disabled={disabled}
          />

          <div
            className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${dragging ? "bg-indigo-100" : "bg-white border border-gray-200"}
          `}
          >
            <UploadCloud
              className={`w-7 h-7 ${
                dragging ? "text-indigo-600" : "text-gray-400"
              }`}
            />
          </div>

          <div className="text-center px-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {dragging ? "Drop to analyse" : "Drag & drop certificate here"}
            </p>
            <p className="text-xs text-gray-400">
              or{" "}
              <span className="text-indigo-600 font-medium underline underline-offset-2">
                browse file
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPEG · PNG · WebP · TIFF · Max {MAX_MB}MB
            </p>
          </div>
        </label>
      )}

      {/* Validation error */}
      {fileError && (
        <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fileError}
        </div>
      )}
    </div>
  );
}
