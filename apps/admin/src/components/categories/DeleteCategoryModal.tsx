import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  productCount: number;
  hasChildren: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  categoryName,
  productCount,
  hasChildren,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const canDelete = productCount === 0 && !hasChildren;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Category</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <strong className="text-white">{categoryName}</strong>?
          </p>

          {!canDelete && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
              {hasChildren && <p>• This category has sub-categories. Please re-assign or delete sub-categories first.</p>}
              {productCount > 0 && <p>• {productCount} products are assigned to this category. Please re-assign them first.</p>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
