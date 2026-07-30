import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductModal, ProductData } from '../components/products/ProductModal';
import { DeleteProductModal } from '../components/products/DeleteProductModal';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

const initialProducts: ProductItem[] = [
  { id: 'prod_1', name: 'Cotton Oxford Shirt - White', slug: 'cotton-oxford-shirt-white', sku: 'SHIRT-WHT-M', category: 'Menswear', price: 8500, description: '100% premium woven cotton shirt.', stock: 24, status: 'PUBLISHED' },
  { id: 'prod_2', name: 'Slim Fit Chinos - Navy', slug: 'slim-fit-chinos-navy', sku: 'CHINO-NVY-32', category: 'Menswear', price: 9200, description: 'Tailored stretch cotton chinos.', stock: 18, status: 'PUBLISHED' },
  { id: 'prod_3', name: 'Linen Summer Dress - Floral', slug: 'linen-summer-dress-floral', sku: 'DRSS-FLR-S', category: 'Womenswear', price: 12800, description: 'Breathable linen summer dress.', stock: 12, status: 'PUBLISHED' },
  { id: 'prod_4', name: 'Leather Monk Strap Shoes', slug: 'leather-monk-strap-shoes', sku: 'SHOE-MNK-42', category: 'Footwear', price: 22500, description: 'Handcrafted genuine leather footwear.', stock: 6, status: 'DRAFT' },
  { id: 'prod_5', name: 'Woven Leather Belt - Brown', slug: 'woven-leather-belt-brown', sku: 'BELT-BRN-L', category: 'Accessories', price: 4500, description: 'Interwoven genuine leather belt.', stock: 35, status: 'PUBLISHED' },
  { id: 'prod_6', name: 'Silk Pocket Square - Paisley', slug: 'silk-pocket-square-paisley', sku: 'SILK-PSQ-BLU', category: 'Accessories', price: 2800, description: 'Pure silk paisley accessory.', stock: 10, status: 'ARCHIVED' },
];

const categoryList = ['Menswear', 'Womenswear', 'Footwear', 'Accessories'];

export const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Checkbox Selection Logic
  const isAllSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const currentPageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Bulk Actions
  const handleBulkArchive = () => {
    setProducts((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: 'ARCHIVED' } : p))
    );
    setSelectedIds([]);
  };

  const handleBulkDeleteConfirm = () => {
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setIsBulkDeleteOpen(false);
  };

  // Save product (Create / Update)
  const handleSaveProduct = (data: ProductData) => {
    if (data.id) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.id
            ? {
                ...p,
                name: data.name,
                slug: data.slug,
                sku: data.sku,
                category: data.category,
                price: data.price,
                description: data.description,
                status: data.status,
              }
            : p
        )
      );
    } else {
      const newProduct: ProductItem = {
        id: `prod_${Date.now()}`,
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        category: data.category,
        price: data.price,
        description: data.description,
        stock: 0,
        status: data.status,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  // Delete single product confirm
  const handleSingleDeleteConfirm = () => {
    if (deleteTarget) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" /> Products & Catalogue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Screens #4 & #5 · Product list, category filtering, search, bulk actions, and core field management
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" /> Create New Product
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300 sm:col-span-1">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, SKU, slug..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-slate-200 placeholder-slate-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">
              {selectedIds.length} product(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Archive className="h-3.5 w-3.5 text-amber-400" /> Archive Selected
              </button>
              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {isAllSelected ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelectRow(p.id)} className="text-slate-400 hover:text-white">
                        {isSelected ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">/{p.slug}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-indigo-400">{p.sku}</td>
                    <td className="py-3 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">LKR {p.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${p.stock < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'DRAFT'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingProduct({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            sku: p.sku,
                            category: p.category,
                            price: p.price,
                            description: p.description,
                            status: p.status,
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                        title="Edit Core Fields"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} items
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        categories={categoryList}
      />

      <DeleteProductModal
        isOpen={!!deleteTarget}
        productCount={1}
        productName={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleSingleDeleteConfirm}
      />

      <DeleteProductModal
        isOpen={isBulkDeleteOpen}
        productCount={selectedIds.length}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
};
