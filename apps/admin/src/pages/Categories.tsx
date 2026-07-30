import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Tag
} from 'lucide-react';
import { CategoryModal, CategoryData } from '../components/categories/CategoryModal';
import { DeleteCategoryModal } from '../components/categories/DeleteCategoryModal';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  productCount: number;
  status: 'ACTIVE' | 'DRAFT';
  displayOrder: number;
}

const initialCategoriesData: CategoryNode[] = [
  { id: 'cat_1', name: 'Menswear', slug: 'menswear', parentId: null, description: 'Men apparel & clothing', productCount: 42, status: 'ACTIVE', displayOrder: 1 },
  { id: 'cat_1_1', name: 'Shirts', slug: 'menswear-shirts', parentId: 'cat_1', description: 'Casual and formal shirts', productCount: 24, status: 'ACTIVE', displayOrder: 1 },
  { id: 'cat_1_2', name: 'Trousers & Chinos', slug: 'menswear-trousers', parentId: 'cat_1', description: 'Pants and casual bottoms', productCount: 18, status: 'ACTIVE', displayOrder: 2 },
  { id: 'cat_2', name: 'Womenswear', slug: 'womenswear', parentId: null, description: 'Women apparel & accessories', productCount: 58, status: 'ACTIVE', displayOrder: 2 },
  { id: 'cat_2_1', name: 'Dresses', slug: 'womenswear-dresses', parentId: 'cat_2', description: 'Summer and formal dresses', productCount: 30, status: 'ACTIVE', displayOrder: 1 },
  { id: 'cat_3', name: 'Footwear', slug: 'footwear', parentId: null, description: 'Leather shoes & sneakers', productCount: 24, status: 'ACTIVE', displayOrder: 3 },
  { id: 'cat_4', name: 'Accessories', slug: 'accessories', parentId: null, description: 'Belts, wallets & hats', productCount: 16, status: 'ACTIVE', displayOrder: 4 },
];

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryNode[]>(initialCategoriesData);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    cat_1: true,
    cat_2: true,
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (parentId: string | null = null) => {
    setEditingCategory(parentId ? ({ name: '', slug: '', parentId, description: '', status: 'ACTIVE' }) : null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryNode) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      description: cat.description,
      status: cat.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = (data: CategoryData) => {
    if (data.id) {
      // Update
      setCategories((prev) =>
        prev.map((c) =>
          c.id === data.id
            ? {
                ...c,
                name: data.name,
                slug: data.slug,
                parentId: data.parentId || null,
                description: data.description,
                status: data.status,
              }
            : c
        )
      );
    } else {
      // Create new
      const newCategory: CategoryNode = {
        id: `cat_${Date.now()}`,
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        description: data.description,
        productCount: 0,
        status: data.status,
        displayOrder: categories.length + 1,
      };
      setCategories((prev) => [...prev, newCategory]);
      if (data.parentId) {
        setExpandedIds((prev) => ({ ...prev, [data.parentId!]: true }));
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleMoveOrder = (id: string, direction: 'UP' | 'DOWN') => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const item1 = newCategories[index];
    const item2 = newCategories[targetIndex];
    if (item1 && item2) {
      newCategories[index] = item2;
      newCategories[targetIndex] = item1;
      setCategories(newCategories);
    }
  };

  // Filter root and child categories
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const rootCategories = filteredCategories.filter((c) => c.parentId === null);
  const getSubcategories = (parentId: string) =>
    filteredCategories.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-indigo-400" /> Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Screen #3 · Organize product catalogue tree hierarchy & display ordering</p>
        </div>
        <button
          onClick={() => handleOpenAddModal(null)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Root Category
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search categories by name or /slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none w-full text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Tree Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rootCategories.map((rootCat, rootIdx) => {
                const subCats = getSubcategories(rootCat.id);
                const isExpanded = !!expandedIds[rootCat.id];

                return (
                  <React.Fragment key={rootCat.id}>
                    {/* Root Row */}
                    <tr className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        {subCats.length > 0 ? (
                          <button
                            onClick={() => toggleExpand(rootCat.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="w-6" />
                        )}
                        <span className="text-slate-100">{rootCat.name}</span>
                        {subCats.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {subCats.length} sub
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400">/{rootCat.slug}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{rootCat.productCount} items</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            rootCat.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {rootCat.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveOrder(rootCat.id, 'UP')}
                            disabled={rootIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(rootCat.id, 'DOWN')}
                            disabled={rootIdx === rootCategories.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenAddModal(rootCat.id)}
                          className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-xs font-semibold border border-indigo-500/30 inline-flex items-center gap-1 mr-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Subcategory
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rootCat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rootCat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Subcategories */}
                    {isExpanded &&
                      subCats.map((sub) => (
                        <tr key={sub.id} className="bg-slate-950/40 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 pl-12 font-medium text-slate-300 flex items-center gap-2">
                            <span className="text-slate-600 font-mono">└─</span>
                            <Tag className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{sub.name}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-indigo-300/80">/{sub.slug}</td>
                          <td className="py-3 px-4 text-xs text-slate-400">{sub.productCount} items</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-slate-500">—</td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(sub)}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sub)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
        existingCategories={categories}
      />

      <DeleteCategoryModal
        isOpen={!!deleteTarget}
        categoryName={deleteTarget?.name || ''}
        productCount={deleteTarget?.productCount || 0}
        hasChildren={categories.some((c) => c.parentId === deleteTarget?.id)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
