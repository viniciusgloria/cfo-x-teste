import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // focus first element marked with [autofocus], otherwise first focusable, otherwise focus the dialog itself
    const auto = dialog.querySelector('[autofocus]') as HTMLElement | null;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = auto || (focusable.length ? focusable[0] : null);
    if (first) {
      first.focus();
    } else {
      // ensure the dialog is focusable and focus it as a fallback
      try {
        dialog.focus();
      } catch (e) {
        /* ignore */
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      if (e.key === 'Tab') {
        // basic focus trap
        const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ));
        if (nodes.length === 0) {
          e.preventDefault();
          // fallback: focus the dialog container so keyboard users still have context
          try { dialog.focus(); } catch (err) { /* ignore */ }
          return;
        }
        const firstNode = nodes[0];
        const lastNode = nodes[nodes.length - 1];
        if (!e.shiftKey && document.activeElement === lastNode) {
          e.preventDefault();
          firstNode.focus();
        }
        if (e.shiftKey && document.activeElement === firstNode) {
          e.preventDefault();
          lastNode.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    // prevent background from scrolling
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      // restore focus
      try { lastActiveElementRef.current?.focus(); } catch (e) { /* ignore */ }
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-content"
        ref={dialogRef}
        tabIndex={-1}
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>
        <div id="modal-content" className="p-4 sm:p-6 text-gray-800 dark:text-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
