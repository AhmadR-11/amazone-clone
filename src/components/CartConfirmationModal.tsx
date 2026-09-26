'use client';

import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmationItem {
  asin: string;
  title: string;
  image: string;
  price?: number;
  color?: string;
  size?: string;
  quantity?: number;
}

interface CartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'item' | 'clear';
  item?: ConfirmationItem | null;
  totalCount?: number;
}

export default function CartConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  item,
  totalCount = 0,
}: CartConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 sm:p-7 overflow-hidden z-10 text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          {type === 'clear' ? <AlertTriangle className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
        </div>

        {/* Content */}
        {type === 'clear' ? (
          <div>
            <h3 id="modal-title" className="text-lg font-extrabold text-slate-900 font-display mb-1.5">
              Clear Entire Shopping Bag?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Are you sure you want to remove all <span className="font-bold text-slate-900">{totalCount} {totalCount === 1 ? 'item' : 'items'}</span> from your shopping bag? This action cannot be undone.
            </p>
          </div>
        ) : (
          <div>
            <h3 id="modal-title" className="text-lg font-extrabold text-slate-900 font-display mb-1.5">
              Remove Product from Bag?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to remove this item from your shopping bag?
            </p>

            {/* Product Card Preview */}
            {item && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-white rounded-xl border border-slate-200/80 p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-0.5">
                    {item.title}
                  </h4>
                  {(item.color || item.size) && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.color && <span>Color: {item.color} </span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </p>
                  )}
                  {item.price !== undefined && (
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{type === 'clear' ? 'Clear Bag' : 'Remove Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
