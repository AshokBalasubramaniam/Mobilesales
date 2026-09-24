import path from 'path';
import sharp from 'sharp';
import logger from '../utils/logger';

export interface ConvertedImage {
  buffer: Buffer;
  mimetype?: string;
  originalName?: string;
  converted: boolean;
}

const WEBP_QUALITY = 80;

// SVG is vector (rasterising it would lose quality) and WebP needs no work.
const SKIP_MIMETYPES = new Set(['image/svg+xml', 'image/webp']);

/**
 * Re-encodes any raster image upload as WebP (smaller files, same visual
 * quality) before it is stored. Non-image files (PDFs, video, audio) pass
 * through untouched, and if conversion fails the original is kept so an
 * upload never breaks because of it.
 */
export const convertToWebp = async (
  buffer: Buffer,
  mimetype?: string,
  originalName?: string,
): Promise<ConvertedImage> => {
  if (!mimetype?.startsWith('image/') || SKIP_MIMETYPES.has(mimetype)) {
    return { buffer, mimetype, originalName, converted: false };
  }

  try {
    const webp = await sharp(buffer, { animated: true })
      .rotate() // apply EXIF orientation so phone photos aren't sideways
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const baseName = originalName
      ? path.basename(originalName, path.extname(originalName))
      : 'image';
    return {
      buffer: webp,
      mimetype: 'image/webp',
      originalName: `${baseName}.webp`,
      converted: true,
    };
  } catch (error) {
    logger.warn(`WebP conversion failed for ${originalName || mimetype}, storing original`, error);
    return { buffer, mimetype, originalName, converted: false };
  }
};
