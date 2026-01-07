import React, { DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onFiles: (files: FileList | File[]) => void;
  accept?: string;
  children?: React.ReactNode;
}

export function Dropzone({ onFiles, accept = '.pdf,image/*', children }: Props) {
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length) onFiles(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center bg-white dark:bg-gray-800"
    >
      <div className="flex items-center justify-center gap-3">
        <UploadCloud className="text-gray-400" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Arraste e solte arquivos aqui ou clique para selecionar
        </div>
      </div>
      <input
        aria-hidden
        tabIndex={-1}
        type="file"
        accept={accept}
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const files = e.target.files;
          if (files) onFiles(files);
          (e.target as HTMLInputElement).value = '';
        }}
      />
      {children}
    </div>
  );
}
