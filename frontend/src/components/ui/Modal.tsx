'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  /** "drawer" slides in from the right edge instead of centring. */
  variant?: 'dialog' | 'drawer';
}

const WIDTHS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  variant = 'dialog',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const first = panelRef.current.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
      first?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const drawer = variant === 'drawer';

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-ink/35 backdrop-blur-[2px] ${drawer ? 'justify-end' : 'items-center justify-center p-4'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={panelRef}
        className={
          drawer
            ? `flex h-full w-full ${WIDTHS[size]} flex-col overflow-y-auto border-l border-line bg-paper animate-[drawer-in_0.28s_cubic-bezier(0.2,0.7,0.2,1)]`
            : `w-full ${WIDTHS[size]} max-h-[90vh] overflow-y-auto rounded-[26px] border border-line bg-paper shadow-[0_30px_80px_-30px_rgba(23,34,27,0.5)] animate-[pop-in_0.22s_ease-out]`
        }
      >
        {(title || showCloseButton) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper/95 px-6 py-5 backdrop-blur">
            <div>
              {title && (
                <h2 id="modal-title" className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-mute">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                data-close
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
