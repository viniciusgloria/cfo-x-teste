import { useCallback, useMemo, useRef, useState } from 'react';
import { Attachment } from '../types';

export type UploadStatus = 'uploading' | 'done' | 'error';

export interface UploadAttachment extends Attachment {
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface SimulateUploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });

const simulateUpload = (file: File, { onProgress, signal }: SimulateUploadOptions) =>
  new Promise<string>((resolve, reject) => {
    let progress = 0;
    const remoteUrl = `https://files.cfo-hub.local/${randomId()}/${encodeURIComponent(file.name)}`;

    const step = () => {
      if (signal?.aborted) {
        clearInterval(interval);
        reject(new DOMException('Upload cancelado', 'AbortError'));
        return;
      }
      progress = Math.min(100, progress + 10 + Math.random() * 25);
      onProgress?.(Math.min(progress, 99));
      if (progress >= 100) {
        clearInterval(interval);
        onProgress?.(100);
        resolve(remoteUrl);
      }
    };

    const interval = setInterval(step, 180);
    step();

    signal?.addEventListener(
      'abort',
      () => {
        clearInterval(interval);
        reject(new DOMException('Upload cancelado', 'AbortError'));
      },
      { once: true }
    );
  });

export function useAttachmentUploader() {
  const [attachments, setAttachments] = useState<UploadAttachment[]>([]);
  const controllersRef = useRef(new Map<string, AbortController>());

  const MAX_BYTES = 5 * 1024 * 1024; // 5MB per user request
  const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg']);

  const patchAttachment = useCallback((id: string, patch: Partial<UploadAttachment>) => {
    setAttachments((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  const addFile = useCallback(
    async (file: File) => {
      const id = randomId();
      const dataUrl = await fileToDataUrl(file);
      // validate type and size before adding
      const mime = file.type || 'application/octet-stream';
      if (!ALLOWED.has(mime)) {
        const initialErr: UploadAttachment = {
          id,
          name: file.name,
          mimeType: mime,
          size: file.size,
          dataUrl,
          remoteUrl: '',
          progress: 0,
          status: 'error',
          error: 'Tipo de arquivo não permitido',
        };
        setAttachments((prev) => [...prev, initialErr]);
        return;
      }
      if (file.size > MAX_BYTES) {
        const initialErr: UploadAttachment = {
          id,
          name: file.name,
          mimeType: mime,
          size: file.size,
          dataUrl,
          remoteUrl: '',
          progress: 0,
          status: 'error',
          error: 'Arquivo excede 5MB',
        };
        setAttachments((prev) => [...prev, initialErr]);
        return;
      }

      const initial: UploadAttachment = {
        id,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        remoteUrl: '',
        progress: 0,
        status: 'uploading',
        error: undefined,
      };

      setAttachments((prev) => [...prev, initial]);

      const controller = new AbortController();
      controllersRef.current.set(id, controller);

      try {
        const remoteUrl = await simulateUpload(file, {
          signal: controller.signal,
          onProgress: (progress) => patchAttachment(id, { progress }),
        });
        controllersRef.current.delete(id);
        patchAttachment(id, { remoteUrl, progress: 100, status: 'done' });
      } catch (error) {
        controllersRef.current.delete(id);
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        patchAttachment(id, { status: 'error' });
      }
    },
    [patchAttachment]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        void addFile(file);
      });
    },
    [addFile]
  );

  const removeAttachment = useCallback((id: string) => {
    const controller = controllersRef.current.get(id);
    if (controller) {
      controller.abort();
      controllersRef.current.delete(id);
    }
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
    setAttachments([]);
  }, []);

  const readyAttachments = useMemo<Attachment[]>(() => {
    return attachments
      .filter((att) => att.status === 'done' && att.remoteUrl)
      .map(({ progress: _progress, status: _status, ...rest }) => rest);
  }, [attachments]);

  const isUploading = attachments.some((att) => att.status === 'uploading');
  const hasError = attachments.some((att) => att.status === 'error');

  return {
    attachments,
    readyAttachments,
    handleFiles,
    removeAttachment,
    reset,
    isUploading,
    hasError,
  };
}
