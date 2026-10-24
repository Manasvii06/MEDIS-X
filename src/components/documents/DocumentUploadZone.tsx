import { useRef, useState } from 'react';
import { UploadIcon, FileTextIcon, ImageIcon, XIcon } from '../common/icons';

interface DocumentUploadZoneProps {
  onFileSelected: (file: File, label: string) => void;
  isUploading?: boolean;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export function DocumentUploadZone({ onFileSelected, isUploading }: DocumentUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [label, setLabel] = useState('Prescription');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    setSelectedFile(file);
    if (!label.trim()) setLabel('Prescription');
  };

  const handleSubmit = () => {
    if (selectedFile && label.trim()) {
      onFileSelected(selectedFile, label.trim());
      setSelectedFile(null);
      setLabel('');
    }
  };

  if (selectedFile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              {selectedFile.type === 'application/pdf' ? <FileTextIcon className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Document type</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Prescription — Cardiology"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-brand-900"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!label.trim() || isUploading}
          className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Processing…' : 'Process Prescription'}
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        dragActive
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
          : 'border-slate-200 bg-slate-50/60 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800/40'
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm dark:bg-slate-800">
        <UploadIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Drag & drop, or <span className="text-brand-600 dark:text-brand-400">browse</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Supports JPG, PNG, or PDF · max 10MB</p>
      </div>
      <input
        ref={inputRef}
        id="prescription-file-input"
        data-testid="prescription-file-input"
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
