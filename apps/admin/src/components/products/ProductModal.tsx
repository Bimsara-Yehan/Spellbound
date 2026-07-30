import React, { useState, useEffect } from 'react';
import { X, Package, Sparkles } from 'lucide-react';

export interface ProductData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductData) => void;
  initialData?: ProductData | null;
  categories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('DRAFT');
  const [isSlugAuto, setIsSlugAuto] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setSku(initialData.sku);
      setCategory(initialData.category);
      setPrice(initialData.price);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setIsSlugAuto(false);
    } else {
      setName('');
      setSlug('');
      setSku('');
      setCategory(categories[0] || 'Menswear');
      setPrice(0);
      setDescription('');
      setStatus('DRAFT');
      setIsSlugAuto(true);
    }
  }, [initialData, isOpen, categories]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (isSlugAuto) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
      if (!initialData && !sku) {
        setSku(`SKU-${generatedSlug.substring(0, 8).toUpperCase()}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    onSave({
      id: initialData?.id,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      sku,
      category,
      price: Number(price),
      description,
      status,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Edit Product Core Fields' : 'Create New Product'}
              </h3>
              <p className="text-xs text-slate-400">Screen #5 · Basic information, pricing, SKU and catalogue status</p>
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
              Product Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Cotton Oxford Shirt - White"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                {isSlugAuto && (
                  <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Auto
                  </span>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugAuto(false);
                  setSlug(e.target.value);
                }}
                placeholder="cotton-oxford-shirt"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-indigo-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Base SKU <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SHIRT-WHT-01"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Base Retail Price (LKR) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">LKR</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="8500"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-3 py-2.5 text-sm font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Product features, fabric details, sizing notes..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Publishing Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    status === st
                      ? st === 'PUBLISHED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : st === 'DRAFT'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
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
              {initialData ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
