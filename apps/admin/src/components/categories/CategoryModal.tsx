import React, { useState, useEffect } from 'react';
import { X, FolderTree, Sparkles } from 'lucide-react';

export interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryData) => void;
  initialData?: CategoryData | null;
  existingCategories: { id: string; name: string }[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [isSlugAuto, setIsSlugAuto] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setParentId(initialData.parentId || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setIsSlugAuto(false);
    } else {
      setName('');
      setSlug('');
      setParentId('');
      setDescription('');
      setStatus('ACTIVE');
      setIsSlugAuto(true);
    }
  }, [initialData, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (isSlugAuto) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugAuto(false);
    setSlug(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parentId: parentId || null,
      description,
      status,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p className="text-xs text-slate-400">Organise your product catalogue navigation structure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Category Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Menswear, Footwear"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              {isSlugAuto && (
                <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Auto-generated
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-mono">/</span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="menswear"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-indigo-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Parent Category (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Top Level Root Category)</option>
              {existingCategories
                .filter((c) => c.id !== initialData?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description for storefront category banners..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Visibility Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                ACTIVE (Visible online)
              </button>
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  status === 'DRAFT'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                DRAFT (Hidden)
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {initialData ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
