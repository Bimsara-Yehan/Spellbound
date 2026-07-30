import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Eye,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Filter,
  Layers
} from 'lucide-react';
import { ImageLightbox } from '../components/gallery/ImageLightbox';

export interface GalleryItem {
  id: string;
  url: string;
  isPrimary: boolean;
  name: string;
  size: string;
  productName: string;
}

const initialGallery: GalleryItem[] = [
  { id: 'img_1', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', isPrimary: true, name: 'shirt-front.jpg', size: '1.2 MB', productName: 'Cotton Oxford Shirt - White' },
  { id: 'img_2', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', isPrimary: false, name: 'shirt-detail.jpg', size: '940 KB', productName: 'Cotton Oxford Shirt - White' },
  { id: 'img_3', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80', isPrimary: false, name: 'shirt-back.jpg', size: '1.4 MB', productName: 'Cotton Oxford Shirt - White' },
  { id: 'img_4', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', isPrimary: true, name: 'sneakers-red.jpg', size: '2.1 MB', productName: 'Leather Monk Strap Shoes' },
];

export const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryItem[]>(initialGallery);
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const productList = Array.from(new Set(images.map((img) => img.productName)));

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(20);
    setTimeout(() => setUploadProgress(60), 400);
    setTimeout(() => {
      setUploadProgress(100);
      const newImg: GalleryItem = {
        id: `img_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
        isPrimary: false,
        name: 'new-product-shot.jpg',
        size: '1.1 MB',
        productName: selectedProduct === 'ALL' ? 'Cotton Oxford Shirt - White' : selectedProduct,
      };
      setImages((prev) => [newImg, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
    }, 900);
  };

  const setPrimary = (id: string, productName: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.productName === productName ? { ...img, isPrimary: img.id === id } : img
      )
    );
  };

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const movePosition = (index: number, direction: 'LEFT' | 'RIGHT') => {
    const targetIdx = direction === 'LEFT' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredImages.length) return;

    const newArr = [...images];
    const item1 = newArr[index];
    const item2 = newArr[targetIdx];
    if (item1 && item2) {
      newArr[index] = item2;
      newArr[targetIdx] = item1;
      setImages(newArr);
    }
  };

  const filteredImages = selectedProduct === 'ALL'
    ? images
    : images.filter((img) => img.productName === selectedProduct);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-400" /> Image Upload & Gallery
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Screen #6 · Drag-reorder, primary thumbnail selection, S3/R2 CDN upload manager
          </p>
        </div>

        {/* Filter by Product */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-slate-200 font-semibold"
          >
            <option value="ALL">All Associated Products</option>
            {productList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Zone Dropzone */}
      <div
        onClick={handleSimulatedUpload}
        className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 rounded-2xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="inline-flex h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Upload className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">
          Drag & drop product images here, or click to upload
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PNG, JPG, WEBP up to 5MB. Directly uploads to Cloudflare R2 / AWS S3 CDN.
        </p>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4 max-w-xs mx-auto space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-indigo-400">
              <span>Uploading to CDN...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Catalogue Media Gallery ({filteredImages.length} images)
          </h3>
          <span className="text-xs text-slate-400">
            * Drag/Move arrows set PDP carousel order
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="aspect-square relative overflow-hidden bg-slate-900">
                <img
                  src={img.url}
                  alt={img.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />

                {/* Primary Tag */}
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-md">
                    <Star className="h-3 w-3 fill-white" /> Primary Thumbnail
                  </span>
                )}

                {/* Quick Hover Actions Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setLightboxImage(img)}
                    className="p-2 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 shadow"
                    title="Zoom / Lightbox Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {!img.isPrimary && (
                    <button
                      onClick={() => setPrimary(img.id, img.productName)}
                      className="p-2 rounded-xl bg-slate-900/90 text-amber-400 hover:bg-slate-800 shadow"
                      title="Set as Primary Thumbnail"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="p-2 rounded-xl bg-slate-900/90 text-rose-400 hover:bg-slate-800 shadow"
                    title="Delete Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Footer Info & Position Controls */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{img.name}</p>
                  <p className="text-[10px] text-slate-500">{img.size}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => movePosition(idx, 'LEFT')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    title="Move Left in Gallery"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => movePosition(idx, 'RIGHT')}
                    disabled={idx === filteredImages.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                    title="Move Right in Gallery"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={!!lightboxImage}
          imageUrl={lightboxImage.url}
          imageName={lightboxImage.name}
          imageSize={lightboxImage.size}
          isPrimary={lightboxImage.isPrimary}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
