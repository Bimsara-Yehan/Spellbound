import React from 'react';
import { X, ExternalLink, Star } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  imageName: string;
  imageSize: string;
  isPrimary: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  imageUrl,
  imageName,
  imageSize,
  isPrimary,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 w-full max-w-3xl shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white truncate max-w-md">{imageName}</h3>
            {isPrimary && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white flex items-center gap-1">
                <Star className="h-3 w-3 fill-white" /> Primary Thumbnail
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close image lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* High-res Image Preview */}
        <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
          <img src={imageUrl} alt={imageName} className="max-h-full max-w-full object-contain" />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>File Size: {imageSize} · Format: JPEG / WEBP · Storage: Cloudflare R2 / S3 CDN</span>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            Open Original CDN <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
