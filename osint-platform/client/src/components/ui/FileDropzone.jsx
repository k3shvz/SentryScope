import { useCallback, useRef, useState } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import clsx from 'clsx';

export default function FileDropzone({ accept, file, onFileSelect, onClear, hint }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileSelect(dropped);
    },
    [onFileSelect]
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <FiFile size={16} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text font-medium truncate">{file.name}</p>
          <p className="text-xs text-text-faint">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onClear}
          className="text-text-faint hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors flex-shrink-0"
          aria-label="Remove file"
        >
          <FiX size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
        dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30 hover:bg-white/[0.01]'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
        }}
      />
      <FiUploadCloud size={28} className="text-text-faint mx-auto mb-3" />
      <p className="text-sm text-text font-medium">Drop a file here, or click to browse</p>
      {hint && <p className="text-xs text-text-faint mt-1.5">{hint}</p>}
    </div>
  );
}
