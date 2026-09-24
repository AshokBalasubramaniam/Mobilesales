import {
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight, RotateCw, X, ZoomIn } from "lucide-react";
import clsx from "clsx";
import type { MobileImage, MobileVideo } from "../../types/models";

export interface ImageGalleryProps {
  images?: MobileImage[];
  videos?: MobileVideo[];
  // Rendered over the main image's top-right corner (e.g. a wishlist button)
  overlay?: ReactNode;
}

const classes = {
  emptyState:
    "relative flex aspect-square items-center justify-center rounded-2xl bg-brand-50 text-gray-400",
  overlay: "absolute top-4 right-4 z-20",
  layout: "flex flex-col-reverse gap-3 sm:flex-row",
  mainColumn: "min-w-0 flex-1",
  mainImageWrapper:
    "relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl bg-brand-50",
  mainImageGlow:
    "pointer-events-none absolute size-2/3 rounded-full bg-brand-100 opacity-60",
  mainImage:
    "relative z-10 size-full object-contain p-6 drop-shadow-xl select-none",
  zoomBadge:
    "absolute right-4 bottom-4 z-20 flex size-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow",
  zoomIcon: "size-4",
  spinBadge:
    "absolute inset-x-0 bottom-3 z-20 mx-auto w-fit rounded-full bg-black/50 px-3 py-1 text-xs text-white",
  thumbnailStrip: "flex items-center gap-2 sm:flex-col",
  thumbnailScroll:
    "flex gap-2 overflow-x-auto sm:max-h-[28rem] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto",
  thumbnailButtonBase:
    "size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 transition-all",
  thumbnailButtonActive: "border-brand-500",
  thumbnailButtonInactive: "border-gray-200 hover:border-gray-300",
  thumbnailImage: "size-full object-cover",
  spinToggleBase:
    "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium",
  spinToggleActive:
    "border-brand-600 bg-brand-50 text-brand-700",
  spinToggleInactive: "border-gray-300",
  spinToggleIcon: "size-3.5",
  videoWrapper: "mt-3",
  video: "w-full rounded-xl",
  lightboxOverlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4",
  lightboxCloseButton: "absolute top-4 right-4 text-white",
  lightboxCloseIcon: "size-6",
  lightboxPrevButton: "absolute left-4 text-white",
  lightboxNavIcon: "size-8",
  lightboxImage: "max-h-full max-w-full object-contain",
  lightboxNextButton: "absolute right-4 text-white",
};

const ImageGallery = ({
  images = [],
  videos = [],
  overlay,
}: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [spinMode, setSpinMode] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const sorted = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
  const active = sorted[activeIndex];
  const canSpin = sorted.length >= 6;

  const handleDrag = (clientX: number) => {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) > 30) {
      setActiveIndex((i) =>
        delta > 0
          ? (i - 1 + sorted.length) % sorted.length
          : (i + 1) % sorted.length,
      );
      dragStartX.current = clientX;
    }
  };

  if (!sorted.length) {
    return (
      <div className={classes.emptyState}>
        No images available
        {overlay && <div className={classes.overlay}>{overlay}</div>}
      </div>
    );
  }

  const thumbnails = (
    <div className={classes.thumbnailStrip}>
      <div className={classes.thumbnailScroll}>
        {sorted.map((img, idx) => (
          <button
            key={img.url}
            onClick={() => setActiveIndex(idx)}
            className={clsx(
              classes.thumbnailButtonBase,
              idx === activeIndex
                ? classes.thumbnailButtonActive
                : classes.thumbnailButtonInactive,
            )}
          >
            <img src={img.url} alt="" className={classes.thumbnailImage} />
          </button>
        ))}
      </div>
      {canSpin && (
        <button
          onClick={() => setSpinMode((s) => !s)}
          className={clsx(
            classes.spinToggleBase,
            spinMode ? classes.spinToggleActive : classes.spinToggleInactive,
          )}
        >
          <RotateCw className={classes.spinToggleIcon} /> 360°
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className={classes.layout}>
        {thumbnails}
        <div className={classes.mainColumn}>
          <div
            className={classes.mainImageWrapper}
            onMouseDown={(e: MouseEvent<HTMLDivElement>) =>
              spinMode && (dragStartX.current = e.clientX)
            }
            onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
              spinMode && handleDrag(e.clientX)
            }
            onMouseUp={() => (dragStartX.current = null)}
            onTouchStart={(e: TouchEvent<HTMLDivElement>) =>
              spinMode && (dragStartX.current = e.touches[0].clientX)
            }
            onTouchMove={(e: TouchEvent<HTMLDivElement>) =>
              spinMode && handleDrag(e.touches[0].clientX)
            }
            onClick={() => !spinMode && setZoomOpen(true)}
          >
            <span className={classes.mainImageGlow} />
            <img
              src={active?.url}
              alt="Listing"
              className={classes.mainImage}
              draggable={false}
            />
            {!spinMode && (
              <span className={classes.zoomBadge}>
                <ZoomIn className={classes.zoomIcon} />
              </span>
            )}
            {spinMode && (
              <span className={classes.spinBadge}>
                Drag to rotate · {activeIndex + 1}/{sorted.length}
              </span>
            )}
            {overlay && (
              <div
                className={classes.overlay}
                onClick={(e) => e.stopPropagation()}
              >
                {overlay}
              </div>
            )}
          </div>
        </div>
      </div>

      {videos.length > 0 && (
        <div className={classes.videoWrapper}>
          <video src={videos[0].url} controls className={classes.video} />
        </div>
      )}

      {zoomOpen && (
        <div
          className={classes.lightboxOverlay}
          onClick={() => setZoomOpen(false)}
        >
          <button
            className={classes.lightboxCloseButton}
            onClick={() => setZoomOpen(false)}
          >
            <X className={classes.lightboxCloseIcon} />
          </button>
          <button
            className={classes.lightboxPrevButton}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
            }}
          >
            <ChevronLeft className={classes.lightboxNavIcon} />
          </button>
          <img
            src={active?.url}
            alt="Zoomed"
            className={classes.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={classes.lightboxNextButton}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i + 1) % sorted.length);
            }}
          >
            <ChevronRight className={classes.lightboxNavIcon} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
