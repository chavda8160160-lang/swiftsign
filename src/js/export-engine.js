/**
 * ExportEngine for SwiftSign
 * Implements the "No Quality Loss" Pipeline:
 * - PDF: Vector/object overlay preserving selectable text, metadata & resolution
 * - Image: Full natural resolution compositing onto original image pixels
 */

const _CoordConverter = typeof CoordinateConverter !== 'undefined'
  ? CoordinateConverter
  : (typeof require !== 'undefined' ? require('./coordinate-converter.js') : null);

class ExportEngine {
  /**
   * Export signed PDF without rasterization
   * @param {Object} params
   * @param {Uint8Array} params.originalPdfBytes
   * @param {Array} params.placements - Array of placement items
   * @param {Function} [params.onProgress]
   * @returns {Promise<{ bytes: Uint8Array, blob: Blob, blobUrl: string, size: number }>}
   */
  static async exportPdf({ originalPdfBytes, placements, onProgress }) {
    if (typeof PDFLib === 'undefined') {
      throw new Error('PDF-lib is not loaded');
    }

    if (!originalPdfBytes || originalPdfBytes.length === 0) {
      throw new Error('PDF byte buffer is empty. Please re-open the document.');
    }

    if (onProgress) onProgress(10, 'Loading original PDF structure...');

    // 1. Load document (preserves existing text, vector paths, fonts)
    const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes, {
      ignoreEncryption: true
    });
    const totalPages = pdfDoc.getPageCount();

    if (onProgress) onProgress(30, 'Embedding signature assets...');

    // Cache embedded images so identical signatures aren't duplicated in file size
    const imageCache = new Map();

    // 2. Iterate through placements and overlay onto pages
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      const pageIndex = p.pageNumber - 1;

      if (pageIndex < 0 || pageIndex >= totalPages) {
        console.warn(`Skipping placement on invalid page ${p.pageNumber}`);
        continue;
      }

      const page = pdfDoc.getPage(pageIndex);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      const pageRotation = page.getRotation().angle || 0;

      // Get or create embedded PNG image
      let embeddedImage = imageCache.get(p.dataUrl);
      if (!embeddedImage) {
        const pngBytes = ExportEngine.dataUrlToUint8Array(p.dataUrl);
        embeddedImage = await pdfDoc.embedPng(pngBytes);
        imageCache.set(p.dataUrl, embeddedImage);
      }

      // Convert coordinates
      const coords = _CoordConverter.screenToPdf({
        pageWidth,
        pageHeight,
        pageRotation,
        renderedWidth: p.renderedWidth,
        renderedHeight: p.renderedHeight,
        placement: {
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          rotation: p.rotation || 0
        }
      });

      // Draw onto page object stream
      page.drawImage(embeddedImage, {
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height,
        rotate: PDFLib.degrees(coords.rotateDegrees)
      });
    }

    if (onProgress) onProgress(70, 'Preserving vector streams and finalizing PDF...');

    // 3. Save modified PDF
    const savedBytes = await pdfDoc.save();

    // 4. Validate output
    ExportEngine.validatePdfBytes(savedBytes, totalPages);

    if (onProgress) onProgress(100, 'Complete!');

    const blob = new Blob([savedBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    return {
      bytes: savedBytes,
      blob,
      blobUrl,
      size: savedBytes.length
    };
  }

  /**
   * Export signed Image compositing onto natural pixel dimensions
   */
  static async exportImage({ originalImage, placements, originalFormat = 'image/png' }) {
    const natW = originalImage.naturalWidth || originalImage.width;
    const natH = originalImage.naturalHeight || originalImage.height;

    const canvas = document.createElement('canvas');
    canvas.width = natW;
    canvas.height = natH;
    const ctx = canvas.getContext('2d');

    // Draw original image at 100% natural resolution
    ctx.drawImage(originalImage, 0, 0, natW, natH);

    // Overlay each placement
    for (const p of placements) {
      const img = await ExportEngine.loadImage(p.dataUrl);
      const coords = _CoordConverter.screenToImage({
        imageNaturalWidth: natW,
        imageNaturalHeight: natH,
        renderedWidth: p.renderedWidth,
        renderedHeight: p.renderedHeight,
        placement: p
      });

      ctx.save();
      const cx = coords.x + coords.width / 2;
      const cy = coords.y + coords.height / 2;
      ctx.translate(cx, cy);
      if (coords.rotation) {
        ctx.rotate((coords.rotation * Math.PI) / 180);
      }
      ctx.drawImage(
        img,
        -coords.width / 2,
        -coords.height / 2,
        coords.width,
        coords.height
      );
      ctx.restore();
    }

    const mime = (originalFormat === 'image/jpeg' || originalFormat === 'image/jpg')
      ? 'image/jpeg'
      : (originalFormat === 'image/webp' ? 'image/webp' : 'image/png');

    const quality = mime === 'image/jpeg' ? 0.98 : undefined;

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        resolve({
          bytes,
          blob,
          blobUrl,
          size: blob.size,
          width: natW,
          height: natH,
          mimeType: mime
        });
      }, mime, quality);
    });
  }

  static validatePdfBytes(bytes, expectedPageCount) {
    if (!bytes || bytes.length === 0) {
      throw new Error('Exported PDF byte stream is empty');
    }
    // Check %PDF- header
    const header = String.fromCharCode(...bytes.subarray(0, 5));
    if (header !== '%PDF-') {
      throw new Error(`Corrupted PDF header: ${header}`);
    }
  }

  static dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  static loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportEngine;
}
