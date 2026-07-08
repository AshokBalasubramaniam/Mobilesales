import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, X, ZoomIn } from 'lucide-react';
import clsx from 'clsx';

/**
 * Main image + thumbnail strip with a click-to-zoom lightbox. When the
 * listing has enough photos, a "360° view" toggle lets you drag across the
 * image to cycle through them like a product spin — reusing the seller's own
 * uploaded angles rather than requiring a dedicated 360 asset.
 */
const ImageGallery = ({ images = [], videos = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [spinMode, setSpinMode] = useState(false);
  const dragStartX = useRef(null);

  const sorted = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
  const active = sorted[activeIndex];
  const canSpin = sorted.length >= 6;

  const handleDrag = (clientX) => {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) > 30) {
      setActiveIndex((i) => (delta > 0 ? (i - 1 + sorted.length) % sorted.length : (i + 1) % sorted.length));
      dragStartX.current = clientX;
    }
  };

  if (!sorted.length) {
    return <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">No images available</div>;
  }

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
        onMouseDown={(e) => spinMode && (dragStartX.current = e.clientX)}
        onMouseMove={(e) => spinMode && handleDrag(e.clientX)}
        onMouseUp={() => (dragStartX.current = null)}
        onTouchStart={(e) => spinMode && (dragStartX.current = e.touches[0].clientX)}
        onTouchMove={(e) => spinMode && handleDrag(e.touches[0].clientX)}
        onClick={() => !spinMode && setZoomOpen(true)}
      >
        <img src={active?.url} alt="Listing" className="size-full object-cover select-none" draggable={false} />
        {!spinMode && (
          <span className="absolute right-2 bottom-2 rounded-full bg-black/50 p-1.5 text-white">
            <ZoomIn className="size-4" />
          </span>
        )}
        {spinMode && (
          <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            Drag to rotate · {activeIndex + 1}/{sorted.length}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {sorted.map((img, idx) => (
            <button
              key={img.url}
              onClick={() => setActiveIndex(idx)}
              className={clsx(
                'size-14 shrink-0 overflow-hidden rounded-lg border-2',
                idx === activeIndex ? 'border-brand-600' : 'border-transparent'
              )}
            >
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
        {canSpin && (
          <button
            onClick={() => setSpinMode((s) => !s)}
            className={clsx(
              'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium',
              spinMode ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30' : 'border-gray-300 dark:border-gray-700'
            )}
          >
            <RotateCw className="size-3.5" /> 360°
          </button>
        )}
      </div>

      {videos.length > 0 && (
        <div className="mt-3">
          <video src={videos[0].url} controls className="w-full rounded-xl" />
        </div>
      )}

      {zoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomOpen(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setZoomOpen(false)}>
            <X className="size-6" />
          </button>
          <button
            className="absolute left-4 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
            }}
          >
            <ChevronLeft className="size-8" />
          </button>
          <img src={active?.url} alt="Zoomed" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute right-4 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i + 1) % sorted.length);
            }}
          >
            <ChevronRight className="size-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
